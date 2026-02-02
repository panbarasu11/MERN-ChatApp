import { Router } from "express";
import { submitFeedback } from "../controllers/FeedbackController.js";

const feedbackRoutes = Router();

feedbackRoutes.post("/submit", submitFeedback);
export default feedbackRoutes;



