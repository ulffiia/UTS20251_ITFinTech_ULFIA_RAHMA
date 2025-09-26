import mongoose from "mongoose";

const CheckoutSchema = new mongoose.Schema({
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 },
    },
  ],
  total: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Checkout || mongoose.model("Checkout", CheckoutSchema);
