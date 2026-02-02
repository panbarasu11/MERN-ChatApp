import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Users", 
    required: false, 
    index: false // ✅ Ensures `userId` is NOT unique
  },
  feedback: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

export default Feedback;
