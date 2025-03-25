export interface User {
  id: string;
  name: string;
  date_of_birth: string;
  profile: Profile;
}

export interface Relationship {
  id: string;
  interacted: boolean;
  type: "friend" | "accommodation";
}

export interface Profile {
  id: string;
  title: string;
  interests: string[];
  location: string;
  media: string[];
  thumbnail?: string;
}

export interface Message {
  message_id: string;
  conversation_id: string;
  content: string;
  sender: string;
  sent_at: string;
}

export interface Conversation {
  messages: Message[];
  profile: Profile;
  id: string;
}

export interface TextMessageProps {
  sender: string;
  content: string;
}
