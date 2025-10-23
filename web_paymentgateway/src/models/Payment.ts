import mongoose, { Schema, models } from "mongoose";

const PaymentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      productId: { type: Schema.Types.ObjectId, ref: "Product" },
      name: String,
      price: Number,
      quantity: Number,
    },
  ],
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ["PENDING", "WAITING_PAYMENT", "PAID", "EXPIRED", "FAILED"],
    default: "PENDING",
  },
  paymentMethod: String,
  xenditInvoiceId: String,
  xenditInvoiceUrl: String,
  expiresAt: Date,
  paidAt: Date,

  // --- Tambahan untuk ADMIN ---
  adminId: { type: Schema.Types.ObjectId, ref: "Admin" }, // siapa admin yang mengelola transaksi
  adminNote: { type: String }, // catatan dari admin (opsional)
  verifiedByAdmin: { type: Boolean, default: false }, // sudah diverifikasi admin atau belum
  verifiedAt: { type: Date }, // kapan diverifikasi
  adminAction: {
    type: String,
    enum: ["NONE", "APPROVED", "REJECTED", "REFUNDED"],
    default: "NONE",
  },
}, { timestamps: true });

export default models.Payment || mongoose.model("Payment", PaymentSchema);
