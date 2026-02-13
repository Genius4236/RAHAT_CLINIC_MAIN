import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
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
                password:{
                    type:String,
                    required:true,
                    minLength: [8, "Password Must contain At Least 8 character!"],
                    maxLength: [20, "Password Must contain At Least 20 character!"],
                    select: false,
                },
                role:{
                    type:String,
                    required:true,
                    enum: ["Admin", "Patient", "Doctor"],
                },
                doctorDepartment:{
                    type:String,
                },
                docAvatar:{
                    public_id: String,
                    url: String,
                },
});

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next()
    }
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateJsonWebToken = function(){
    return jwt.sign({id: this._id}, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES,
    });
};

export const User = mongoose.model("User", userSchema);