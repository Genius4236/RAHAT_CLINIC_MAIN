import crypto from "crypto";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Payment } from "../models/paymentSchema.js";
import { Appointment } from "../models/appointmentSchema.js";
import { instance } from "../config/razorpay.js";

export const createPaymentOrder = catchAsyncErrors(async (req, res, next) => {
    const { appointmentId, amount } = req.body;

    if (!appointmentId || !amount) {
        return next(new ErrorHandler("Please provide appointmentId and amount", 400));
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found", 404));
    }

    if (appointment.patientId.toString() !== req.user._id.toString()) {
        return next(new ErrorHandler("Not authorized to pay for this appointment", 403));
    }

    if (!instance) {
        return next(new ErrorHandler("Payment gateway is not configured", 503));
    }

    const razorpayOrder = await instance.orders.create({
        amount: Math.round(Number(amount) * 100),
        currency: "INR",
    });

    const payment = await Payment.create({
        appointmentId,
        patientId: req.user._id,
        amount: Number(amount),
        status: "Pending",
        razorpayOrderId: razorpayOrder.id,
    });

    res.status(201).json({
        success: true,
        message: "Payment order created",
        payment,
        order: {
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
        },
    });
});

export const verifyPayment = catchAsyncErrors(async (req, res, next) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, appointmentId } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return next(new ErrorHandler("Missing payment verification details", 400));
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
        return res.status(400).json({
            success: false,
            message: "Payment verification failed",
        });
    }

    // Update payment record
    const payment = await Payment.findOne({
        razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
        return next(new ErrorHandler("Payment record not found", 404));
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "Completed";
    payment.transactionId = razorpay_payment_id;
    payment.updatedAt = new Date();

    await payment.save();

    await Appointment.findByIdAndUpdate(payment.appointmentId, {
        paymentStatus: "Completed",
    });

    res.status(200).json({
        success: true,
        message: "Payment verified successfully",
        payment,
    });
});

export const getPaymentHistory = catchAsyncErrors(async (req, res, next) => {
    const patientId = req.user._id;
    const { status, limit = 10, page = 1 } = req.query;

    const filter = { patientId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const payments = await Payment.find(filter)
        .populate("appointmentId", "firstName lastName appointment_date department")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Payment.countDocuments(filter);

    res.status(200).json({
        success: true,
        payments,
        pagination: {
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page),
        },
    });
});

export const getAppointmentPayments = catchAsyncErrors(async (req, res, next) => {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found", 404));
    }

    const payment = await Payment.findOne({ appointmentId });

    res.status(200).json({
        success: true,
        payment: payment || null,
    });
});

export const refundPayment = catchAsyncErrors(async (req, res, next) => {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
        return next(new ErrorHandler("Payment not found", 404));
    }

    if (payment.status === "Refunded") {
        return next(new ErrorHandler("Payment already refunded", 400));
    }

    // Here you would typically call Razorpay API for refund
    // For now, we'll just mark it in the database
    payment.status = "Refunded";
    payment.updatedAt = new Date();
    await payment.save();

    res.status(200).json({
        success: true,
        message: "Payment refunded successfully",
        payment,
    });
});

export const getAdminPayments = catchAsyncErrors(async (req, res, next) => {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const payments = await Payment.find(filter)
        .populate("appointmentId", "firstName lastName appointment_date department")
        .populate("patientId", "firstName lastName email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const total = await Payment.countDocuments(filter);

    res.status(200).json({
        success: true,
        payments,
        pagination: {
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page),
        },
    });
});

export const getAdminPaymentStats = catchAsyncErrors(async (req, res, next) => {
    const { startDate, endDate } = req.query;

    const filter = { status: "Completed" };

    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const payments = await Payment.find(filter);

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalTransactions = payments.length;
    const averageTransaction = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    res.status(200).json({
        success: true,
        stats: {
            totalRevenue,
            totalTransactions,
            averageTransaction,
            completedPayments: payments.length,
        },
    });
});
