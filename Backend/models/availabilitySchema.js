import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    // For date-specific availability (one-time slots)
    date: {
        type: String, // YYYY-MM-DD format
    },
    // For recurring weekly availability
    dayOfWeek: {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday", null],
    },
    startTime: {
        type: String, // HH:mm format (24-hour)
        required: true,
    },
    endTime: {
        type: String, // HH:mm format (24-hour)
        required: true,
    },
    slotDuration: {
        type: Number, // Duration of each appointment slot in minutes (default: 30)
        default: 30,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Compound indexes
availabilitySchema.index({ doctorId: 1, date: 1 });
availabilitySchema.index({ doctorId: 1, dayOfWeek: 1 });

export const Availability = mongoose.model("Availability", availabilitySchema);
