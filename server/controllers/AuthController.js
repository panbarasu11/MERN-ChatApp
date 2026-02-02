import { compare } from "bcrypt";
import User from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../mailer/mailer.js";
import crypto from "crypto";
import { renameSync, unlinkSync } from "fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import bcrypt from "bcrypt"; // 🔥 Add this import
dotenv.config();
const maxAge = 16 * 86400000;

const createToken = (email, userId) => {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
};

const sendVerificationEmail = async (email, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_KEY, { expiresIn: "1h" });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_MAIL,
    to: email,
    subject: "Verify your email",
    html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
  });
};

// Signup function with email verification
export const signup = async (request, response) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return response.status(400).send("Email and password are required.");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return response.status(400).json({ message: "Email is already used." });
    }

    const user = await User.create({ email, password, isVerified: false });

    // Send verification email
    await sendVerificationEmail(user.email, user._id);

    return response
      .status(201)
      .json({ message: "Signup successful! Please verify your email." });
  } catch (error) {
    console.error(error);
    return response.status(500).send("Internal Server Error");
  }
};

// Email verification route
export const verifyEmail = async (request, response) => {
  console.log("Verify Email route hit!");
  try {
    const { token } = request.query; // ✅ Read token from query params
    if (!token) return response.status(400).send("Invalid token.");

    const decoded = jwt.verify(token, process.env.JWT_KEY);
    console.log("Decoded Token:", decoded);

    const user = await User.findById(decoded.userId);
    console.log("User Found:", user);

    if (!user) return response.status(404).send("User not found.");

    user.isVerified = true;
    await user.save();
    console.log("User Updated:", user);

    return response
      .status(200)
      .json({ message: "Email verified successfully!" });
  } catch (error) {
    console.error("Email verification error:", error);
    return response.status(400).send("Invalid or expired token.");
  }
};

export const login = async (request, response, next) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return response.status(400).send("Email and Password is required.");
    }
    const user = await User.findOne({ email });
    if (!user) return response.status(400).json({ message: "User not found" });

    if (!user.isVerified) {
      await sendVerificationEmail(user.email, user._id);
      return response.status(403).json({ message: "Email send succesfully." });
    }

    const auth = await compare(password, user.password);
    if (!auth) {
      return response.status(400).send("Password is incorrect.");
    }
    response.cookie("jwt", createToken(email, user.id), {
      maxAge,
      secure: true,
      sameSite: "None",
    });
    return response.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      },
    });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internel Server Error");
  }
};

export const google = async (req, res, next) => {
  const { name, email, googlePhotoUrl } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      // ✅ Generate a random password for Google users
      const generatedPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);

      // ✅ Create new user
      user = await User.create({
        username: name.toLowerCase().replace(/\s/g, "") + Math.random().toString(9).slice(-4),
        email,
        password: hashedPassword, // ✅ Save hashed password
        
        isVerified: true, // ✅ Auto-verify Google users
      });

      console.log("Generated Password for Google User:", generatedPassword); // Debugging only
    }

    // ✅ Generate JWT Token
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_KEY, {
      expiresIn: "7d",
    });

    const { password, ...userWithoutPassword } = user._doc; // Remove password from response

    res
      .status(200)
      .cookie("jwt", token, { httpOnly: true, secure: true, sameSite: "None" })
      .json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getUserInfo = async (request, response, next) => {
  try {
    console.log(request.userId);
    const userData = await User.findById(request.userId);
    if (!userData) {
      return response.status(404).send("User with the given id is not found.");
    }

    return response.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
    });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internel Server Error");
  }
};
export const forgotPassword = async (req, res) => {
  try {
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

    if (!emailSent) {
      return res.status(500).json({ message: "Error sending email" });
    }

    res.json({ message: "Password reset email sent!" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) {
    return res.status(400).json({ message: "New password is required" });
  }

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  user.password = newPassword; // Make sure to hash the password before saving
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.json({ message: "Password reset successfully!" });
};
export const updateProfile = async (request, response) => {
  try {
    const { firstName, lastName, color } = request.body;
    const userId = request.userId; // ✅ Extract from token

    if (!firstName) {
      return response.status(400).send("Firstname is required.");
    }

    if (!lastName) {
      return response.status(200).send("Update successfully.");
    }

    const userData = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        color,
        profileSetup: true,
      },
      { new: true, runValidators: true }
    );

    return response.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
    });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internal Server Error");
  }
};
export const addProfileImage = async (request, response, next) => {
  try {
    if (!request.file) {
      return response.status(400).send("File is required");
    }

    const date = Date.now();
    let fileName = "uploads/profiles/" + date + request.file.originalname;
    renameSync(request.file.path, fileName);

    const updatedUser = await User.findByIdAndUpdate(
      request.userId,
      { image: fileName },
      { new: true, runValidators: true }
    );

    return response.status(200).json({
      image: updatedUser.image,
    });
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internel Server Error");
  }
};
export const removeProfileImage = async (request, response, next) => {
  try {
    const { userId } = request;
    const user = await User.findById(userId);

    if (!user) {
      return response.status(404).send("User not found");
    }

    if (user.image) {
      unlinkSync(user.image);
    }

    user.image = null;
    await user.save();

    return response.status(200).send("Profile image removed successfully.");
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internel Server Error");
  }
};
export const logOut = async (request, response, next) => {
  try {
    response.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "None" });
    return response.status(200).send("Logout successfully.");
  } catch (error) {
    console.log({ error });
    return response.status(500).send("Internel Server Error");
  }
};
