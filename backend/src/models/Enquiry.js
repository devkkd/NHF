import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["bulk", "product"],
      default: "bulk",
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    mobile: {
      type: String,
      trim: true,
      default: "",
    },

    companyName: {
      type: String,
      trim: true,
      default: "",
    },

    country: {
      type: String,
      trim: true,
      default: "",
    },

    businessTypes: [
      {
        type: String,
      },
    ],

    productCategory: {
      type: String,
      default: "",
    },

    productSubCategory: {
      type: String,
      default: "",
    },

    message: {
      type: String,
      default: "",
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    },

    productSnapshot: {
      name: String,
      slug: String,
      sku: String,
      image: String,
    },

    status: {
      type: String,
      enum: ["new", "contacted", "closed"],
      default: "new",
    },

    adminNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Enquiry", enquirySchema);