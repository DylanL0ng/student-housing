export interface User {
  id: string;
  full_name: string;
  date_of_birth: string;
  location: string;
  interests: string[];
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
}
