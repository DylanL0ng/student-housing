import { createClient } from "jsr:@supabase/supabase-js@2";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const SAVED_PROMPTS = {};
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase credentials not configured");
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const getPromptLabel = async (prompt_id) => {
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
  const prompts = promptData.reduce((acc, prompt) => {
    acc[prompt.id] = prompt.prompt;
    SAVED_PROMPTS[prompt.id] = prompt.prompt;
    return acc;
  }, {});
  return prompts;
};
export const getMediaUrls = async (userIds) => {
  const mediaMap = {};
  await Promise.all(
    userIds.map(async (id) => {
      const { data: mediaData, error: mediaError } = await supabase.storage
        .from("profile-images")
        .list(id);
      if (mediaError || !mediaData || mediaData.length === 0) {
        mediaMap[id] = [];
        return;
      }
      const urls = await Promise.all(
        mediaData.map(async (media) => {
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
      mediaMap[id] = urls.filter((url) => url !== null);
    })
  );
  return mediaMap;
};
const constructProfile = (userData, mediaUrls, { minimal }) => {
  const media = mediaUrls[userData.id];
  if (!media || media.length === 0) {
    console.error("No media found for user:", userData.id);
    return null;
  }
  const data = {};
  if (minimal) {
    //   conversation_members: [
    //     {
    //       conversation_id: "1b763211-8670-4b3b-b24a-1466dd2fa46d",
    //       conversation_registry: {
    //         conversation_id: "1b763211-8670-4b3b-b24a-1466dd2fa46d",
    //         conversation_messages: [ [Object], [Object], [Object] ]
    //       }
    //     }
    //   ]
    // }
    // ;
  } else {
    data["interests"] = userData.profile_interests.map(
      (interest) => interest.interest_registry.interest
    );
    data["location"] = {
      city: userData.profile_locations[0].city,
      point: userData.profile_locations[0].point,
      distance: userData.profile_locations[0].distance,
    };
    data["information"] = userData.profile_information.map((info) => {
      return {
        key: info.profile_information_registry.key,
        value: info.profile_information_registry.value,
      };
    });
  }
  return {
    id: userData.id,
    title: userData.full_name,
    type: userData.type,
    media: media,
    ...data,
  };
};

export const getUserData = async (userId, { minimal, exclude }) => {
  if (typeof userId === "string") {
    userId = [userId];
  }
  // console.log("Fetching user data for IDs:", userId, minimal);
  //   if minimal is true we only return data that is needed for inital loading
  //   if minimal is false we return all data

  const getUserDataQuery = minimal
    ? `
      conversation_members!user_id(
        conversation_id,
        conversation_registry!conversation_id(
          conversation_id,
          conversation_messages!conversation_id(
            id,
            content,
            created_at,
            sender_id
          )
        )
      )
    `
    : `
      profile_information!profile_id(*, profile_information_registry!key(label, priority_order)),
      profile_interests!profile_id(interest_registry!id(interest)),
      profile_locations!profile_id(point, city)
    `;

  let userData, userError;
  if (exclude) {
    const { data: _userData, error: _userError } = await supabase
      .from("profiles")
      .select(
        `
            full_name,
            type,
            id,
            ${getUserDataQuery}
            `
      )
      .not("id", "in", userId)
      .limit(10);
    userData = _userData;
    userError = _userError;
  } else {
    const { data: _userData, error: _userError } = await supabase
      .from("profiles")
      .select(
        `
            full_name,
            type,
            id,
            ${getUserDataQuery}
            `
      )
      .in("id", userId)
      .limit(10);
    userData = _userData;
    userError = _userError;
  }

  if (!userData || userData.length === 0) {
    return [];
  }

  // Get media URLs for all users
  const mediaUrls = await getMediaUrls(userId);

  // console.log("User data:", userData);
  // Process the results to include only the most recent message for each conversation
  return userData.map((user) => {
    // If minimal mode, process conversation data to get most recent messages
    if (minimal && user.conversation_members) {
      // For each conversation, find the most recent message
      user.conversation_members = user.conversation_members.map((member) => {
        if (
          member.conversation_registry &&
          member.conversation_registry.conversation_messages &&
          member.conversation_registry.conversation_messages.length > 0
        ) {
          // Sort messages by created_at in descending order
          const sortedMessages = [
            ...member.conversation_registry.conversation_messages,
          ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

          // Keep only the most recent message
          member.conversation_registry.conversation_messages = [
            sortedMessages[0],
          ];
        }
        return member;
      });
    }

    return constructProfile(user, mediaUrls, {
      minimal,
    });
  });
};

export const getConnectedUserIds = async (userId) => {
  const { data, error } = await supabase
    .from("connections")
    .select(
      `
      cohert2, cohert1
    `
    )
    .or(`cohert1.eq.${userId},cohert2.eq.${userId}`);
  if (error) {
    return [];
  }
  const connections = data;
  const connectedUserIds = connections.map((connection) => {
    return connection.cohert1 === userId
      ? connection.cohert2
      : connection.cohert1;
  });
  if (connectedUserIds.length === 0) {
    return [];
  }
  return connectedUserIds;
};
export const getDiscoveryProfiles = async (userId, filters) => {
  const connectedUsersIds = await getConnectedUserIds(userId);
  const discoveryUsers = await getUserData(connectedUsersIds, {
    minimal: true,
    exclude: true,
  });
  if (!discoveryUsers) {
    return [];
  }
  return discoveryUsers;
};
export const getConnectedUsers = async (userId, { minimal }) => {
  const connectedUserIds = await getConnectedUserIds(userId);
  const connectedUsers = await getUserData(connectedUserIds, {
    minimal,
  });
  if (!connectedUsers) {
    return [];
  }
  return connectedUsers;
};
