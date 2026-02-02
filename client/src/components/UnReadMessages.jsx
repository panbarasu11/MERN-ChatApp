import { useEffect } from "react";
import { useAppStore } from "@/store";
import { apiClient } from "@/lib/api-client";
import { UNREAD_MESSAGES_ROUTE } from "@/utils/constants";

const UnReadMessages = () => {
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      try {
        const response = await apiClient.get(`${UNREAD_MESSAGES_ROUTE}`, {
          withCredentials: true,
        });
        if (response.data.unreadCount !== undefined) {
          useAppStore.setState({ unreadMessages: response.data.unreadCount });
        }
      } catch (error) {
        console.error("Error fetching unread messages:", error);
      }
    };

    fetchUnreadMessages();
  }, []);

  return null;
};

export default UnReadMessages;
