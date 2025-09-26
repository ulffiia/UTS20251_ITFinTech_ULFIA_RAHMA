import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  checkoutId: { type: mongoose.Schema.Types.ObjectId, ref: "Checkout" },
  method: { type: String, enum: ["CreditCard", "PayPal", "EWallet", "BankTransfer"], required: true },
  amount: Number,
  status: { type: String, enum: ["Pending", "Lunas", "Failed"], default: "Pending" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
