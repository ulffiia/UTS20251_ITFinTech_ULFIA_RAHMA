import mongoose, { Schema, models } from "mongoose";

const PaymentSchema = new Schema(
  {
    // ✅ Xendit Integration
    xenditInvoiceId: { type: String, unique: true, sparse: true }, // ID invoice dari Xendit
    invoiceId: { type: String, unique: true, sparse: true }, // Alias untuk xenditInvoiceId
    externalId: { type: String, unique: true, required: true }, // ID unik kita (CHK-XXX)
    xenditInvoiceUrl: String, // URL pembayaran
    invoiceUrl: String, // Alias untuk xenditInvoiceUrl

    // ✅ Checkout Reference
    checkoutId: { type: Schema.Types.ObjectId, ref: "Checkout" },

    // User & Items (untuk backward compatibility)
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],

    // ✅ Amount & Status
    total: { type: Number, required: true },
    amount: { type: Number }, // Alias untuk total
    status: {
      type: String,
      enum: ["PENDING", "WAITING_PAYMENT", "PAID", "LUNAS", "EXPIRED", "FAILED"],
      default: "PENDING",
    },

    // ✅ Payment Details
    paymentMethod: String, // BANK_TRANSFER, EWALLET, dll
    paymentChannel: String, // BCA, MANDIRI, OVO, GOPAY, dll
    paidAt: Date,
    expiresAt: Date,

    // ✅ Webhook Raw Data
    lastWebhookRaw: Schema.Types.Mixed,

    // Admin Features
    adminId: { type: Schema.Types.ObjectId, ref: "Admin" },
    adminNote: String,
    verifiedByAdmin: { type: Boolean, default: false },
    verifiedAt: Date,
    adminAction: {
      type: String,
      enum: ["NONE", "APPROVED", "REJECTED", "REFUNDED"],
      default: "NONE",
    },
  },
  { timestamps: true }
);

// ✅ Indexes untuk performa query
PaymentSchema.index({ externalId: 1 });
PaymentSchema.index({ invoiceId: 1 });
PaymentSchema.index({ xenditInvoiceId: 1 });
PaymentSchema.index({ checkoutId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ createdAt: -1 });

export default models.Payment || mongoose.model("Payment", PaymentSchema);