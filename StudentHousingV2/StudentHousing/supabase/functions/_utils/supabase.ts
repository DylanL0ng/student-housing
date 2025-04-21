import { createClient } from "jsr:@supabase/supabase-js@2";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SAVED_PROMPTS: Record<string, string> = {};
const GLOBAL_INTEREST_LIST: string[] = [];
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

export interface Profile {
  id: string;
  type: string;
  title: string;
  interests: string[];
  conversations: any[];
  location: {
    point: { longitude: number; latitude: number };
    distance?: number;
  };
  information: [];
  media: string[];
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase credentials not configured");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getPromptLabel = async (prompt_id: string) => {
  if (SAVED_PROMPTS[prompt_id]) return SAVED_PROMPTS[prompt_id];
  const { data: promptData, error: promptError } = await supabase
    .from("prompt_registry")
    .select("prompt")
    .eq("id", prompt_id)
    .single();
  if (promptError) {
    console.error("Error fetching prompt label:", promptError);
    return;
  }
  if (!promptData) {
    console.error("No prompt data found");
    return;
  }
  SAVED_PROMPTS[prompt_id] = promptData.prompt;
  return promptData.prompt;
};

export const getAllPrompts = async () => {
  const { data: promptData, error: promptError } = await supabase
    .from("prompt_registry")
    .select("id, prompt");
  if (promptError) {
    console.error("Error fetching all prompts:", promptError);
    return;
  }
  if (!promptData) {
    console.error("No prompt data found");
    return;
  }
  const prompts = promptData.reduce(
    (acc: Record<string, string>, prompt: { prompt: string; id: string }) => {
      acc[prompt.id] = prompt.prompt;
      SAVED_PROMPTS[prompt.id] = prompt.prompt;
      return acc;
    },
    {}
  );

  return prompts;
};

export const getMediaUrls = async (userIds: string[]) => {
  const mediaMap: Record<string, string[]> = {};

  await Promise.all(
    userIds.map(async (id) => {
      const { data: mediaData, error: mediaError } = await supabase.storage
        .from("profile-images")
        .list(id);

      // console.log("Media data for user:", id, mediaData, mediaError);

      if (mediaError || !mediaData || mediaData.length === 0) {
        mediaMap[id] = [];
        return;
      }

      const urls = await Promise.all(
        mediaData.map(async (media: { name: string }) => {
          const { data: profileData, error: profileError } =
            await supabase.storage
              .from("profile-images")
              .getPublicUrl(`${id}/${media.name}`);

          if (profileError) {
            console.error(
              `Error fetching public URL for media: ${media.name}`,
              profileError
            );
            return null;
          }
          return profileData?.publicUrl;
        })
      );

      mediaMap[id] = urls.filter((url: string) => url !== null);
    })
  );

  // console.log("Media URLs fetched:", mediaMap);

  return mediaMap;
};

const constructProfile = (
  userData: any,
  mediaUrls: Record<string, string[]>,
  { minimal = false }: { minimal?: boolean }
) => {
  // console.log("Constructing profile for user data:", userData);
  const media = mediaUrls[userData.id];
  if (!media || media.length === 0) {
    console.error("No media found for user:", userData.id);
    return null;
  }
  const data: Partial<Profile> = {};
  if (minimal) {
    data["conversations"] = userData.conversations;
  } else {
    data["interests"] =
      userData.profile_interests?.map(
        (interest: { interest_registry: { id: string } }) =>
          interest.interest_registry.id
      ) || [];
    data["location"] = {
      point: userData.profile_locations.point,
      distance: userData.profile_locations.distance,
    };
    data["information"] = userData.profile_information.map((item) => {
      return {
        key: item.key,
        value: item.value,
        label: item.profile_information_registry.label,
        priority_order: item.profile_information_registry.priority_order,
      };
    });
  }
  return {
    id: userData.id,
    title: userData.full_name,
    type: userData.type,
    media: media,
    ...data,
  } as Profile;
};

export const getUserData = async (
  userId: string[] | string,
  {
    minimal,
    exclude,
    sourceId,
    recommender,
    mode = "flatmate",
    filters,
  }: {
    minimal?: boolean;
    exclude?: boolean;
    sourceId?: string;
    recommender?: boolean;
    filters?: Record<string, any>;
    mode?: "flatmate" | "accommodation";
  } = {}
) => {
  if (typeof userId === "string") {
    userId = [userId];
  }
  console.log("Fetching user data for IDs:", userId, minimal);
  //   if minimal is true we only return data that is needed for inital loading
  //   if minimal is false we return all data

  const getUserDataQuery = minimal
    ? `
      conversation_members!user_id(
        conversation_id,
        user_id,
        conversation_registry!conversation_id(
          conversation_id,
          conversation_messages!conversation_id(
            content, status, sender_id, created_at, message_id
          )
        )
      )
    `
    : `
      profile_information!profile_id(*, profile_information_registry!key(label, priority_order)),
      profile_interests!profile_id(interest_registry!id(id)),
      profile_locations!profile_id(point)
    `;

  let userData, userError;
  if (exclude) {
    // Get user data for all users except the given user IDs
    console.log("Excluding user IDs:", userId);
    const { data: _userData, error: _userError } = await supabase
      .from("profile_mapping")
      .select(
        `
          type,
          id,
          ${getUserDataQuery}
          `
      )
      .filter("id", "not.in", `(${userId.join(",")})`);
    userData = _userData;
    userError = _userError;
  } else {
    // Get user data for the given user IDs
    console.log("Including user IDs:", userId, mode);
    const { data: _userData, error: _userError } = await supabase
      .from("profile_mapping")
      .select(
        `
              type,
              id,
              ${getUserDataQuery}
              `
      )
      .filter("type", "eq", mode)
      .in("id", userId);
    userData = _userData;
    userError = _userError;
  }

  console.log("User data fetched:", userData, userError);

  if (recommender) {
    if (GLOBAL_INTEREST_LIST.length === 0) {
      const { data: interestData, error: interestError } = await supabase
        .from("interest_registry")
        .select("id");

      if (interestError) {
        return console.error(
          "Error fetching interest registry:",
          interestError
        );
      }

      GLOBAL_INTEREST_LIST.push(...interestData.map((interest) => interest.id));
    }

    const vectorize = (userInterests: string[]) => {
      const vector = GLOBAL_INTEREST_LIST.map((id) =>
        userInterests.includes(id) ? 1 : 0
      );
      return vector;
    };

    const dot = (a: number[], b: number[]) =>
      a.reduce((acc, val, i) => acc + val * b[i], 0);

    const magnitude = (vec: number[]) =>
      Math.sqrt(vec.reduce((acc, val) => acc + val * val, 0));

    const cosineSimilarity = (a: number[], b: number[]) =>
      dot(a, b) / (magnitude(a) * magnitude(b));

    const sourceProfile = userData.find((u) => u.id === sourceId);

    const sourceVector = vectorize(
      sourceProfile?.profile_interests.map((i) => i.interest_registry.id)
    );

    userData = userData
      .map((user) => {
        const targetVector = vectorize(
          user.profile_interests.map((i) => i.interest_registry.id)
        );

        return {
          ...user,
          similarity:
            user.id === sourceId
              ? 0
              : cosineSimilarity(sourceVector, targetVector),
        };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10);
  }

  if (!userData || userData.length === 0) {
    console.error("No user data found:", userError);
    return [];
  }

  if (exclude) userId = userData.map((user) => user.id);

  // console.log("User data fetched:", userData);
  // Get media URLs for all users
  const mediaUrls = await getMediaUrls(userId);

  return userData?.map((profile) => {
    if (minimal) {
      // Only return conversations with the source user involved
      const members = profile.conversation_members.filter((member) => {
        return member.user_id !== sourceId;
      });

      // Extract conversations and latest messages
      const conversations = members.map((member) => {
        const messages =
          member.conversation_registry.conversation_messages || [];

        const sortedMessages = [...messages].sort((a, b) => {
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });

        return {
          conversation_id: member.conversation_id,
          messages,
          latest_message: sortedMessages[0] || null,
        };
      });

      return constructProfile({ ...profile, conversations }, mediaUrls, {
        minimal,
      });
    } else {
      return constructProfile(profile, mediaUrls, {
        minimal,
      });
    }
  });
};

export const getConnectedUserIds = async (
  userId: string,
  mode: "accommodation" | "flatmate"
) => {
  const { data: connectionData, error: connectionError } = await supabase
    .from("connections")
    .select(`cohert2, cohert1`)
    .or(`cohert1.eq.${userId},cohert2.eq.${userId}`)
    .eq("type", mode);

  if (connectionError) {
    return { status: "success", response: [] };
  }

  const connections = connectionData;
  if (!connections || connections.length === 0) {
    return { status: "success", response: [] };
  }

  const connectedUserIds = connections.map((connection) => {
    return connection.cohert1 === userId
      ? connection.cohert2
      : connection.cohert1;
  });

  return { status: "success", response: connectedUserIds };
};

const getLikedUserIds = async (userId: string) => {
  const { data: likeData, error: likeError } = await supabase
    .from("profile_interactions")
    .select("cohert2")
    .eq("cohert1", userId)
    .eq("type", "like");
  if (likeError) {
    return { status: "error", response: likeError };
  }

  if (!likeData || likeData.length === 0) {
    return { status: "success", response: [] };
  }

  const likedUserIds = likeData.map((like) => like.cohert2);
  return { status: "success", response: likedUserIds };
};

export const getLocationFilteredUserIds = async (
  filters: Record<string, any>,
  excludeUserIds: string[] = [],
  userType: "flatmate" | "accommodation" = "flatmate"
): Promise<string[]> => {
  // If we have a location filter
  const { latitude, longitude, range } = filters.location;

  const { data: locationData, error: locationError } = await supabase.rpc(
    "get_profiles_within_distance",
    {
      user_type: userType,
      exclude_ids: excludeUserIds,
      lat: latitude,
      lng: longitude,
      distance_meters: range,
    }
  );

  if (locationError) {
    console.error("Error applying location filter:", locationError);
  }

  return locationData.map((user: { id: string }) => user.id);
};

export const getFilteredUserIds = async (
  filters: Record<string, any>,
  excludeUserIds: string[] = [],
  mode: "accommodation" | "flatmate"
) => {
  // const locationFilteredUserIds = await getLocationFilteredUserIds(
  //   filters,
  //   excludeUserIds,
  //   mode
  // );

  // filtering out age rn for testing
  const parsedFilters = Object.entries(filters).filter(
    ([key, value]) => key !== "location" && value !== null
  );

  let query = supabase.from("profile_information").select("profile_id");
  parsedFilters.forEach(([key, value]) => {
    if (key === "budget") {
      // Range filter
      // console.log("Range filter:", key, min, max);
      const [min, max] = value;
      query = query
        .eq("key", key)
        .gte(`value->data->value`, min)
        .lte(`value->data->value`, max);
      // .in("profile_id", locationFilteredUserIds);
    }
  });

  const { data: filteredData, error: filterError } = await query;
  if (filterError) {
    console.error("Error applying filters:", filterError);
    return { response: [] };
  }
  console.log("Filtered user IDs:", filteredData);
  if (!filteredData || filteredData.length === 0) {
    return { response: [] };
  }

  const filteredUserIds = filteredData.map((item) => item.profile_id);

  return { response: filteredUserIds };
};

export const getDiscoveryProfiles = async (
  sourceId: string,
  filters: Record<string, any>,
  search: "accommodation" | "flatmate" = "flatmate"
) => {
  const { response: connectedUsersIds } = await getConnectedUserIds(
    sourceId,
    search
  );

  const { response: likedUserIds } = await getLikedUserIds(sourceId);

  const combinedUserIds = [...connectedUsersIds, ...likedUserIds, sourceId];

  // const { response: filteredUserIds } = await getFilteredUserIds(
  //   filters,
  //   combinedUserIds,
  //   search
  // );

  // exclude will exclude the given ids
  const discoveryUsers = await getUserData(combinedUserIds, {
    // exclude: true,
    sourceId,
    recommender: false,
    filters,
    mode: search,
  });

  if (!discoveryUsers) {
    return { status: "error", response: "No users found" };
  }

  return { status: "success", response: discoveryUsers };
};

export const getConnectedUsers = async (
  sourceId: string,
  { minimal, mode }: { minimal: boolean; mode: "accommodation" | "flatmate" }
) => {
  const { response: connectedUserIds } = await getConnectedUserIds(
    sourceId,
    mode
  );
  const connectedUsers = await getUserData(connectedUserIds, {
    minimal,
    sourceId,
    mode,
  });

  if (!connectedUsers) {
    return [];
  }

  return connectedUsers;
};

export const likeUser = async (targetId: string, sourceId: string) => {
  if (targetId === sourceId)
    return { status: "error", response: "Invalid user" };

  const { data, error } = await supabase
    .from("profile_interactions")
    .select("type")
    .eq("cohert2", sourceId)
    .eq("cohert1", targetId)
    .eq("type", "like")
    .single();

  if (!data) {
    const { error } = await supabase.from("profile_interactions").upsert({
      cohert1: sourceId,
      cohert2: targetId,
    });
    if (error) return { status: "error", response: error };

    return { status: "success" };
  } else {
    const deleteInteractions = Promise.all([
      supabase
        .from("profile_interactions")
        .delete()
        .eq("cohert1", targetId)
        .eq("cohert2", sourceId),
      supabase
        .from("profile_interactions")
        .delete()
        .eq("cohert1", sourceId)
        .eq("cohert2", targetId),
    ]);

    const createConversation = supabase
      .from("conversation_registry")
      .insert({})
      .select("conversation_id")
      .single();

    const [_, { data: conversationData, error: conversationError }] =
      await Promise.all([deleteInteractions, createConversation]);

    if (!conversationData) {
      return { status: "error", response: conversationError };
    }

    await Promise.all([
      supabase.from("connections").insert({
        cohert1: targetId,
        cohert2: sourceId,
      }),
      supabase.from("conversation_members").insert([
        {
          conversation_id: conversationData.conversation_id,
          user_id: targetId,
        },
        {
          conversation_id: conversationData.conversation_id,
          user_id: sourceId,
        },
      ]),
    ]);

    return { status: "success", reponse: "matched" };
  }
};

export const dislikeUser = async (targetId: string, sourceId: string) => {
  if (targetId === sourceId)
    return { status: "error", response: "Invalid user" };
  await supabase.from("profile_interactions").insert({
    cohert1: sourceId,
    cohert2: targetId,
    type: "dislike",
  });

  return { status: "success" };
};
