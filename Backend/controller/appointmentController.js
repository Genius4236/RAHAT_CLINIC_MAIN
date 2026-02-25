import {catchAsyncErrors} from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import {Appointment} from "../models/appointmentSchema.js";
import {User} from "../models/userSchema.js";
import {Availability} from "../models/availabilitySchema.js";

export const postAppointment = catchAsyncErrors(async (req, res, next) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        dob,
        gender,
        appointment_date,
        appointment_time,
        department,
        doctor_firstName,
        doctor_lastName,
        hasVisited,
        address
     } = req.body;

     // Validate appointment_time is provided
     if (!appointment_time) {
        return next(new ErrorHandler("Please select a time slot", 400));
     }

     if(
        !firstName ||
        !lastName ||
        !email ||
        !phone ||
        !dob ||
        !gender ||
        !appointment_date ||
        !department ||
        !doctor_firstName ||
        !doctor_lastName ||
        !address ||
        !appointment_time){
        return next(new ErrorHandler("Please fill all the fields", 400));
        }

        // Validate appointment date is not in the past
        const appointmentDate = new Date(appointment_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (appointmentDate < today) {
            return next(new ErrorHandler("Appointment date cannot be in the past", 400));
        }

        const isConflict = await User.find({
            firstName: doctor_firstName,
            lastName: doctor_lastName,
            role: "Doctor",
            doctorDepartment: department,
        });
        if (isConflict.length === 0) {
            return next(new ErrorHandler("Doctor not found", 404));
        }
        if (isConflict.length > 1) {
            return next(new ErrorHandler("Doctor Conflict! Please Contact Through Email or Phone!", 404));
        }
        const doctorId = isConflict[0]._id;
        const patientId = req.user._id;

        // Check for duplicate appointments on same date+time with same doctor
        const existingAppointment = await Appointment.findOne({
            doctorId: doctorId,
            appointment_date: appointment_date,
            appointment_time: appointment_time,
            status: { $ne: "Rejected" },
        });
        if (existingAppointment) {
            return next(new ErrorHandler("Doctor already has an appointment at this time. Please choose a different date/time", 409));
        }

        // Check doctor availability (date-specific first, then weekly)
        const appointmentDateObj = new Date(appointment_date);
        const dateStr = appointment_date.includes("T") ? appointment_date.split("T")[0] : appointment_date;
        const dayOfWeek = appointmentDateObj.toLocaleDateString("en-US", { weekday: "long" });

        let availability = await Availability.findOne({
            doctorId,
            date: dateStr,
            isActive: true,
        });
        if (!availability) {
            availability = await Availability.findOne({
                doctorId,
                dayOfWeek,
                isActive: true,
            });
        }
        if (!availability) {
            return next(new ErrorHandler(`Doctor is not available on this date`, 400));
        }

        const appointment = await Appointment.create({
        firstName,
        lastName,
        email,
        phone,
        dob,
        gender,
        appointment_date: dateStr,
        appointment_time,
        department,
        doctor:{
            firstName: doctor_firstName,
            lastName: doctor_lastName,
        },
        hasVisited,
        address,
        doctorId,
        patientId
        });
        res.status(200).json({
            success: true,
            message: "Appointment Sent Successfully",
        });
});

export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
    const appointments = await Appointment.find({}).populate("doctorId", "firstName lastName").populate("patientId", "firstName lastName");
    // if any problem try to change above appointment .populate("doctorId", "firstName lastName").populate("patientId", "firstName lastName") with ();
    res.status(200).json({
        success: true,
        appointments,
    });
});

export const getPatientAppointments = catchAsyncErrors(async (req, res, next) => {
    const patientId = req.user._id;
    const appointments = await Appointment.find({ patientId }).populate("doctorId", "firstName lastName doctorDepartment");
    res.status(200).json({
        success: true,
        appointments,
    });
});

export const getDoctorAppointments = catchAsyncErrors(async (req, res, next) => {
    const doctorId = req.user._id;
    const appointments = await Appointment.find({ doctorId }).populate("patientId", "firstName lastName email phone");
    res.status(200).json({
        success: true,
        appointments,
    });
});

export const updateAppointmentStatus = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.params;
    let appointment = await Appointment.findById(id);
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found", 404));
    }
    appointment = await Appointment.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success: true,
        message: "Appointment status updated successfully",
        appointment,
    });
});

export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
    const {id} = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found", 404));
    }
    await Appointment.findByIdAndDelete(id);
    res.status(200).json({
        success: true,
        message: "Appointment Deleted successfully",
    });
});

export const rescheduleAppointment = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { appointment_date, appointment_time } = req.body;

    if (!appointment_date) {
        return next(new ErrorHandler("Please provide new appointment date", 400));
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
        return next(new ErrorHandler("Appointment not found", 404));
    }

    // Check if trying to reschedule to past date
    const appointmentDateObj = new Date(appointment_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDateObj < today) {
        return next(new ErrorHandler("Cannot reschedule to a past date", 400));
    }

    // Check doctor availability (date-specific first, then weekly)
    const dateStr = appointment_date.includes("T") ? appointment_date.split("T")[0] : appointment_date;
    const dayOfWeek = appointmentDateObj.toLocaleDateString("en-US", { weekday: "long" });
    const docId = appointment.doctorId?._id || appointment.doctorId;

    let availability = await Availability.findOne({
        doctorId: docId,
        date: dateStr,
        isActive: true,
    });
    if (!availability) {
        availability = await Availability.findOne({
            doctorId: docId,
            dayOfWeek,
            isActive: true,
        });
    }
    if (!availability) {
        return next(new ErrorHandler(`Doctor is not available on this date`, 400));
    }

    // Check for conflicts with other appointments on same date+time
    const conflictQuery = {
        doctorId: docId,
        appointment_date: dateStr,
        _id: { $ne: id },
        status: { $ne: "Rejected" },
    };
    if (appointment_time) conflictQuery.appointment_time = appointment_time;
    const existingAppointment = await Appointment.findOne(conflictQuery);

    if (existingAppointment) {
        return next(new ErrorHandler("Doctor already has an appointment at this time", 409));
    }

    // Update appointment
    appointment.appointment_date = dateStr;
    if (appointment_time) appointment.appointment_time = appointment_time;
    appointment.status = "Pending"; // Reset status for rescheduled appointment
    await appointment.save();

    res.status(200).json({
        success: true,
        message: "Appointment rescheduled successfully",
        appointment,
    });
});

export const addAppointmentNotes = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const { appointmentNotes, prescription } = req.body;

    if (!appointmentNotes && !prescription) {
        return next(new ErrorHandler("Please provide notes or prescription", 400));
    }

    const appointment = await Appointment.findByIdAndUpdate(
        id,
        { appointmentNotes, prescription, status: "Accepted" },
        { new: true, runValidators: true }
    );

    if (!appointment) {
        return next(new ErrorHandler("Appointment not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Notes added successfully",
        appointment,
    });
});