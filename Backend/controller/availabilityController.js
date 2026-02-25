import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Availability } from "../models/availabilitySchema.js";
import { User } from "../models/userSchema.js";

export const setDoctorAvailability = catchAsyncErrors(async (req, res, next) => {
    const { date, dayOfWeek, startTime, endTime, slotDuration = 30 } = req.body;
    const doctorId = req.user._id;

    // Check if it's date-specific or weekly availability
    const isDateSpecific = !!date;

    if (isDateSpecific) {
        // Date-specific availability
        if (!startTime || !endTime) {
            return next(new ErrorHandler("Please provide startTime and endTime", 400));
        }

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(date)) {
            return next(new ErrorHandler("Invalid date format. Use YYYY-MM-DD", 400));
        }

        // Check if date is not in the past
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            return next(new ErrorHandler("Cannot set availability for past dates", 400));
        }

        // Check if availability already exists for this date
        let availability = await Availability.findOne({
            doctorId,
            date,
        });

        if (availability) {
            // Update existing
            availability.startTime = startTime;
            availability.endTime = endTime;
            availability.slotDuration = slotDuration;
            availability.updatedAt = new Date();
            await availability.save();
        } else {
            // Create new
            availability = await Availability.create({
                doctorId,
                date,
                dayOfWeek: null,
                startTime,
                endTime,
                slotDuration,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Date-specific availability set successfully",
            availability,
        });
    } else {
        // Weekly recurring availability
        if (!dayOfWeek || !startTime || !endTime) {
            return next(new ErrorHandler("Please provide dayOfWeek, startTime, and endTime", 400));
        }

        const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        if (!validDays.includes(dayOfWeek)) {
            return next(new ErrorHandler("Invalid day of week", 400));
        }

        // Validate time format and logic
        if (startTime >= endTime) {
            return next(new ErrorHandler("Start time must be before end time", 400));
        }

        // Check if availability already exists for this day
        let availability = await Availability.findOne({
            doctorId,
            dayOfWeek,
        });

        if (availability) {
            // Update existing
            availability.startTime = startTime;
            availability.endTime = endTime;
            availability.slotDuration = slotDuration;
            availability.updatedAt = new Date();
            await availability.save();
        } else {
            // Create new
            availability = await Availability.create({
                doctorId,
                dayOfWeek,
                date: null,
                startTime,
                endTime,
                slotDuration,
            });
        }

        res.status(200).json({
            success: true,
            message: "Weekly availability set successfully",
            availability,
        });
    }
});

export const getDoctorAvailability = catchAsyncErrors(async (req, res, next) => {
    const { doctorId } = req.params;

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "Doctor") {
        return next(new ErrorHandler("Doctor not found", 404));
    }

    const availability = await Availability.find({ doctorId, isActive: true }).sort("dayOfWeek");

    res.status(200).json({
        success: true,
        availability,
    });
});

export const getAvailableSlotsForDate = catchAsyncErrors(async (req, res, next) => {
    const { doctorId, date } = req.query;

    if (!doctorId || !date) {
        return next(new ErrorHandler("Please provide doctorId and date", 400));
    }
    const dateStr = String(date).includes("T") ? String(date).split("T")[0] : String(date);

    // First, check for date-specific availability
    let availability = await Availability.findOne({
        doctorId,
        date: dateStr,
        isActive: true,
    });

    // If no date-specific availability, check for weekly recurring availability
    if (!availability) {
        const appointmentDate = new Date(dateStr);
        const dayOfWeek = appointmentDate.toLocaleDateString("en-US", { weekday: "long" });

        availability = await Availability.findOne({
            doctorId,
            dayOfWeek,
            isActive: true,
        });
    }

    if (!availability) {
        return res.status(200).json({
            success: true,
            slots: [],
            message: "Doctor not available on this day",
        });
    }

    // Get already booked appointments for this date
    const { Appointment } = await import("../models/appointmentSchema.js");
    const bookedAppointments = await Appointment.find({
        doctorId,
        appointment_date: dateStr,
        status: { $ne: "Rejected" },
    });

    // Generate all available slots, passing booked times (appointment_time field)
    const bookedTimes = bookedAppointments.map((apt) => apt.appointment_time);
    const slots = generateTimeSlots(
        availability.startTime,
        availability.endTime,
        availability.slotDuration,
        bookedTimes
    );

    res.status(200).json({
        success: true,
        slots,
        doctorName: (await User.findById(doctorId)).firstName,
    });
});

export const updateDoctorAvailability = catchAsyncErrors(async (req, res, next) => {
    const { availabilityId } = req.params;
    const { startTime, endTime, slotDuration, isActive } = req.body;
    const doctorId = req.user._id;

    const availability = await Availability.findById(availabilityId);
    if (!availability) {
        return next(new ErrorHandler("Availability not found", 404));
    }

    if (availability.doctorId.toString() !== doctorId.toString()) {
        return next(new ErrorHandler("Not authorized to update this availability", 403));
    }

    if (startTime && endTime && startTime >= endTime) {
        return next(new ErrorHandler("Start time must be before end time", 400));
    }

    availability.startTime = startTime || availability.startTime;
    availability.endTime = endTime || availability.endTime;
    availability.slotDuration = slotDuration || availability.slotDuration;
    if (isActive !== undefined) availability.isActive = isActive;
    availability.updatedAt = new Date();

    await availability.save();

    res.status(200).json({
        success: true,
        message: "Availability updated successfully",
        availability,
    });
});

export const deleteDoctorAvailability = catchAsyncErrors(async (req, res, next) => {
    const { availabilityId } = req.params;
    const doctorId = req.user._id;

    const availability = await Availability.findById(availabilityId);
    if (!availability) {
        return next(new ErrorHandler("Availability not found", 404));
    }

    if (availability.doctorId.toString() !== doctorId.toString()) {
        return next(new ErrorHandler("Not authorized to delete this availability", 403));
    }

    await Availability.findByIdAndDelete(availabilityId);

    res.status(200).json({
        success: true,
        message: "Availability deleted successfully",
    });
});

// Helper function to generate time slots
// bookedTimes should be an array of time strings like ['09:00', '09:30', '10:00']
function generateTimeSlots(startTime, endTime, slotDuration, bookedTimes = []) {
    const slots = [];
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    let currentDate = new Date();
    currentDate.setHours(startHour, startMin, 0);
    const endDate = new Date();
    endDate.setHours(endHour, endMin, 0);

    while (currentDate < endDate) {
        const h = currentDate.getHours();
        const m = currentDate.getMinutes();
        const timeString = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        // Check if this time is in the booked times array
        const isBooked = bookedTimes.includes(timeString);

        slots.push({
            time: timeString,
            available: !isBooked,
        });

        currentDate.setMinutes(currentDate.getMinutes() + slotDuration);
    }

    return slots;
}
