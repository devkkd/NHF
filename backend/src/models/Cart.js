import mongoose from "mongoose";

/* =========================================================
   CART ITEM SCHEMA
========================================================= */

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    /* =====================================================
       SELECTED VARIANT
    ===================================================== */

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

    /* =====================================================
       SNAPSHOT OF CURRENT PRICE

       Backend calculates these values from Product
       when item is added/updated.
    ===================================================== */

    selectedSizeActualPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    selectedSizeSellingPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    selectedActualPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    selectedSellingPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    selectedShippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: true,
  }
);

/* =========================================================
   CART SCHEMA
========================================================= */

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Cart", cartSchema);