import mongoose from "mongoose";

/* =========================================================
   ORDER REQUEST SCHEMA

   Handles:
   - Order cancellation request
   - Product return request
   - Damaged product replacement request
========================================================= */

const orderRequestSchema = new mongoose.Schema(
  {
    /* =====================================================
       BASIC REFERENCES
    ====================================================== */

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* =====================================================
       REQUEST TYPE
    ====================================================== */

    type: {
      type: String,
      enum: ["cancel", "return", "replacement"],
      required: true,
      index: true,
    },

    /* =====================================================
       ORDER ITEM
       Required for return/replacement.
       Not required for full order cancellation.
    ====================================================== */

    orderItemId: {
      type: String,
      default: "",
      trim: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    /* =====================================================
       PRODUCT SNAPSHOT
       Keeps useful information even if product changes later.
    ====================================================== */

    productName: {
      type: String,
      default: "",
      trim: true,
    },

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

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    /* =====================================================
       REQUEST REASON
    ====================================================== */

    reason: {
      type: String,
      enum: [
        "damaged",
        "defective",
        "wrong_product",
        "wrong_size",
        "not_as_expected",
        "change_of_mind",
        "other",
      ],
      default: "other",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    /* =====================================================
       DAMAGE / RETURN IMAGES
       User can upload multiple images.
    ====================================================== */

    images: {
      type: [
        {
          type: String,
          trim: true,
        },
      ],
      default: [],
    },

    /* =====================================================
       REQUEST STATUS

       pending
       approved
       rejected
       cancelled
       completed
    ====================================================== */

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
        "completed",
      ],
      default: "pending",
      index: true,
    },

    /* =====================================================
       ADMIN REVIEW
    ====================================================== */

   reviewedBy: {
  type: mongoose.Schema.Types.ObjectId,
  default: null,
},

    reviewedAt: {
      type: Date,
      default: null,
    },

    approvalDate: {
      type: Date,
      default: null,
    },

    rejectionDate: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    adminNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },

    /* =====================================================
       REPLACEMENT-SPECIFIC
    ====================================================== */

    replacementApproved: {
      type: Boolean,
      default: false,
    },

    replacementCompleted: {
      type: Boolean,
      default: false,
    },

    replacementOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    /* =====================================================
       RETURN-SPECIFIC
    ====================================================== */

    returnReceived: {
      type: Boolean,
      default: false,
    },

    returnReceivedAt: {
      type: Date,
      default: null,
    },

    /* =====================================================
       REFUND INFORMATION

       Actual refund processing will be handled separately.
    ====================================================== */

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundStatus: {
      type: String,
      enum: [
        "not_applicable",
        "pending",
        "processing",
        "completed",
        "failed",
      ],
      default: "not_applicable",
    },

    refundTransactionId: {
      type: String,
      default: "",
      trim: true,
    },

    refundedAt: {
      type: Date,
      default: null,
    },

    /* =====================================================
       REPLACEMENT WINDOW

       This will store the exact last date/time on which
       replacement can be requested.

       For replacement:
       deliveredAt + 7 days
    ====================================================== */

    replacementWindowEndsAt: {
      type: Date,
      default: null,
    },

    /* =====================================================
       CUSTOMER NOTE
    ====================================================== */

    customerNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================================
   INDEXES
========================================================= */

orderRequestSchema.index({
  order: 1,
  createdAt: -1,
});

orderRequestSchema.index({
  user: 1,
  createdAt: -1,
});

orderRequestSchema.index({
  status: 1,
  createdAt: -1,
});

orderRequestSchema.index({
  type: 1,
  status: 1,
});

/* =========================================================
   EXPORT
========================================================= */

export default mongoose.model("OrderRequest", orderRequestSchema);