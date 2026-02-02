import express from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import {
  addDMNotification,
  addGroupMessageNotification,
  markNotificationsAsRead,
  getNotifications,
} from "../controllers/NotificationController.js";

const notificationRouter = express.Router();

// ✅ Route to fetch all notifications for a user
notificationRouter.get("/:userId", verifyToken, getNotifications);

// ✅ Route to add a DM notification (usually triggered internally)
notificationRouter.post("/add-dm", verifyToken, addDMNotification);

// ✅ Route to add a Group/Channel message notification (usually triggered internally)
notificationRouter.post("/add-group-message", verifyToken, addGroupMessageNotification);

// ✅ Route to mark all notifications as read
notificationRouter.post("/mark-read", verifyToken, markNotificationsAsRead);

export default notificationRouter;
