import mongoose from "mongoose";
import validator from "validator";

const appointmentSchema = new mongoose.Schema({
    firstName:{
        type:String,
        required:true,
        minLength: [2, "First Name Must contain At Least 2 characte!"]
    },
    lastName:{
        type:String,
        required:true,
        minLength: [2, "Last Name Must contain At Least 2 characte!"]
        },
        email:{
            type:String,
            required:true,
            validate: [validator.isEmail, "please enter a valid email"],
        },
        phone:{
            type:String,
            required:true,
            minLength: [10, "Phone Number Must contain  10 character!"],
            maxLength: [10, "Phone Number Must contain  10 character!"],
            },
        dob:{
            type:Date,
            required:[true, "Date of Birth is required"],
        },
        gender:{
            type:String,
            required: true,
            enum: ["Male", "Female"],
        },
        appointment_date:{  // YYYY-MM-DD format (date only)
            type:String,
            required: true, 
        },
        appointment_time:{  // HH:mm format (time only)
            type: String,
            required:true,
        },
                department:{
                    type:String,
                    required: true, 
                },
                doctor:{
                    firstName: {
                        type: String,
                        required: true,
                    },
                    lastName: {
                        type: String,
                        required: true,
                    },
                },
                hasVisited: {
                    type: Boolean,
                    default: false,
                },
                doctorId: {
                    type: mongoose.Schema.ObjectId,
                    required: true,
                },
                patientId: {
                    type: mongoose.Schema.ObjectId,
                    required: true,
                },
                address: {
                    type: String,
                    required: true,
                },
                status: {
                    type: String,
                    enum: ["Pending", "Accepted", "Rejected"],
                    default: "Pending",
                },
                paymentStatus: {
                    type: String,
                    enum: ["Pending", "Completed", "Failed"],
                    default: "Pending",
                },
                appointmentNotes: {
                    type: String,
                },
                prescription: {
                    type: String,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
                rescheduledFrom: {
                    type: mongoose.Schema.ObjectId,
                    ref: "Appointment",
                },
});

export const Appointment = mongoose.model("Appointment", appointmentSchema);