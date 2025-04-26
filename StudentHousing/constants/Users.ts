import { Conversation } from "@/typings";
import { useState } from "react";

export const Relationships = [
  {
    id: "1",
    type: "friend",
    interacted: false,
  },
];

export const Users = {
  "1": {
    id: "1",
    name: "Alice",
    date_of_birth: "1982/31/08",
    profile: {
      id: "1:profile",
      title: "Alice",
      location: "Dublin",
      media: [
        "https://media.istockphoto.com/id/1384892916/photo/young-teenager-taking-a-selfie-with-smartphone-in-a-city-park.jpg?s=2048x2048&w=is&k=20&c=kMTTX7I6CcKVpre2UQXojPVM9_CUja__m6wW3piFq0s=",
        "https://media.istockphoto.com/id/1391794638/photo/portrait-of-beautiful-woman-making-selfie-in-the-municipal-market.jpg?s=2048x2048&w=is&k=20&c=YbNsTsh_W5mB1P9ccxlyNo7VNc1ewkEepHMDB3zBopA=",
        "https://media.istockphoto.com/id/1460836430/photo/video-ringing-successful-businessman-looking-at-smartphone-camera-talking-remotely-with.jpg?s=2048x2048&w=is&k=20&c=waw4Q6Vx64wkowOAf0Pch_RhnpW8XKDg0RQJUE4AVns=",
      ],
      interests: ["music", "sports", "art"],
    },
  },
  "2": {
    id: "2",
    name: "Bob",
    date_of_birth: "1982/31/08",
    profile: {
      id: "2:profile",
      title: "Bob",
      location: "Dublin",
      interests: ["music", "sports", "art"],
      media: [
        "https://media.istockphoto.com/id/1384892916/photo/young-teenager-taking-a-selfie-with-smartphone-in-a-city-park.jpg?s=2048x2048&w=is&k=20&c=kMTTX7I6CcKVpre2UQXojPVM9_CUja__m6wW3piFq0s=",
        "https://media.istockphoto.com/id/1391794638/photo/portrait-of-beautiful-woman-making-selfie-in-the-municipal-market.jpg?s=2048x2048&w=is&k=20&c=YbNsTsh_W5mB1P9ccxlyNo7VNc1ewkEepHMDB3zBopA=",
        "https://media.istockphoto.com/id/1460836430/photo/video-ringing-successful-businessman-looking-at-smartphone-camera-talking-remotely-with.jpg?s=2048x2048&w=is&k=20&c=waw4Q6Vx64wkowOAf0Pch_RhnpW8XKDg0RQJUE4AVns=",
      ],
    },
  },
  "3": {
    id: "3",
    name: "Charlie",
    date_of_birth: "1982/31/08",
    profile: {
      id: "3:profile",
      title: "Charlie",
      media: [
        "https://media.istockphoto.com/id/1384892916/photo/young-teenager-taking-a-selfie-with-smartphone-in-a-city-park.jpg?s=2048x2048&w=is&k=20&c=kMTTX7I6CcKVpre2UQXojPVM9_CUja__m6wW3piFq0s=",
        "https://media.istockphoto.com/id/1391794638/photo/portrait-of-beautiful-woman-making-selfie-in-the-municipal-market.jpg?s=2048x2048&w=is&k=20&c=YbNsTsh_W5mB1P9ccxlyNo7VNc1ewkEepHMDB3zBopA=",
        "https://media.istockphoto.com/id/1460836430/photo/video-ringing-successful-businessman-looking-at-smartphone-camera-talking-remotely-with.jpg?s=2048x2048&w=is&k=20&c=waw4Q6Vx64wkowOAf0Pch_RhnpW8XKDg0RQJUE4AVns=",
      ],
      location: "Dublin",
      interests: ["music", "sports", "art"],
    },
  },
  "4": {
    id: "4",
    name: "Dylan",
    date_of_birth: "1982/31/08",
    profile: {
      id: "4:profile",
      location: "Dublin",
      interests: ["music", "sports", "art"],
      media: [
        "https://media.istockphoto.com/id/1384892916/photo/young-teenager-taking-a-selfie-with-smartphone-in-a-city-park.jpg?s=2048x2048&w=is&k=20&c=kMTTX7I6CcKVpre2UQXojPVM9_CUja__m6wW3piFq0s=",
        "https://media.istockphoto.com/id/1391794638/photo/portrait-of-beautiful-woman-making-selfie-in-the-municipal-market.jpg?s=2048x2048&w=is&k=20&c=YbNsTsh_W5mB1P9ccxlyNo7VNc1ewkEepHMDB3zBopA=",
        "https://media.istockphoto.com/id/1460836430/photo/video-ringing-successful-businessman-looking-at-smartphone-camera-talking-remotely-with.jpg?s=2048x2048&w=is&k=20&c=waw4Q6Vx64wkowOAf0Pch_RhnpW8XKDg0RQJUE4AVns=",
      ],
      title: "Dylan",
    },
  },
  "5": {
    id: "5",
    name: "Eve",
    date_of_birth: "1982/31/08",
    profile: {
      id: "5:profile",
      location: "Dublin",
      interests: ["music", "sports", "art"],
      media: [
        "https://media.istockphoto.com/id/1384892916/photo/young-teenager-taking-a-selfie-with-smartphone-in-a-city-park.jpg?s=2048x2048&w=is&k=20&c=kMTTX7I6CcKVpre2UQXojPVM9_CUja__m6wW3piFq0s=",
        "https://media.istockphoto.com/id/1391794638/photo/portrait-of-beautiful-woman-making-selfie-in-the-municipal-market.jpg?s=2048x2048&w=is&k=20&c=YbNsTsh_W5mB1P9ccxlyNo7VNc1ewkEepHMDB3zBopA=",
        "https://media.istockphoto.com/id/1460836430/photo/video-ringing-successful-businessman-looking-at-smartphone-camera-talking-remotely-with.jpg?s=2048x2048&w=is&k=20&c=waw4Q6Vx64wkowOAf0Pch_RhnpW8XKDg0RQJUE4AVns=",
      ],
      title: "Eve",
    },
  },
  "6": {
    id: "6",
    name: "Frank",
    date_of_birth: "1982/31/08",
    profile: {
      id: "6:profile",
      location: "Dublin",
      interests: ["music", "sports", "art"],
      media: [
        "https://media.istockphoto.com/id/1384892916/photo/young-teenager-taking-a-selfie-with-smartphone-in-a-city-park.jpg?s=2048x2048&w=is&k=20&c=kMTTX7I6CcKVpre2UQXojPVM9_CUja__m6wW3piFq0s=",
        "https://media.istockphoto.com/id/1391794638/photo/portrait-of-beautiful-woman-making-selfie-in-the-municipal-market.jpg?s=2048x2048&w=is&k=20&c=YbNsTsh_W5mB1P9ccxlyNo7VNc1ewkEepHMDB3zBopA=",
        "https://media.istockphoto.com/id/1460836430/photo/video-ringing-successful-businessman-looking-at-smartphone-camera-talking-remotely-with.jpg?s=2048x2048&w=is&k=20&c=waw4Q6Vx64wkowOAf0Pch_RhnpW8XKDg0RQJUE4AVns=",
      ],
      title: "Frank",
    },
  },
};

// export const Conversations: Record<string, Conversation> = {};

// export const [Conversations, SetConversations] = useState({});
