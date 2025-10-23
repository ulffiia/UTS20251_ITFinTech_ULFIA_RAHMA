import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("Please define MONGODB_URI in .env.local");

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;
  const db = await mongoose.connect(MONGODB_URI);
  isConnected = !!db.connections[0].readyState;
  console.log("✅ MongoDB connected");
};

// --------------------
// Tambahan: definisi schema OTP
// --------------------
import { Schema, models } from "mongoose";

const OtpSchema = new Schema(
  {
    email: { type: String, index: true },
    phone: { type: String, index: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL index agar otomatis hapus OTP yang kedaluwarsa
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OtpModel = models.Otp || mongoose.model("Otp", OtpSchema);
