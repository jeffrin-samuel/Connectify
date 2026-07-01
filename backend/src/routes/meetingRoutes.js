// backend/src/routes/meetingRoutes.js
import { Router } from "express";
import { saveChatMessages, generateSummary } from "../controllers/meetingController.js";
import authenticate from "../../middleware/auth.js";

const router = Router(); // Creates an independent router instance to manage meeting-related routes

router.route("/:meetingId/save-chat").post(authenticate, saveChatMessages);
router.route("/:meetingId/summary").get(authenticate, generateSummary);

export default router;