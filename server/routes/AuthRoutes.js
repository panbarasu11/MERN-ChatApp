import { Router } from "express";
import {
  getUserInfo,
  login,
  signup,
  updateProfile,
  addProfileImage,
  removeProfileImage,
  logOut,
  resetPassword,
  forgotPassword,
  verifyEmail,
  google,
} from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import multer from "multer";

const authRoutes = Router();
const upload = multer({ dest: "uploads/profiles/" });

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/google", google);
authRoutes.get("/verify-email", verifyEmail);
authRoutes.get("/user-info", verifyToken, getUserInfo);
authRoutes.post("/update-profile", verifyToken, updateProfile);
authRoutes.post(
  "/add-profile-image",
  verifyToken,
  upload.single("profile-image"),
  addProfileImage
);

authRoutes.delete("/remove-profile-image", verifyToken, removeProfileImage);
authRoutes.post("/logOut", logOut);

authRoutes.post("/forgot-password", forgotPassword);
authRoutes.post("/reset-password/:token", resetPassword);

export default authRoutes;
