import React, { useCallback, useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { router, useFocusEffect, useNavigation } from "expo-router";

import { useTheme, View } from "@tamagui/core";

import ProfileCard from "@/components/ProfileCard";
import { Profile } from "@/typings";
import { useAuth } from "@/providers/AuthProvider";
import Loading from "@/components/Loading";
import { Label, ListItem, ScrollView, Tabs, Text, YGroup } from "tamagui";
import MediaUpload, {
  deleteImage,
  ImageObject,
  uploadImage,
} from "@/components/MediaUpload";
import { useViewMode } from "@/providers/ViewModeProvider";
import { ChevronRight } from "@tamagui/lucide-icons";
import { useProfile } from "@/providers/ProfileProvider";
import { getCityFromCoordinates } from "../(filters)";

export default function ProfileScreen() {
  const { session } = useAuth();

  if (!session) return <></>;

  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({
      header: () => <></>,
    });
  }, [navigation]);

  const theme = useTheme();

  const [loading, setLoading] = useState(true);

  const [tabMode, setTabMode] = useState<"edit" | "preview">("edit");
  const [profile, setProfile] = useState<Profile | undefined>(undefined);
  const [profileImages, setProfileImages] = useState<ImageObject[]>([]);

  const {
    setInterests,
    interests,
    globalInterests,
    getInterestName,
    location,
  } = useProfile();
  const [labeledInterests, setLabeledInterests] = useState<string[]>([]);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);

  const [profileInformation, setProfileInformation] = useState([]);

  const { activeProfileId } = useProfile();

  useEffect(() => {
    (async () => {
      if (location) {
        const city = await getCityFromCoordinates(
          location.latitude,
          location.longitude
        );
        setLocationLabel(city);
      }
    })();
  }, [location]);

  const { viewMode } = useViewMode();

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      // fetchProfileInformation();
    }, [viewMode])
  );

  useEffect(() => {
    setInterests(interests || []);
  }, [interests]);

  const formatProfileInformation = (item) => {
    if (item.type === "interests") {
      return interests.map((interest) => getInterestName(interest)).join(", ");
    }
    switch (item.input_type) {
      case "text":
        return item.profile_information[0]?.value?.data.value;
      case "slider":
        return `€${item.profile_information[0].value.data.value}`;
      case "select":
        return `${item.profile_information[0].value.data.value?.label}`;
      case "location":
        return locationLabel;
    }
  };

  // const fetchProfileInformation = async () => {
  //   const { data, error } = await supabase
  //     .from("profile_information_registry")
  //     .select(`*, profile_information(*)`)
  //     .eq("view", viewMode)
  //     .eq("profile_information.view", viewMode)
  //     .eq("profile_information.profile_id", activeProfileId)
  //     .eq("editable", true);

  //   const parsedProfileInformation = data.map((item) => {
  //     return {
  //       ...item,
  //       information:
  //         item.profile_information && item.profile_information.length > 0
  //           ? item.profile_information[0]
  //           : null,
  //     };
  //   });

  //   const sortedProfileInformation = parsedProfileInformation.sort((a, b) => {
  //     if (a.priority_order > b.priority_order) {
  //       return -1;
  //     }
  //     if (a.priority_order < b.priority_order) {
  //       return 1;
  //     }
  //     return 0;
  //   });

  //   console.log("Profile Information:", sortedProfileInformation);

  //   setProfileInformation(sortedProfileInformation);
  // };

  const fetchProfile = async () => {
    const { data, error } = await supabase.functions.invoke("getProfile", {
      body: {
        userId: activeProfileId,
        mode: viewMode,
      },
    });

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    // if (!data || data.length === 0) {
    // console.log("No profile found, redirecting to creation page");
    // return router.push("/(auth)/creation");
    // }

    const profile = data[0] as Profile;
    console.log(profile);
    const media = profile.media.map((url) => {
      const split = url.split("/");
      const filename = split[split.length - 1];
      const order = parseInt(filename.split(".")[0]);

      return {
        uri: url,
        order: order,
      };
    });

    const sortedMedia = media.sort((a, b) => a.order - b.order);

    setProfileImages(sortedMedia);
    setProfile(profile);
    setInterests(profile.interests || []);
    setLabeledInterests(
      profile.interests.map((interest) => getInterestName(interest))
    );

    setLoading(false);
  };

  if (loading) {
    return <Loading title="Loading profile" />;
  }

  return (
    <>
      <View flex={1} bg={"$background"}>
        <Tabs
          flex={1}
          defaultValue={tabMode}
          orientation="horizontal"
          flexDirection="column"
          overflow="hidden"
          onValueChange={(value) => {
            setTabMode(value as "edit" | "preview");
          }}
        >
          <Tabs.List>
            <Tabs.Tab
              // border={0}
              flex={1}
              bg={"$color2"}
              focusStyle={{
                backgroundColor: "$color3",
              }}
              value="edit"
            >
              <Text color={"$color"}>Edit</Text>
            </Tabs.Tab>
            <Tabs.Tab
              border={0}
              flex={1}
              bg={"$color2"}
              focusStyle={{
                backgroundColor: "$color3",
              }}
              value="preview"
            >
              <Text color={"$color"}>Preview</Text>
            </Tabs.Tab>
          </Tabs.List>
          <Tabs.Content
            flex={1}
            paddingInline={"$2"}
            paddingBlock={"$2"}
            value="edit"
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              gap={"$2"}
              flex={1}
            >
              <YGroup rowGap={"$1"}>
                <YGroup.Item>
                  <Label fontSize={"$6"} fontWeight={"bold"}>
                    Profile Images
                  </Label>
                  <MediaUpload
                    images={profileImages}
                    onLoad={() => {}}
                    onUpload={(image) => {}}
                    onDelete={(image) => {}}
                  />
                </YGroup.Item>
                <Label fontSize={"$6"} fontWeight={"bold"}>
                  Your information
                </Label>
                {profileInformation.map((item, index) =>
                  item ? (
                    <YGroup.Item key={index}>
                      <ListItem
                        title={item.label}
                        subTitle={formatProfileInformation(item)}
                        pressTheme
                        iconAfter={ChevronRight}
                        onPress={() => {
                          if (item.type === "location") {
                            router.navigate({
                              pathname: "/(main)/(profile)/location",
                              params: {
                                onReturn: "refresh",
                              },
                            });
                            return;
                          }
                          if (item.type === "interests") {
                            router.navigate({
                              pathname: "/(main)/(profile)/select",
                              params: {
                                item: JSON.stringify({
                                  information: {
                                    value: {
                                      data: {
                                        value: interests.map((i) => ({
                                          id: i,
                                          label: getInterestName(i),
                                        })),
                                      },
                                    },
                                    key: "interests",
                                  },
                                  creation: {
                                    options: {
                                      items: globalInterests.map((i) => {
                                        return {
                                          id: i,
                                          label: getInterestName(i),
                                        };
                                      }),
                                    },
                                  },
                                }),
                                onReturn: "refresh",
                              },
                            });
                            return;
                          }
                          if (item.input_type === "text") {
                            router.navigate({
                              pathname: "/(main)/(profile)/text-input",
                              params: {
                                item: JSON.stringify(item),
                                onReturn: "refresh",
                              },
                            });
                            return;
                          }
                          if (item.input_type === "slider") {
                            router.navigate({
                              pathname: "/(main)/(profile)/slider",
                              params: {
                                item: JSON.stringify(item),
                                onReturn: "refresh",
                              },
                            });
                            return;
                          }

                          if (item.input_type === "select") {
                            router.navigate({
                              pathname: "/(main)/(profile)/select",
                              params: {
                                item: JSON.stringify(item),
                                onReturn: "refresh",
                              },
                            });
                            return;
                          }
                        }}
                      />
                    </YGroup.Item>
                  ) : null
                )}
              </YGroup>
            </ScrollView>
          </Tabs.Content>
          <Tabs.Content flex={1} value="preview">
            {profile ? (
              <ProfileCard profile={profile} />
            ) : (
              <Loading title="Loading profile" />
            )}
          </Tabs.Content>
        </Tabs>
      </View>
    </>
  );
}
