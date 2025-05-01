import { createClient } from "jsr:@supabase/supabase-js@2";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
const GLOBAL_INTEREST_LIST = [];
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase credentials not configured");
}
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const getMediaUrls = async (userIds)=>{
  const mediaMap = {};
  // run the function in parallel for all user IDs
  await Promise.all(userIds.map(async (id)=>{
    // fetch the list of images for each user
    const { data: mediaData, error: mediaError } = await supabase.storage.from("profile-images").list(id);
    // if no media found, or error occurred, set empty array
    if (mediaError || !mediaData || mediaData.length === 0) {
      return mediaMap[id] = [];
    }
    const urls = await Promise.all(mediaData.map(async (media)=>{
      // fetch the public URL for each media item per user
      const { data: profileData, error: profileError } = await supabase.storage.from("profile-images").getPublicUrl(`${id}/${media.name}`);
      if (profileError) {
        return console.warn(`Error fetching public URL for media: ${media.name}`, profileError);
      }
      // return the public URL if it exists
      return profileData?.publicUrl;
    }));
    // filter out any null URLs
    mediaMap[id] = urls.filter((url)=>url !== null);
  }));
  // return the media map with user IDs as keys and
  // their media URLs as values
  return mediaMap;
};
const constructProfile = (userData, mediaUrls, { minimal = false })=>{
  const media = mediaUrls[userData.id] || [];
  // partial allows us to create an object with
  // only the properties we need
  const data = {};
  // if minimal is true, we need to get the conversation
  // if minimal is false, we need to get the profile interests
  // and location.
  if (minimal) {
    data["conversations"] = userData?.conversations;
  } else {
    data["interests"] = userData.profile_interests?.map((interest)=>interest?.interest_registry?.id) || [];
    data["location"] = {
      point: userData.profile_locations?.point || {
        longitude: 0,
        latitude: 0
      },
      distance: userData.profile_locations?.distance || 0
    };
  }
  // convert the profile information to a hash map
  // with the key as the profile information registry key
  // and the value as the profile information value
  data["information"] = userData.profile_information.reduce((acc, item)=>{
    acc[item.key] = {
      value: item.value,
      label: item.profile_information_registry?.label || "",
      type: item.profile_information_registry?.type,
      input_type: item.profile_information_registry?.input_type,
      editable: item.profile_information_registry?.editable || false,
      creation: item.profile_information_registry?.creation,
      priority_order: item.profile_information_registry?.priority_order || null
    };
    return acc;
  }, {});
  // construct the profile object with the user data
  // and the media URLs
  return {
    id: userData?.id || "",
    title: userData?.full_name || "No Name",
    type: userData?.type || "unknown",
    media: media || [],
    ...data
  };
};
export const createResponse = (status, response)=>{
  return new Response(JSON.stringify({
    status: status,
    response: response
  }), {
    status: status === "success" ? 200 : 500,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    }
  });
};
const recommenderService = async (userData, sourceId)=>{
  if (GLOBAL_INTEREST_LIST.length === 0) {
    const { data: interestData, error: interestError } = await supabase.from("interest_registry").select("id");
    if (interestError) {
      return {
        status: "error",
        response: interestError
      };
    }
    const parsedData = interestData?.map((item)=>item.id);
    const sortedGlobalIds = parsedData?.sort((a, b)=>a.localeCompare(b));
    GLOBAL_INTEREST_LIST.push(...sortedGlobalIds);
    console.log("Global interest list:", GLOBAL_INTEREST_LIST);
  }
  const vectorise = (userInterests)=>{
    // convert the interests to a vector of 0s and 1s
    // 1 if the user has the interest, 0 otherwise
    return GLOBAL_INTEREST_LIST.map((id)=>userInterests.includes(id) ? 1 : 0);
  };
  const dot = (a, b)=>// calculate the dot product of two vectors
    a.reduce((acc, val, i)=>acc + val * b[i], 0);
  const magnitude = (vec)=>// calculate the magnitude of a vector
    Math.sqrt(vec.reduce((acc, val)=>acc + val * val, 0));
  const cosineSimilarity = (a, b)=>// calculate the cosine similarity between two vectors
    dot(a, b) / (magnitude(a) * magnitude(b));
  const sourceProfile = userData.find((u)=>u.id === sourceId);
  const sourceVector = vectorise(sourceProfile?.profile_interests.map((i)=>i.interest_registry.id) ?? []);
  const mostSimilarUsers = userData.map((user)=>{
    if (user.id === sourceId) return null;
    const targetVector = vectorise(user.profile_interests.map((i)=>i.interest_registry.id));
    return {
      ...user,
      similarity: cosineSimilarity(sourceVector, targetVector)
    };
  }).filter((user)=>user !== null).sort((a, b)=>b.similarity - a.similarity).slice(0, 10);
  return mostSimilarUsers;
};
export const getUserData = async (userId, { minimal, exclude, sourceId, recommender, type = "flatmate" } = {})=>{
  if (typeof userId === "string") {
    userId = [
      userId
    ];
  }
  // if minimal is true, we need to get the conversation
  // members and messages and the profile information with
  // the profile information registry
  // if minimal is false, we need to get the profile interests
  // and locations and the profile information with the profile
  // information registry
  const getUserDataQuery = minimal ? `
      conversation_members!user_id(
        conversation_id,
        user_id,
        conversation_registry!conversation_id(
          conversation_id,
          conversation_messages!conversation_id(
            content, status, sender_id, created_at, message_id
          )
        )
      ),
      profile_information!profile_id(
        *, 
        profile_information_registry!key(
          label, priority_order, type, input_type, editable, creation
        )
      )
    `.trim() : `
      profile_information!profile_id(
        *, 
        profile_information_registry!key(
          label, priority_order, type, input_type, editable, creation
        )
      ),
      profile_interests!profile_id(
        interest_registry!id(id)
      ),
      profile_locations!profile_id(point)
    `.trim();
  let userData, userError;
  if (exclude) {
    console.log("Getting user data for exclude:", userId, type);
    // if exclude is true, we need to get the user ids of the
    // users that are not in the exclude list
    const { data: _userData, error: _userError } = await supabase.from("profile_mapping").select(`
        type,
        id,
        ${getUserDataQuery}
      `).filter("id", "not.in", `(${userId.join(",")})`).filter("type", "eq", type);
    userData = _userData;
    userError = _userError;
  } else {
    console.log("Getting user data for include:", userId, type);
    // if exclude is false, we need to get the user ids of the
    // users that are in the include list
    const { data: _userData, error: _userError } = await supabase.from("profile_mapping").select(`
        type,
        id,
        ${getUserDataQuery}
      `).filter("type", "eq", type).in("id", userId);
    userData = _userData;
    userError = _userError;
  }
  console.log("User data:", userData, userError);
  // if recommender is true, we need to get the most similar users
  // based on the interests of the user
  if (recommender && sourceId) {
    const mostSimilarUsers = await recommenderService(userData, sourceId);
    userData = mostSimilarUsers;
  }
  if (!userData || userData.length === 0) {
    console.warn("No user data found:", userError);
    return [];
  }
  // if exclude is true, we need to get the user ids of the
  // users that are not in the exclude list
  if (exclude) userId = userData.map((profile)=>profile.id);
  const mediaUrls = await getMediaUrls(Array.isArray(userId) ? userId : [
    userId
  ]);
  const usersData = userData.map((profile)=>{
    if (minimal) {
      // filter out the sourceId from the conversation members
      const members = profile.conversation_members?.filter((member)=>{
        return member.user_id !== sourceId;
      }) ?? [];
      // process conversations and messages sort the messages
      // by created_at timestamp in descending order
      const conversations = members.map((member)=>{
        const messages = member.conversation_registry?.conversation_messages || [];
        const sortedMessages = [
          ...messages
        ].sort((a, b)=>{
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        return {
          conversation_id: member.conversation_id,
          messages,
          latest_message: sortedMessages[0] || null
        };
      });
      // construct the profile with conversations
      const constructedProfile = constructProfile({
        ...profile,
        conversations
      }, mediaUrls, {
        minimal
      });
      return constructedProfile;
    } else {
      // construct the profile without conversations
      const constructedProfile = constructProfile(profile, mediaUrls, {
        minimal
      });
      return constructedProfile;
    }
  });
  return usersData;
};
export const getConnectedUserIds = async (userId, mode = "flatmate", type = "flatmate")=>{
  // get the connected user ids from the connections table
  let query = supabase.from("connections").select(`cohert2, cohert1`);
  // if the mode is accommodation, we need to get the
  // connected user ids for the accommodation type
  // otherwise we need to get the connected user ids for the flatmate type
  if (mode === "accommodation") {
    query = query.eq("cohert1", userId).eq("type", "flatmate");
  } else {
    query = query.or(`cohert1.eq.${userId},cohert2.eq.${userId}`).eq("type", type);
  }
  const { data: connectionData, error: connectionError } = await query;
  if (connectionError) {
    return {
      status: "success",
      response: []
    };
  }
  const connections = connectionData;
  if (!connections || connections.length === 0) {
    return {
      status: "success",
      response: []
    };
  }
  // get the connected user ids from the connections table
  // if the userId is in cohert1, we need to get the cohert2
  const connectedUserIds = connections.map((connection)=>{
    return connection.cohert1 === userId ? connection.cohert2 : connection.cohert1;
  });
  return {
    status: "success",
    response: connectedUserIds
  };
};
export const getLikedUserIds = async (userId)=>{
  const { data: likeData, error: likeError } = await supabase.from("profile_interactions").select("cohert2").eq("cohert1", userId).eq("type", "like");
  if (likeError) {
    return {
      status: "error",
      response: likeError
    };
  }
  if (!likeData || likeData.length === 0) {
    return {
      status: "success",
      response: []
    };
  }
  // return a list of ids
  const likedUserIds = likeData.map((user)=>user.cohert2);
  return {
    status: "success",
    response: likedUserIds
  };
};
export const getLocationFilteredUserIds = async (filters, excludeUserIds = [], userType = "flatmate")=>{
  // If we have a location filter
  const { latitude, longitude, range } = filters.location;
  const { data: locationData, error: locationError } = await supabase.rpc("get_profiles_within_distance", {
    user_type: userType,
    exclude_ids: excludeUserIds,
    lat: latitude,
    lng: longitude,
    distance_meters: range
  });
  if (locationError) {
    console.error("Error applying location filter:", locationError);
  }
  // get the user ids from the location data
  return locationData.map((user)=>user.id);
};
export const getFilteredUserIds = async (filters, excludeUserIds = [], mode)=>{
  // filter by location and distance
  const locationFilteredUserIds = await getLocationFilteredUserIds(filters, excludeUserIds, mode);
  // remove the location filter from the filters object
  // as its already applied
  const parsedFilters = Object.entries(filters).filter(([key, value])=>key !== "location" && value !== null);
  const filterPromises = [];
  for (const [key, value] of parsedFilters){
    switch(key){
      case "age":
        {
          // convert the age range to birthdate range
          // query the database for profiles with birthdates
          // within the range of the given age
          const [minAge, maxAge] = value;
          const today = new Date();
          const minBirthdate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate()).toISOString();
          const maxBirthdate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate()).toISOString();
          filterPromises.push(supabase.rpc("filter_profiles_by_age", {
            min_birthdate: minBirthdate,
            max_birthdate: maxBirthdate,
            profile_ids: locationFilteredUserIds
          }).then(({ data, error })=>{
            if (error) {
              console.error("Age filter error:", error);
              return {
                data: []
              };
            }
            return {
              data
            };
          }));
          break;
        }
      case "budget":
      case "rent":
        {
          // query the database for profiles with budget/rent
          //  within the range
          const [min, max] = value;
          filterPromises.push(supabase.from("profile_information").select("profile_id").eq("key", key).gte("value->data->value", min).lte("value->data->value", max).in("profile_id", locationFilteredUserIds).then(({ data, error })=>{
            if (error) {
              console.error(`${key} filter error:`, error);
              return {
                data: []
              };
            }
            return {
              data
            };
          }));
          break;
        }
      case "amenities":
      case "gender":
        {
          // query the database for profiles with
          // amenities or gender selected
          const selectedValues = Object.entries(value).filter(([_, selected])=>selected).map(([option])=>option.toLowerCase());
          if (selectedValues.length > 0) {
            filterPromises.push(supabase.rpc("filter_profiles_by_selected_values", {
              selected_values: selectedValues,
              filter_key: key,
              profile_ids: locationFilteredUserIds
            }).then(({ data, error })=>{
              if (error) {
                console.error(`${key} filter error:`, error);
                return {
                  data: []
                };
              }
              return {
                data: (data ?? []).map((row)=>({
                    profile_id: row.profile_id
                  }))
              };
            }));
          }
          break;
        }
      default:
        console.warn(`Unknown filter key: ${key}`);
        break;
    }
  }
  // query the database for the promises in parallel
  const filterResults = await Promise.all(filterPromises);
  // track the profile IDs from each filter result
  const profileIdSets = filterResults.map((result)=>new Set(result.data.map((row)=>row.profile_id)));
  if (profileIdSets.length === 0) {
    return {
      response: locationFilteredUserIds
    };
  }
  // return the profile IDs that are present in all filter results
  const finalFilteredIds = [
    ...profileIdSets.reduce((acc, set)=>{
      return new Set([
        ...acc
      ].filter((id)=>set.has(id)));
    })
  ];
  return {
    response: finalFilteredIds
  };
};
export const getDiscoveryProfiles = async (sourceId, filters, search = "flatmate")=>{
  // get users who are already connected with source user
  const { response: connectedUsersIds } = await getConnectedUserIds(sourceId, "flatmate", search);
  // get users who the source user liked
  const { response: likedUserIds } = await getLikedUserIds(sourceId);
  const combinedUserIds = [
    ...connectedUsersIds,
    ...likedUserIds
  ];
  // use these ids as exclude list and filter every other user
  // based on the filters provided
  const result = await getFilteredUserIds(filters, combinedUserIds, search);
  const filteredUserIds = Array.isArray(result) ? result : result.response;
  // given the filtered user ids, get the user data
  // and return the profiles with similar interests
  const discoveryUsers = await getUserData(filteredUserIds, {
    exclude: false,
    recommender: true,
    minimal: false,
    sourceId,
    type: search
  });
  if (!discoveryUsers) {
    return {
      status: "error",
      response: "No users found"
    };
  }
  return {
    status: "success",
    response: discoveryUsers
  };
};
export const getHousingRequests = async (sourceId)=>{
  const { data, error } = await supabase.from("profile_interactions").select("cohert1").eq("cohert2", sourceId).eq("type", "like");
  const parsedData = data?.map((item)=>item.cohert1);
  const combinedUserIds = [
    ...parsedData,
    sourceId
  ];
  // exclude will exclude the given ids
  const housingRequests = await getUserData(combinedUserIds, {
    exclude: false,
    sourceId,
    recommender: false,
    minimal: false,
    type: "flatmate"
  });
  if (!housingRequests) {
    return {
      status: "error",
      response: "No users found"
    };
  }
  return {
    status: "success",
    response: housingRequests
  };
};
export const getConnectedUsers = async (sourceId, { minimal, mode, type = "flatmate" })=>{
  console.log("Getting connected users for:", sourceId, minimal, mode);
  const { response: connectedUserIds } = await getConnectedUserIds(sourceId, mode, type);
  console.log("Connected user IDs:", connectedUserIds);
  const connectedUsers = await getUserData(connectedUserIds, {
    minimal,
    sourceId,
    type
  });
  if (!connectedUsers) {
    return [];
  }
  return connectedUsers;
};
export const likeUser = async (targetId, sourceId, mode)=>{
  if (targetId === sourceId) return {
    status: "error",
    response: "Invalid user"
  };
  // insert the like into the profile_interactions table
  const { error } = await supabase.from("profile_interactions").insert({
    cohert1: sourceId,
    cohert2: targetId,
    type: "like",
    mode: mode
  });
  if (error) return {
    status: "error",
    response: error.message
  };
  return {
    status: "success"
  };
};
export const dislikeUser = async (targetId, sourceId, mode)=>{
  if (targetId === sourceId) return {
    status: "error",
    response: "Invalid user"
  };
  // insert the dislike into the profile_interactions table
  const { error } = await supabase.from("profile_interactions").insert({
    cohert1: sourceId,
    cohert2: targetId,
    type: "dislike",
    mode: mode
  });
  if (error) return {
    status: "error",
    response: error.message
  };
  return {
    status: "success"
  };
};
