import express from "express";
import { sendMessage, getAllMessages, deleteMessage, replyToMessage } from "../controller/messageController.js";
import { isAdminAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/send",sendMessage);
router.get("/getall", isAdminAuthenticated, getAllMessages);
router.delete("/delete/:id", isAdminAuthenticated, deleteMessage);
router.post("/reply/:id", isAdminAuthenticated, replyToMessage);

export default router;