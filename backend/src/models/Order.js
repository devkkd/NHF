import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    image: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,

    address1: String,
    address2: String,

    city: String,
    state: String,
    country: String,

    pin: String,

    mobile: String,

    email: String,   // ✅ ADD THIS
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    /* ---------------- User ---------------- */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* ---------------- Products ---------------- */

    items: {
      type: [orderItemSchema],
      required: true,
    },

    /* ---------------- Shipping Address ---------------- */

    address: {
      type: addressSchema,
      required: true,
    },

    /* ---------------- Pricing ---------------- */

    subtotal: {
      type: Number,
      required: true,
      default: 0,
    },

    shipping: {
      type: Number,
      default: 0,
    },

    tax: {
      type: Number,
      default: 0,
    },

    discount: {
      type: Number,
      default: 0,
    },

    total: {
      type: Number,
      required: true,
    },

    /* ---------------- Coupon ---------------- */

    couponCode: {
      type: String,
      default: "",
    },

    /* ---------------- Payment ---------------- */

    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod"],
      default: "razorpay",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    paymentDate: Date,

    transactionId: {
      type: String,
      default: "",
    },

    /* ---------------- Razorpay ---------------- */

    razorpayOrderId: {
      type: String,
      default: "",
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    razorpaySignature: {
      type: String,
      default: "",
    },

    /* ---------------- Order Status ---------------- */

    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "packed",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    /* ---------------- Invoice ---------------- */

    invoiceNumber: {
      type: String,
      default: "",
    },

    /* ---------------- Shiprocket ---------------- */

    shiprocketOrderId: {
      type: String,
      default: "",
    },

    shipmentId: {
      type: String,
      default: "",
    },

    awbCode: {
      type: String,
      default: "",
    },

    courierName: {
      type: String,
      default: "",
    },

    trackingUrl: {
      type: String,
      default: "",
    },

    /* ---------------- Notes ---------------- */

    adminNote: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

/* ---------------- Indexes ---------------- */

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderStatus: 1 });

export default mongoose.model("Order", orderSchema);