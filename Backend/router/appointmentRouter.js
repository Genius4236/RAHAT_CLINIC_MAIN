import express from "express";
import { postAppointment, getAllAppointments, updateAppointmentStatus, deleteAppointment, getPatientAppointments, getDoctorAppointments, rescheduleAppointment, addAppointmentNotes, patientCancelAppointment, doctorUpdateAppointmentStatus, getAdminAnalytics } from "../controller/appointmentController.js";
import { isAdminAuthenticated, isPatientAuthenticated, isDoctorAuthenticated, isAuthenticated, isAuthorized } from "../middlewares/auth.js";

const router = express.Router();

router.post("/post", isPatientAuthenticated, postAppointment);
router.get("/getall", isAdminAuthenticated, getAllAppointments);
router.get("/admin/analytics", isAdminAuthenticated, getAdminAnalytics);
router.get("/my", isPatientAuthenticated, getPatientAppointments);
router.get("/doctor", isDoctorAuthenticated, getDoctorAppointments);
router.put("/update/:id", isAdminAuthenticated, updateAppointmentStatus);
router.put("/doctor-status/:id", isDoctorAuthenticated, doctorUpdateAppointmentStatus);
router.put("/reschedule/:id", isPatientAuthenticated, rescheduleAppointment);
router.put("/notes/:id", isDoctorAuthenticated, addAppointmentNotes);
router.delete("/delete/:id", isAuthenticated, isAuthorized("Admin", "Doctor"), deleteAppointment);
router.delete("/cancel/:id", isPatientAuthenticated, patientCancelAppointment);

export default router;
