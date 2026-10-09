import type { ThreadActions } from "@/components/messages/MessageThread";
import {
  deleteMessageAction,
  loadEarlierMessagesAction,
  pollThreadAction,
  sendMessageAction,
} from "@/server/actions/messages";

export const teamThreadActions: ThreadActions = {
  send: sendMessageAction,
  remove: deleteMessageAction,
  loadEarlier: loadEarlierMessagesAction,
  poll: pollThreadAction,
};
