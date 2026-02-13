import mongoose from "mongoose";

// export const dbConnection = () => {
//     mongoose.connect("mongodb+srv://mdkhizer15_db_user:PyvZD4uP6zWpCclw@new.v4xb5on.mongodb.net/?appName=new"|| process.env.MONGO_URI, {
//         dbName: "mdkhizer15_db_user"
//     }).then(() => {
//         console.log("Connected to MongoDB");
//     }).catch(err => {
//         console.log(`some error occured while connecting to database: ${err}`);
//     });
// };


export const dbConnection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};

// module.exports = dbConnection;


