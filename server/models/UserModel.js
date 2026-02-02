import mongoose from "mongoose";
import { genSalt, hash } from "bcrypt";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: (true, "Email is Required"),
    unique: false,
  },
  password: {
    type: String,
    required: (true, "Password is Required"),
  },
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  image: {
    type: String,
    required: false,
  },
  color: {
    type: Number,
    required: false,
  },
  profileSetup: {
    type: Boolean,
    default: false,
  },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetToken: { type: String },
  resetTokenExpiry: { type: Date },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) { 
    const salt = await genSalt();
    this.password = await hash(this.password, salt);
  }
  console.log("Hashed Password:", this.password); 
  next();
});


const User = mongoose.model("Users", userSchema);

export default User;
