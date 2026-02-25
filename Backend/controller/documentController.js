import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Document } from "../models/documentSchema.js";
import { User } from "../models/userSchema.js";

// Upload a document for a patient
export const uploadDocument = catchAsyncErrors(async (req, res, next) => {
    const { patientId, title, description, documentType } = req.body;

    if (!patientId || !title) {
        return next(new ErrorHandler("Patient ID and title are required", 400));
    }

    // Check if patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== "Patient") {
        return next(new ErrorHandler("Patient not found", 404));
    }

    if (!req.file) {
        return next(new ErrorHandler("No file uploaded", 400));
    }

    const document = await Document.create({
        patientId,
        title,
        description,
        documentType: documentType || "Other",
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        uploadedBy: req.user._id,
    });

    res.status(201).json({
        success: true,
        message: "Document uploaded successfully",
        document,
    });
});

// Get all documents for a patient
export const getPatientDocuments = catchAsyncErrors(async (req, res, next) => {
    const { patientId } = req.params;

    // Check if patient exists
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== "Patient") {
        return next(new ErrorHandler("Patient not found", 404));
    }

    const documents = await Document.find({ patientId }).sort({ uploadedAt: -1 });

    res.status(200).json({
        success: true,
        documents,
    });
});

// Get document by ID
export const getDocumentById = catchAsyncErrors(async (req, res, next) => {
    const { documentId } = req.params;

    const document = await Document.findById(documentId);
    if (!document) {
        return next(new ErrorHandler("Document not found", 404));
    }

    res.status(200).json({
        success: true,
        document,
    });
});

// Delete a document
export const deleteDocument = catchAsyncErrors(async (req, res, next) => {
    const { documentId } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    const document = await Document.findById(documentId);
    if (!document) {
        return next(new ErrorHandler("Document not found", 404));
    }

    // Only admin, doctor, or the patient who owns the document can delete it
    if (userRole !== "Admin" && userRole !== "Doctor" && document.patientId.toString() !== userId.toString()) {
        return next(new ErrorHandler("Not authorized to delete this document", 403));
    }

    await Document.findByIdAndDelete(documentId);

    res.status(200).json({
        success: true,
        message: "Document deleted successfully",
    });
});

// Get all documents (Admin only)
export const getAllDocuments = catchAsyncErrors(async (req, res, next) => {
    const { page = 1, limit = 10, patientId } = req.query;

    const filter = {};
    if (patientId) {
        filter.patientId = patientId;
    }

    const documents = await Document.find(filter)
        .populate("patientId", "firstName lastName email")
        .populate("uploadedBy", "firstName lastName")
        .sort({ uploadedAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const total = await Document.countDocuments(filter);

    res.status(200).json({
        success: true,
        documents,
        pagination: {
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page),
        },
    });
});
