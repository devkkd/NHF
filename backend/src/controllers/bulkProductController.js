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
      ?.toLowerCase() || "jpg";

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
 * Excel "category" column now accepts:
 *
 * - Subcategory MongoDB ObjectId
 * - Subcategory exact name
 * - Subcategory slug
 *
 * IMPORTANT:
 * Product MUST belong to a subcategory.
 *
 * Main Category:
 * parent = null
 *
 * Subcategory:
 * parent = Main Category ID
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

    /*
      Try MongoDB ObjectId first.
    */

    if (
      mongoose.Types.ObjectId.isValid(
        value
      )
    ) {
      category =
        await Category.findById(
          value
        );
    }

    /*
      Try exact name / slug.
    */

    if (!category) {
      const slug =
        slugify(value);

      category =
        await Category.findOne({
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

          isActive: true,
        });
    }

    if (!category) {
      return null;
    }

    /*
      A product cannot be directly
      attached to a main category.
    */

    if (!category.parent) {
      const error =
        new Error(
          `Product category "${value}" is a main category. Please use a subcategory.`
        );

      error.code =
        "MAIN_CATEGORY_NOT_ALLOWED";

      throw error;
    }

    return category;
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
   PRODUCT DATA BUILDER
========================================================= */

/**
 * Build product data from Excel row.
 *
 * sortOrder is handled separately because
 * it depends on whether the product is:
 *
 * - new
 * - already existing
 * - moving between subcategories
 */
const buildProductData =
  async (row) => {
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

    if (
      !normalizeString(
        row.category
      )
    ) {
      throw new Error(
        "Subcategory is required in category column"
      );
    }

    const category =
      await findSubcategory(
        row.category
      );

    if (!category) {
      throw new Error(
        `Subcategory not found: ${row.category}`
      );
    }

    const productData = {
      name,

      slug:
        normalizeString(
          row.slug
        ) ||
        slugify(name),

      sku,

      price:
        normalizeNumber(
          row.price
        ),

      /*
        IMPORTANT:
        category = SUBCATEGORY ID
      */
      category:
        category._id,

      colors:
        parseArray(
          row.colors
        ),

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

      size:
        normalizeString(
          row.size
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
    };

    /*
      Only return sortOrder when Excel
      actually supplied one.

      This is important for UPDATE:
      if Excel has no serial, existing
      product keeps its current serial.
    */

    const rawSortOrder =
      normalizeString(
        row.sortOrder
      );

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
      category,
    };
  };

/* =========================================================
   TEMPLATE HEADERS
========================================================= */

const TEMPLATE_HEADERS = [
  "name",
  "slug",
  "sku",
  "price",

  /*
    IMPORTANT:
    This column now expects
    SUBCATEGORY name / slug / ID.
  */
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

  /*
    Product serial number inside
    its SUBCATEGORY.
  */
  "sortOrder",

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

        /*
          Use SUBCATEGORY here.
        */
        category:
          "Cotton Bedsheets",

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
          "3. The category column must contain a SUBCATEGORY name, slug, or MongoDB ID.",
        ],

        [
          "4. Products cannot be assigned directly to a main category.",
        ],

        [
          "5. Main Category -> Subcategory -> Product is the supported structure.",
        ],

        [
          "6. Multiple values like colors/features/materials should be comma separated.",
        ],

        [
          "7. isActive, isFeatured and showInNewArrivals should be true or false.",
        ],

        [
          "8. sortOrder is the product serial number inside its subcategory.",
        ],

        [
          "9. sortOrder starts from 1.",
        ],

        [
          "10. If sortOrder is blank for an existing SKU, its current serial number is preserved.",
        ],

        [
          "11. If sortOrder is provided for an existing SKU, the product is moved to that position.",
        ],

        [
          "12. If sortOrder is provided for a new SKU, it is inserted at that position and other products shift automatically.",
        ],

        [
          "13. Product images are optional.",
        ],

        [
          "14. If uploading images, rename them using SKU.",
        ],

        [
          "15. Main image example: NHF001.jpg",
        ],

        [
          "16. Gallery image example: NHF001-1.jpg",
        ],

        [
          "17. Additional gallery image: NHF001-2.jpg",
        ],

        [
          "18. Supported image types: JPG, JPEG, PNG, WEBP.",
        ],

        [
          "19. Uploaded images are matched automatically using SKU.",
        ],

        [
          "20. Existing SKU products will be UPDATED.",
        ],

        [
          "21. New SKU products will be CREATED.",
        ],

        [
          "22. Leave mainImage/galleryImages empty when using uploaded local images.",
        ],
      ];

      const instructionSheet =
        XLSX.utils.aoa_to_sheet(
          instructions
        );

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
          wch: 110,
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
        XLSX.write(
          workbook,
          {
            type: "buffer",
            bookType: "xlsx",
          }
        );

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
      ----------------------------------------------------- */

      const totalUploadSize =
        excelFile.size +
        imageFiles.reduce(
          (
            total,
            file
          ) =>
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
         PROCESS ROWS
      ----------------------------------------------------- */

      for (
        let index = 0;
        index <
        rows.length;
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

          const {
            productData,
            category,
          } =
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

          let mainImage =
            "";

          const galleryImages =
            [];

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
             IMAGE URL FALLBACK
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
             FIND EXISTING PRODUCT
          ----------------------------------------------- */

          const existingProduct =
            await Product.findOne({
              sku,
            });

          let product;

          /* =================================================
             CREATE
          ================================================= */

          if (
            !existingProduct
          ) {
            /*
              If Excel has sortOrder:
                insert at requested position.

              If blank:
                automatically put at bottom.
            */

            const position =
              await insertAtOrder({
                Model:
                  Product,

                scope: {
                  category:
                    category._id,

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
             UPDATE
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
                category._id,

              isActive:
                true,
            };

            const categoryChanged =
              String(
                oldCategory || ""
              ) !==
              String(
                category._id
              );

            /*
              Existing SKU + no sortOrder
              =
              preserve current position,
              unless category changed.
            */

            const sortOrderProvided =
              Object.prototype.hasOwnProperty.call(
                productData,
                "sortOrder"
              );

            let requestedOrder;

            if (
              sortOrderProvided
            ) {
              requestedOrder =
                productData.sortOrder;
            } else if (
              categoryChanged
            ) {
              /*
                Moving category without a requested
                serial means it goes to bottom.
              */

              requestedOrder =
                null;
            } else {
              /*
                Same category + blank sortOrder:
                preserve current position.
              */

              requestedOrder =
                existingProduct.sortOrder;
            }

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
             ADD SUCCESS RESULT
          ----------------------------------------------- */

          result.products.push({
            row:
              excelRow,

            sku,

            name:
              product.name,

            category:
              category.name,

            action:
              existingProduct
                ? "updated"
                : "created",

            sortOrder:
              product.sortOrder,
          });
        } catch (error) {
          result.failed++;

          result.errors.push({
            row:
              excelRow,

            sku:
              normalizeString(
                row.sku
              ) || null,

            name:
              normalizeString(
                row.name
              ) || null,

            category:
              normalizeString(
                row.category
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