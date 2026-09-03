import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    /* =====================================================
       BASIC INFORMATION
    ===================================================== */

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    /* =====================================================
       NORMAL CATEGORY IMAGE
       Used for category / subcategory cards
    ===================================================== */

    image: {
      type: String,
      default: "",
      trim: true,
    },

    /* =====================================================
       DESKTOP HERO IMAGE
       Recommended: 1920 × 540
       Aspect ratio: 32:9
    ===================================================== */

    heroImage: {
      type: String,
      default: "",
      trim: true,
    },

    /* =====================================================
       MOBILE HERO IMAGE
       OPTIONAL
       Recommended mobile-specific banner.
       
       Frontend fallback:
       mobileHeroImage || heroImage
    ===================================================== */

    mobileHeroImage: {
      type: String,
      default: "",
      trim: true,
    },

    /* =====================================================
       CATEGORY HIERARCHY

       null      = Main Category
       ObjectId  = Subcategory
    ===================================================== */

    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    /* =====================================================
       HOME VISIBILITY
    ===================================================== */

    showInHome: {
      type: Boolean,
      default: false,
    },

    /* =====================================================
       WARDROBE VISIBILITY
    ===================================================== */

    showInWardrobe: {
      type: Boolean,
      default: false,
    },

    /* =====================================================
       FOOTER VISIBILITY
    ===================================================== */

    showInFooter: {
      type: Boolean,
      default: true,
    },

    /* =====================================================
       ACTIVE STATUS
    ===================================================== */

    isActive: {
      type: Boolean,
      default: true,
    },

    /* =====================================================
       SERIAL / DISPLAY ORDER
    ===================================================== */

    sortOrder: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================================================
   AUTO SLUG
========================================================= */

categorySchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(
        /[^a-z0-9\s-]/g,
        ""
      )
      .replace(
        /\s+/g,
        "-"
      )
      .replace(
        /-{2,}/g,
        "-"
      )
      .trim();
  }

  next();
});

/* =========================================================
   INDEXES
========================================================= */

categorySchema.index({
  isActive: 1,
});

categorySchema.index({
  showInHome: 1,
});

categorySchema.index({
  showInWardrobe: 1,
});

categorySchema.index({
  parent: 1,
});

categorySchema.index({
  parent: 1,
  sortOrder: 1,
});

/* =========================================================
   MODEL
========================================================= */

const Category =
  mongoose.model(
    "Category",
    categorySchema
  );

export default Category;