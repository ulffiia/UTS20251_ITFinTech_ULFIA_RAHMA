import { Schema, model, models } from 'mongoose';

const CheckoutSchema = new Schema(
  {
    // Identifikasi
    code: { type: String, unique: true, required: true }, // Kode unik checkout (CHK-XXX)
    
    // Info Customer
    customerName: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true }, // 62xxx format
    
    // Items (array produk yang dibeli)
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        price: Number,
        quantity: Number,
        subtotal: Number,
      }
    ],
    
    // Pricing
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
    
    // Status
    status: {
      type: String,
      enum: ['pending', 'paid', 'expired', 'cancelled'],
      default: 'pending'
    },
    
    // Payment Reference (link ke Payment collection)
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    
    // User Reference (opsional, jika checkout by logged-in user)
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    
    // Metadata
    notes: String,
    shippingAddress: String,
  },
  { timestamps: true }
);

// Index untuk query cepat
CheckoutSchema.index({ code: 1 });
CheckoutSchema.index({ phone: 1 });
CheckoutSchema.index({ status: 1 });
CheckoutSchema.index({ createdAt: -1 });

export default models.Checkout || model('Checkout', CheckoutSchema);