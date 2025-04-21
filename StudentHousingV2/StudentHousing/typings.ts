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

export interface Filter {
  // id: number;
  id: string;
  default: {
    data: any;
  };
  options: FilterOptions;
  group?: string;
  label: string;
  description: string;
  filter_key: string;
  filter_table: string;
  filter_registry: {
    type: FilterType;
  };
}

export type FilterType = "multiSelect" | "slider" | "map" | "default";

export interface FilterOptions {
  values?: Record<string, { label: string }>; // For multiSelect
  range?: [number, number, number]; // [min, max, step] for slider
  returnRange?: boolean; // For slider
  default?: number; // For slider
}

export interface FilterState {
  [key: string]: any; // The value type depends on the filter type
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
  information: [];
  media: string[];
  // has_conversation: boolean;
  conversations: Conversation[];
  latest_message?: string;
}
export interface Conversation {
  latest_message?: string;
  conversation_id: string;
}

export interface Message {
  message_id: string;
  conversation_id: string;
  content: string;
  sender: string;
  sent_at: string;
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
  state: any;
}

export interface CreationInputProps {
  question: {
    type: string;
    options?: any;
  };
  state: any;
  value: any;
}

export interface Interest {
  id: string;
  interest: string;
}
