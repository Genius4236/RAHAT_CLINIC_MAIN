import mongoose from "mongoose";

const passwordResetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    resetToken: {
        type: String,
        required: true,
        unique: true,
    },
    resetTokenExpiry: {
        type: Date,
        required: true,
    },
    isUsed: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Automatically delete document 24 hours after creation
passwordResetSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export const PasswordReset = mongoose.model("PasswordReset", passwordResetSchema);
