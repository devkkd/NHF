import mongoose from "mongoose";

/* =========================================================
   ORDER ITEM
========================================================= */

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
      trim: true,
    },

    image: {
      type: String,
      default: "",
      trim: true,
    },

    /* ---------------- PRICE SNAPSHOT ---------------- */

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    actualPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ---------------- QUANTITY ---------------- */

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    /* ---------------- VARIANT SNAPSHOT ---------------- */

    selectedColor: {
      type: String,
      default: "",
      trim: true,
    },

    selectedColorName: {
      type: String,
      default: "",
      trim: true,
    },

    selectedSize: {
      type: String,
      default: "",
      trim: true,
    },

    /* ---------------- SHIPPING SNAPSHOT ---------------- */

    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

/* =========================================================
   ADDRESS SNAPSHOT
========================================================= */

const addressSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      default: "",
      trim: true,
    },

    lastName: {
      type: String,
      default: "",
      trim: true,
    },

    address1: {
      type: String,
      default: "",
      trim: true,
    },

    address2: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      default: "",
      trim: true,
    },

    state: {
      type: String,
      default: "",
      trim: true,
    },

    country: {
      type: String,
      default: "",
      trim: true,
    },

    pin: {
      type: String,
      default: "",
      trim: true,
    },

    mobile: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
  },
  {
    _id: false,
  }
);

/* =========================================================
   ADMIN APPROVAL
========================================================= */

const adminApprovalSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    approvedBy: {
      type: String,
      default: "",
      trim: true,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedBy: {
      type: String,
      default: "",
      trim: true,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },
  },
  {
    _id: false,
  }
);

/* =========================================================
   SHIPROCKET SNAPSHOT
========================================================= */

const shiprocketSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    shipmentId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    channelId: {
      type: String,
      default: "",
      trim: true,
    },

    awbCode: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    courierCompanyId: {
      type: String,
      default: "",
      trim: true,
    },

    courierName: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      default: "",
      trim: true,
    },

    trackingUrl: {
      type: String,
      default: "",
      trim: true,
    },

    labelUrl: {
      type: String,
      default: "",
      trim: true,
    },

    manifestUrl: {
      type: String,
      default: "",
      trim: true,
    },

    createdAt: {
      type: Date,
      default: null,
    },

    pickedUpAt: {
      type: Date,
      default: null,
    },

    shippedAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    lastSyncedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

/* =========================================================
   ORDER SCHEMA
========================================================= */

const orderSchema = new mongoose.Schema(
  {
    /* =====================================================
       USER
    ===================================================== */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* =====================================================
       PRODUCTS
    ===================================================== */

    items: {
      type: [orderItemSchema],
      required: true,

      validate: {
        validator: function (items) {
          return (
            Array.isArray(items) &&
            items.length > 0
          );
        },

        message:
          "Order must contain at least one item.",
      },
    },

    /* =====================================================
       SHIPPING ADDRESS SNAPSHOT
    ===================================================== */

    address: {
      type: addressSchema,
      required: true,
    },

    /* =====================================================
       PRICING
    ===================================================== */

    subtotal: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    shipping: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    /* =====================================================
       COUPON
    ===================================================== */

    couponCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    /* =====================================================
       PAYMENT
    ===================================================== */

    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod"],
      default: "razorpay",
      required: true,
    },

    paymentStatus: {
      type: String,

      enum: [
        "pending",
        "paid",
        "failed",
        "refunded",
        "partially_refunded",
      ],

      default: "pending",
      index: true,
    },

    paymentDate: {
      type: Date,
      default: null,
    },

    transactionId: {
      type: String,
      default: "",
      trim: true,
    },

    /* =====================================================
       RAZORPAY
    ===================================================== */

    razorpayOrderId: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    razorpayPaymentId: {
      type: String,
      default: "",
      trim: true,
    },

    razorpaySignature: {
      type: String,
      default: "",
      trim: true,
    },

    /* =====================================================
       ADMIN APPROVAL
       
       IMPORTANT:
       Order create hone ke baad pending rahega.
       Admin approve karne ke baad hi confirmed hoga.
    ===================================================== */

    adminApproval: {
      type: adminApprovalSchema,
      default: () => ({}),
    },

    /* =====================================================
       ORDER STATUS
    ===================================================== */

    orderStatus: {
      type: String,

      enum: [
        "pending",
        "confirmed",
        "processing",
        "packed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "return_requested",
        "return_approved",
        "returned",
        "replacement_requested",
        "replacement_approved",
        "replacement_shipped",
        "replacement_delivered",
        "refunded",
      ],

      default: "pending",
      index: true,
    },

    /* =====================================================
       ORDER DATES
    ===================================================== */

    confirmedAt: {
      type: Date,
      default: null,
    },

    processingAt: {
      type: Date,
      default: null,
    },

    packedAt: {
      type: Date,
      default: null,
    },

    shippedAt: {
      type: Date,
      default: null,
    },

    outForDeliveryAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    returnedAt: {
      type: Date,
      default: null,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    /* =====================================================
       CANCELLATION
       
       Actual request separate OrderRequest model mein
       store hoga.
    ===================================================== */

    cancellationReason: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    cancelledBy: {
      type: String,

      enum: [
        "",
        "user",
        "admin",
        "system",
      ],

      default: "",
    },

    /* =====================================================
       REFUND
    ===================================================== */

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundStatus: {
      type: String,

      enum: [
        "not_requested",
        "pending",
        "processing",
        "completed",
        "failed",
      ],

      default: "not_requested",
      index: true,
    },

    refundPaymentId: {
      type: String,
      default: "",
      trim: true,
    },

    /* =====================================================
       SHIPROCKET
    ===================================================== */

    shiprocket: {
      type: shiprocketSchema,
      default: () => ({}),
    },

    /* =====================================================
       LEGACY / QUICK ACCESS SHIPROCKET FIELDS
       
       Ye fields backward compatibility ke liye rakhe hain.
    ===================================================== */

    shiprocketOrderId: {
      type: String,
      default: "",
      trim: true,
    },

    shipmentId: {
      type: String,
      default: "",
      trim: true,
    },

    awbCode: {
      type: String,
      default: "",
      trim: true,
      index: true,
    },

    courierName: {
      type: String,
      default: "",
      trim: true,
    },

    trackingUrl: {
      type: String,
      default: "",
      trim: true,
    },

    /* =====================================================
       INVOICE
    ===================================================== */

    invoiceNumber: {
      type: String,
      default: "",
      trim: true,
    },

    /* =====================================================
       ADMIN NOTE
    ===================================================== */

    adminNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    /* =====================================================
       CUSTOMER NOTE
    ===================================================== */

    customerNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    /* =====================================================
       REQUEST REFERENCES
       
       Return / Replace / Cancel requests ka separate
       OrderRequest collection mein record rahega.
    ===================================================== */

    activeRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "OrderRequest",
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

/* =========================================================
   INDEXES
========================================================= */

/* User orders */
orderSchema.index({
  user: 1,
  createdAt: -1,
});

/* Order status */
orderSchema.index({
  orderStatus: 1,
  createdAt: -1,
});

/* Payment */
orderSchema.index({
  paymentStatus: 1,
  createdAt: -1,
});

/* Admin approval */
orderSchema.index({
  "adminApproval.status": 1,
  createdAt: -1,
});

/* Razorpay */
orderSchema.index({
  razorpayOrderId: 1,
});

/* Shiprocket */
orderSchema.index({
  "shiprocket.orderId": 1,
});

orderSchema.index({
  "shiprocket.awbCode": 1,
});

/* Request */
orderSchema.index({
  activeRequestId: 1,
});

/* =========================================================
   MODEL
========================================================= */

export default mongoose.model(
  "Order",
  orderSchema
);