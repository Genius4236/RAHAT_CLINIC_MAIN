import express from "express";
import { chatQuery } from "../controller/chatController.js";
import { isPatientAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/query", isPatientAuthenticated, chatQuery);

export default router;
