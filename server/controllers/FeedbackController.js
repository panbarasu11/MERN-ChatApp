import Feedback from "../models/FeedbackModel.js";

export const submitFeedback = async (req, res) => {
  try {
    const { userId, feedback } = req.body;

    if (!feedback) {
      return res.status(400).json({ message: "Feedback is required" });
    }

    const newFeedback = new Feedback({ userId: userId || null, feedback });
    await newFeedback.save();

    res.status(201).json({ message: "Feedback submitted successfully!" });
  } catch (error) {
    console.error("Feedback Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


