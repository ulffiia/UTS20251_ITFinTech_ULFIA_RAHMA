import { Schema, model, models } from 'mongoose';

const OtpSchema = new Schema(
  {
    email: { type: String, index: true },
    phone: { type: String, index: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL auto hapus

export default models.Otp || model('Otp', OtpSchema);
