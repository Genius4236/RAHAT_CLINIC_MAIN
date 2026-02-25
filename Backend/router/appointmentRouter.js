import express from "express";
import { postAppointment, getAllAppointments, updateAppointmentStatus, deleteAppointment, getPatientAppointments, getDoctorAppointments, rescheduleAppointment, addAppointmentNotes } from "../controller/appointmentController.js";
import { isAdminAuthenticated, isPatientAuthenticated, isDoctorAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/post", isPatientAuthenticated, postAppointment);
router.get("/getall", isAdminAuthenticated, getAllAppointments);
router.get("/my", isPatientAuthenticated, getPatientAppointments);
router.get("/doctor", isDoctorAuthenticated, getDoctorAppointments);
router.put("/update/:id", isAdminAuthenticated, updateAppointmentStatus);
router.put("/reschedule/:id", isPatientAuthenticated, rescheduleAppointment);
router.put("/notes/:id", isDoctorAuthenticated, addAppointmentNotes);
router.delete("/delete/:id", isAdminAuthenticated, deleteAppointment);

export default router;
