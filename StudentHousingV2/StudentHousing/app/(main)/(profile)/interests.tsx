import React, { useCallback, useEffect, useState } from "react";
import { useNavigation } from "expo-router";
import { View, YStack, Text, Button } from "tamagui";
import { useAuth } from "@/providers/AuthProvider";
import { HeaderWithBack, HeaderWithText } from "../(filters)";
import { CreationMultiSelect } from "@/components/Inputs/CreationMultiSelect";
import { useProfile } from "@/providers/ProfileProvider";
import Loading from "@/components/Loading";

export default function InterestsScreen() {
  const navigation = useNavigation();
  const { session } = useAuth();

  const { activeProfileId } = useProfile();

  const { setInterests, interests, globalInterests, getInterestName } =
    useProfile();

  const [loading, setLoading] = useState(false);
  const [formState, setFormState] = useState({
    interests: [] as string[],
  });

  useEffect(() => {
    setFormState((prevState) => ({
      ...prevState,
      interests: interests,
    }));
  }, [interests]);

  // Save interests and navigate back
  const saveInterests = useCallback(async () => {
    if (!activeProfileId) {
      console.error("User session is not available.");
      return;
    }

    setInterests(formState.interests);
  }, [formState.interests, setInterests, session, navigation]);

  const interestsQuestion = {
    type: "interests",
    title: "Select your interests",
    options: {
      values: globalInterests.map((interest) => ({
        interest: getInterestName(interest),
        id: interest,
      })),
    },
  };

  return (
    <>
      <HeaderWithBack page="Interests" />
      <View flex={1} padding="$4" backgroundColor="$background">
        <YStack space="$4">
          <Text>{formState.interests.length} interests selected</Text>
          {loading ? (
            <Loading title="Loading interests" />
          ) : (
            <View gap={"$4"}>
              <CreationMultiSelect
                question={interestsQuestion}
                value={formState.interests}
                state={[formState, setFormState]}
              />
              <Button onPress={saveInterests}>Save Interests</Button>
            </View>
          )}
        </YStack>
      </View>
    </>
  );
}
