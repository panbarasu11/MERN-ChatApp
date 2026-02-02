import jwt from "jsonwebtoken";
import User from "../models/UserModel.js"; // Import User model

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: "Invalid or missing token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_KEY);

    // Find user by email and token
    const user = await User.findOne({ email: decoded.email, verificationToken: token });
    if (!user) {
      return res.status(404).json({ message: "User not found or token invalid" });
    }

    // Update user as verified
    user.isVerified = true;
    user.verificationToken = null; // Remove token after successful verification
    await user.save();

    return res.status(200).json({ message: "Email verified successfully! You can now login." });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Invalid or expired token" });
  }
};
