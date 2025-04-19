import React, { useRef, useEffect, useState, useCallback } from "react";
import { TouchableOpacity, Animated, Dimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

import supabase from "@/lib/supabase";
import { useAuth } from "@/components/AuthProvider";
import { uploadImage } from "@/components/MediaUpload";
import { Question, Answer, Interest, ImageObject } from "@/typings";
import { CreationInputFactory } from "@/components/Inputs/Creation";
import { Button, Progress, Text, useTheme, View } from "tamagui";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CreateScreen = () => {
  const { session } = useAuth();
  const [interests, setInterests] = useState<Interest[]>([]);
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
  });

  const [answers, setAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    supabase
      .from("interest_registry")
      .select()
      .then(({ data, error }) => {
        if (error) console.error(error);
        if (data) setInterests(data);
      });
  }, []);

  const questions = useCallback(
    () => [
      {
        title: "My name is...",
        description: "This is how people will know you",
        type: "text" as const,
        options: { placeholder: "Your name" },
        db: { table: "profiles", column: "full_name", identifier: "id" },
        key: "name",
        skipable: false,
      },
      {
        title: "My favourite thing to do is...",
        description: "",
        type: "text" as const,
        options: { placeholder: "Your favourite thing to do" },
        db: {
          table: "profiles",
          column: "favorite_activity",
          identifier: "id",
        },
        key: "activity",
        skipable: false,
      },
      {
        title: "My age is...",
        description: "When were you born",
        type: "date" as const,
        options: {},
        db: { table: "profiles", column: "date_of_birth", identifier: "id" },
        key: "dob",
        skipable: false,
      },
      {
        title: "I am interested in...",
        description: "Select your interests",
        type: "multiSelect" as const,
        key: "interests",
        options: { values: interests },
        db: {
          table: "profile_interests",
          column: "interest_id",
          identifier: "user_id",
        },
        skipable: true,
      },
      {
        title: "My budget is...",
        description: "Set your monthly budget",
        type: "slider" as const,
        key: "budget",
        options: {
          range: [0, 2000, 1],
          value: 0,
        },
        db: {
          table: "profiles",
          column: "budget",
          identifier: "id",
        },
        skipable: true,
      },
      {
        title: "Photos...",
        description: "Upload your profile photos",
        type: "media" as const,
        key: "profile-images",
        options: { bucket: "profile-images" },
        skipable: false,
      },
    ],
    [interests]
  );

  const questionList = questions();
  const currentQuestion = questionList[questionIndex];

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
    }
  }, []);

  const validateInput = (type: string, value: any) => {
    switch (type) {
      case "text":
        return value?.length > 0;
      case "multiSelect":
        return value?.length > 0;
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
      default:
        return false;
    }
  };

  useEffect(() => {
    const value = inputState[currentQuestion.type];
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
    supabase.auth.signOut();
    router.replace("/login");
  };

  const continueButtonPressed = () => {
    if (!currentQuestion) return;
    if (continueDisabled) return;

    let value;

    switch (currentQuestion.type) {
      case "text":
        value = inputState.text;
        break;
      case "multiSelect":
        value = inputState.multiSelect;
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

    setAnswers((prev) => ({ ...prev, [currentQuestion.key]: value }));
    resetInputState(currentQuestion.type);

    if (questionIndex + 1 >= questionList.length) {
      console.log("Submitting data", answers);
      router.replace("/(main)/(tabs)");
    } else {
      setQuestionIndex((prev) => prev + 1);
    }
  };

  return (
    <View bg="$background" style={{ flex: 1 }}>
      <View style={{ width: "100%", backgroundColor: "black" }}>
        <Progress value={(questionIndex / questionList.length) * 100}>
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
        <View style={{ flex: 1, padding: 24, paddingBottom: 0 }}>
          <View style={{ flex: 1 }}>
            <View
              style={{
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
                gap: 16,
                marginBottom: 16,
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
                <Text style={{ color: theme.color11.val, fontSize: 14 }}>
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
