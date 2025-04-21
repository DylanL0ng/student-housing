import supabase from "@/lib/supabase";
import { ar, faker } from "@faker-js/faker";

import * as Location from "expo-location";

const interests = [
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

const DEV_ID = "7edf42e0-d865-46c9-986a-0560837a02bc";

export default async function generateFakeUsers(numUsers: number) {
  // // console.log(`Generating ${numUsers} fake users...`);

  for (let count = 0; count < numUsers; count++) {
    try {
      const name = `${faker.person.firstName()}`;
      // const budget = faker.number.int({ min: 1000, max: 3000 });
      const email = faker.internet.email();

      // Create user
      const { data: user, error: userError } =
        await supabase.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { full_name: name },
        });

      if (userError || !user?.user?.id)
        return console.error(userError?.message || "User creation failed");

      const { data: userIds, error: userIdError } = await supabase
        .from("profile_mapping")
        .select("id, type")
        .eq("linked_profile", user.user.id);

      if (userIdError || !userIds) {
        console.error(userIdError?.message || "Failed to get profile mappings");
        return;
      }

      // Parse userIds into an object with type as key and id as value
      const profileIds = userIds.reduce(
        (acc: Record<string, string>, mapping) => {
          if (mapping.type && mapping.id) {
            acc[mapping.type] = mapping.id;
          }
          return acc;
        },
        {}
      );

      // handle flatmate
      const flatmateId = profileIds["flatmate"];
      if (!flatmateId) {
        console.error("Flatmate ID not found");
        return;
      }

      await supabase.from("profile_information").upsert([
        {
          profile_id: flatmateId,
          key: "name",
          value: {
            data: {
              value: name,
            },
          },
          view: "flatmate",
        },
        {
          profile_id: flatmateId,
          key: "budget",
          value: {
            data: {
              value: 1000,
            },
          },
          view: "flatmate",
        },
        {
          profile_id: flatmateId,
          key: "university",
          value: {
            data: {
              value: ["Technlogical University of Dublin"],
            },
          },
          view: "flatmate",
        },
        {
          profile_id: flatmateId,
          key: "biography",
          value: {
            data: {
              value: faker.lorem.paragraph(2),
            },
          },
          view: "flatmate",
        },
        {
          profile_id: flatmateId,
          key: "gender",
          value: {
            data: {
              value: ["male"],
            },
          },
          view: "flatmate",
        },
        {
          profile_id: flatmateId,
          key: "age",
          value: {
            data: {
              value: faker.date.birthdate(),
            },
          },
          view: "flatmate",
        },
      ]);

      await supabase.from("profile_locations").upsert([
        {
          profile_id: flatmateId,
          point: `POINT(${faker.location.latitude()} ${faker.location.longitude()})`,
        },
      ]);

      await supabase.from("profile_interests").upsert([
        {
          profile_id: flatmateId,
          interest_id: interests[Math.floor(Math.random() * interests.length)],
        },
        {
          profile_id: flatmateId,
          interest_id: interests[Math.floor(Math.random() * interests.length)],
        },
        {
          profile_id: flatmateId,
          interest_id: interests[Math.floor(Math.random() * interests.length)],
        },
      ]);

      // Upload media
      const mediaCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < mediaCount; i++) {
        const media = faker.image.avatar();
        const arraybuffer = await fetch(media).then((res) => res.arrayBuffer());
        const path = `${flatmateId}/${i}.jpg`;

        await supabase.storage
          .from("profile-images")
          .update(path, arraybuffer, { contentType: "image/jpeg" });
      }

      // // Update profile
      // const { error: updateUserError } = await supabase
      //   .from("profiles")
      //   .update({ full_name: name })
      //   .eq("id", user_id);

      // if (updateUserError) return console.error(updateUserError.message);

      // const latitude: number = faker.location.latitude();
      // const longitude: number = faker.location.longitude();

      // const geocode = await Location.reverseGeocodeAsync({
      //   latitude,
      //   longitude,
      // });

      // let city = "unknown";
      // let country = "unknown";
      // if (geocode.length > 0) {
      //   const { city: _city, country: _country } = geocode[0];
      //   if (_city) city = _city;
      //   if (_country) country = _country;
      // }

      // const { data: locationData, error: locationError } = await supabase
      //   .from("profile_locations")
      //   .upsert({
      //     point: `POINT(${latitude} ${longitude})`,
      //     city: city,
      //     user_id: user_id,
      //   });

      // if (locationError)
      //   return console.error("Error inserting location:", locationError);

      // // Generate interests
      // const interestCount = Math.floor(Math.random() * 5) + 1;
      // const shuffledInterests = [...interests].sort(() => Math.random() - 0.5);
      // const userInterests = shuffledInterests.slice(0, interestCount);

      // // Insert interests
      // const { error: interestError } = await supabase
      //   .from("profile_interests")
      //   .insert(
      //     userInterests.map((interest) => ({
      //       user_id,
      //       interest_id: interest,
      //     }))
      //   );

      // if (interestError)
      //   return console.error("Error inserting interests:", interestError);

      // // Upload media
      // const mediaCount = Math.floor(Math.random() * 3) + 1;
      // for (let i = 0; i < mediaCount; i++) {
      //   const media = faker.image.personPortrait();
      //   const arraybuffer = await fetch(media).then((res) => res.arrayBuffer());
      //   const path = `${user_id}/${i}.jpg`;

      //   await supabase.storage
      //     .from("profile-images")
      //     .update(path, arraybuffer, { contentType: "image/jpeg" });
      // }

      // // Create interaction
      // await supabase
      //   .from("profile_interactions")
      //   .insert({ cohert1: user_id, cohert2: DEV_ID, type: "like" });

      // // console.log(`Created user ${count + 1}/${numUsers}`);
    } catch (error) {
      return console.error(`Failed to create user ${count + 1}:`, error);
    }
  }

  // // console.log("Finished generating users.");
}
