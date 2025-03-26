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
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  ScrollView,
} from "react-native";
import supabase from "../lib/supabase";
import { Button, Chip, Input, Slider } from "@rneui/themed";
import { router, useRouter } from "expo-router";
import { User } from "@supabase/supabase-js";
import {
  CreationMultiSelect,
  CreationSlider,
  CreationText,
} from "@/components/Inputs/Creation";
import { Answer, Interest, Question } from "@/typings";
import MediaUpload from "@/components/MediaUpload";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CreateScreen = () => {
  const [user, setUser] = useState<User | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
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
  const [uploadedImages, setUploadedImages] = useState<{
    files: string[];
    imageUris: string[];
  }>({ files: [], imageUris: [] });

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
              images={uploadedImages.imageUris}
              onUpload={(files, uris) => {
                setUploadedImages({ files, imageUris: uris });
                setAnswers((prev) => ({
                  ...prev,
                  [question.key]: {
                    value: {
                      files,
                      imageUris: uris,
                    },
                    skipped: false,
                  },
                }));
              }}
              onDelete={(index) => {
                const updatedFiles = [...uploadedImages.files];
                const updatedUris = [...uploadedImages.imageUris];

                updatedFiles.splice(index, 1);
                updatedUris.splice(index, 1);

                setUploadedImages({
                  files: updatedFiles,
                  imageUris: updatedUris,
                });

                // Update answers to reflect deleted image
                setAnswers((prev) => ({
                  ...prev,
                  [question.key]: {
                    value: {
                      files: updatedFiles,
                      imageUris: updatedUris,
                    },
                    skipped: updatedFiles.length === 0,
                  },
                }));
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

    try {
      setSubmittingData(true);
      console.log("Final answers:", finalAnswers); // Debugging to ensure all answers exist
      for (const [key, answer] of Object.entries(finalAnswers)) {
        if (answer.skipped) continue;

        const question = questions.find((q) => q.key === key);
        if (!question || !question.options) continue;

        const { dbTable, dbColumn, dbIdentifier } = question.options;
        if (!dbTable || !dbColumn || !dbIdentifier) continue;

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
          // Handle media uploads separately
          const mediaAnswer = answer.value as {
            files: string[];
            imageUris: string[];
          };
          // You might want to implement specific logic for uploading images here
          // This could involve uploading to Supabase storage and storing file paths
          console.log("Media files to upload:", mediaAnswer.files);
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

      setSubmittingData(false);
      return true;
    } catch (error) {
      console.error("Profile update failed:", error);
      setSubmittingData(false);
      supabase.auth.signOut();
      return false;
    }
  };

  // Maintain original submission logic
  const submitAnswers = useCallback(
    async (finalAnswers: Record<string, Answer>) => {
      if (!user) {
        console.error("No user found");
        return;
      }
      const success = await updateProfile(user, finalAnswers);
      if (success) {
        router.replace("/(tabs)");
      } else {
        console.error("Failed to update profile");
      }
    },
    [router, user]
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
    setUploadedImages({ files: [], imageUris: [] });
  }, [questions, questionIndex, submitAnswers]);

  // Improved continue button logic
  const continueButtonPressed = useCallback(() => {
    const currentQuestion = questions[questionIndex];
    const currentValue =
      currentQuestion.type === "text"
        ? currentInput
        : currentQuestion.type === "slider"
        ? sliderValue
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
              ? uploadedImages.files.length === 0
              : currentValue.length === 0,
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
    setUploadedImages({ files: [], imageUris: [] });
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
      style={{
        flex: 1,
        backgroundColor: TailwindColours.background.primary,
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
                      color={TailwindColours.text.muted}
                    />
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity activeOpacity={0.9} onPress={cancelCreation}>
                  <View id="close-button">
                    <MaterialIcons
                      name="close"
                      size={40}
                      color={TailwindColours.text.muted}
                    />
                  </View>
                </TouchableOpacity>
              )}
              {questions[questionIndex].skipable && (
                <TouchableOpacity activeOpacity={0.9} onPress={skipQuestion}>
                  <Text style={{ color: TailwindColours.text.muted }}>
                    Skip
                  </Text>
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
                    color: TailwindColours.text.muted,
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
              backgroundColor: TailwindColours.background.primary,
            }}
          >
            <Button
              onPress={continueButtonPressed}
              title={"Continue"}
              disabled={
                submittingData ||
                (questions[questionIndex].type === "text" && !currentInput) ||
                (questions[questionIndex].type === "multi-select" &&
                  selectedOptions.length === 0) ||
                (questions[questionIndex].type === "media" &&
                  uploadedImages.files.length === 0)
              }
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default CreateScreen;
