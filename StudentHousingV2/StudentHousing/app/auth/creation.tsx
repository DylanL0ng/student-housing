import React, { useRef, useEffect, useState, useCallback } from "react";
import { TouchableOpacity, Animated, Dimensions } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { User } from "@supabase/supabase-js";
import { Button } from "@tamagui/button";
import { Text, useTheme, View } from "@tamagui/core";

import supabase from "../lib/supabase";
import { useAuth } from "@/components/AuthProvider";

import { uploadImage } from "@/components/MediaUpload";
import { Question, Answer, Interest, ImageObject } from "@/typings";
import { CreationInputFactory } from "@/components/Inputs/Creation";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const CreateScreen = () => {
  const { session } = useAuth();
  const [interests, setInterests] = useState<Interest[]>([]);
  const theme = useTheme();

  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  const [questionIndex, setQuestionIndex] = useState(0);
  const [submittingData, setSubmittingData] = useState(false);

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

  const [textInput, setTextInput] = useState("");
  const [multiSelectInput, setMultiSelectInput] = useState<string[]>([]);
  const [sliderInput, setSliderInput] = useState(0);
  const [dateInput, setDateInput] = useState<Date>(new Date());
  const [mediaInput, setMediaInput] = useState<ImageObject[]>([]);

  const inputState = {
    text: [textInput, setTextInput],
    multiSelect: [multiSelectInput, setMultiSelectInput],
    slider: [sliderInput, setSliderInput],
    date: [dateInput, setDateInput],
    media: [mediaInput, setMediaInput],
  };

  const questions = useCallback(
    () => [
      {
        title: "My name is...",
        description: "This is how people will know you",
        type: "text" as const,
        options: {
          placeholder: "Your name",
        },
        db: {
          table: "profiles",
          column: "full_name",
          identifier: "id",
        },
        key: "name",
        skipable: false,
      },
      {
        title: "My favourite thing to do is...",
        description: "",
        type: "text" as const,
        options: {
          placeholder: "Your favourite thing to do",
        },
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
        db: {
          table: "profiles",
          column: "date_of_birth",
          identifier: "id",
        },
        key: "dob",
        skipable: false,
      },
      {
        title: "I am interested in...",
        description: "Select your interests",
        type: "multiSelect" as const,
        key: "interests",
        options: {
          values: interests,
        },
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
          range: [0, 20000, 1],
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
        options: {
          bucket: "profile-images",
        },
        skipable: false,
      },
    ],
    [interests]
  );

  const backButtonPressed = useCallback(() => {
    setQuestionIndex((prevIndex) => prevIndex - 1);
  }, []);
  const cancelButtonPressed = useCallback(() => {
    supabase.auth.signOut();
    router.replace("/auth/login");
  }, []);

  // Slide animation effect
  useEffect(() => {
    slideAnim.setValue(SCREEN_WIDTH);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 8,
      speed: 12,
    }).start();
  }, [questionIndex, slideAnim]);

  const [answers, setAnswers] = useState({});

  const resetInputState = useCallback((type) => {
    switch (type) {
      case "text":
        setTextInput("");
        break;
      case "multiSelect":
        setMultiSelectInput([]);
        break;
      case "slider":
        setSliderInput(0);
        break;
      case "date":
        setDateInput(new Date());
        break;
      case "media":
        setMediaInput([]);
        break;
    }
  }, []);

  const continueButtonPressed = useCallback(() => {
    const currentQuestion = questions()[questionIndex];

    if (!currentQuestion) {
      console.error("No current question found");
      return;
    }

    if (!inputState[currentQuestion.type]) {
      resetInputState(currentQuestion.type);
      return console.error("State is empty or undefined");
    }

    const state = inputState[currentQuestion.type][0];
    let newAnswer = {
      ...answers,
    };
    if (!state) console.error("State is empty or undefined");
    else newAnswer[currentQuestion.key] = state;

    setQuestionIndex((prevIndex) => prevIndex + 1);
    resetInputState(currentQuestion.type);
    setAnswers((prev) => newAnswer);

    if (questionIndex + 1 >= questions().length) {
      router.replace("/(tabs)");
      // submit the data
    }
  }, [questionIndex, inputState, answers]);

  return (
    <View
      bg="$background"
      style={{
        flex: 1,
      }}
    >
      <View style={{ width: "100%", backgroundColor: "black" }}>
        <View
          style={{
            height: 10,
            width: `${((questionIndex + 1) / questions().length) * 100}%`,
            backgroundColor: "red",
          }}
        />
      </View>

      {submittingData ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>Saving your profile...</Text>
        </View>
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
          {questions()[questionIndex] && (
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

                {questions()[questionIndex].skipable && (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => console.error("Skip question")}
                  >
                    <Text color="$color11">Skip</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Animated.View
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  marginBottom: 16,
                  transform: [{ translateX: slideAnim }],
                }}
              >
                <View style={{ display: "flex", gap: 8 }}>
                  <Text
                    style={{
                      color: theme.color.val,
                      fontSize: 24,
                      fontWeight: "bold",
                    }}
                  >
                    {questions()[questionIndex].title}
                  </Text>
                  <Text
                    style={{
                      color: theme.color11.val,
                      fontSize: 14,
                    }}
                  >
                    {questions()[questionIndex].description}
                  </Text>
                </View>

                <View style={{ width: "100%" }}>
                  <CreationInputFactory
                    question={questions()[questionIndex]}
                    inputState={inputState}
                  />
                </View>
              </Animated.View>
            </View>
          )}

          <View style={{ paddingVertical: 16 }}>
            <Button onPress={continueButtonPressed} opacity={1}>
              Continue
            </Button>
          </View>
        </View>
      )}
    </View>
  );
};

export default CreateScreen;
