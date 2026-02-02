import NotificationModel from "../models/NotificationModel.js";
import Group from "../models/GroupModel.js";

/**
 * ✅ Create a Direct Message (DM) Notification
 */
export const addDMNotification = async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;

    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ error: "Missing required fields: senderId, receiverId, or message." });
    }

    const newNotification = new NotificationModel({
      senderId,
      receiverId,
      message,
      type: "dm",
      isRead: false,
      timestamp: new Date(),
    });

    await newNotification.save();
    console.log("✅ DM Notification Created:", newNotification);

    res.status(201).json(newNotification);
  } catch (error) {
    console.error("❌ Error creating DM notification:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * ✅ Create a Group/Channel Message Notification
 */
export const addGroupMessageNotification = async (req, res) => {
  try {
    const { groupId, senderId, message } = req.body;

    if (!groupId || !senderId || !message) {
      return res.status(400).json({ error: "Missing required fields: groupId, senderId, or message." });
    }

    const group = await Group.findById(groupId).populate("members");
    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }

    // Create notifications for all group members except the sender
    const notifications = group.members
      .filter((member) => member._id.toString() !== senderId.toString())
      .map(async (member) => {
        const newNotification = new NotificationModel({
          senderId,
          receiverId: member._id,
          groupId,
          message,
          type: "groupMessage",
          isRead: false,
          timestamp: new Date(),
        });
        await newNotification.save();
      });

    await Promise.all(notifications);
    console.log("✅ Group Message Notifications Created.");

    res.status(201).json({ message: "Group message notifications created successfully." });
  } catch (error) {
    console.error("❌ Error creating group message notification:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * ✅ Fetch Notifications for a User
 */
export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    const notifications = await NotificationModel.find({ receiverId: userId })
      .sort({ timestamp: -1 });

    res.status(200).json(notifications);
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * ✅ Mark Notifications as Read
 */
export const markNotificationsAsRead = async (req, res) => {
  try {
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ error: "Receiver ID is required." });
    }

    await NotificationModel.updateMany({ receiverId, isRead: false }, { isRead: true });

    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error("❌ Error marking notifications as read:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};
