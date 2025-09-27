import mongoose, { Schema, models } from "mongoose";

const PaymentSchema = new Schema(
  {
    externalId: { type: String, index: true },
    invoiceId: { type: String, index: true },
    status: { type: String, default: "PENDING" }, // PENDING | LUNAS | EXPIRED
    paidAt: { type: Date },
    lastWebhookRaw: { type: Schema.Types.Mixed }, // simpan payload terakhir
  },
  { timestamps: true }
);

export default models.Payment || mongoose.model("Payment", PaymentSchema);
