import GoogleUser from "../models/GoogleUserModel.js";
import jwt from "jsonwebtoken";

export const googleAuth = async (req, res, next) => {
  const { googleId, name, email, googlePhotoUrl } = req.body;

  try {
    let user = await GoogleUser.findOne({ googleId });

    if (!user) {
      user = new GoogleUser({
        googleId,
        name,
        email,
        image: googlePhotoUrl,
      });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY);

    return res
      .status(200)
      .cookie("access_token", token, { httpOnly: true })
      .json({ id: user._id, name: user.name, email: user.email, image: user.image });
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
