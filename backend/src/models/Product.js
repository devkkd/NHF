import mongoose from "mongoose";

/* =========================================================
   SPEC SCHEMA
========================================================= */

const specSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },

    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  }
);

/* =========================================================
   SIZE PRICE SCHEMA
========================================================= */

/*
 * Example:
 *
 * {
 *   name: "Queen",
 *   actualPrice: 3000,
 *   sellingPrice: 2400
 * }
 *
 * OR
 *
 * {
 *   name: "M",
 *   actualPrice: 1999,
 *   sellingPrice: 1499
 * }
 */

const sizePriceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    actualPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

/* =========================================================
   PRODUCT SCHEMA
========================================================= */

const productSchema = new mongoose.Schema(
  {
    /* ===================================================
       BASIC
    =================================================== */

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    sku: {
      type: String,
      trim: true,
      default: "",
      unique: true,
      sparse: true,
    },

    /* ===================================================
       OLD PRICE FIELD

       Kept for backward compatibility with
       existing products/data.

       New products should use:
       actualPrice + sellingPrice
    =================================================== */

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ===================================================
       PRODUCT LEVEL PRICE

       Used when product has NO size variations.
    =================================================== */

    actualPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ===================================================
       SHIPPING COST

       Product-level shipping charge.

       0 = Free Shipping
    =================================================== */

    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ===================================================
       CATEGORY

       Product belongs only to subcategory.
    =================================================== */

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    /* ===================================================
       IMAGES

       Same images for entire product.
       Size selection DOES NOT create/change images.
    =================================================== */

    mainImage: {
      type: String,
      default: "",
    },

    galleryImages: {
      type: [String],
      default: [],
    },

    /* ===================================================
       COLOURS

       EXISTING SYSTEM - KEEP AS IT IS.
    =================================================== */

    colors: {
      type: [String],
      default: [],
    },

    /* ===================================================
       SIZE PRICE VARIATIONS

       Example:

       [
         {
           name: "Queen",
           actualPrice: 3000,
           sellingPrice: 2400
         },
         {
           name: "King",
           actualPrice: 3500,
           sellingPrice: 2800
         }
       ]
    =================================================== */

    sizes: {
      type: [sizePriceSchema],
      default: [],
    },

    /* ===================================================
       PRODUCT INFORMATION
    =================================================== */

    item: {
      type: String,
      trim: true,
      default: "",
    },

    threadCount: {
      type: String,
      trim: true,
      default: "",
    },

    fabric: {
      type: String,
      trim: true,
      default: "",
    },

    material: {
      type: String,
      trim: true,
      default: "",
    },

    /*
     * OLD SINGLE SIZE FIELD
     *
     * Kept for backward compatibility.
     *
     * New UI should use `sizes`.
     */

    size: {
      type: String,
      trim: true,
      default: "",
    },

    gsm: {
      type: String,
      trim: true,
      default: "",
    },

    usageApplication: {
      type: String,
      trim: true,
      default: "",
    },

    bedSize: {
      type: String,
      trim: true,
      default: "",
    },

    washType: {
      type: String,
      trim: true,
      default: "",
    },

    packagingType: {
      type: String,
      trim: true,
      default: "",
    },

    type: {
      type: String,
      trim: true,
      default: "",
    },

    countryOfOrigin: {
      type: String,
      trim: true,
      default: "Made In India",
    },

    cotton: {
      type: String,
      trim: true,
      default: "",
    },

    handmade: {
      type: String,
      trim: true,
      default: "",
    },

    design: {
      type: String,
      trim: true,
      default: "",
    },

    /* ===================================================
       CONTENT
    =================================================== */

    description: {
      type: String,
      trim: true,
      default: "",
    },

    moreInformation: {
      type: String,
      trim: true,
      default: "",
    },

    features: {
      type: [String],
      default: [],
    },

    materials: {
      type: [String],
      default: [],
    },

    careInstructions: {
      type: [String],
      default: [],
    },

    specs: {
      type: [specSchema],
      default: [],
    },

    /* ===================================================
       STATUS
    =================================================== */

    isActive: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    showInNewArrivals: {
      type: Boolean,
      default: false,
    },

    isOnSale: {
      type: Boolean,
      default: false,
    },

    /* ===================================================
       SERIAL ORDER
    =================================================== */

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
   VALIDATE PRICE RELATIONSHIPS
========================================================= */

productSchema.pre(
  "validate",
  function (next) {
    /*
     * Product-level prices
     */

    const actual =
      Number(
        this.actualPrice || 0
      );

    const selling =
      Number(
        this.sellingPrice || 0
      );

    if (
      selling > actual &&
      actual > 0
    ) {
      return next(
        new Error(
          "Selling price cannot be greater than actual price."
        )
      );
    }

    /*
     * Size-level prices
     */

    if (
      Array.isArray(
        this.sizes
      )
    ) {
      const seen =
        new Set();

      for (
        const size of this.sizes
      ) {
        const name =
          String(
            size?.name || ""
          ).trim();

        if (!name) {
          return next(
            new Error(
              "Size name cannot be empty."
            )
          );
        }

        const key =
          name.toLowerCase();

        if (
          seen.has(key)
        ) {
          return next(
            new Error(
              `Duplicate size "${name}".`
            )
          );
        }

        seen.add(key);

        const sizeActual =
          Number(
            size.actualPrice ||
              0
          );

        const sizeSelling =
          Number(
            size.sellingPrice ||
              0
          );

        if (
          sizeSelling >
            sizeActual &&
          sizeActual > 0
        ) {
          return next(
            new Error(
              `Selling price cannot be greater than actual price for size "${name}".`
            )
          );
        }
      }
    }

    next();
  }
);

/* =========================================================
   AUTO SLUG
========================================================= */

productSchema.pre(
  "save",
  function (next) {
    if (
      this.isModified(
        "name"
      ) &&
      !this.slug
    ) {
      this.slug =
        this.name
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
  }
);

/* =========================================================
   INDEXES
========================================================= */

productSchema.index({
  isActive: 1,
});

productSchema.index({
  category: 1,
});

productSchema.index({
  category: 1,
  sortOrder: 1,
});

productSchema.index({
  isFeatured: 1,
});

productSchema.index({
  showInNewArrivals: 1,
});

productSchema.index({
  isOnSale: 1,
});

/* =========================================================
   MODEL
========================================================= */

const Product =
  mongoose.model(
    "Product",
    productSchema
  );

export default Product;