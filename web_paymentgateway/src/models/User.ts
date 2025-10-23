import { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  email: { type: String, unique: true, sparse: true },
  phone: { type: String, unique: true, sparse: true },  // 62xxxxxxxxxx
  name: String,
  passwordHash: String,                                  // boleh kosong (OTP-only)
  mfaEnabled: { type: Boolean, default: true },
}, { timestamps: true });

export default models.User || model('User', UserSchema);
