import { Conversation, Message, User } from "@/typings";

export interface State {
  swipedHistory: User[];
  conversations: Record<string, Conversation>;
  interests: string[];
}

interface AddMatchedUserAction {
  type: "ADD_MATCHED_USER";
  payload: User;
}

interface SetPersonalInterestsAction {
  type: "SET_PERSONAL_INTERESTS";
  payload: string[];
}

interface AddChatMessagePayload {
  conversationId: string;
  message: Message;
}

interface AddChatMessageAction {
  type: "ADD_MESSAGE";
  payload: AddChatMessagePayload;
}

interface AddPersonalInterestAction {
  type: "ADD_PERSONAL_INTERESTS";
  payload: string;
}

type Action =
  | AddMatchedUserAction
  | SetPersonalInterestsAction
  | AddPersonalInterestAction
  | AddChatMessageAction;

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_MATCHED_USER":
      return {
        ...state,
        swipedHistory: [...state.swipedHistory, action.payload],
      };
    case "SET_PERSONAL_INTERESTS":
      return {
        ...state,
        interests: action.payload,
      };
    case "ADD_PERSONAL_INTERESTS":
      return {
        ...state,
        interests: [...state.interests, action.payload],
      };
    case "ADD_MESSAGE":
      let conversation = state.conversations[action.payload?.conversationId];

      if (!conversation) {
        conversation = {
          messages: [],
        };
      }

      conversation.messages = [
        ...conversation.messages,
        action.payload.message,
      ];
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [action.payload.conversationId]: conversation,
        },
      };
    default:
      return state;
  }
};
