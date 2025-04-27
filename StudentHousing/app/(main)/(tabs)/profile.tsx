import React, { useCallback, useEffect, useState } from "react";
import supabase from "@/lib/supabase";
import { router, useFocusEffect, useNavigation } from "expo-router";
import { useTheme, View } from "@tamagui/core";
import ProfileCard from "@/components/ProfileCard";
import { Profile } from "@/typings";
import { useAuth } from "@/providers/AuthProvider";
import Loading from "@/components/Loading";
import { Label, ListItem, ScrollView, Tabs, Text, YGroup } from "tamagui";
import MediaUpload, { ImageObject } from "@/components/MediaUpload";
import { useViewMode } from "@/providers/ViewModeProvider";
import { ChevronRight } from "@tamagui/lucide-icons";
import { useProfile } from "@/providers/ProfileProvider";
import { getCityFromCoordinates } from "../(filters)";

interface ProfileContext {
  interests: string[];
  globalInterests: string[];
  getInterestName: (id: string) => string;
  amenities: string[];
  globalAmenities: string[];
  getAmenityName: (id: string) => string;
  locationLabel: string | null;
}

interface ProfileItemValue {
  data: {
    value: any;
  };
}

interface ProfileItem {
  value: ProfileItemValue;
  type?: string;
  creation?: {
    options: {
      values: Array<{ id: string; label: string }>;
    };
  };
}

interface ProfileItemHandler {
  getFormattedValue: (item: ProfileItem, context: ProfileContext) => string;
  handleNavigation: (item: ProfileItem, context: ProfileContext) => void;
}

interface InputItemValue {
  data: {
    value: any;
  };
}

interface SelectValue {
  label: string;
}

interface InputItem {
  value: InputItemValue;
}

interface InputHandler {
  getFormattedValue: (item: InputItem) => string;
  handleNavigation: (item: InputItem) => void;
}

interface ProfileInformationItem {
  label: string;
  priority_order: number;
  editable: boolean;
  value: any;
}

type InputType = keyof typeof inputTypeHandlers;
type ProfileItemType = keyof typeof profileItemHandlers;

interface ProfileItem {
  type?: ProfileItemType;
  input_type?: InputType;
  value: {
    data: {
      value: any;
    };
  };
}

const profileItemHandlers: Record<string, ProfileItemHandler> = {
  interests: {
    getFormattedValue: (_, { interests, getInterestName }: ProfileContext) => {
      return interests.map((interest) => getInterestName(interest)).join(", ");
    },
    handleNavigation: (
      item: ProfileItem,
      { interests, globalInterests, getInterestName }: ProfileContext
    ) => {
      router.navigate({
        pathname: "/(main)/(profile)/select",
        params: {
          item: JSON.stringify({
            value: {
              data: {
                value: interests.map((i) => ({
                  id: i,
                  label: getInterestName(i),
                })),
              },
            },
            type: "interests",
            creation: {
              options: {
                values: globalInterests.map((i) => ({
                  id: i,
                  label: getInterestName(i),
                })),
              },
            },
          }),
          onReturn: "refresh",
        },
      });
    },
  },

  amenities: {
    getFormattedValue: (_, { amenities, getAmenityName }: ProfileContext) => {
      return amenities.map((amenity) => getAmenityName(amenity)).join(", ");
    },
    handleNavigation: (
      item: ProfileItem,
      { amenities, globalAmenities, getAmenityName }: ProfileContext
    ) => {
      router.navigate({
        pathname: "/(main)/(profile)/select",
        params: {
          item: JSON.stringify({
            value: {
              data: {
                value: amenities.map((a) => ({
                  id: a,
                  label: getAmenityName(a),
                })),
              },
            },
            type: "amenities",
            creation: {
              options: {
                values: globalAmenities.map((a) => ({
                  id: a,
                  label: getAmenityName(a),
                })),
              },
            },
          }),
          onReturn: "refresh",
        },
      });
    },
  },

  location: {
    getFormattedValue: (
      item: ProfileItem,
      { locationLabel }: ProfileContext
    ) => {
      return locationLabel || "";
    },
    handleNavigation: () => {
      router.navigate({
        pathname: "/(main)/(profile)/location",
        params: {
          onReturn: "refresh",
        },
      });
    },
  },
};

const inputTypeHandlers: Record<string, InputHandler> = {
  text: {
    getFormattedValue: (item: InputItem) => item.value.data.value,
    handleNavigation: (item: InputItem) => {
      router.navigate({
        pathname: "/(main)/(profile)/text-input",
        params: {
          item: JSON.stringify(item),
          onReturn: "refresh",
        },
      });
    },
  },
  slider: {
    getFormattedValue: (item: InputItem) => `€${item.value.data.value}`,
    handleNavigation: (item: InputItem) => {
      router.navigate({
        pathname: "/(main)/(profile)/slider",
        params: {
          item: JSON.stringify(item),
          onReturn: "refresh",
        },
      });
    },
  },
  select: {
    getFormattedValue: (item: InputItem) =>
      `${(item.value.data.value as SelectValue).label}`,
    handleNavigation: (item: InputItem) => {
      router.navigate({
        pathname: "/(main)/(profile)/select",
        params: {
          item: JSON.stringify(item),
          onReturn: "refresh",
        },
      });
    },
  },
};

export default function ProfileScreen() {
  const { session } = useAuth();

  if (!session) return <></>;

  const [loading, setLoading] = useState(true);
  const [tabMode, setTabMode] = useState<"edit" | "preview">("edit");
  const [profile, setProfile] = useState<Profile | undefined>(undefined);
  const [profileImages, setProfileImages] = useState<ImageObject[]>([]);

  const [profileInformation, setProfileInformation] = useState<
    Array<[string, ProfileInformationItem]>
  >([]);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);

  const {
    setInterests,
    interests,
    globalInterests,
    getInterestName,
    setAmenities,
    amenities,
    globalAmenities,
    getAmenityName,
    location,
    activeProfileId,
  } = useProfile();

  const { viewMode } = useViewMode();

  const profileContext = {
    interests,
    globalInterests,
    getInterestName,
    amenities,
    globalAmenities,
    getAmenityName,
    locationLabel,
  };

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

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [viewMode])
  );

  const formatProfileInformation = (item: ProfileItem) => {
    if (item.type && profileItemHandlers[item.type]) {
      return profileItemHandlers[item.type].getFormattedValue(
        item,
        profileContext
      );
    }

    if (item.input_type && inputTypeHandlers[item.input_type]) {
      return inputTypeHandlers[item.input_type].getFormattedValue(item);
    }

    return "Unknown format";
  };

  const handleItemPress = (item: ProfileItem) => {
    if (item.type && profileItemHandlers[item.type]) {
      profileItemHandlers[item.type].handleNavigation(item, profileContext);
      return;
    }

    if (item.input_type && inputTypeHandlers[item.input_type]) {
      inputTypeHandlers[item.input_type].handleNavigation(item);
      return;
    }

    console.warn("Unknown item type:", item);
  };

  const fetchProfile = async () => {
    const { data, error } = await supabase.functions.invoke("getProfile", {
      body: {
        userId: activeProfileId,
        mode: viewMode,
      },
    });

    const { response, status } = data;
    if (status === "error") {
      router.push("/(auth)/creation");
      return;
    }

    if (error) {
      console.error("Error fetching profile:", error);
      return;
    }

    const profile = response[0] as Profile;
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
    setProfileInformation(
      Object.entries(profile.information).sort(
        (
          a: [string, ProfileInformationItem],
          b: [string, ProfileInformationItem]
        ) => b[1].priority_order - a[1].priority_order
      )
    );

    setInterests(profile?.interests || []);
    setAmenities(profile?.information?.amenities?.value?.data?.value || []);

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
              {profileInformation && (
                <YGroup rowGap={"$1"}>
                  <YGroup.Item>
                    <Label fontSize={"$6"} fontWeight={"bold"}>
                      Profile Images
                    </Label>
                    <MediaUpload images={profileImages} />
                  </YGroup.Item>
                  <Label fontSize={"$6"} fontWeight={"bold"}>
                    Your information
                  </Label>
                  {viewMode === "flatmate" && (
                    <YGroup.Item>
                      <ListItem
                        title="Interests"
                        subTitle={interests
                          .map((i) => getInterestName(i))
                          .join(", ")}
                        pressTheme
                        iconAfter={ChevronRight}
                        onPress={() => {
                          router.push({
                            pathname: "/(main)/(profile)/select",
                            params: {
                              item: JSON.stringify({
                                value: {
                                  data: {
                                    value: interests.map((i) => ({
                                      id: i,
                                      label: getInterestName(i),
                                    })),
                                  },
                                },
                                type: "interests",
                                creation: {
                                  options: {
                                    values: globalInterests.map((i) => ({
                                      id: i,
                                      label: getInterestName(i),
                                    })),
                                  },
                                },
                              }),
                              onReturn: "refresh",
                            },
                          });
                        }}
                      />
                    </YGroup.Item>
                  )}
                  {viewMode === "accommodation" && (
                    <YGroup.Item>
                      <ListItem
                        title="Amenities"
                        subTitle={amenities
                          .map((a) => getAmenityName(a))
                          .join(", ")}
                        pressTheme
                        iconAfter={ChevronRight}
                        onPress={() => {
                          router.push({
                            pathname: "/(main)/(profile)/select",
                            params: {
                              item: JSON.stringify({
                                value: {
                                  data: {
                                    value: amenities.map((a) => ({
                                      id: a,
                                      label: getAmenityName(a),
                                    })),
                                  },
                                },
                                type: "amenities",
                                creation: {
                                  options: {
                                    values: globalAmenities.map((a) => ({
                                      id: a,
                                      label: getAmenityName(a),
                                    })),
                                  },
                                },
                              }),
                              onReturn: "refresh",
                            },
                          });
                        }}
                      />
                    </YGroup.Item>
                  )}
                  {profileInformation.map(([key, item], index) =>
                    item && item.editable && key !== "amenities" ? (
                      <YGroup.Item key={index}>
                        <ListItem
                          title={item.label}
                          subTitle={formatProfileInformation(item)}
                          pressTheme
                          iconAfter={ChevronRight}
                          onPress={() => handleItemPress(item)}
                        />
                      </YGroup.Item>
                    ) : null
                  )}

                  <YGroup.Item>
                    <ListItem
                      title="Location"
                      subTitle={locationLabel}
                      pressTheme
                      iconAfter={ChevronRight}
                      onPress={() => {
                        router.push({
                          pathname: "/(main)/(profile)/location",
                          params: {
                            onReturn: "refresh",
                          },
                        });
                      }}
                    />
                  </YGroup.Item>
                </YGroup>
              )}
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
