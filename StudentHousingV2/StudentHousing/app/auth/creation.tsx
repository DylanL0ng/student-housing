import TailwindColours from "@/constants/TailwindColours";
import { MaterialIcons } from "@expo/vector-icons";
import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import supabase from "../lib/supabase";
import { router, useRouter } from "expo-router";
import { User } from "@supabase/supabase-js";
import {
  CreationMultiSelect,
  CreationSlider,
  CreationText,
} from "@/components/Inputs/Creation";
import { Answer, Interest, Question } from "@/typings";
import MediaUpload, { uploadImage } from "@/components/MediaUpload";
import { Button } from "@tamagui/button";
import { Text, useTheme, View } from "@tamagui/core";
import { useAuth } from "@/components/AuthProvider";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface ImageObject {
  uri: string;
  order: number;
}

const CreateScreen = () => {
  // const [user, setUser] = useState<User | null>(null);
  const { session } = useAuth();
  const [interests, setInterests] = useState<Interest[]>([]);

  const theme = useTheme();

  useEffect(() => {
    supabase
      .from("interest_registry")
      .select()
      .then((response) => {
        const { data, error } = response;
        if (error) console.error(error);
        if (data) {
          setInterests(data);
        }
      });
  }, []);

  // Define questions as a useMemo to maintain referential stability
  const questions = useMemo<Question[]>(
    () => [
      {
        title: "My name is...",
        description: "This is how people will know you",
        type: "text",
        options: {
          placeholder: "Your name",
          dbTable: "profiles",
          dbColumn: "full_name",
          dbIdentifier: "id",
        },
        key: "name",
      },
      {
        title: "I am interested in...",
        description: "This is how people will know you",
        type: "multi-select",
        key: "interests",
        options: {
          values: interests,
          dbTable: "profile_interests", // Table for many-to-many relationship
          dbColumn: "interest_id",
          dbIdentifier: "user_id",
        },
        skipable: true,
      },
      {
        title: "My budget is...",
        description: "This is how people will know you",
        type: "slider",
        key: "budget",
        options: {
          range: [0, 20000, 1],
          dbTable: "profiles",
          dbColumn: "budget",
          dbIdentifier: "id",
        },
        skipable: true,
      },
      {
        title: "Photos...",
        description: "This is how people will know you",
        type: "media",
        key: "profile-images",
        options: {
          bucket: "profile-images",
        },
        skipable: false,
      },
    ],
    [interests]
  );

  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [submittingData, setSubmittingData] = useState(false);

  const [currentInput, setCurrentInput] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [sliderValue, setSliderValue] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<ImageObject[]>([]);

  // Maintain original slide animation
  useEffect(() => {
    slideAnim.setValue(SCREEN_WIDTH);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 8,
      speed: 12,
    }).start();
  }, [questionIndex]);

  const loadImages = useCallback(async () => {
    try {
      const images = await supabase.storage
        .from("profile-images")
        .list(session?.user?.id || "");

      if (images.error) {
        console.error("Error loading images:", images.error);
        return;
      }

      const newImages = await Promise.all(
        images.data.map(async (item) => {
          const { data } = await supabase.storage
            .from("profile-images")
            .getPublicUrl(`${session?.user.id}/${item.name}`);

          // Extract order from filename
          const order = parseInt(item.name.split(".")[0]);

          return {
            uri: data.publicUrl,
            order: order,
          };
        })
      );

      // Sort images by order
      const sortedImages = newImages.sort((a, b) => a.order - b.order);

      setUploadedImages(sortedImages);
    } catch (error) {
      console.error("Image loading error:", error);
    }
  }, []);

  useEffect(() => {
    loadImages();
  }, []);

  // Render question based on type (similar to original)
  const renderInput = useCallback(
    (question: Question) => {
      switch (question.type) {
        case "text":
          return (
            <CreationText
              question={question}
              value={currentInput}
              onValueChange={setCurrentInput}
            />
          );
        case "multi-select":
          return (
            <CreationMultiSelect
              question={question}
              value={selectedOptions}
              onValueChange={setSelectedOptions}
            />
          );
        case "slider":
          return (
            <CreationSlider
              question={question}
              value={sliderValue}
              onValueChange={setSliderValue}
            />
          );
        case "media":
          return (
            <MediaUpload
              images={uploadedImages}
              onLoad={loadImages}
              onUpload={(image: ImageObject) => {
                setUploadedImages((prev) => {
                  const newImages = [...prev];
                  const existingIndex = newImages.findIndex(
                    (img) => img.order === image.order
                  );

                  if (existingIndex !== -1) {
                    newImages[existingIndex] = image;
                  } else {
                    newImages.push(image);
                  }

                  return newImages;
                });
              }}
              onDelete={(image: ImageObject) => {
                setUploadedImages((prev) =>
                  prev.filter((img) => img.order !== image.order)
                );
              }}
            />
          );
        default:
          return <View />;
      }
    },
    [currentInput, selectedOptions, sliderValue, uploadedImages]
  );

  // Improved cancel and skip logic
  const cancelCreation = useCallback(() => {
    supabase.auth.signOut();
  }, []);

  const updateProfile = async (
    user: User,
    finalAnswers: Record<string, Answer>
  ) => {
    if (!user) {
      console.error("No user found");
      return false;
    }

    let error = false;
    try {
      setSubmittingData(true);

      for (const [key, answer] of Object.entries(finalAnswers)) {
        if (answer.skipped) continue;

        const question = questions.find((q) => q.key === key);
        if (!question || !question.options) continue;

        const { dbTable, dbColumn, dbIdentifier } = question.options;
        if (
          question.type !== "media" &&
          (!dbTable || !dbColumn || !dbIdentifier)
        )
          continue;

        if (question.type === "multi-select") {
          const selectedValues = answer.value as string[];
          if (selectedValues.length > 0) {
            await supabase.from(dbTable).delete().eq(dbIdentifier, user.id);
            const { error: insertError } = await supabase.from(dbTable).insert(
              selectedValues.map((selectedId) => ({
                [dbIdentifier]: user.id,
                [dbColumn]: selectedId,
              }))
            );
            if (insertError) {
              console.error(`Error inserting into ${dbTable}:`, insertError);
              supabase.auth.signOut();
            }
          }
        } else if (question.type === "media") {
          const images = answer.value as unknown as ImageObject[];

          images.forEach((image: ImageObject) => {
            uploadImage(session, image);
          });
        } else {
          const updateData = { [dbColumn]: answer.value };
          const { error } = await supabase
            .from(dbTable)
            .update(updateData)
            .eq(dbIdentifier, user.id);
          if (error) {
            console.error(`Error updating ${dbTable}:`, error);
            supabase.auth.signOut();
          }
        }
      }

      return true;
    } catch (error) {
      error = true;
      supabase.auth.signOut();
      return false;
    } finally {
      if (error) return;

      const { error: error2 } = await supabase
        .from("profiles")
        .update({ created: true })
        .eq("id", user.id);

      if (error2) {
        console.error("Error updating profile:", error2);
      }

      setSubmittingData(false);
    }
  };

  // Maintain original submission logic
  const submitAnswers = useCallback(
    async (finalAnswers: Record<string, Answer>) => {
      if (!session || !session.user) {
        console.error("No user found");
        return;
      }
      const success = await updateProfile(session.user, finalAnswers);
      if (success) {
        router.replace("/(tabs)");
      } else {
        console.error("Failed to update profile");
      }
    },
    [router, session]
  );

  const skipQuestion = useCallback(() => {
    const currentQuestion = questions[questionIndex];

    setAnswers((prev) => {
      const updatedAnswers = {
        ...prev,
        [currentQuestion.key]: {
          value:
            currentQuestion.type === "text"
              ? ""
              : currentQuestion.type === "media"
              ? { files: [], imageUris: [] }
              : [],
          skipped: true,
        },
      };

      if (questionIndex + 1 < questions.length) {
        setQuestionIndex((prevIndex) => prevIndex + 1);
      } else {
        submitAnswers(updatedAnswers); // Ensure the latest answers are used
      }

      return updatedAnswers;
    });

    // Reset input states
    setCurrentInput("");
    setSelectedOptions([]);
    setUploadedImages([]);
  }, [questions, questionIndex, submitAnswers]);

  // Improved continue button logic
  const continueButtonPressed = useCallback(() => {
    const disabled =
      submittingData ||
      (questions[questionIndex].type === "text" && !currentInput) ||
      (questions[questionIndex].type === "multi-select" &&
        selectedOptions.length === 0) ||
      (questions[questionIndex].type === "media" && uploadedImages.length === 0)
        ? true
        : false;

    if (disabled) return;

    const currentQuestion = questions[questionIndex];
    const currentValue =
      currentQuestion.type === "text"
        ? currentInput
        : currentQuestion.type === "slider"
        ? Number(sliderValue)
        : currentQuestion.type === "media"
        ? uploadedImages
        : selectedOptions;

    setAnswers((prev) => {
      const updatedAnswers = {
        ...prev,
        [currentQuestion.key]: {
          value: currentValue,
          skipped:
            currentQuestion.type === "media"
              ? uploadedImages.length === 0
              : currentQuestion.type === "slider"
              ? currentValue === 0
              : (currentValue as string | string[]).length === 0,
        },
      };

      if (questionIndex + 1 < questions.length) {
        setQuestionIndex((prevIndex) => prevIndex + 1);
      } else {
        submitAnswers(updatedAnswers);
      }

      return updatedAnswers;
    });

    // Reset input states
    setCurrentInput("");
    setSelectedOptions([]);
    setSliderValue(0);
    setUploadedImages([]);
  }, [
    questions,
    questionIndex,
    currentInput,
    selectedOptions,
    sliderValue,
    uploadedImages,
    submitAnswers,
  ]);

  const backButtonPressed = useCallback(() => {
    setQuestionIndex((prevIndex) => prevIndex - 1);
  }, []);

  return (
    <View
      bg={"$background"}
      style={{
        flex: 1,
      }}
    >
      <View
        id="progress-bar"
        style={{ width: "100%", backgroundColor: "black" }}
      >
        <View
          id="indicator"
          style={{
            height: 10,
            width: `${((questionIndex + 1) / questions.length) * 100}%`,
            backgroundColor: "red",
          }}
        ></View>
      </View>
      {submittingData ? (
        <Text>Loading</Text>
      ) : (
        <View
          style={{
            flex: 1,
            padding: 24,
            paddingBottom: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <View style={{ flex: 1 }}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              {questionIndex > 0 ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={backButtonPressed}
                >
                  <View id="close-button">
                    <MaterialIcons
                      name="arrow-back-ios-new"
                      size={32}
                      color={theme.color11.val}
                    />
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity activeOpacity={0.9} onPress={cancelCreation}>
                  <View id="close-button">
                    <MaterialIcons
                      name="close"
                      size={40}
                      color={theme.color11.val}
                    />
                  </View>
                </TouchableOpacity>
              )}
              {questions[questionIndex].skipable && (
                <TouchableOpacity activeOpacity={0.9} onPress={skipQuestion}>
                  <Text color={"$color11"}>Skip</Text>
                </TouchableOpacity>
              )}
            </View>
            <Animated.View
              id="input-group"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 16,
                marginBottom: 16,
                transform: [
                  {
                    translateX: slideAnim,
                  },
                ],
              }}
            >
              <View style={{ display: "flex", gap: 8 }}>
                <Text
                  style={{
                    color: TailwindColours.text.primary,
                    fontSize: 24,
                    fontWeight: "bold",
                  }}
                >
                  {questions[questionIndex].title}
                </Text>
                <Text
                  style={{
                    color: theme.color11.val,
                    fontSize: 14,
                    padding: 0,
                    margin: 0,
                  }}
                >
                  {questions[questionIndex].description}
                </Text>
              </View>
              <View style={{ width: "100%" }}>
                {renderInput(questions[questionIndex])}
              </View>
            </Animated.View>
          </View>
          <View
            style={{
              paddingVertical: 16,
            }}
          >
            <Button
              onPress={continueButtonPressed}
              opacity={
                submittingData ||
                (questions[questionIndex].type === "text" && !currentInput) ||
                (questions[questionIndex].type === "multi-select" &&
                  selectedOptions.length === 0) ||
                (questions[questionIndex].type === "media" &&
                  uploadedImages.length === 0)
                  ? 0.5
                  : 1
              }
            >
              {"Continue"}
            </Button>
            {/* <Button
              title={"Continue"}
            /> */}
          </View>
        </View>
      )}
    </View>
  );
};

export default CreateScreen;
