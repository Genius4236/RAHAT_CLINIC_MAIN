import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    documentType: {
        type: String,
        enum: ["Prescription", "Lab Report", "Medical Record", "Invoice", "Other"],
        default: "Other",
    },
    fileName: {
        type: String,
        required: true,
    },
    filePath: {
        type: String,
        required: true,
    },
    fileType: {
        type: String,
        required: true,
    },
    fileSize: {
        type: Number,
    },
    uploadedBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for efficient queries
documentSchema.index({ patientId: 1, uploadedAt: -1 });

export const Document = mongoose.model("Document", documentSchema);
