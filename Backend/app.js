import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import os from "os";
import { dbConnection } from "./database/dbConnection.js";
import messageRouter from "./router/messageRouter.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import userRouter from "./router/userRouter.js";
import appointmentRouter from "./router/appointmentRouter.js";
import productRouter from "./router/ProductRouter.js";
import availabilityRouter from "./router/availabilityRouter.js";
import paymentRouter from "./router/paymentRouter.js";
import documentRouter from "./router/documentRouter.js";

const app = express();
dbConnection();
app.set("trust proxy", true);

app.use(cors({
    origin: [process.env.FRONTEND_URL, process.env.DASHBOARD_URL, "http://localhost:5173", "http://localhost:5174","http://localhost:5176", "https://rahatclinic.netlify.app", "https://rahatdashboard.netlify.app"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: os.tmpdir(),
}));

app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/appointment", appointmentRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/availability", availabilityRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/document", documentRouter);




app.use(errorMiddleware);

export default app;
