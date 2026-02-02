import { Router } from "express";
import {
  createChannel,
  getChannelMessages,
  getUsersChannels,
} from "../controllers/ChannelController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const channelRoutes = Router();

channelRoutes.post("/create-channel", verifyToken, createChannel);
channelRoutes.get("/get-user-channels", verifyToken, getUsersChannels);
channelRoutes.get(
  "/get-channel-messages/:channelId",
  verifyToken,
  getChannelMessages,
);
export default channelRoutes;
