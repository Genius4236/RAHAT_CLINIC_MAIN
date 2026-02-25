export const generateToken =(user, message, statusCode,res)=>{
    const token = user.generateJsonWebToken();
    let cookieName;
    
    if (user.role === "Admin") {
        cookieName = "adminToken";
    } else if (user.role === "Patient") {
        cookieName = "patientToken";
    } else if (user.role === "Doctor") {
        cookieName = "doctorToken";
    }
    
    res.status(statusCode).cookie(cookieName, token, {
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: true,
        sameSite: "None",
    })
    .json({
        success: true,
        message,
        user,
        token,
    });
};