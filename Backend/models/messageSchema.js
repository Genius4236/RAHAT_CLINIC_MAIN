import mongoose from "mongoose";
import validator from "validator";

const messageSchema = new mongoose.Schema({
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
            message:{
                type:String,
                required:true,
                minLength: [10, "Message Must contain At Least 10 character!"]
                },

});

export const Message = mongoose.model("Message", messageSchema);