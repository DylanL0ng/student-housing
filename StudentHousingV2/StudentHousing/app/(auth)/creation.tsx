import React, { useRef, useEffect, useState, useCallback } from "react";
import { TouchableOpacity, Animated, Dimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import supabase from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { uploadImage } from "@/components/MediaUpload";
import { Question, Answer, Interest, ImageObject } from "@/typings";
import { CreationInputFactory } from "@/components/Inputs/Creation";
import { Button, Progress, Text, useTheme, View } from "tamagui";
import Loading from "@/components/Loading";

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
  value: number;
}

export interface MediaOptions {
  bucket: string;
}

export interface InputOptions {
  placeholder: string;
}

export interface DateOptions {}

export interface MultiSelectOptions {
  values: any[];
}

export interface ImageObject {
  uri: string;
  order: number;
}

const CreateScreen = () => {
  const { session } = useAuth();
  const theme = useTheme();

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
    select: null,
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("profile_information_registry")
        .select("creation, priority_order, input_type, type");

      if (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
        return;
      }

      if (!data || data.length === 0) {
        console.log("No data returned from query");
        setLoading(false);
        return;
      }

      const filteredData = data.filter((item) => item && item.creation);

      const sortedData = filteredData.sort(
        (a, b) => b.priority_order - a.priority_order
      );

      const parsedData = sortedData.map((item) => ({
        title: item.creation.title,
        description: item.creation.description,
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
        setInputState((prev) => ({ ...prev, select: null }));
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
    if (!session) return;

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
            profile_id: session.user.id,
            value: processAnswer(key, value),
            key,
            view: "flatmate",
          };
        })
      );

      if (error) {
        console.error("Error saving data:", error);
        return;
      }

      const { error: createdError } = await supabase
        .from("profiles")
        .update({
          created: true,
        })
        .eq("id", session.user.id);

      if (createdError) {
        console.error("Error updating created status:", createdError);
        return;
      }

      setLoading(false);
      router.replace("/(main)/(tabs)");
    } else {
      setQuestionIndex((prev) => prev + 1);
    }
  };

  if (loading) return <Loading title="Loading" />;

  if (!questions || questions.length === 0)
    return <Loading title="No questions found" />;

  return (
    <View bg="$background" style={{ flex: 1 }}>
      <View style={{ width: "100%", backgroundColor: "black" }}>
        <Progress value={(questionIndex / questions.length) * 100}>
          <Progress.Indicator animation={"superBouncy"} />
        </Progress>
      </View>

      {submittingData ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text>Saving your profile...</Text>
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
