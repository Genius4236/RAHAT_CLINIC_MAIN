import express from "express";
import { getAllDoctors, getUserDetails, patientRegister, logoutAdmin, logoutPatient, logoutDoctor, addNewDoctor, requestPasswordReset, verifyResetToken, resetPassword, changePassword, updateUserProfile} from "../controller/userController.js";
import { login } from "../controller/userController.js";
import { addNewAdmin } from "../controller/userController.js";
import {isAdminAuthenticated, isPatientAuthenticated, isDoctorAuthenticated} from "../middlewares/auth.js";

const router =express.Router();

router.post("/patient/register", patientRegister);
router.post("/login", login);
router.post("/admin/addnew", isAdminAuthenticated, addNewAdmin);
router.get("/doctors", getAllDoctors);
router.get("/admin/me", isAdminAuthenticated, getUserDetails);
router.get("/patient/me", isPatientAuthenticated, getUserDetails);
router.get("/doctor/me", isDoctorAuthenticated, getUserDetails);
router.post("/admin/logout", isAdminAuthenticated, logoutAdmin);
router.post("/patient/logout", isPatientAuthenticated, logoutPatient);
router.post("/doctor/logout", isDoctorAuthenticated, logoutDoctor);
router.post("/doctor/addnew", isAdminAuthenticated, addNewDoctor);

// Password reset routes
router.post("/password/request-reset", requestPasswordReset);
router.post("/password/verify-token", verifyResetToken);
router.post("/password/reset", resetPassword);
router.post("/password/change", isPatientAuthenticated, changePassword);

// User profile routes
router.put("/profile/update", isPatientAuthenticated, updateUserProfile);

export default router;