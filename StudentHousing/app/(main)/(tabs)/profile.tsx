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
  value: ProfileItemValue;
  type?: string;
  input_type?: string;
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

const getSafeValue = <T,>(
  item: ProfileInformationItem | undefined | null,
  defaultValue: T
): T => {
  try {
    if (!item?.value?.data?.value) return defaultValue;
    return item.value.data.value;
  } catch (error) {
    console.error("Error accessing value:", error);
    return defaultValue;
  }
};

const getSafeLabel = (
  item: ProfileInformationItem | undefined | null
): string => {
  try {
    if (!item) return "Unknown";
    return item.label || "Unknown";
  } catch (error) {
    console.error("Error accessing label:", error);
    return "Unknown";
  }
};

export default function ProfileScreen() {
  const { session } = useAuth();

  if (!session) return <></>;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    interests: interests || [],
    globalInterests: globalInterests || [],
    getInterestName: (id: string) => getInterestName(id) || id,
    amenities: amenities || [],
    globalAmenities: globalAmenities || [],
    getAmenityName: (id: string) => getAmenityName(id) || id,
    locationLabel,
  };

  useEffect(() => {
    (async () => {
      if (location) {
        try {
          const city = await getCityFromCoordinates(
            location.latitude,
            location.longitude
          );
          setLocationLabel(city);
        } catch (error) {
          console.error("Error getting city:", error);
          setLocationLabel("Location unavailable");
        }
      }
    })();
  }, [location]);

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [viewMode])
  );

  const formatProfileInformation = (item: ProfileInformationItem) => {
    try {
      if (!item) return "Not available";

      if (item.type && profileItemHandlers[item.type]) {
        return profileItemHandlers[item.type].getFormattedValue(
          item,
          profileContext
        );
      }

      if (item.input_type && inputTypeHandlers[item.input_type]) {
        return inputTypeHandlers[item.input_type].getFormattedValue(item);
      }

      return getSafeValue(item, "Not available");
    } catch (error) {
      console.error("Error formatting profile information:", error);
      return "Error displaying value";
    }
  };

  const handleItemPress = (item: ProfileInformationItem) => {
    try {
      if (item.type && profileItemHandlers[item.type]) {
        profileItemHandlers[item.type].handleNavigation(item, profileContext);
        return;
      }

      if (item.input_type && inputTypeHandlers[item.input_type]) {
        inputTypeHandlers[item.input_type].handleNavigation(item);
        return;
      }

      console.warn("Unknown item type:", item);
    } catch (error) {
      console.error("Error handling item press:", error);
    }
  };

  const fetchProfile = async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await supabase.functions.invoke(
        "getProfile",
        {
          body: {
            userId: activeProfileId,
            mode: viewMode,
          },
        }
      );

      if (fetchError) throw fetchError;

      const { response, status } = data;
      if (status === "error") {
        router.push("/(auth)/creation");
        return;
      }

      const profile = response[0] as Profile;

      // Safely handle media
      const media = (profile.media || []).map((url) => {
        try {
          const split = url.split("/");
          const filename = split[split.length - 1];
          const order = parseInt(filename.split(".")[0]) || 0;

          return {
            uri: url,
            order: order,
          };
        } catch (error) {
          console.error("Error processing media item:", error);
          return {
            uri: url,
            order: 0,
          };
        }
      });

      const sortedMedia = media.sort((a, b) => a.order - b.order);

      setProfileImages(sortedMedia);
      setProfile(profile);

      // Safely handle profile information
      if (profile.information) {
        const sortedInformation = Object.entries(profile.information)
          .filter(([_, item]) => item !== null && item !== undefined)
          .sort(
            (a, b) => (b[1].priority_order || 0) - (a[1].priority_order || 0)
          );
        setProfileInformation(sortedInformation);
      } else {
        setProfileInformation([]);
      }

      setInterests(profile?.interests || []);
      setAmenities(getSafeValue(profile?.information?.amenities, []));
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading title="Loading profile" />;
  }

  if (error) {
    return (
      <View
        flex={1}
        justifyContent="center"
        alignItems="center"
        bg="$background"
        padding="$4"
      >
        <Text color="$red10" textAlign="center">
          {error}
        </Text>
        <ListItem
          pressTheme
          onPress={fetchProfile}
          title="Retry"
          marginTop="$4"
        />
      </View>
    );
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
                        subTitle={
                          interests.map((i) => getInterestName(i)).join(", ") ||
                          "None selected"
                        }
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
                        subTitle={
                          amenities.map((a) => getAmenityName(a)).join(", ") ||
                          "None selected"
                        }
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
                          title={getSafeLabel(item)}
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
                      subTitle={locationLabel || "Not set"}
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
