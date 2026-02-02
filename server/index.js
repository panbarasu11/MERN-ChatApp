import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import mongoose, { connect } from "mongoose";
import authRoutes from "./routes/AuthRoutes.js";
import cors from "cors";
import contactsRoutes from "./routes/ContactRoutes.js";
import setupSocket from "./socket.js";
import messagesRoutes from "./routes/MessagesRoutes.js";
import channelRoutes from "./routes/ChannelRoutes.js";
import feedbackRoutes from "./routes/FeedbackRoutes.js";
import passport from "passport";
import cookieSession from "cookie-session";
import notificationRouter from "./routes/NotificationRoutes.js";

dotenv.config();

const app = express();

app.use(
  cookieSession({
    name: "session",
    keys: ["cyberwolf"],
    maxAge: 24 * 60 * 60 * 100,
  })
);

const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: "http://localhost:5173", // ✅ Allow frontend URL
    credentials: true, 
  })
);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/channel", channelRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/notifications", notificationRouter);

const server = app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

setupSocket(server);

mongoose
  .connect(databaseURL)
  .then(() => console.log("Database Connected successfully"))
  .catch((err) => console.log(err.message));
