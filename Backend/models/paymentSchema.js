import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    appointmentId: {
        type: mongoose.Schema.ObjectId,
        ref: "Appointment",
        required: true,
    },
    patientId: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    currency: {
        type: String,
        default: "INR",
    },
    paymentMethod: {
        type: String,
        enum: ["Razorpay", "Other"],
        default: "Razorpay",
    },
    razorpayOrderId: {
        type: String,
    },
    razorpayPaymentId: {
        type: String,
    },
    razorpaySignature: {
        type: String,
    },
    status: {
        type: String,
        enum: ["Pending", "Completed", "Failed", "Refunded"],
        default: "Pending",
    },
    transactionId: {
        type: String,
        unique: true,
        sparse: true,
    },
    description: {
        type: String,
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

export const Payment = mongoose.model("Payment", paymentSchema);
