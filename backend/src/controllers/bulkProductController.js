import XLSX from "xlsx";
import mongoose from "mongoose";
import crypto from "crypto";

import Product from "../models/Product.js";
import Category from "../models/Category.js";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "../config/r2.js";

/* =========================================================
   HELPERS
========================================================= */

const normalizeString = (value) => {
  if (value === undefined || value === null) {
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

  const normalized = String(value)
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
      .map((item) => String(item).trim())
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
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
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
      ?.toLowerCase() || "jpg";

  const safeSku = slugify(sku);

  const fileName =
    type === "main"
      ? `${safeSku}.${extension}`
      : `${safeSku}-${crypto.randomUUID()}.${extension}`;

  const key = `products/${safeSku}/${fileName}`;

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,

    Key: key,

    Body: file.buffer,

    ContentType: file.mimetype,

    ContentLength: file.size,
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
========================================================= */

const getImageFilesForSku = (
  files,
  sku
) => {
  const normalizedSku =
    normalizeString(sku).toLowerCase();

  const matched = files.filter((file) => {
    const fileName =
      file.originalname
        .replace(/\.[^/.]+$/, "")
        .toLowerCase()
        .trim();

    return (
      fileName === normalizedSku ||
      fileName.startsWith(
        `${normalizedSku}-`
      )
    );
  });

  return matched.sort((a, b) => {
    const aBase =
      a.originalname
        .replace(/\.[^/.]+$/, "")
        .toLowerCase()
        .trim();

    const bBase =
      b.originalname
        .replace(/\.[^/.]+$/, "")
        .toLowerCase()
        .trim();

    /*
      Exact SKU always becomes main image.
    */

    if (aBase === normalizedSku) {
      return -1;
    }

    if (bBase === normalizedSku) {
      return 1;
    }

    /*
      SKU-1
      SKU-2
      SKU-3
      ...
    */

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

    if (aMatch && bMatch) {
      return (
        Number(aMatch[1]) -
        Number(bMatch[1])
      );
    }

    if (aMatch) {
      return -1;
    }

    if (bMatch) {
      return 1;
    }

    return aBase.localeCompare(bBase);
  });
};

/* =========================================================
   CATEGORY RESOLVER
========================================================= */

const findCategory = async (
  categoryValue
) => {
  const value =
    normalizeString(categoryValue);

  if (!value) {
    return null;
  }

  /*
    If Excel contains Mongo ObjectId
  */

  if (
    mongoose.Types.ObjectId.isValid(value)
  ) {
    const categoryById =
      await Category.findById(value);

    if (categoryById) {
      return categoryById;
    }
  }

  const slug = slugify(value);

  return Category.findOne({
    $or: [
      {
        name: {
          $regex: `^${value}$`,
          $options: "i",
        },
      },
      {
        slug,
      },
    ],

    isActive: true,
  });
};

/* =========================================================
   SPECS
========================================================= */

const buildSpecs = (row) => {
  const specs = [];

  for (
    let i = 1;
    i <= 10;
    i++
  ) {
    const label =
      normalizeString(
        row[`spec_${i}_label`]
      );

    const value =
      normalizeString(
        row[`spec_${i}_value`]
      );

    if (label && value) {
      specs.push({
        label,
        value,
      });
    }
  }

  return specs;
};

/* =========================================================
   PRODUCT DATA BUILDER
========================================================= */

const buildProductData = async (
  row
) => {
  const name =
    normalizeString(row.name);

  const sku =
    normalizeString(row.sku);

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

  const category =
    await findCategory(
      row.category
    );

  if (
    row.category &&
    !category
  ) {
    throw new Error(
      `Category not found: ${row.category}`
    );
  }

  const productData = {
    name,

    slug:
      normalizeString(row.slug) ||
      slugify(name),

    sku,

    price:
      normalizeNumber(row.price),

    category:
      category?._id || null,

    colors:
      parseArray(row.colors),

    item:
      normalizeString(row.item),

    threadCount:
      normalizeString(
        row.threadCount
      ),

    fabric:
      normalizeString(row.fabric),

    material:
      normalizeString(row.material),

    size:
      normalizeString(row.size),

    gsm:
      normalizeString(row.gsm),

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
      normalizeString(row.type),

    countryOfOrigin:
      normalizeString(
        row.countryOfOrigin
      ) || "Made In India",

    cotton:
      normalizeString(row.cotton),

    handmade:
      normalizeString(row.handmade),

    design:
      normalizeString(row.design),

    description:
      normalizeString(
        row.description
      ),

    moreInformation:
      normalizeString(
        row.moreInformation
      ),

    features:
      parseArray(row.features),

    materials:
      parseArray(row.materials),

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

    sortOrder:
      normalizeNumber(
        row.sortOrder,
        0
      ),
  };

  return productData;
};

/* =========================================================
   TEMPLATE HEADERS
========================================================= */

const TEMPLATE_HEADERS = [
  "name",
  "slug",
  "sku",
  "price",
  "category",
  "colors",
  "item",
  "threadCount",
  "fabric",
  "material",
  "size",
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

  "spec_1_label",
  "spec_1_value",

  "spec_2_label",
  "spec_2_value",

  "spec_3_label",
  "spec_3_value",

  "spec_4_label",
  "spec_4_value",

  "spec_5_label",
  "spec_5_value",

  "spec_6_label",
  "spec_6_value",

  "spec_7_label",
  "spec_7_value",

  "spec_8_label",
  "spec_8_value",

  "spec_9_label",
  "spec_9_value",

  "spec_10_label",
  "spec_10_value",

  "isActive",
  "isFeatured",
  "showInNewArrivals",
  "sortOrder",

  /*
    Optional fallback image URLs.
    Uploaded files are preferred.
  */

  "mainImage",
  "galleryImages",
];

/* =========================================================
   DOWNLOAD SAMPLE EXCEL
========================================================= */

export const downloadBulkProductTemplate =
  async (
    req,
    res,
    next
  ) => {
    try {
      const exampleRow = {
        name:
          "Cotton Handblock Bedsheet",

        slug:
          "cotton-handblock-bedsheet",

        sku:
          "NHF001",

        price:
          2499,

        category:
          "Bedsheets",

        colors:
          "Blue, White",

        item:
          "Bedsheet",

        threadCount:
          "144",

        fabric:
          "Cotton",

        material:
          "100% Cotton",

        size:
          "King",

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

        isActive:
          true,

        isFeatured:
          false,

        showInNewArrivals:
          true,

        sortOrder:
          1,

        /*
          Optional.

          If uploading local images with the
          bulk upload UI, leave these empty.
        */

        mainImage:
          "",

        galleryImages:
          "",
      };

      const worksheet =
        XLSX.utils.json_to_sheet(
          [exampleRow],
          {
            header:
              TEMPLATE_HEADERS,
          }
        );

      /*
        Add a second sheet with instructions.
      */

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
          "3. Category must match an active category name or category MongoDB ID.",
        ],

        [
          "4. Multiple values like colors/features/materials should be comma separated.",
        ],

        [
          "5. isActive, isFeatured and showInNewArrivals should be true or false.",
        ],

        [
          "6. Product images are optional.",
        ],

        [
          "7. If uploading images, rename them using SKU.",
        ],

        [
          "8. Main image example: NHF001.jpg",
        ],

        [
          "9. Gallery image example: NHF001-1.jpg",
        ],

        [
          "10. Additional gallery image: NHF001-2.jpg",
        ],

        [
          "11. Supported image types: JPG, JPEG, PNG, WEBP.",
        ],

        [
          "12. Uploaded images are matched automatically using SKU.",
        ],

        [
          "13. Existing SKU products will be UPDATED.",
        ],

        [
          "14. New SKU products will be CREATED.",
        ],

        [
          "15. Leave mainImage/galleryImages empty when using uploaded local images.",
        ],
      ];

      const instructionSheet =
        XLSX.utils.aoa_to_sheet(
          instructions
        );

      /*
        Column widths
      */

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

      instructionSheet["!cols"] = [
        {
          wch: 100,
        },
      ];

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

      const buffer =
        XLSX.write(workbook, {
          type: "buffer",
          bookType: "xlsx",
        });

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="NHF-Bulk-Product-Template.xlsx"'
      );

      return res.send(buffer);
    } catch (error) {
      next(error);
    }
  };

/* =========================================================
   MAIN BULK UPLOAD
========================================================= */

export const bulkUploadProducts =
  async (
    req,
    res,
    next
  ) => {
    try {
      /* -----------------------------------------------------
         CHECK EXCEL
      ----------------------------------------------------- */

      const excelFile =
        req.files?.excel?.[0];

      if (!excelFile) {
        return res.status(400).json({
          ok: false,
          error:
            "Excel file is required.",
        });
      }

      /* -----------------------------------------------------
         GET IMAGES

         Images are OPTIONAL.
      ----------------------------------------------------- */

      const imageFiles =
        req.files?.images || [];

      /* -----------------------------------------------------
         CHECK TOTAL UPLOAD SIZE

         This protects memoryStorage from
         extremely large combined requests.
      ----------------------------------------------------- */

      const totalUploadSize =
        excelFile.size +
        imageFiles.reduce(
          (total, file) =>
            total + file.size,
          0
        );

      const MAX_COMBINED_SIZE =
        500 * 1024 * 1024;

      if (
        totalUploadSize >
        MAX_COMBINED_SIZE
      ) {
        return res.status(413).json({
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
        workbook.SheetNames[0];

      if (!sheetName) {
        return res.status(400).json({
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
        return res.status(400).json({
          ok: false,
          error:
            "Excel contains no products.",
        });
      }

      /* -----------------------------------------------------
         RESULT
      ----------------------------------------------------- */

      const result = {
        total: rows.length,

        created: 0,

        updated: 0,

        failed: 0,

        errors: [],

        products: [],
      };

      /* -----------------------------------------------------
         PROCESS ROWS
      ----------------------------------------------------- */

      for (
        let index = 0;
        index < rows.length;
        index++
      ) {
        const row =
          rows[index];

        const excelRow =
          index + 2;

        try {
          /* -----------------------------------------------
             BUILD PRODUCT
          ----------------------------------------------- */

          const productData =
            await buildProductData(
              row
            );

          const sku =
            productData.sku;

          /* -----------------------------------------------
             MATCH IMAGES
          ----------------------------------------------- */

          const matchedImages =
            getImageFilesForSku(
              imageFiles,
              sku
            );

          let mainImage = "";

          const galleryImages = [];

          /* -----------------------------------------------
             UPLOAD IMAGES
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
                imageIndex === 0
                  ? "main"
                  : "gallery"
              );

            if (
              imageIndex === 0
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
             IMAGE OVERRIDE

             Excel URLs are used only when
             no matching uploaded images exist.
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
             CREATE OR UPDATE USING SKU
          ----------------------------------------------- */

          const existingProduct =
            await Product.findOne({
              sku,
            });

          let product;

          if (
            existingProduct
          ) {
            product =
              await Product.findByIdAndUpdate(
                existingProduct._id,

                {
                  $set:
                    productData,
                },

                {
                  new: true,
                  runValidators: true,
                }
              );

            result.updated++;
          } else {
            product =
              await Product.create(
                productData
              );

            result.created++;
          }

          /* -----------------------------------------------
             ADD RESULT
          ----------------------------------------------- */

          result.products.push({
            row: excelRow,

            sku,

            name:
              product.name,

            action:
              existingProduct
                ? "updated"
                : "created",
          });
        } catch (error) {
          result.failed++;

          result.errors.push({
            row: excelRow,

            sku:
              normalizeString(
                row.sku
              ) || null,

            name:
              normalizeString(
                row.name
              ) || null,

            error:
              error.message ||
              "Upload failed",
          });
        }
      }

      /* -----------------------------------------------------
         RESPONSE
      ----------------------------------------------------- */

      return res.status(200).json({
        ok: true,

        message:
          "Bulk product upload completed.",

        data: result,
      });
    } catch (error) {
      next(error);
    }
  };