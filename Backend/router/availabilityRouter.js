import express from "express";
import {
  setDoctorAvailability,
  getDoctorAvailability,
  getAvailableSlotsForDate,
  updateDoctorAvailability,
  deleteDoctorAvailability,
} from "../controller/availabilityController.js";
import { isDoctorAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// POST /api/v1/availability/set
router.post("/set", isDoctorAuthenticated, setDoctorAvailability);

// GET /api/v1/availability/slots/available
router.get("/slots/available", getAvailableSlotsForDate);

// GET /api/v1/availability/:doctorId
router.get("/:doctorId", getDoctorAvailability);

// PUT /api/v1/availability/update/:availabilityId
router.put("/update/:availabilityId", isDoctorAuthenticated, updateDoctorAvailability);

// DELETE /api/v1/availability/delete/:availabilityId
router.delete("/delete/:availabilityId", isDoctorAuthenticated, deleteDoctorAvailability);

export default router;
