import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { PasswordReset } from "../models/passwordResetSchema.js";
import {generateToken} from "../utils/jwtToken.js";
import cloudinary from "cloudinary";
import crypto from "crypto";

export const patientRegister = catchAsyncErrors(async(req,res,next)=>{
    const {firstName, lastName, email, phone, password, gender, dob, role} = req.body;
    if (!firstName || !lastName || !email || !phone || !password || !gender || !dob || !role){
        return next(new ErrorHandler("Please fill in all fields", 400));
    };



    let isRegistered = await User.findOne({ email });
    if(isRegistered){
        return next(new ErrorHandler("Email already Registered!", 400));
    }

    const user = await User.create({firstName, lastName, email, phone, password, gender, dob,/* nic,*/ role});
    generateToken(user, "User Registered!", 200, res);
        
});



export const login  = catchAsyncErrors(async(req, res, next)=> {
    const {email, password, /*confirmPassword,*/ role} = req.body;
    if(!email || !password /*||!confirmPassword*/ || !role) {
        return next(new ErrorHandler("Please fill in all fields", 400));
    }
    // if(password !== confirmPassword){
    //     return next(new ErrorHandler("Password and Confirm Password must be same", 400));
    //     }
        const user = await User.findOne({ email }).select("+password");
        if(!user){
            return next(new ErrorHandler("Invalid Email or Password!", 400));
        }

        const isPasswordMatched = await user.comparePassword(password);
        if(!isPasswordMatched){
            return next(new ErrorHandler("Invalid Email or Password", 400));
        }
        if(role !== user.role){
            return next(new ErrorHandler("Invalid Role", 400));
        }
        generateToken(user, "User Login Successfully!", 201, res);
});

export const addNewAdmin = catchAsyncErrors(async(req, res, next) => {
    const {firstName, lastName, email, phone, password, gender, dob,/* nic*/} =req.body;
    if (!firstName || !lastName || !email || !phone || !password || !gender || !dob/* || !nic*/) {
        return next(new ErrorHandler("Please fill in all fields", 400));
    }
    const isRegistered = await User.findOne({email});
    if (isRegistered) {
        return next(new ErrorHandler(`${isRegistered.role} With This Email Already Exists!`));
        }

        
        const admin = await User.create({firstName, lastName, email, phone, password, gender, dob, /*nic,*/ role: "Admin",
        });
        res.status(200).json({
            success: true,
            message: "Admin Registered Successfully!",
            admin,
        }); 
});

export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
    const doctors = await User.find({role: "Doctor"});
    res.status(200).json({
        success: true,
        doctors,
    });
});

export const getUserDetails = catchAsyncErrors(async(req,res,next)=>{
    const user = req.user;
    res.status(200).json({
        success: true,
        user,
        });
});

export const logoutAdmin = catchAsyncErrors(async(req, res, next) => {
    res.status(200).cookie("adminToken","",{
        httpOnly: true,
        expires: new Date(Date.now()),
        secure: true,
        sameSite: "None",
    }).json({
        success: true,
        message: "Admin Logout Successfully!",
    });
});

export const logoutPatient = catchAsyncErrors(async(req, res, next) => {
    res.status(200).cookie("patientToken", "",{
        httpOnly: true,
        expires: new Date(Date.now()),
        secure: true,
        sameSite: "None",
    }).json({
        success: true,
        message: "User Logout Successfully!",
    });
});

export const logoutDoctor = catchAsyncErrors(async(req, res, next) => {
    res.status(200).cookie("doctorToken", "",{
        httpOnly: true,
        expires: new Date(Date.now()),
        secure: true,
        sameSite: "None",
    }).json({
        success: true,
        message: "Doctor Logout Successfully!",
    });
});

export const addNewDoctor = catchAsyncErrors(async(req, res, next) => {
    if(!req.files || Object.keys(req.files).length === 0) {
        return next(new ErrorHandler("Doctor Avatar Required!", 400));
    }
    const { docAvatar } = req.files;
    const allowedFormats = ["image/png", "image/jpeg", "image/webp"];
    if (!allowedFormats.includes(docAvatar.mimetype)) {
        return next(new ErrorHandler("Invalid Format Not Supported!", 400));
    }
    const {firstName, lastName, email, phone, password, gender, dob,/* nic,*/ doctorDepartment } =req.body;
    if(!firstName || !lastName || !email || !phone || !password || !gender || !dob /*|| !nic*/ || !doctorDepartment){
        return next(new ErrorHandler("Please Provide Full Details!", 400));
    }
    const isRegistered = await User.findOne({email});
    if(isRegistered){
        return next(new ErrorHandler(`${isRegistered.role} Email Already Registered!`, 400));
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(
        docAvatar.tempFilePath
    );
    if(!cloudinaryResponse || cloudinaryResponse.error){
        console.error("Cloudinary Error:", cloudinaryResponse.error || "Unknown Cloudinary Error");
        return next(new ErrorHandler("Failed to Upload Doctor Avatar!", 500));
    }
    const doctor = await User.create({firstName, lastName, email, phone, password, gender, dob, /*nic,*/ doctorDepartment, role: "Doctor", docAvatar: {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,},
    });
    res.status(201).json({
        success: true,
        message: "New Doctor Added Successfully!",
        doctor,
    });
});

export const requestPasswordReset = catchAsyncErrors(async(req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new ErrorHandler("Please provide email", 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
        return next(new ErrorHandler("User not found with this email", 404));
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // Save reset token to database
    await PasswordReset.create({
        userId: user._id,
        resetToken: crypto.createHash("sha256").update(resetToken).digest("hex"),
        resetTokenExpiry,
    });

    // In production, send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL}reset-password/${resetToken}`;
    
    // For now, we'll just return the token (in production, email it)
    console.log(`Password Reset URL: ${resetUrl}`);

    res.status(200).json({
        success: true,
        message: "Password reset token sent to email",
        // Note: In production, don't send token in response. Send via email instead.
        // resetToken: resetToken // Remove this in production
    });
});

export const verifyResetToken = catchAsyncErrors(async(req, res, next) => {
    const { token } = req.body;

    if (!token) {
        return next(new ErrorHandler("Please provide reset token", 400));
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const resetRecord = await PasswordReset.findOne({
        resetToken: hashedToken,
        resetTokenExpiry: { $gt: Date.now() },
        isUsed: false,
    });

    if (!resetRecord) {
        return next(new ErrorHandler("Invalid or expired reset token", 400));
    }

    res.status(200).json({
        success: true,
        message: "Token is valid",
        isValid: true,
    });
});

export const resetPassword = catchAsyncErrors(async(req, res, next) => {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }

    if (newPassword !== confirmPassword) {
        return next(new ErrorHandler("Passwords do not match", 400));
    }

    if (newPassword.length < 8) {
        return next(new ErrorHandler("Password must be at least 8 characters", 400));
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const resetRecord = await PasswordReset.findOne({
        resetToken: hashedToken,
        resetTokenExpiry: { $gt: Date.now() },
        isUsed: false,
    });

    if (!resetRecord) {
        return next(new ErrorHandler("Invalid or expired reset token", 400));
    }

    const user = await User.findById(resetRecord.userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    user.password = newPassword;
    await user.save();

    // Mark reset token as used
    resetRecord.isUsed = true;
    await resetRecord.save();

    res.status(200).json({
        success: true,
        message: "Password reset successfully",
    });
});

export const changePassword = catchAsyncErrors(async(req, res, next) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user._id;

    if (!oldPassword || !newPassword || !confirmPassword) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }

    if (newPassword !== confirmPassword) {
        return next(new ErrorHandler("New passwords do not match", 400));
    }

    if (newPassword.length < 8) {
        return next(new ErrorHandler("Password must be at least 8 characters", 400));
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    const isPasswordMatched = await user.comparePassword(oldPassword);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Old password is incorrect", 400));
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
        success: true,
        message: "Password changed successfully",
    });
});

export const updateUserProfile = catchAsyncErrors(async(req, res, next) => {
    const { firstName, lastName, email, phone, gender, dob, address } = req.body;
    const userId = req.user._id;

    if (!firstName || !lastName || !email || !phone) {
        return next(new ErrorHandler("Please provide required fields", 400));
    }

    const user = await User.findById(userId);
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    // Check if email is taken by another user
    if (email !== user.email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return next(new ErrorHandler("Email already in use", 400));
        }
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.phone = phone;
    if (gender) user.gender = gender;
    if (dob) user.dob = dob;

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user,
    });
});