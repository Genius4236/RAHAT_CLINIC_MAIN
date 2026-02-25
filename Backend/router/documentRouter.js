import express from "express";
import { uploadDocument, getPatientDocuments, getDocumentById, deleteDocument, getAllDocuments } from "../controller/documentController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

// Upload a document (Admin/Doctor only)
router.post("/upload", isAuthenticated, uploadDocument);

// Get all documents for a patient
router.get("/patient/:patientId", isAuthenticated, getPatientDocuments);

// Get document by ID
router.get("/:documentId", isAuthenticated, getDocumentById);

// Delete a document
router.delete("/:documentId", isAuthenticated, deleteDocument);

// Get all documents (Admin only)
router.get("/", isAuthenticated, getAllDocuments);

export default router;
