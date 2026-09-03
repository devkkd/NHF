import Product from "../models/Product.js";
import Category from "../models/Category.js";

import {
  insertAtOrder,
  moveToOrder,
} from "../utils/reorder.js";

/* =========================================================
   PAGINATION
========================================================= */

const paginate = (
  page = 1,
  limit = 20
) => {
  const pg = Math.max(
    Number(page) || 1,
    1
  );

  const lim = Math.min(
    Math.max(
      Number(limit) || 20,
      1
    ),
    100
  );

  return {
    skip: (pg - 1) * lim,
    limit: lim,
    page: pg,
  };
};

/* =========================================================
   BOOLEAN
========================================================= */

const parseBoolean = (
  value,
  fallback = undefined
) => {
  if (
    value === undefined
  ) {
    return fallback;
  }

  return (
    value === true ||
    value === "true"
  );
};

/* =========================================================
   NUMBER
========================================================= */

const parseNumber = (
  value,
  fallback = 0
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : fallback;
};

/* =========================================================
   PRODUCT CATEGORY VALIDATION
========================================================= */

/**
 * Products can only belong to a SUBCATEGORY.
 *
 * Structure:
 *
 * Main Category
 *    └── Subcategory
 *          └── Product
 */

const validateProductCategory =
  async (categoryId) => {
    if (!categoryId) {
      const error =
        new Error(
          "Product must belong to a subcategory"
        );

      error.status = 400;

      throw error;
    }

    const category =
      await Category.findOne({
        _id: categoryId,
        isActive: true,
      })
        .select(
          "_id parent"
        )
        .lean();

    if (!category) {
      const error =
        new Error(
          "Category not found"
        );

      error.status = 400;

      throw error;
    }

    /**
     * If parent is null,
     * this is a main category.
     *
     * Products are not allowed
     * directly under main category.
     */

    if (!category.parent) {
      const error =
        new Error(
          "Product must belong to a subcategory"
        );

      error.status = 400;

      throw error;
    }

    return category;
  };

/* =========================================================
   NORMALIZE SIZES
========================================================= */

/**
 * Converts incoming size data into:
 *
 * [
 *   {
 *     name: "Queen",
 *     actualPrice: 3000,
 *     sellingPrice: 2400
 *   }
 * ]
 *
 * Invalid / empty size rows are ignored.
 */

const normalizeSizes = (
  sizes
) => {
  if (!Array.isArray(sizes)) {
    return [];
  }

  return sizes
    .map((size) => {
      if (
        typeof size ===
        "string"
      ) {
        return {
          name:
            size.trim(),

          actualPrice:
            0,

          sellingPrice:
            0,
        };
      }

      return {
        name: String(
          size?.name || ""
        ).trim(),

        actualPrice:
          parseNumber(
            size?.actualPrice,
            0
          ),

        sellingPrice:
          parseNumber(
            size?.sellingPrice,
            0
          ),
      };
    })
    .filter(
      (size) =>
        size.name
    );
};

/* =========================================================
   VALIDATE PRICE DATA
========================================================= */

const validatePriceData =
  ({
    actualPrice = 0,
    sellingPrice = 0,
    shippingCost = 0,
    sizes = [],
  }) => {
    const actual =
      parseNumber(
        actualPrice,
        0
      );

    const selling =
      parseNumber(
        sellingPrice,
        0
      );

    const shipping =
      parseNumber(
        shippingCost,
        0
      );

    /* -----------------------------------------------
       BASIC PRICE VALIDATION
    ----------------------------------------------- */

    if (
      actual < 0 ||
      selling < 0 ||
      shipping < 0
    ) {
      const error =
        new Error(
          "Price and shipping cost cannot be negative."
        );

      error.status = 400;

      throw error;
    }

    /* -----------------------------------------------
       PRODUCT PRICE
    ----------------------------------------------- */

    if (
      actual > 0 &&
      selling > actual
    ) {
      const error =
        new Error(
          "Selling price cannot be greater than actual price."
        );

      error.status = 400;

      throw error;
    }

    /* -----------------------------------------------
       SIZE PRICES
    ----------------------------------------------- */

    if (
      Array.isArray(
        sizes
      )
    ) {
      const seen =
        new Set();

      for (
        const size of sizes
      ) {
        const name =
          String(
            size?.name || ""
          ).trim();

        const sizeActual =
          parseNumber(
            size?.actualPrice,
            0
          );

        const sizeSelling =
          parseNumber(
            size?.sellingPrice,
            0
          );

        /* -------------------------------------------
           SIZE NAME
        ------------------------------------------- */

        if (!name) {
          const error =
            new Error(
              "Size name is required."
            );

          error.status = 400;

          throw error;
        }

        /* -------------------------------------------
           DUPLICATE SIZE
        ------------------------------------------- */

        const key =
          name.toLowerCase();

        if (
          seen.has(key)
        ) {
          const error =
            new Error(
              `Duplicate size "${name}".`
            );

          error.status = 400;

          throw error;
        }

        seen.add(key);

        /* -------------------------------------------
           NEGATIVE SIZE PRICE
        ------------------------------------------- */

        if (
          sizeActual < 0 ||
          sizeSelling < 0
        ) {
          const error =
            new Error(
              `Invalid price for size "${name}".`
            );

          error.status = 400;

          throw error;
        }

        /* -------------------------------------------
           SELLING > ACTUAL
        ------------------------------------------- */

        if (
          sizeActual > 0 &&
          sizeSelling >
            sizeActual
        ) {
          const error =
            new Error(
              `Selling price cannot be greater than actual price for size "${name}".`
            );

          error.status = 400;

          throw error;
        }
      }
    }

    return {
      actual,
      selling,
      shipping,
    };
  };

/* =========================================================
   PUBLIC PRODUCTS
========================================================= */

/**
 * Get public products.
 *
 * Supports:
 *
 * /products
 * /products?category=SUBCATEGORY_ID
 * /products?featured=true
 * /products?newArrivals=true
 *  /products?sale=true
 * /products?wardrobe=true
 * /products?search=bed
 */

export const getProducts =
  async (
    req,
    res,
    next
  ) => {
    try {
     const {
  category,
  featured,
  newArrivals,
  sale,
  page,
  limit,
  search,
} = req.query;

      const {
        skip,
        limit: lim,
        page: pg,
      } = paginate(
        page,
        limit
      );

      const filter = {
        isActive: true,
      };

      /* ===================================================
         WARDROBE
      =================================================== */

      /**
       * Wardrobe products:
       *
       * Main categories:
       * showInWardrobe = true
       *
       * then their direct subcategories
       *
       * then products inside those subcategories
       */

      if (
        req.query.wardrobe ===
        "true"
      ) {
        const wardrobeParents =
          await Category.find({
            isActive: true,
            parent: null,
            showInWardrobe: true,
          })
            .select("_id")
            .lean();

        const wardrobeSubcategories =
          wardrobeParents.length
            ? await Category.find({
                isActive: true,

                parent: {
                  $in:
                    wardrobeParents.map(
                      (item) =>
                        item._id
                    ),
                },
              })
                .select("_id")
                .lean()
            : [];

        filter.category = {
          $in:
            wardrobeSubcategories.map(
              (item) =>
                item._id
            ),
        };
      }

      /* ===================================================
         SPECIFIC CATEGORY
      =================================================== */

      /**
       * If a specific category /
       * subcategory is requested,
       * don't overwrite wardrobe filter.
       */

      if (
        category &&
        req.query.wardrobe !==
          "true"
      ) {
        filter.category =
          category;
      }

      /* ===================================================
         FEATURED
      =================================================== */

      if (
        featured === "true"
      ) {
        filter.isFeatured =
          true;
      }

      /* ===================================================
         NEW ARRIVALS
      =================================================== */

      if (
        newArrivals ===
        "true"
      ) {
        filter.showInNewArrivals =
          true;
      }
/* ===================================================
   SALE
=================================================== */

if (
  sale ===
  "true"
) {
  filter.isOnSale =
    true;
}
      /* ===================================================
         SEARCH
      =================================================== */

      if (search) {
        filter.$or = [
          {
            name: {
              $regex:
                search,

              $options: "i",
            },
          },

          {
            sku: {
              $regex:
                search,

              $options: "i",
            },
          },
        ];
      }

      /* ===================================================
         QUERY
      =================================================== */

      const [
        products,
        total,
      ] = await Promise.all([
        Product.find(filter)
          .populate(
            "category",
            "name slug parent sortOrder"
          )
          .sort({
            sortOrder: 1,
            createdAt: -1,
          })
          .skip(skip)
          .limit(lim)
          .lean(),

        Product.countDocuments(
          filter
        ),
      ]);

      /* ===================================================
         RESPONSE
      =================================================== */

      res.json({
        ok: true,

        data: {
          products,

          total,

          page: pg,

          limit: lim,

          pages:
            Math.ceil(
              total / lim
            ),
        },
      });
    } catch (err) {
      next(err);
    }
  };

/* =========================================================
   PRODUCT BY SLUG
========================================================= */

/**
 * Get one product by slug.
 *
 * This returns the complete product,
 * including:
 *
 * colors
 * sizes
 * actualPrice
 * sellingPrice
 * shippingCost
 * images
 */

export const getProductBySlug =
  async (
    req,
    res,
    next
  ) => {
    try {
      const product =
        await Product.findOne({
          slug:
            req.params.slug,

          isActive: true,
        })
          .populate(
            "category",
            "name slug parent sortOrder"
          )
          .lean();

      if (!product) {
        return res
          .status(404)
          .json({
            ok: false,
            error: "Not found",
          });
      }

      res.json({
        ok: true,

        data: {
          product,
        },
      });
    } catch (err) {
      next(err);
    }
  };

/* =========================================================
   ADMIN PRODUCTS
========================================================= */

/**
 * Get products for admin panel.
 *
 * Supports:
 *
 * ?page=1
 * ?limit=20
 * ?category=SUBCATEGORY_ID
 * ?search=bedsheet
 * ?active=true
 * ?active=false
 */

export const getAllProductsAdmin =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        page,
        limit,
        search,
        category,
        active,
      } = req.query;

      const {
        skip,
        limit: lim,
        page: pg,
      } = paginate(
        page,
        limit
      );

      const filter = {};

      /* ===================================================
         CATEGORY
      =================================================== */

      if (category) {
        filter.category =
          category;
      }

      /* ===================================================
         ACTIVE
      =================================================== */

      if (
        active === "true"
      ) {
        filter.isActive =
          true;
      }

      if (
        active === "false"
      ) {
        filter.isActive =
          false;
      }

      /* ===================================================
         SEARCH
      =================================================== */

      if (search) {
        filter.$or = [
          {
            name: {
              $regex:
                search,

              $options: "i",
            },
          },

          {
            sku: {
              $regex:
                search,

              $options: "i",
            },
          },
        ];
      }

      /* ===================================================
         QUERY
      =================================================== */

      const [
        products,
        total,
      ] = await Promise.all([
        Product.find(filter)
          .populate(
            "category",
            "name slug parent sortOrder"
          )
          .sort({
            category: 1,
            sortOrder: 1,
            createdAt: -1,
          })
          .skip(skip)
          .limit(lim)
          .lean(),

        Product.countDocuments(
          filter
        ),
      ]);

      res.json({
        ok: true,

        data: {
          products,

          total,

          page: pg,

          limit: lim,

          pages:
            Math.ceil(
              total / lim
            ),
        },
      });
    } catch (err) {
      next(err);
    }
  };

/* =========================================================
   CREATE PRODUCT
========================================================= */

/**
 * Create a product.
 *
 * Product must belong to
 * a SUBCATEGORY.
 *
 * Supports:
 *
 * - existing colors
 * - sizes[]
 * - actualPrice
 * - sellingPrice
 * - shippingCost
 * - images
 * - all existing product fields
 */

export const createProduct =
  async (
    req,
    res,
    next
  ) => {
    try {
      /* ===================================================
         NAME
      =================================================== */

      if (
        !req.body.name?.trim()
      ) {
        return res
          .status(400)
          .json({
            ok: false,
            error:
              "Name required",
          });
      }

      /* ===================================================
         CATEGORY
      =================================================== */

      const category =
        await validateProductCategory(
          req.body.category
        );

      /* ===================================================
         NORMALIZE SIZES
      =================================================== */

      const sizes =
        normalizeSizes(
          req.body.sizes
        );

      /* ===================================================
         PRODUCT PRICES
      =================================================== */

      const actualPrice =
        parseNumber(
          req.body.actualPrice,
          0
        );

      const sellingPrice =
        parseNumber(
          req.body.sellingPrice,
          0
        );

      const shippingCost =
        parseNumber(
          req.body.shippingCost,
          0
        );

      /* ===================================================
         VALIDATE
      =================================================== */

      validatePriceData({
        actualPrice,

        sellingPrice,

        shippingCost,

        sizes,
      });

      /* ===================================================
         PRODUCT DATA
      =================================================== */

      const productData = {
        ...req.body,

        /*
         * Product-level prices
         */

        actualPrice,

        sellingPrice,

        shippingCost,

        /*
         * Size-level pricing
         */

        sizes,

        /*
         * Keep existing `price`
         * for backward compatibility.
         *
         * If sizes exist:
         * use first size selling price.
         *
         * Otherwise:
         * use product selling price.
         */

        price:
          sizes.length > 0
            ? Number(
                sizes[0]
                  ?.sellingPrice ||
                  0
              )
            : sellingPrice,
      };

      /* ===================================================
         SERIAL ORDER
      =================================================== */

      const position =
        await insertAtOrder({
          Model: Product,

          scope: {
            category:
              category._id,

            isActive: true,
          },

          requestedOrder:
            req.body.sortOrder,
        });

      productData.sortOrder =
        position;

      productData.category =
        category._id;

      /* ===================================================
         CREATE
      =================================================== */

      const product =
        await Product.create(
          productData
        );

      /* ===================================================
         POPULATE
      =================================================== */

      await product.populate(
        "category",
        "name slug parent sortOrder"
      );

      /* ===================================================
         RESPONSE
      =================================================== */

      res.status(201).json({
        ok: true,

        data: {
          product,
        },
      });
    } catch (err) {
      /* =================================================
         DUPLICATE
      ================================================= */

      if (
        err.code === 11000
      ) {
        return res
          .status(409)
          .json({
            ok: false,
            error: "Duplicate",
          });
      }

      next(err);
    }
  };

/* =========================================================
   UPDATE PRODUCT
========================================================= */

/**
 * Update product.
 *
 * Supports:
 *
 * - name
 * - category/subcategory
 * - serial number
 * - images
 * - colors
 * - sizes
 * - actualPrice
 * - sellingPrice
 * - shippingCost
 * - all other fields
 */

export const updateProduct =
  async (
    req,
    res,
    next
  ) => {
    try {
      /* ===================================================
         FIND EXISTING
      =================================================== */

      const existing =
        await Product.findById(
          req.params.id
        );

      if (!existing) {
        return res
          .status(404)
          .json({
            ok: false,
            error: "Not found",
          });
      }

      /* ===================================================
         BODY
      =================================================== */

      const body = {
        ...req.body,
      };

      /* ===================================================
         NAME
      =================================================== */

      if (body.name) {
        const cleanName =
          String(
            body.name
          ).trim();

        body.name =
          cleanName;

        /*
         * Regenerate slug when
         * name changes.
         */

        body.slug =
          cleanName
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

      /* ===================================================
         CATEGORY CHECK
      =================================================== */

      const categoryProvided =
        Object.prototype.hasOwnProperty.call(
          body,
          "category"
        );

      const requestedCategory =
        categoryProvided
          ? body.category
          : existing.category;

      const categoryChanged =
        categoryProvided
          ? String(
              existing.category ||
                ""
            ) !==
            String(
              requestedCategory ||
                ""
            )
          : false;

      /* ===================================================
         VALIDATE CATEGORY
      =================================================== */

      const category =
        categoryProvided ||
        !existing.category
          ? await validateProductCategory(
              requestedCategory
            )
          : await Category.findById(
              existing.category
            )
              .select("_id")
              .lean();

      /* ===================================================
         SET CATEGORY
      =================================================== */

      if (
        categoryProvided
      ) {
        body.category =
          category?._id ||
          null;
      }

      /* ===================================================
         NORMALIZE SIZES
      =================================================== */

      if (
        Object.prototype.hasOwnProperty.call(
          body,
          "sizes"
        )
      ) {
        body.sizes =
          normalizeSizes(
            body.sizes
          );
      }

      /* ===================================================
         NORMALIZE ACTUAL PRICE
      =================================================== */

      if (
        Object.prototype.hasOwnProperty.call(
          body,
          "actualPrice"
        )
      ) {
        body.actualPrice =
          parseNumber(
            body.actualPrice,
            0
          );
      }

      /* ===================================================
         NORMALIZE SELLING PRICE
      =================================================== */

      if (
        Object.prototype.hasOwnProperty.call(
          body,
          "sellingPrice"
        )
      ) {
        body.sellingPrice =
          parseNumber(
            body.sellingPrice,
            0
          );
      }

      /* ===================================================
         NORMALIZE SHIPPING
      =================================================== */

      if (
        Object.prototype.hasOwnProperty.call(
          body,
          "shippingCost"
        )
      ) {
        body.shippingCost =
          parseNumber(
            body.shippingCost,
            0
          );
      }

      /* ===================================================
         EFFECTIVE PRICE VALUES
      =================================================== */

      const effectiveActualPrice =
        body.actualPrice !==
        undefined
          ? body.actualPrice
          : Number(
              existing.actualPrice ||
                0
            );

      const effectiveSellingPrice =
        body.sellingPrice !==
        undefined
          ? body.sellingPrice
          : Number(
              existing.sellingPrice ||
                0
            );

      const effectiveShippingCost =
        body.shippingCost !==
        undefined
          ? body.shippingCost
          : Number(
              existing.shippingCost ||
                0
            );

      const effectiveSizes =
        body.sizes !==
        undefined
          ? body.sizes
          : normalizeSizes(
              existing.sizes
            );

      /* ===================================================
         VALIDATE PRICE DATA
      =================================================== */

      validatePriceData({
        actualPrice:
          effectiveActualPrice,

        sellingPrice:
          effectiveSellingPrice,

        shippingCost:
          effectiveShippingCost,

        sizes:
          effectiveSizes,
      });

      /* ===================================================
         LEGACY PRICE
         
         Keep existing frontend/API
         compatibility.
      =================================================== */

      if (
        Array.isArray(
          effectiveSizes
        ) &&
        effectiveSizes.length >
          0
      ) {
        body.price =
          Number(
            effectiveSizes[0]
              ?.sellingPrice ||
              0
          );
      } else if (
        body.sellingPrice !==
        undefined
      ) {
        body.price =
          Number(
            effectiveSellingPrice ||
              0
          );
      }

      /* ===================================================
         ORDER SCOPE
      =================================================== */

      const oldScope = {
        category:
          existing.category ||
          null,

        isActive: true,
      };

      const newScope = {
        category:
          category?._id ||
          null,

        isActive: true,
      };

      /* ===================================================
         SORT ORDER
      =================================================== */

      /**
       * Decide whether we need
       * to move the product in
       * serial order.
       */

      const sortOrderWasProvided =
        Object.prototype.hasOwnProperty.call(
          req.body,
          "sortOrder"
        );

      const requestedOrder =
        sortOrderWasProvided ||
        categoryChanged
          ? req.body.sortOrder
          : existing.sortOrder;

      /* ===================================================
         MOVE PRODUCT
      =================================================== */

      body.sortOrder =
        await moveToOrder({
          Model: Product,

          id: existing._id,

          oldScope,

          newScope,

          oldOrder:
            existing.sortOrder,

          requestedOrder,
        });

      /* ===================================================
         UPDATE
      =================================================== */

      const product =
        await Product.findByIdAndUpdate(
          req.params.id,
          {
            $set: body,
          },
          {
            new: true,
            runValidators: true,
          }
        ).populate(
          "category",
          "name slug parent sortOrder"
        );

      /* ===================================================
         RESPONSE
      =================================================== */

      res.json({
        ok: true,

        data: {
          product,
        },
      });
    } catch (err) {
      /* =================================================
         DUPLICATE
      ================================================= */

      if (
        err.code === 11000
      ) {
        return res
          .status(409)
          .json({
            ok: false,
            error: "Duplicate",
          });
      }

      next(err);
    }
  };

/* =========================================================
   SOFT DELETE PRODUCT
========================================================= */

/**
 * Soft delete / deactivate product.
 *
 * After removing a product,
 * remaining products shift up.
 *
 * Example:
 *
 * 1 A
 * 2 B
 * 3 C
 *
 * Delete B
 *
 * 1 A
 * 2 C
 */

export const deleteProduct =
  async (
    req,
    res,
    next
  ) => {
    try {
      /* ===================================================
         FIND
      =================================================== */

      const product =
        await Product.findById(
          req.params.id
        );

      if (!product) {
        return res
          .status(404)
          .json({
            ok: false,
            error: "Not found",
          });
      }

      /* ===================================================
         OLD SCOPE
      =================================================== */

      const oldScope = {
        category:
          product.category ||
          null,

        isActive: true,
      };

      const oldOrder =
        product.sortOrder;

      /* ===================================================
         DEACTIVATE
      =================================================== */

      await product.updateOne({
        $set: {
          isActive: false,
        },
      });

      /* ===================================================
         COMPACT ORDER
      =================================================== */

      if (
        oldOrder
      ) {
        await Product.updateMany(
          {
            ...oldScope,

            _id: {
              $ne:
                product._id,
            },

            sortOrder: {
              $gt:
                oldOrder,
            },
          },
          {
            $inc: {
              sortOrder:
                -1,
            },
          }
        );
      }

      /* ===================================================
         RESPONSE
      =================================================== */

      res.json({
        ok: true,

        data: {
          message:
            "Deactivated",
        },
      });
    } catch (err) {
      next(err);
    }
  };

/* =========================================================
   PERMANENT DELETE PRODUCT
========================================================= */

export const permanentlyDeleteProduct =
  async (
    req,
    res,
    next
  ) => {
    try {
      /* ===================================================
         FIND PRODUCT
      =================================================== */

      const product =
        await Product.findById(
          req.params.id
        );

      if (!product) {
        return res
          .status(404)
          .json({
            ok: false,
            error:
              "Product not found",
          });
      }

      /* ===================================================
         OLD CATEGORY
      =================================================== */

      const oldCategory =
        product.category ||
        null;

      const oldOrder =
        product.sortOrder;

      /* ===================================================
         DELETE
      =================================================== */

      await Product.findByIdAndDelete(
        req.params.id
      );

      /* ===================================================
         SERIAL ORDER GAP FIX
      =================================================== */

      if (
        oldCategory &&
        oldOrder
      ) {
        await Product.updateMany(
          {
            category:
              oldCategory,

            isActive: true,

            sortOrder: {
              $gt:
                oldOrder,
            },
          },
          {
            $inc: {
              sortOrder:
                -1,
            },
          }
        );
      }

      /* ===================================================
         RESPONSE
      =================================================== */

      return res.json({
        ok: true,

        data: {
          message:
            "Product permanently deleted",
        },
      });
    } catch (err) {
      next(err);
    }
  };