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

// Types from the original file
export type Interest = {
  id: string;
  interest: string;
};

export type QuestionOption = {
  placeholder?: string;
  values?: any;
  dbTable?: string;
  dbColumn?: string;
  dbIdentifier?: string;
  range?: [number, number, number?];
};

export type Question = {
  title: string;
  description: string;
  type: "text" | "multi-select" | "slider" | "media";
  key: string;
  options?: QuestionOption;
  skipable?: boolean;
};

// Updated type to include skipped information
export type Answer = {
  value: string | string[] | number;
  skipped: boolean;
};

export interface CreationInputProps {
  question: {
    type: string;
    options?: QuestionOption;
  };
  value: any;
  onValueChange: (value: any) => void;
}
