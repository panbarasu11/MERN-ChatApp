// models/NotificationModel.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: false,
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: false,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["dm", "groupMessage", "channelMessage", "friendRequest"],
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const NotificationModel = mongoose.model("Notification", NotificationSchema);

export default NotificationModel;