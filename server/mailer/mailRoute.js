import express from "express";
import crypto from "crypto";
import User from "../models/UserModel.js"; // Adjust path as needed
import { sendEmail } from "../mailer/mailer.js";

const router = express.Router();

// Forgot Password Route
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found!" });

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetToken = resetToken;
  user.resetTokenExpiry = Date.now() + 3600000; // 1-hour expiry
  await user.save();

  // Reset Link
  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // Send email
  const emailSent = await sendEmail(
    email,
    "Password Reset Request",
    `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
  );

  if (emailSent) {
    res.json({ message: "Password reset email sent!" });
  } else {
    res.status(500).json({ message: "Error sending email" });
  }
});

// Reset Password Route
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json({ message: "Invalid or expired token" });

  // Save new password (hash before saving in a real app)
  user.password = newPassword;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.json({ message: "Password has been reset successfully!" });
});

export default router;
