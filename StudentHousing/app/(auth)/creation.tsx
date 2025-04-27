import React, { useRef, useEffect, useState, useCallback } from "react";
import { TouchableOpacity, Animated, Dimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import supabase from "@/lib/supabase";
import { Interest } from "@/typings";
import { CreationInputFactory } from "@/components/Inputs/CreationInputFactory";
import { Button, Progress, Text, useTheme, View } from "tamagui";
import Loading from "@/components/Loading";
import { useProfile } from "@/providers/ProfileProvider";
import { useViewMode } from "@/providers/ViewModeProvider";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface Question {
  title: string;
  description: string;
  type:
    | "text"
    | "multiSelect"
    | "slider"
    | "date"
    | "media"
    | "location"
    | "select";
  key: string;
  options?:
    | InputOptions
    | DateOptions
    | SliderOptions
    | MediaOptions
    | MultiSelectOptions;
  skipable?: boolean;
}

export interface Answer {
  value: any;
  skipped: boolean;
}

export interface SliderOptions {
  range: [number, number, number]; // [min, max, step]
}

export interface MediaOptions {
  bucket: string;
}

export interface InputOptions {
  placeholder: string;
  // options: {
  // };
}

export interface MultiSelectOptions {
  id: string;
  label: string;
}

export interface ImageObject {
  uri: string;
  order: number;
}

const CreateScreen = () => {
  const theme = useTheme();

  const { activeProfileId } = useProfile();
  const { viewMode } = useViewMode();

  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const [questionIndex, setQuestionIndex] = useState(0);
  const [submittingData, setSubmittingData] = useState(false);
  const [continueDisabled, setContinueDisabled] = useState(false);

  const [inputState, setInputState] = useState({
    text: "",
    multiSelect: [],
    slider: 0,
    date: new Date(),
    media: [],
    location: [],
    select: [],
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("profile_information_registry")
        .select("creation, priority_order, input_type, type")
        .or(`view.eq.${viewMode}, view.eq.shared`);

      if (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      const filteredData = data.filter((item) => item && item.creation);

      const sortedData = filteredData.sort(
        (a, b) => b.priority_order - a.priority_order
      );

      sortedData.push({
        creation: {
          title: "Upload some images of yourself",
          description: "You can skip this question if you want.",
        },
        input_type: "media",
        type: "media",
        priority_order: 0,
      });

      const parsedData = sortedData.map((item) => ({
        title: item.creation.title,
        description: item.creation.description,
        registry: item.creation.registry,
        type: item.input_type,
        key: item.type,
        options: item.creation.options,
        skipable: item.creation.skipable || false,
      }));

      setQuestions(parsedData);
      setLoading(false);
    })();
  }, []);

  const currentQuestion = questions[questionIndex];

  const resetInputState = useCallback((type: string) => {
    switch (type) {
      case "text":
        setInputState((prev) => ({ ...prev, text: "" }));
        break;
      case "multiSelect":
        setInputState((prev) => ({ ...prev, multiSelect: [] }));
        break;
      case "slider":
        setInputState((prev) => ({ ...prev, slider: 0 }));
        break;
      case "date":
        setInputState((prev) => ({ ...prev, date: new Date() }));
        break;
      case "media":
        setInputState((prev) => ({ ...prev, media: [] }));
        break;
      case "location":
        setInputState((prev) => ({ ...prev, location: [] }));
        break;
      case "select":
        setInputState((prev) => ({ ...prev, select: [] }));
        break;
    }
  }, []);

  const validateInput = (type: string, value: any) => {
    switch (type) {
      case "text":
        return value?.length > 0;
      case "multiSelect":
        return value?.length > 0;
      case "select":
        return value;
      case "slider":
        return value >= 0;
      case "date":
        const date = new Date(value);
        if (isNaN(date.getTime())) return false;
        const today = new Date();
        const age = today.getFullYear() - date.getFullYear();
        return age >= 18;
      case "media":
        return value?.length > 0;
      case "location":
        return value?.latitude && value?.longitude;
      default:
        return false;
    }
  };

  useEffect(() => {
    if (!currentQuestion) return;
    const type = currentQuestion.type as keyof typeof inputState;
    const value = inputState[type];
    setContinueDisabled(!validateInput(currentQuestion.type, value));
  }, [questionIndex, inputState, currentQuestion]);

  useEffect(() => {
    slideAnim.setValue(SCREEN_WIDTH);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 8,
      speed: 12,
    }).start();
  }, [questionIndex, slideAnim]);

  const backButtonPressed = () => setQuestionIndex((prev) => prev - 1);

  const cancelButtonPressed = () => {
    router.dismiss();
  };

  const processAnswer = (key: string, value: any) => {
    switch (key) {
      case "biography":
        return {
          data: value,
          label: "Your bio",
          placeholder: "Enter your bio",
        };
      case "name":
        return {
          data: value,
          label: "Edit your name",
          placeholder: "Your name",
        };
      default:
        return {
          data: value,
        };
    }
  };

  const continueButtonPressed = async () => {
    if (!currentQuestion) return;
    if (continueDisabled) return;
    if (!activeProfileId) return;

    let value;

    switch (currentQuestion.type) {
      case "text":
        value = inputState.text;
        break;
      case "multiSelect":
        value = inputState.multiSelect;
        break;
      case "select":
        value = inputState.select;
        break;
      case "slider":
        value = inputState.slider;
        break;
      case "date":
        value = inputState.date;
        break;
      case "media":
        value = inputState.media;
        break;
      case "location":
        value = inputState.location;
        break;
      default:
        console.warn("Unknown input type");
        return;
    }

    if (
      !currentQuestion.skipable &&
      !validateInput(currentQuestion.type, value)
    )
      return;

    if (currentQuestion.skipable && !value) {
      setQuestionIndex((prev) => prev + 1);
      return;
    }

    const newAnswers = {
      ...answers,
      [currentQuestion.key]: {
        value,
      },
    };

    setAnswers(newAnswers);
    resetInputState(currentQuestion.type);

    if (questionIndex + 1 >= questions.length) {
      setLoading(true);
      const parsedAnswers = Object.entries(newAnswers).filter(
        ([key, value]) => {
          if (key === "media") return;
          if (key === "location") return;
          if (key === "interests") return;

          return value !== undefined;
        }
      );

      const { data, error } = await supabase.from("profile_information").upsert(
        parsedAnswers.map(([key, value]) => {
          return {
            profile_id: activeProfileId,
            value: processAnswer(key, value),
            key,
            // view: viewMode,
          };
        })
      );

      // handle location
      const location = newAnswers["location"]?.value;
      if (location) {
        const geoPoint = {
          type: "Point",
          coordinates: [location.longitude, location.latitude], // [lng, lat]
        };

        const { error: locationError } = await supabase
          .from("profile_locations")
          .upsert({
            profile_id: activeProfileId,
            point: geoPoint,
          });

        if (locationError) {
          console.error("Error saving location:", locationError);
          return;
        }
      }

      // handle interests
      const interests = newAnswers["interests"]?.value;
      if (interests) {
        await supabase
          .from("profile_interests")
          .delete()
          .eq("profile_id", activeProfileId);

        const { error } = await supabase.from("profile_interests").upsert(
          interests.map((interest: Interest) => ({
            profile_id: activeProfileId,
            interest_id: interest,
          }))
        );

        if (error) {
          console.error("Error saving interests:", error);
          return;
        }
      }

      if (error) {
        console.error("Error saving data:", error);
        return;
      }

      console.log("3");
      const { error: createdError } = await supabase
        .from("profile_mapping")
        .update({
          created: true,
        })
        .eq("id", activeProfileId);

      if (createdError) {
        console.error("Error updating created status:", createdError);
        return;
      }

      console.log("4");
      setLoading(false);
      router.replace("/(main)/(tabs)");
    } else {
      setQuestionIndex((prev) => prev + 1);
    }
  };

  if (loading) return <Loading title="Saving information" />;

  if (!questions || questions.length === 0)
    return <Loading title="No questions found" />;

  return (
    <View bg="$background" style={{ flex: 1 }}>
      <View style={{ width: "100%", backgroundColor: "black" }}>
        <Progress value={Math.floor((questionIndex / questions.length) * 100)}>
          <Progress.Indicator animation={"medium"} />
        </Progress>
      </View>

      {submittingData ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Loading title="Saving your profile..." />
        </View>
      ) : (
        <View paddingInline={"$2"} flex={1}>
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBlock: 16,
              }}
            >
              {questionIndex > 0 ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={backButtonPressed}
                >
                  <MaterialIcons
                    name="arrow-back-ios-new"
                    size={32}
                    color={theme.color11.val}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={cancelButtonPressed}
                >
                  <MaterialIcons
                    name="close"
                    size={40}
                    color={theme.color11.val}
                  />
                </TouchableOpacity>
              )}

              {currentQuestion.skipable && (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setQuestionIndex((prev) => prev + 1)}
                >
                  <Text color="$color11">Skip</Text>
                </TouchableOpacity>
              )}
            </View>

            <Animated.View
              style={{
                alignItems: "flex-start",
                width: "100%",
                transform: [{ translateX: slideAnim }],
              }}
            >
              <View style={{ gap: 8 }}>
                <Text
                  style={{
                    color: theme.color.val,
                    fontSize: 24,
                    fontWeight: "bold",
                  }}
                >
                  {currentQuestion.title}
                </Text>
                <Text
                  marginBlockEnd={"$4"}
                  style={{ color: theme.color11.val, fontSize: 14 }}
                >
                  {currentQuestion.description}
                </Text>
              </View>

              <View style={{ width: "100%" }}>
                <CreationInputFactory
                  question={currentQuestion}
                  state={[inputState, setInputState]}
                />
              </View>
            </Animated.View>
          </View>

          <View style={{ paddingVertical: 16 }}>
            <Button
              onPress={continueButtonPressed}
              opacity={continueDisabled ? 0.5 : 1}
            >
              Continue
            </Button>
          </View>
        </View>
      )}
    </View>
  );
};

export default CreateScreen;
