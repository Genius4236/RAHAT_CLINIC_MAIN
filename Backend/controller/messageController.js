import { catchAsyncErrors } from '../middlewares/catchAsyncErrors.js'
import {Message} from "../models/messageSchema.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

export const sendMessage = catchAsyncErrors(async(req,res,next)=>{
    const {firstName, lastName, email, phone, message} = req.body;
    if (!firstName || !lastName || !email || !phone || !message) {
        return next(new ErrorHandler('Please fill in all fields', 400));
} 

    await Message.create({firstName, lastName, email, phone, message});
    res.status(200).json({
     success:true,
        message: "Message sent successfully",
     });
});

export const getAllMessages = catchAsyncErrors(async(req, res, next) => {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json({
        success: true,
        messages,
    });
});

export const deleteMessage = catchAsyncErrors(async(req, res, next) => {
    const { id } = req.params;
    
    const message = await Message.findById(id);
    if (!message) {
        return next(new ErrorHandler('Message not found', 404));
    }

    await Message.findByIdAndDelete(id);
    res.status(200).json({
        success: true,
        message: "Message deleted successfully",
    });
});

export const replyToMessage = catchAsyncErrors(async(req, res, next) => {
    const { id } = req.params;
    const { replyMessage, email: replyEmail } = req.body;

    if (!replyMessage || !replyEmail) {
        return next(new ErrorHandler('Please provide reply message and email', 400));
    }

    const message = await Message.findById(id);
    if (!message) {
        return next(new ErrorHandler('Message not found', 404));
    }

    // In production, send email to the user with the reply
    // For now, just log it
    console.log(`Reply sent to ${message.email}: ${replyMessage}`);

    res.status(200).json({
        success: true,
        message: "Reply sent successfully",
    });
});