import { D } from "@faker-js/faker/dist/airline-CBNP41sR";

export interface Relationship {
  id: string;
  interacted: boolean;
  type: "friend" | "accommodation";
}

export interface User {
  id: string;
  name: string;
  date_of_birth: string;
  profile: Profile;
}

export interface Profile {
  id: string;
  type: string;
  title: string;
  interests: string[];
  location: {
    city: string;
    point: { longitude: number; latitude: number };
    distance?: number;
  };
  media: string[];
}

export interface Message {
  message_id: string;
  conversation_id: string;
  content: string;
  sender: string;
  sent_at: string;
}

export interface Conversation {
  latest_message: string;
  profile: Profile;
  id: string;
}

export interface TextMessageProps {
  content: string;
  sender_id: string;
  conversation_id: string;
  status: "sending" | "delivered";
  sender: boolean;
  message_id?: string;
  created_at?: string;
}

export interface CreationDateProps {
  value?: Date | undefined;
  question: {
    type: string;
    options?: any;
  };
  setter: (value: any) => void;
}

export interface CreationInputProps {
  question: {
    type: string;
    options?: any;
  };
  setter: (value: any) => void;
  value: any;
}

// types.ts
export interface Interest {
  id: string;
  interest: string;
}

export interface Answer {
  value: any;
  skipped: boolean;
}

export interface SliderOptions {
  range: [number, number, number]; // [min, max, step]
  value: number;
}

export interface MediaOptions {
  bucket: string;
}

export interface DatabaseOptions {
  table: string;
  column: string;
  identifier: string;
}

export interface InputOptions {
  placeholder: string;
}

export interface DateOptions {}

export interface MultiSelectOptions {
  values: any[];
}

export interface Question {
  title: string;
  description: string;
  type: "text" | "multiSelect" | "slider" | "date" | "media";
  key: string;
  db?: DatabaseOptions;
  options?:
    | InputOptions
    | DateOptions
    | SliderOptions
    | MediaOptions
    | MultiSelectOptions;
  skipable?: boolean;
}

export interface ImageObject {
  uri: string;
  order: number;
}
