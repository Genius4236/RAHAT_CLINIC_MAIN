import express from "express";
import {
    createPaymentOrder,
    verifyPayment,
    getPaymentHistory,
    getAppointmentPayments,
    refundPayment,
    getAdminPaymentStats,
} from "../controller/paymentController.js";
import { isPatientAuthenticated, isAdminAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/create-order", isPatientAuthenticated, createPaymentOrder);
router.post("/verify", isPatientAuthenticated, verifyPayment);
router.get("/history", isPatientAuthenticated, getPaymentHistory);
router.get("/appointment/:appointmentId", getAppointmentPayments);
router.post("/refund/:paymentId", isAdminAuthenticated, refundPayment);
router.get("/admin/stats", isAdminAuthenticated, getAdminPaymentStats);

export default router;
