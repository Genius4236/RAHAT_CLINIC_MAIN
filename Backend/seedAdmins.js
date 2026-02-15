import mongoose from "mongoose";
import { User } from "./models/userSchema.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "./config/config.env") });


const sampleAdmins = [
  {
    firstName: "John",
    lastName: "Admin",
    email: "admin@rahatclinic.com",
    phone: "9876543210",
    dob: new Date("1990-05-15"),
    gender: "Male",
    password: "Admin@123456",
    role: "Admin",
  },
  {
    firstName: "Sarah",
    lastName: "Manager",
    email: "manager@rahatclinic.com",
    phone: "9876543211",
    dob: new Date("1992-08-20"),
    gender: "Female",
    password: "Manager@123456",
    role: "Admin",
  },
  {
    firstName: "Michael",
    lastName: "Director",
    email: "director@rahatclinic.com",
    phone: "9876543212",
    dob: new Date("1988-03-10"),
    gender: "Male",
    password: "Director@123456",
    role: "Admin",
  },
];

const seedAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing admins
    const deleteResult = await User.deleteMany({ role: "Admin" });
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing admins`);

    // Add sample admins
    const result = await User.insertMany(sampleAdmins);
    console.log(`✅ Added ${result.length} sample admins to the database`);

    console.log("\n📋 Sample Admins Created:");
    result.forEach((admin) => {
      console.log(`
  Name: ${admin.firstName} ${admin.lastName}
  Email: ${admin.email}
  Phone: ${admin.phone}
  Password: ${sampleAdmins.find(a => a.email === admin.email).password}
  ---`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admins:", error.message);
    process.exit(1);
  }
};

seedAdmins();
