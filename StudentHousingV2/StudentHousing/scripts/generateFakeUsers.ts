import supabase from "@/lib/supabase";
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";

// Constants
const INTERESTS = [
  "11239c98-71f9-40c1-8547-f865f5a5a022",
  "338e7d05-3e52-4780-b0b7-3591de72fc9f",
  "4c8bfc67-03c9-43a7-a152-a93460a76b09",
  "4d0756a9-f104-4543-a1d8-cfd08a8ccd65",
  "6179361d-fbb8-4665-8415-c3ef44daeae0",
  "694ac964-fabc-45e0-aac2-d55ffeff9983",
  "73766b79-0524-493d-8269-ec395eac1d2d",
  "79c22c5b-8298-4f57-b757-1272ffb5c0dd",
  "7c478cb2-ce1d-4893-9615-96b352c5b63e",
  "a9100d55-b81c-44e5-80c3-561ce339ed1c",
  "c97b0f38-ed5a-4196-b1a3-1bb97e2c0277",
  "df7dc5d1-29a7-4e88-abd6-d0a81a65f7fb",
];

const AMENITIES = [
  "939a39cb-65ed-4d32-9f61-4a21fa7c3208",
  "8ea30d73-a3bd-4577-845d-55763864f449",
];

const DEV_ID = "7edf42e0-d865-46c9-986a-0560837a02bc";
const MIN_BUDGET = 1000;
const MAX_BUDGET = 3000;
const MIN_INTERESTS = 1;
const MAX_INTERESTS = 5;
const MIN_MEDIA = 1;
const MAX_MEDIA = 3;

// Types
type ProfileInformation = {
  profile_id: string;
  key: string;
  value: { data: { value: any } };
  view: string;
};

// Helper Functions
const getRandomInterests = (): string[] => {
  const count = faker.number.int({ min: MIN_INTERESTS, max: MAX_INTERESTS });
  return [...INTERESTS].sort(() => Math.random() - 0.5).slice(0, count);
};

const getRandomMediaCount = (): number => {
  return faker.number.int({ min: MIN_MEDIA, max: MAX_MEDIA });
};

const createAccommodationProfileInformation = (
  profileId: string,
  name: string
): ProfileInformation[] => [
  {
    profile_id: profileId,
    key: "name",
    value: { data: { value: name } },
    view: "accommodation",
  },
  {
    profile_id: profileId,
    key: "rent",
    value: {
      data: { value: faker.number.int({ min: MIN_BUDGET, max: MAX_BUDGET }) },
    },
    view: "accommodation",
  },
  {
    profile_id: profileId,
    key: "amenities",
    value: { data: { value: [...AMENITIES] } },
    view: "accommodation",
  },
];

const createFlatmateProfileInformation = (
  profileId: string,
  name: string
): ProfileInformation[] => [
  {
    profile_id: profileId,
    key: "name",
    value: { data: { value: name } },
    view: "flatmate",
  },
  {
    profile_id: profileId,
    key: "budget",
    value: {
      data: { value: faker.number.int({ min: MIN_BUDGET, max: MAX_BUDGET }) },
    },
    view: "flatmate",
  },
  {
    profile_id: profileId,
    key: "university",
    value: { data: { value: { id: "tud", label: "TUDublin" } } },
    view: "flatmate",
  },
  {
    profile_id: profileId,
    key: "biography",
    value: { data: { value: faker.lorem.paragraph(2) } },
    view: "flatmate",
  },
  {
    profile_id: profileId,
    key: "gender",
    value: { data: { value: ["male"] } },
    view: "flatmate",
  },
  {
    profile_id: profileId,
    key: "age",
    value: { data: { value: faker.date.birthdate() } },
    view: "flatmate",
  },
];

const uploadProfileImage = async (
  profileId: string,
  index: number,
  type: "flatmate" | "accommodation"
) => {
  const media =
    type === "flatmate"
      ? faker.image.avatar()
      : faker.image.urlLoremFlickr({
          category: "property",
        });

  const arrayBuffer = await fetch(media).then((res) => res.arrayBuffer());
  const path = `${profileId}/${index}.jpg`;

  await supabase.storage
    .from("profile-images")
    .update(path, arrayBuffer, { contentType: "image/jpeg" });
};

// Main Functions
const createSupabaseUser = async (name: string, email: string) => {
  const { data: user, error } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { full_name: name },
  });

  if (error || !user?.user?.id) {
    throw new Error(error?.message || "User creation failed");
  }

  return user.user.id;
};

const getProfileMappings = async (userId: string) => {
  const { data: mappings, error } = await supabase
    .from("profile_mapping")
    .select("id, type")
    .eq("linked_profile", userId);

  if (error || !mappings) {
    throw new Error(error?.message || "Failed to get profile mappings");
  }

  return mappings.reduce((acc: Record<string, string>, mapping) => {
    if (mapping.type && mapping.id) {
      acc[mapping.type] = mapping.id;
    }
    return acc;
  }, {});
};

const createFakeUser = async () => {
  try {
    const name = faker.person.firstName();
    const email = faker.internet.email();

    // Create auth user
    const userId = await createSupabaseUser(name, email);

    // Get profile mappings
    const profileIds = await getProfileMappings(userId);
    const flatmateId = profileIds["flatmate"];
    const accommodationId = profileIds["accommodation"];

    if (!flatmateId) {
      throw new Error("Flatmate ID not found");
    }

    if (!accommodationId) {
      throw new Error("Accommodation ID not found");
    }

    createFakeFlatmate(flatmateId);
    // Create accommodation
    createFakeAccommodation(accommodationId);

    return { success: true, userId };
  } catch (error) {
    console.error("Error creating fake user:", error);
    return { success: false, error };
  }
};

const createFakeFlatmate = async (userId: string) => {
  // Create profile information
  const name = faker.person.firstName();
  await supabase
    .from("profile_information")
    .upsert(createFlatmateProfileInformation(userId, name));

  // Add location
  await supabase.from("profile_locations").upsert([
    {
      profile_id: userId,
      point: `POINT(${faker.location.latitude()} ${faker.location.longitude()})`,
    },
  ]);

  // Add interests
  const userInterests = getRandomInterests();
  await supabase.from("profile_interests").upsert(
    userInterests.map((interest) => ({
      profile_id: userId,
      interest_id: interest,
    }))
  );

  // Upload media
  const mediaCount = getRandomMediaCount();
  for (let i = 0; i < mediaCount; i++) {
    await uploadProfileImage(userId, i, "flatmate");
  }
};

const createFakeAccommodation = async (userId: string) => {
  const name = faker.company.name();

  await supabase
    .from("profile_information")
    .upsert(createAccommodationProfileInformation(userId, name));

  await supabase.from("profile_locations").upsert([
    {
      profile_id: userId,
      point: `POINT(${faker.location.latitude()} ${faker.location.longitude()})`,
    },
  ]);

  // Upload media
  const mediaCount = getRandomMediaCount();
  for (let i = 0; i < mediaCount; i++) {
    await uploadProfileImage(userId, i, "accommodation");
  }
};

// Main Export
export default async function generateFakeUsers(numUsers: number) {
  const results = [];

  for (let i = 0; i < numUsers; i++) {
    results.push(await createFakeUser());
  }

  return results;
}
