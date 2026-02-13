import crypto from "crypto";
import { instance } from "../config/razorpay.js";

export const processPayment = async (req, res) => {
  if (!instance) {
    return res.status(503).json({
      success: false,
      message: "Payment gateway is not configured",
    });
  }
  const options = {
    amount: Number(req.body.amount * 100),
    currency: "INR",
  };
  const order = await instance.orders.create(options);
res.status(200).json({
    success: true,
    message: "Payment gateway is working fine",
    order
});
}


export const getKey=async(req,res)=>{
    res.status(200).json({
        key: process.env.RAZORPAY_KEY_ID,
});
}

export const paymentVerification=async(req,res)=>{
    const{razorpay_payment_id,razorpay_order_id,razorpay_signature}=req.body;
    const body=razorpay_order_id+"|"+razorpay_payment_id;
    const expectedSignature=crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET).update(body.toString()).digest("hex");
    const isAuthentic=expectedSignature===razorpay_signature;
    if(isAuthentic){
        return res.redirect(`http://localhost:5173/paymentSuccess?reference=${razorpay_payment_id}`);
    }else{
        res.status(400).json({
            success: false,
            message: "Payment failed",
    });
        // return res.redirect(`http:://localhost:5173/paymentFail`);
    }

    res.status(200).json({
        success: true,
        message: "Payment is successful",
});
}