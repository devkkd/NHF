import XLSX from "xlsx";
import mongoose from "mongoose";
import crypto from "crypto";

import Product from "../models/Product.js";
import Category from "../models/Category.js";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../config/r2.js";

import {
  insertAtOrder,
  moveToOrder,
} from "../utils/reorder.js";

/* =========================================================
   HELPERS
========================================================= */

const normalizeString = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
};

const normalizeBoolean = (
  value,
  defaultValue = false
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalized =
    String(value)
      .trim()
      .toLowerCase();

  return [
    "true",
    "1",
    "yes",
    "y",
    "on",
  ].includes(normalized);
};

const normalizeNumber = (
  value,
  defaultValue = 0
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return defaultValue;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : defaultValue;
};

const parseArray = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) =>
        String(item).trim()
      )
      .filter(Boolean);
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const slugify = (value) => {
  return String(value)
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
    .replace(
      /^-+|-+$/g,
      "");
};

/* =========================================================
   IMAGE UPLOAD TO R2
========================================================= */

const uploadImageToR2 = async (
  file,
  sku,
  type = "gallery"
) => {
  const extension =
    file.originalname
      .split(".")
      .pop()
      ?.toLowerCase() ||
    "jpg";

  const safeSku =
    slugify(sku);

  const fileName =
    type === "main"
      ? `${safeSku}.${extension}`
      : `${safeSku}-${crypto.randomUUID()}.${extension}`;

  const key =
    `products/${safeSku}/${fileName}`;

  const command =
    new PutObjectCommand({
      Bucket:
        process.env.R2_BUCKET_NAME,

      Key: key,

      Body: file.buffer,

      ContentType:
        file.mimetype,

      ContentLength:
        file.size,
    });

  await r2.send(command);

  const publicUrl =
    `${process.env.R2_PUBLIC_URL}/${key}`;

  return {
    key,
    publicUrl,
  };
};

/* =========================================================
   IMAGE MATCHING

   Supported:

   NHF001.jpg
   NHF001.png
   NHF001.webp

   NHF001-1.jpg
   NHF001-2.jpg
   NHF001-3.jpg
========================================================= */

const getImageFilesForSku = (
  files,
  sku
) => {
  const normalizedSku =
    normalizeString(sku)
      .toLowerCase();

  const matched =
    files.filter((file) => {
      const fileName =
        file.originalname
          .replace(
            /\.[^/.]+$/,
            ""
          )
          .toLowerCase()
          .trim();

      return (
        fileName ===
          normalizedSku ||
        fileName.startsWith(
          `${normalizedSku}-`
        )
      );
    });

  return matched.sort(
    (a, b) => {
      const aBase =
        a.originalname
          .replace(
            /\.[^/.]+$/,
            ""
          )
          .toLowerCase()
          .trim();

      const bBase =
        b.originalname
          .replace(
            /\.[^/.]+$/,
            ""
          )
          .toLowerCase()
          .trim();

      if (
        aBase ===
        normalizedSku
      ) {
        return -1;
      }

      if (
        bBase ===
        normalizedSku
      ) {
        return 1;
      }

      const aMatch =
        aBase.match(
          new RegExp(
            `^${normalizedSku}-(\\d+)$`
          )
        );

      const bMatch =
        bBase.match(
          new RegExp(
            `^${normalizedSku}-(\\d+)$`
          )
        );

      if (
        aMatch &&
        bMatch
      ) {
        return (
          Number(
            aMatch[1]
          ) -
          Number(
            bMatch[1]
          )
        );
      }

      if (aMatch) {
        return -1;
      }

      if (bMatch) {
        return 1;
      }

      return aBase.localeCompare(
        bBase
      );
    }
  );
};

/* =========================================================
   CATEGORY / SUBCATEGORY RESOLVER
========================================================= */

/**
 * Product hierarchy:
 *
 * Main Category
 *     ↓
 * Subcategory
 *     ↓
 * Product
 *
 * IMPORTANT:
 * Product.category stores the
 * SUBCATEGORY _id.
 */

/* =========================================================
   FIND MAIN CATEGORY
========================================================= */

/**
 * Accepted:
 *
 * - MongoDB ObjectId
 * - exact name
 * - slug
 *
 * Main category must have:
 * parent = null
 */
const findMainCategory =
  async (
    categoryValue
  ) => {
    const value =
      normalizeString(
        categoryValue
      );

    if (!value) {
      return null;
    }

    let category = null;

    /* -----------------------------------------------------
       ObjectId lookup
    ----------------------------------------------------- */

    if (
      mongoose.Types.ObjectId.isValid(
        value
      )
    ) {
      category =
        await Category.findOne({
          _id: value,

          isActive: true,

          parent: null,
        });
    }

    /* -----------------------------------------------------
       Name / slug lookup
    ----------------------------------------------------- */

    if (!category) {
      const slug =
        slugify(value);

      category =
        await Category.findOne({
          isActive: true,

          parent: null,

          $or: [
            {
              name: {
                $regex:
                  `^${value}$`,

                $options: "i",
              },
            },

            {
              slug,
            },
          ],
        });
    }

    return category;
  };

/* =========================================================
   FIND SUBCATEGORY
========================================================= */

/**
 * Accepted:
 *
 * - MongoDB ObjectId
 * - exact name
 * - slug
 *
 * Main categories are rejected.
 */
const findSubcategory =
  async (
    categoryValue
  ) => {
    const value =
      normalizeString(
        categoryValue
      );

    if (!value) {
      return null;
    }

    let category = null;

    /* -----------------------------------------------------
       ObjectId lookup
    ----------------------------------------------------- */

    if (
      mongoose.Types.ObjectId.isValid(
        value
      )
    ) {
      category =
        await Category.findOne({
          _id: value,

          isActive: true,
        });
    }

    /* -----------------------------------------------------
       Name / slug lookup
    ----------------------------------------------------- */

    if (!category) {
      const slug =
        slugify(value);

      category =
        await Category.findOne({
          isActive: true,

          $or: [
            {
              name: {
                $regex:
                  `^${value}$`,

                $options: "i",
              },
            },

            {
              slug,
            },
          ],
        });
    }

    /*
      A subcategory MUST have a parent.
    */

    if (
      !category ||
      !category.parent
    ) {
      return null;
    }

    return category;
  };

/* =========================================================
   RESOLVE PRODUCT CATEGORY
========================================================= */

const resolveProductCategory =
  async (
    mainCategoryValue,
    subcategoryValue
  ) => {
    /* -----------------------------------------------------
       MAIN CATEGORY REQUIRED
    ----------------------------------------------------- */

    if (
      !normalizeString(
        mainCategoryValue
      )
    ) {
      throw new Error(
        "Main Category is required"
      );
    }

    /* -----------------------------------------------------
       SUBCATEGORY REQUIRED
    ----------------------------------------------------- */

    if (
      !normalizeString(
        subcategoryValue
      )
    ) {
      throw new Error(
        "Subcategory is required"
      );
    }

    /* -----------------------------------------------------
       FIND MAIN CATEGORY
    ----------------------------------------------------- */

    const mainCategory =
      await findMainCategory(
        mainCategoryValue
      );

    if (!mainCategory) {
      throw new Error(
        `Main Category not found: ${mainCategoryValue}`
      );
    }

    /* -----------------------------------------------------
       FIND SUBCATEGORY
    ----------------------------------------------------- */

    const subcategory =
      await findSubcategory(
        subcategoryValue
      );

    if (!subcategory) {
      throw new Error(
        `Subcategory not found: ${subcategoryValue}`
      );
    }

    /* -----------------------------------------------------
       VERIFY RELATION
    ----------------------------------------------------- */

    if (
      String(
        subcategory.parent
      ) !==
      String(
        mainCategory._id
      )
    ) {
      throw new Error(
        `Subcategory "${subcategory.name}" does not belong to Main Category "${mainCategory.name}"`
      );
    }

    return {
      mainCategory,
      subcategory,
    };
  };

/* =========================================================
   SPECS
========================================================= */

const buildSpecs = (
  row
) => {
  const specs = [];

  for (
    let i = 1;
    i <= 10;
    i++
  ) {
    const label =
      normalizeString(
        row[
          `spec_${i}_label`
        ]
      );

    const value =
      normalizeString(
        row[
          `spec_${i}_value`
        ]
      );

    if (
      label &&
      value
    ) {
      specs.push({
        label,
        value,
      });
    }
  }

  return specs;
};

/* =========================================================
   SIZE VARIANTS
========================================================= */

/**
 * Supports 20 sizes.
 *
 * Example:
 *
 * size_1
 * size_1_actualPrice
 * size_1_sellingPrice
 *
 * size_2
 * size_2_actualPrice
 * size_2_sellingPrice
 *
 * ...
 *
 * size_20
 * size_20_actualPrice
 * size_20_sellingPrice
 */
const buildSizes = (
  row
) => {
  const sizes = [];

  const seenNames =
    new Set();

  for (
    let i = 1;
    i <= 20;
    i++
  ) {
    const name =
      normalizeString(
        row[
          `size_${i}`
        ]
      );

    const actualRaw =
      normalizeString(
        row[
          `size_${i}_actualPrice`
        ]
      );

    const sellingRaw =
      normalizeString(
        row[
          `size_${i}_sellingPrice`
        ]
      );

    /* -----------------------------------------------------
       EMPTY SLOT
    ----------------------------------------------------- */

    if (
      !name &&
      !actualRaw &&
      !sellingRaw
    ) {
      continue;
    }

    /* -----------------------------------------------------
       SIZE NAME REQUIRED
    ----------------------------------------------------- */

    if (!name) {
      throw new Error(
        `size_${i} is required when size pricing is provided`
      );
    }

    const normalizedName =
      name.toLowerCase();

    /* -----------------------------------------------------
       DUPLICATE SIZE CHECK
    ----------------------------------------------------- */

    if (
      seenNames.has(
        normalizedName
      )
    ) {
      throw new Error(
        `Duplicate size found: ${name}`
      );
    }

    seenNames.add(
      normalizedName
    );

    /* -----------------------------------------------------
       SIZE PRICES
    ----------------------------------------------------- */

    const actualPrice =
      normalizeNumber(
        actualRaw
      );

    const sellingPrice =
      normalizeNumber(
        sellingRaw
      );

    if (
      actualPrice < 0 ||
      sellingPrice < 0
    ) {
      throw new Error(
        `Size ${name}: prices cannot be negative`
      );
    }

    if (
      actualPrice > 0 &&
      sellingPrice >
        actualPrice
    ) {
      throw new Error(
        `Size ${name}: sellingPrice cannot be greater than actualPrice`
      );
    }

    sizes.push({
      name,

      actualPrice,

      sellingPrice,
    });
  }

  return sizes;
};

/* =========================================================
   PRODUCT DATA BUILDER
========================================================= */

const buildProductData =
  async (
    row
  ) => {
    /* -----------------------------------------------------
       BASIC DATA
    ----------------------------------------------------- */

    const name =
      normalizeString(
        row.name
      );

    const sku =
      normalizeString(
        row.sku
      );

    if (!name) {
      throw new Error(
        "Name required"
      );
    }

    if (!sku) {
      throw new Error(
        "SKU required"
      );
    }

    /* -----------------------------------------------------
       CATEGORY HIERARCHY
    ----------------------------------------------------- */

    const mainCategoryValue =
      normalizeString(
        row.mainCategory
      );

    const subcategoryValue =
      normalizeString(
        row.subcategory
      );

    const {
      mainCategory,
      subcategory,
    } =
      await resolveProductCategory(
        mainCategoryValue,
        subcategoryValue
      );

    /* -----------------------------------------------------
       PRODUCT LEVEL PRICES
    ----------------------------------------------------- */

    const actualPrice =
      normalizeNumber(
        row.actualPrice
      );

    const sellingPrice =
      normalizeNumber(
        row.sellingPrice
      );

    const shippingCost =
      normalizeNumber(
        row.shippingCost
      );

    if (
      actualPrice < 0
    ) {
      throw new Error(
        "actualPrice cannot be negative"
      );
    }

    if (
      sellingPrice < 0
    ) {
      throw new Error(
        "sellingPrice cannot be negative"
      );
    }

    if (
      shippingCost < 0
    ) {
      throw new Error(
        "shippingCost cannot be negative"
      );
    }

    if (
      actualPrice > 0 &&
      sellingPrice >
        actualPrice
    ) {
      throw new Error(
        "sellingPrice cannot be greater than actualPrice"
      );
    }

    /* -----------------------------------------------------
       SIZE VARIANTS
    ----------------------------------------------------- */

    const sizes =
      buildSizes(row);

    /* -----------------------------------------------------
       LEGACY PRICE
    ----------------------------------------------------- */

    const legacyPrice =
      sizes.length > 0
        ? sizes[0]
            .sellingPrice
        : sellingPrice;

    /* -----------------------------------------------------
       LEGACY SIZE
    ----------------------------------------------------- */

    const legacySize =
      sizes.length > 0
        ? sizes
            .map(
              (item) =>
                item.name
            )
            .join(", ")
        : normalizeString(
            row.size
          );

    /* -----------------------------------------------------
       PRODUCT DATA
    ----------------------------------------------------- */

    const productData = {
      name,

      slug:
        normalizeString(
          row.slug
        ) ||
        slugify(name),

      sku,

      /*
        Legacy price.
      */
      price:
        legacyPrice,

      /*
        Current product-level pricing.
      */
      actualPrice,

      sellingPrice,

      shippingCost,

      /*
        IMPORTANT:
        Store SUBCATEGORY ID
        inside Product.category.
      */
      category:
        subcategory._id,

      /*
        Main image gets replaced
        later if local SKU image
        is uploaded.
      */
      mainImage:
        normalizeString(
          row.mainImage
        ),

      galleryImages:
        parseArray(
          row.galleryImages
        ),

      colors:
        parseArray(
          row.colors
        ),

      /*
        Size variants.
      */
      sizes,

      /*
        Legacy general size.
      */
      size:
        legacySize,

      item:
        normalizeString(
          row.item
        ),

      threadCount:
        normalizeString(
          row.threadCount
        ),

      fabric:
        normalizeString(
          row.fabric
        ),

      material:
        normalizeString(
          row.material
        ),

      gsm:
        normalizeString(
          row.gsm
        ),

      usageApplication:
        normalizeString(
          row.usageApplication
        ),

      bedSize:
        normalizeString(
          row.bedSize
        ),

      washType:
        normalizeString(
          row.washType
        ),

      packagingType:
        normalizeString(
          row.packagingType
        ),

      type:
        normalizeString(
          row.type
        ),

      countryOfOrigin:
        normalizeString(
          row.countryOfOrigin
        ) ||
        "Made In India",

      cotton:
        normalizeString(
          row.cotton
        ),

      handmade:
        normalizeString(
          row.handmade
        ),

      design:
        normalizeString(
          row.design
        ),

      description:
        normalizeString(
          row.description
        ),

      moreInformation:
        normalizeString(
          row.moreInformation
        ),

      features:
        parseArray(
          row.features
        ),

      materials:
        parseArray(
          row.materials
        ),

      careInstructions:
        parseArray(
          row.careInstructions
        ),

      specs:
        buildSpecs(row),

      isActive:
        normalizeBoolean(
          row.isActive,
          true
        ),

      isFeatured:
        normalizeBoolean(
          row.isFeatured,
          false
        ),

      showInNewArrivals:
        normalizeBoolean(
          row.showInNewArrivals,
          false
        ),
        isOnSale: normalizeBoolean(
  row.isOnSale,
  false
),
    };

    /* -----------------------------------------------------
       SORT ORDER
    ----------------------------------------------------- */

    const rawSortOrder =
      normalizeString(
        row.sortOrder
      );

    /*
      IMPORTANT:
      Only set sortOrder when
      Excel actually provides it.
    */

    if (
      rawSortOrder !== ""
    ) {
      const parsedOrder =
        Number(
          rawSortOrder
        );

      if (
        !Number.isInteger(
          parsedOrder
        ) ||
        parsedOrder < 1
      ) {
        throw new Error(
          "sortOrder must be a positive integer"
        );
      }

      productData.sortOrder =
        parsedOrder;
    }

    return {
      productData,

      mainCategory,

      subcategory,
    };
  };

/* =========================================================
   TEMPLATE HEADERS
========================================================= */

const TEMPLATE_HEADERS = [
  "name",
  "slug",
  "sku",

  /* -------------------------------------------------------
     PRODUCT PRICING
  ------------------------------------------------------- */

  "actualPrice",
  "sellingPrice",
  "shippingCost",

  /*
    Legacy price.
  */
  "price",

  /* -------------------------------------------------------
     CATEGORY HIERARCHY
  ------------------------------------------------------- */

  "mainCategory",
  "subcategory",

  "colors",

  /* -------------------------------------------------------
     SIZE VARIANTS
  ------------------------------------------------------- */

  ...Array.from(
    {
      length: 20,
    },
    (
      _,
      index
    ) => {
      const number =
        index + 1;

      return [
        `size_${number}`,
        `size_${number}_actualPrice`,
        `size_${number}_sellingPrice`,
      ];
    }
  ).flat(),

  /*
    Legacy/general size.
  */
  "size",

  /* -------------------------------------------------------
     PRODUCT INFORMATION
  ------------------------------------------------------- */

  "item",
  "threadCount",
  "fabric",
  "material",
  "gsm",
  "usageApplication",
  "bedSize",
  "washType",
  "packagingType",
  "type",
  "countryOfOrigin",
  "cotton",
  "handmade",
  "design",

  "description",
  "moreInformation",

  "features",
  "materials",
  "careInstructions",

  /* -------------------------------------------------------
     SPECS
  ------------------------------------------------------- */

  ...Array.from(
    {
      length: 10,
    },
    (
      _,
      index
    ) => {
      const number =
        index + 1;

      return [
        `spec_${number}_label`,
        `spec_${number}_value`,
      ];
    }
  ).flat(),

  /* -------------------------------------------------------
     STATUS / ORDER / IMAGES
  ------------------------------------------------------- */

  "isActive",
  "isFeatured",
  "showInNewArrivals",
  "isOnSale",
  "sortOrder",
  "mainImage",
  "galleryImages",
];

/* =========================================================
   DOWNLOAD BULK PRODUCT TEMPLATE
========================================================= */

export const
  downloadBulkProductTemplate =
  async (
    req,
    res,
    next
  ) => {
    try {
      /* -----------------------------------------------------
         SAMPLE ROW
      ----------------------------------------------------- */

      const exampleRow = {
        name:
          "Cotton Handblock Bedsheet",

        slug:
          "cotton-handblock-bedsheet",

        sku:
          "NHF001",

        /* -------------------------------------------------
           PRODUCT PRICING
        ------------------------------------------------- */

        actualPrice:
          2999,

        sellingPrice:
          2499,

        shippingCost:
          99,

        /*
          Legacy.
        */
        price:
          2499,

        /* -------------------------------------------------
           CATEGORY HIERARCHY
        ------------------------------------------------- */

        mainCategory:
          "Bedroom",

        subcategory:
          "Cotton Bedsheets",

        colors:
          "Blue, White",

        /* -------------------------------------------------
           SIZE 1
        ------------------------------------------------- */

        size_1:
          "Single",

        size_1_actualPrice:
          2299,

        size_1_sellingPrice:
          1999,

        /* -------------------------------------------------
           SIZE 2
        ------------------------------------------------- */

        size_2:
          "Double",

        size_2_actualPrice:
          2699,

        size_2_sellingPrice:
          2249,

        /* -------------------------------------------------
           SIZE 3
        ------------------------------------------------- */

        size_3:
          "King",

        size_3_actualPrice:
          2999,

        size_3_sellingPrice:
          2499,

        /* -------------------------------------------------
           SIZE 4
        ------------------------------------------------- */

        size_4:
          "",

        size_4_actualPrice:
          "",

        size_4_sellingPrice:
          "",

        /* -------------------------------------------------
           SIZE 5
        ------------------------------------------------- */

        size_5:
          "",

        size_5_actualPrice:
          "",

        size_5_sellingPrice:
          "",

        /* -------------------------------------------------
           SIZE 6
        ------------------------------------------------- */

        size_6:
          "",

        size_6_actualPrice:
          "",

        size_6_sellingPrice:
          "",

        /* -------------------------------------------------
           SIZE 7
        ------------------------------------------------- */

        size_7:
          "",

        size_7_actualPrice:
          "",

        size_7_sellingPrice:
          "",

        /* -------------------------------------------------
           SIZE 8
        ------------------------------------------------- */

        size_8:
          "",

        size_8_actualPrice:
          "",

        size_8_sellingPrice:
          "",

        /* -------------------------------------------------
           SIZE 9
        ------------------------------------------------- */

        size_9:
          "",

        size_9_actualPrice:
          "",

        size_9_sellingPrice:
          "",

        /* -------------------------------------------------
           SIZE 10
        ------------------------------------------------- */

        size_10:
          "",

        size_10_actualPrice:
          "",

        size_10_sellingPrice:
          "",

        /* -------------------------------------------------
           SIZE 11
        ------------------------------------------------- */

        size_11:
          "",

        size_11_actualPrice:
          "",

        size_11_sellingPrice:
          "",

        /* -------------------------------------------------
           SIZE 12
        ------------------------------------------------- */

        size_12:
          "",

        size_12_actualPrice:
          "",

        size_12_sellingPrice:
          "",

        /* -------------------------------------------------
           SIZE 13
        ------------------------------------------------- */

        size_13:
          "",

        size_13_actualPrice:
          "",

        size_13_sellingPrice:
          "",

        /* -------------------------------------------------
           SIZE 14
        ------------------------------------------------- */

        size_14:
          "",

        size_14_actualPrice:
          "",

        size_14_sellingPrice:
          "",

        /* -------------------------------------------------
           SIZE 15
        ------------------------------------------------- */

        size_15:
          "",

        size_15_actualPrice:
          "",

        size_15_sellingPrice:
          "",

        /* -------------------------------------------------
           SIZE 16
        ------------------------------------------------- */

        size_16:
          "",

        size_16_actualPrice:
          "",

        size_16_sellingPrice:
          "",

        /* -------------------------------------------------
           SIZE 17
        ------------------------------------------------- */

        size_17:
          "",

        size_17_actualPrice:
          "",

        size_17_sellingPrice:
          "",

        /* -------------------------------------------------
           SIZE 18
        ------------------------------------------------- */

        size_18:
          "",

        size_18_actualPrice:
          "",

        size_18_sellingPrice:
          "",

        /* -------------------------------------------------
           SIZE 19
        ------------------------------------------------- */

        size_19:
          "",

        size_19_actualPrice:
          "",

        size_19_sellingPrice:
          "",

        /* -------------------------------------------------
           SIZE 20
        ------------------------------------------------- */

        size_20:
          "",

        size_20_actualPrice:
          "",

        size_20_sellingPrice:
          "",

        /* -------------------------------------------------
           LEGACY SIZE
        ------------------------------------------------- */

        size:
          "",

        /* -------------------------------------------------
           PRODUCT INFORMATION
        ------------------------------------------------- */

        item:
          "Bedsheet",

        threadCount:
          "144",

        fabric:
          "Cotton",

        material:
          "100% Cotton",

        gsm:
          "120",

        usageApplication:
          "Bedroom",

        bedSize:
          "King",

        washType:
          "Machine Wash",

        packagingType:
          "Box",

        type:
          "Handblock",

        countryOfOrigin:
          "Made In India",

        cotton:
          "Yes",

        handmade:
          "Yes",

        design:
          "Floral",

        description:
          "Handblock printed cotton bedsheet",

        moreInformation:
          "Traditional handcrafted design",

        features:
          "Soft, Breathable, Handcrafted",

        materials:
          "Cotton",

        careInstructions:
          "Machine wash cold",

        /* -------------------------------------------------
           SPECS
        ------------------------------------------------- */

        spec_1_label:
          "Dimensions",

        spec_1_value:
          "108 x 108 inch",

        spec_2_label:
          "Weight",

        spec_2_value:
          "1.2 kg",

        spec_3_label:
          "Pattern",

        spec_3_value:
          "Floral",

        spec_4_label:
          "",

        spec_4_value:
          "",

        spec_5_label:
          "",

        spec_5_value:
          "",

        spec_6_label:
          "",

        spec_6_value:
          "",

        spec_7_label:
          "",

        spec_7_value:
          "",

        spec_8_label:
          "",

        spec_8_value:
          "",

        spec_9_label:
          "",

        spec_9_value:
          "",

        spec_10_label:
          "",

        spec_10_value:
          "",

        /* -------------------------------------------------
           STATUS / ORDER
        ------------------------------------------------- */

        isActive:
          true,

        isFeatured:
          false,

        showInNewArrivals:
          true,
          isOnSale: true,

        sortOrder:
          1,

        /* -------------------------------------------------
           IMAGE URL FALLBACK
        ------------------------------------------------- */

        mainImage:
          "",

        galleryImages:
          "",
      };

      /* -----------------------------------------------------
         PRODUCTS WORKSHEET
      ----------------------------------------------------- */

      const worksheet =
        XLSX.utils.json_to_sheet(
          [exampleRow],
          {
            header:
              TEMPLATE_HEADERS,
          }
        );

      /* -----------------------------------------------------
         INSTRUCTIONS
      ----------------------------------------------------- */

      const instructions = [
        [
          "NHF BULK PRODUCT UPLOAD - INSTRUCTIONS",
        ],

        [],

        [
          "1. Fill the Products sheet.",
        ],

        [
          "2. SKU must be unique.",
        ],

        [
          "3. mainCategory must contain the Main Category name, slug, or MongoDB ID.",
        ],

        [
          "4. subcategory must contain the Subcategory name, slug, or MongoDB ID.",
        ],

        [
          "5. The selected subcategory MUST belong to the selected mainCategory.",
        ],

        [
          "6. Product is stored under the Subcategory, not directly under the Main Category.",
        ],

        [
          "7. actualPrice, sellingPrice and shippingCost are product-level prices.",
        ],

        [
          "8. sellingPrice cannot be greater than actualPrice when actualPrice is greater than 0.",
        ],

        [
          "9. Add size variants using size_1 to size_20.",
        ],

        [
          "10. Every size can have its own actualPrice and sellingPrice.",
        ],

        [
          "11. Leave the entire size slot blank if that size is not required.",
        ],

        [
          "12. A size name is required when size pricing is provided.",
        ],

        [
          "13. Duplicate size names are not allowed.",
        ],

        [
          "14. colors, features, materials and careInstructions can be comma separated.",
        ],

        [
         "15. isActive, isFeatured, showInNewArrivals and isOnSale should be true or false.",
        ],

        [
          "16. sortOrder is the Product Serial Number inside its Subcategory and starts from 1.",
        ],

        [
          "17. Existing SKU + blank sortOrder preserves its current position if category does not change.",
        ],

        [
          "18. Existing SKU + category change + blank sortOrder moves the product to the end of the new Subcategory.",
        ],

        [
          "19. Existing SKU + supplied sortOrder moves the product to the requested position.",
        ],

        [
          "20. Product images are optional.",
        ],

        [
          "21. Exact SKU filename becomes the Main Image, for example NHF001.jpg.",
        ],

        [
          "22. Gallery examples: NHF001-1.jpg, NHF001-2.jpg, NHF001-3.jpg.",
        ],

        [
          "23. Supported images: JPG, JPEG, PNG, WEBP.",
        ],

        [
          "24. Existing SKU products will be UPDATED.",
        ],

        [
          "25. New SKU products will be CREATED.",
        ],

        [
          "26. Leave mainImage and galleryImages blank when using local SKU image uploads.",
        ],

        [
          "27. Legacy price and size columns are retained for compatibility. Prefer actualPrice/sellingPrice and size_* columns.",
        ],
      ];

      const instructionSheet =
        XLSX.utils.aoa_to_sheet(
          instructions
        );

      /* -----------------------------------------------------
         COLUMN WIDTHS
      ----------------------------------------------------- */

      worksheet["!cols"] =
        TEMPLATE_HEADERS.map(
          (header) => ({
            wch:
              Math.max(
                header.length + 2,
                18
              ),
          })
        );

      instructionSheet[
        "!cols"
      ] = [
        {
          wch: 120,
        },
      ];

      /* -----------------------------------------------------
         WORKBOOK
      ----------------------------------------------------- */

      const workbook =
        XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Products"
      );

      XLSX.utils.book_append_sheet(
        workbook,
        instructionSheet,
        "Instructions"
      );

      /* -----------------------------------------------------
         CREATE BUFFER
      ----------------------------------------------------- */

      const buffer =
        XLSX.write(
          workbook,
          {
            type: "buffer",
            bookType: "xlsx",
          }
        );

      /* -----------------------------------------------------
         RESPONSE
      ----------------------------------------------------- */

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="NHF-Bulk-Product-Template.xlsx"'
      );

      return res.send(
        buffer
      );
    } catch (error) {
      next(error);
    }
  };

/* =========================================================
   MAIN BULK PRODUCT UPLOAD
========================================================= */

export const
  bulkUploadProducts =
  async (
    req,
    res,
    next
  ) => {
    try {
      /* -----------------------------------------------------
         EXCEL REQUIRED
      ----------------------------------------------------- */

      const excelFile =
        req.files?.excel?.[0];

      if (!excelFile) {
        return res
          .status(400)
          .json({
            ok: false,

            error:
              "Excel file is required.",
          });
      }

      /* -----------------------------------------------------
         IMAGES OPTIONAL
      ----------------------------------------------------- */

      const imageFiles =
        req.files?.images ||
        [];

      /* -----------------------------------------------------
         TOTAL UPLOAD SIZE
      ----------------------------------------------------- */

      const totalUploadSize =
        excelFile.size +
        imageFiles.reduce(
          (
            total,
            file
          ) =>
            total +
            file.size,
          0
        );

      const MAX_COMBINED_SIZE =
        500 *
        1024 *
        1024;

      if (
        totalUploadSize >
        MAX_COMBINED_SIZE
      ) {
        return res
          .status(413)
          .json({
            ok: false,

            error:
              "Total Excel + image upload size cannot exceed 500 MB.",
          });
      }

      /* -----------------------------------------------------
         READ EXCEL
      ----------------------------------------------------- */

      const workbook =
        XLSX.read(
          excelFile.buffer,
          {
            type: "buffer",
          }
        );

      const sheetName =
        workbook
          .SheetNames[0];

      if (!sheetName) {
        return res
          .status(400)
          .json({
            ok: false,

            error:
              "Excel sheet not found.",
          });
      }

      const worksheet =
        workbook.Sheets[
          sheetName
        ];

      const rows =
        XLSX.utils.sheet_to_json(
          worksheet,
          {
            defval: "",
            raw: false,
          }
        );

      if (!rows.length) {
        return res
          .status(400)
          .json({
            ok: false,

            error:
              "Excel contains no products.",
          });
      }

      /* -----------------------------------------------------
         RESULT
      ----------------------------------------------------- */

      const result = {
        total:
          rows.length,

        created:
          0,

        updated:
          0,

        failed:
          0,

        errors:
          [],

        products:
          [],
      };

      /* -----------------------------------------------------
         PROCESS EACH ROW
      ----------------------------------------------------- */

      for (
        let index = 0;
        index <
        rows.length;
        index++
      ) {
        const row =
          rows[index];

        /*
          Excel:
          Row 1 = header
          Row 2 = first product
        */
        const excelRow =
          index + 2;

        try {
          /* -----------------------------------------------
             BUILD PRODUCT DATA
          ----------------------------------------------- */

          const {
            productData,
            mainCategory,
            subcategory,
          } =
            await buildProductData(
              row
            );

          const sku =
            productData.sku;

          /* -----------------------------------------------
             FIND SKU IMAGES
          ----------------------------------------------- */

          const matchedImages =
            getImageFilesForSku(
              imageFiles,
              sku
            );

          let mainImage =
            "";

          const galleryImages =
            [];

          /* -----------------------------------------------
             UPLOAD MATCHED IMAGES
          ----------------------------------------------- */

          for (
            let imageIndex = 0;
            imageIndex <
            matchedImages.length;
            imageIndex++
          ) {
            const file =
              matchedImages[
                imageIndex
              ];

            const uploaded =
              await uploadImageToR2(
                file,

                sku,

                imageIndex ===
                0
                  ? "main"
                  : "gallery"
              );

            if (
              imageIndex ===
              0
            ) {
              mainImage =
                uploaded.publicUrl;
            } else {
              galleryImages.push(
                uploaded.publicUrl
              );
            }
          }

          /* -----------------------------------------------
             FALLBACK MAIN IMAGE
          ----------------------------------------------- */

          if (
            !mainImage &&
            row.mainImage
          ) {
            mainImage =
              normalizeString(
                row.mainImage
              );
          }

          /* -----------------------------------------------
             FALLBACK GALLERY
          ----------------------------------------------- */

          if (
            galleryImages.length ===
              0 &&
            row.galleryImages
          ) {
            galleryImages.push(
              ...parseArray(
                row.galleryImages
              )
            );
          }

          productData.mainImage =
            mainImage;

          productData.galleryImages =
            galleryImages;

          /* -----------------------------------------------
             FIND EXISTING SKU
          ----------------------------------------------- */

          const existingProduct =
            await Product.findOne({
              sku,
            });

          let product;

          /* =================================================
             CREATE NEW PRODUCT
          ================================================= */

          if (
            !existingProduct
          ) {
            const position =
              await insertAtOrder({
                Model:
                  Product,

                scope: {
                  category:
                    subcategory._id,

                  isActive:
                    true,
                },

                requestedOrder:
                  productData.sortOrder,
              });

            productData.sortOrder =
              position;

            product =
              await Product.create(
                productData
              );

            result.created++;
          }

          /* =================================================
             UPDATE EXISTING PRODUCT
          ================================================= */

          else {
            const oldCategory =
              existingProduct.category;

            const oldScope = {
              category:
                oldCategory,

              isActive:
                true,
            };

            const newScope = {
              category:
                subcategory._id,

              isActive:
                true,
            };

            const categoryChanged =
              String(
                oldCategory ||
                  ""
              ) !==
              String(
                subcategory._id
              );

            const sortOrderProvided =
              Object.prototype.hasOwnProperty.call(
                productData,
                "sortOrder"
              );

            let requestedOrder;

            /* ---------------------------------------------
               SORT ORDER PROVIDED
            --------------------------------------------- */

            if (
              sortOrderProvided
            ) {
              requestedOrder =
                productData.sortOrder;
            }

            /* ---------------------------------------------
               CATEGORY CHANGED
               WITHOUT SORT ORDER
            --------------------------------------------- */

            else if (
              categoryChanged
            ) {
              requestedOrder =
                null;
            }

            /* ---------------------------------------------
               SAME CATEGORY
               WITHOUT SORT ORDER
            --------------------------------------------- */

            else {
              requestedOrder =
                existingProduct.sortOrder;
            }

            /* ---------------------------------------------
               REORDER
            --------------------------------------------- */

            const finalOrder =
              await moveToOrder({
                Model:
                  Product,

                id:
                  existingProduct._id,

                oldScope,

                newScope,

                oldOrder:
                  existingProduct.sortOrder,

                requestedOrder,
              });

            productData.sortOrder =
              finalOrder;

            /* ---------------------------------------------
               UPDATE PRODUCT
            --------------------------------------------- */

            product =
              await Product.findByIdAndUpdate(
                existingProduct._id,

                {
                  $set:
                    productData,
                },

                {
                  new: true,

                  runValidators:
                    true,
                }
              );

            result.updated++;
          }

          /* -----------------------------------------------
             SUCCESS RESULT
          ----------------------------------------------- */

          result.products.push({
            row:
              excelRow,

            sku,

            name:
              product.name,

            mainCategory:
              mainCategory.name,

            subcategory:
              subcategory.name,

            action:
              existingProduct
                ? "updated"
                : "created",

            sortOrder:
              product.sortOrder,
          });
        } catch (error) {
          /* -----------------------------------------------
             FAILED ROW
          ----------------------------------------------- */

          result.failed++;

          result.errors.push({
            row:
              excelRow,

            sku:
              normalizeString(
                row.sku
              ) ||
              null,

            name:
              normalizeString(
                row.name
              ) ||
              null,

            mainCategory:
              normalizeString(
                row.mainCategory
              ) ||
              null,

            subcategory:
              normalizeString(
                row.subcategory
              ) ||
              null,

            error:
              error.message ||
              "Upload failed",
          });
        }
      }

      /* -----------------------------------------------------
         FINAL RESPONSE
      ----------------------------------------------------- */

      return res
        .status(200)
        .json({
          ok: true,

          message:
            "Bulk product upload completed.",

          data:
            result,
        });
    } catch (error) {
      next(error);
    }
  };