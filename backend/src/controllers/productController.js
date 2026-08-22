import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { insertAtOrder, moveToOrder } from '../utils/reorder.js';

const paginate = (page = 1, limit = 20) => {
  const pg = Math.max(Number(page) || 1, 1);
  const lim = Math.min(Math.max(Number(limit) || 20, 1), 100);

  return {
    skip: (pg - 1) * lim,
    limit: lim,
    page: pg,
  };
};

const parseBoolean = (value, fallback = undefined) => {
  if (value === undefined) {
    return fallback;
  }

  return value === true || value === 'true';
};

/**
 * Products can only belong to a SUBCATEGORY.
 *
 * Structure:
 *
 * Main Category
 *    └── Subcategory
 *          └── Product
 */
const validateProductCategory = async (categoryId) => {
  if (!categoryId) {
    const error = new Error(
      'Product must belong to a subcategory'
    );

    error.status = 400;

    throw error;
  }

  const category = await Category.findOne({
    _id: categoryId,
    isActive: true,
  })
    .select('_id parent')
    .lean();

  if (!category) {
    const error = new Error('Category not found');

    error.status = 400;

    throw error;
  }

  /**
   * If parent is null, this is a main category.
   * Products are not allowed directly under it.
   */
  if (!category.parent) {
    const error = new Error(
      'Product must belong to a subcategory'
    );

    error.status = 400;

    throw error;
  }

  return category;
};

/**
 * Get public products.
 *
 * Supports:
 *
 * /products
 * /products?category=SUBCATEGORY_ID
 * /products?featured=true
 * /products?newArrivals=true
 * /products?wardrobe=true
 * /products?search=bed
 */
export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      featured,
      newArrivals,
      page,
      limit,
      search,
    } = req.query;

    const {
      skip,
      limit: lim,
      page: pg,
    } = paginate(page, limit);

    const filter = {
      isActive: true,
    };

    /**
     * Wardrobe products:
     *
     * Main categories having:
     * showInWardrobe = true
     *
     * then all their direct subcategories
     *
     * then products inside those subcategories.
     */
    if (req.query.wardrobe === 'true') {
      const wardrobeParents = await Category.find({
        isActive: true,
        parent: null,
        showInWardrobe: true,
      })
        .select('_id')
        .lean();

      const wardrobeSubcategories = wardrobeParents.length
        ? await Category.find({
            isActive: true,
            parent: {
              $in: wardrobeParents.map(
                (item) => item._id
              ),
            },
          })
            .select('_id')
            .lean()
        : [];

      filter.category = {
        $in: wardrobeSubcategories.map(
          (item) => item._id
        ),
      };
    }

    /**
     * If a specific category/subcategory is requested,
     * don't overwrite the wardrobe filter.
     */
    if (
      category &&
      req.query.wardrobe !== 'true'
    ) {
      filter.category = category;
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    if (newArrivals === 'true') {
      filter.showInNewArrivals = true;
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          sku: {
            $regex: search,
            $options: 'i',
          },
        },
      ];
    }

    const [
      products,
      total,
    ] = await Promise.all([
      Product.find(filter)
        .populate(
          'category',
          'name slug parent sortOrder'
        )
        .sort({
          sortOrder: 1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(lim)
        .lean(),

      Product.countDocuments(filter),
    ]);

    res.json({
      ok: true,

      data: {
        products,
        total,
        page: pg,
        limit: lim,
        pages: Math.ceil(total / lim),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get one product by slug.
 */
export const getProductBySlug = async (
  req,
  res,
  next
) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
    })
      .populate(
        'category',
        'name slug parent sortOrder'
      )
      .lean();

    if (!product) {
      return res.status(404).json({
        ok: false,
        error: 'Not found',
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

/**
 * Get products for admin panel.
 */
export const getAllProductsAdmin = async (
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
    } = paginate(page, limit);

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (active === 'true') {
      filter.isActive = true;
    }

    if (active === 'false') {
      filter.isActive = false;
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: 'i',
          },
        },
        {
          sku: {
            $regex: search,
            $options: 'i',
          },
        },
      ];
    }

    const [
      products,
      total,
    ] = await Promise.all([
      Product.find(filter)
        .populate(
          'category',
          'name slug parent sortOrder'
        )
        .sort({
          category: 1,
          sortOrder: 1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(lim)
        .lean(),

      Product.countDocuments(filter),
    ]);

    res.json({
      ok: true,

      data: {
        products,
        total,
        page: pg,
        limit: lim,
        pages: Math.ceil(total / lim),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a product.
 */
export const createProduct = async (
  req,
  res,
  next
) => {
  try {
    if (!req.body.name?.trim()) {
      return res.status(400).json({
        ok: false,
        error: 'Name required',
      });
    }

    /**
     * Validate category.
     *
     * This ensures that a product is attached
     * only to a subcategory.
     */
    const category =
      await validateProductCategory(
        req.body.category
      );

    const productData = {
      ...req.body,
    };

    /**
     * Product serial is maintained separately
     * inside each subcategory.
     *
     * Example:
     *
     * Cotton Bedsheets
     *   1 Product A
     *   2 Product B
     *   3 Product C
     */
    const position = await insertAtOrder({
      Model: Product,

      scope: {
        category: category._id,
        isActive: true,
      },

      requestedOrder: req.body.sortOrder,
    });

    productData.sortOrder = position;
    productData.category = category._id;

    const product =
      await Product.create(productData);

    await product.populate(
      'category',
      'name slug parent sortOrder'
    );

    res.status(201).json({
      ok: true,

      data: {
        product,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        ok: false,
        error: 'Duplicate',
      });
    }

    next(err);
  }
};

/**
 * Update product.
 *
 * Supports:
 * - name
 * - category/subcategory
 * - serial number
 * - all other product fields
 */
export const updateProduct = async (
  req,
  res,
  next
) => {
  try {
    const existing =
      await Product.findById(req.params.id);

    if (!existing) {
      return res.status(404).json({
        ok: false,
        error: 'Not found',
      });
    }

    const body = {
      ...req.body,
    };

    /**
     * Regenerate slug when name changes.
     */
    if (body.name) {
      body.slug = body.name
        .toLowerCase()
        .replace(
          /[^a-z0-9\s-]/g,
          ''
        )
        .replace(
          /\s+/g,
          '-'
        )
        .replace(
          /-{2,}/g,
          '-'
        )
        .trim();
    }

    const categoryProvided =
      Object.prototype.hasOwnProperty.call(
        body,
        'category'
      );

    const requestedCategory =
      categoryProvided
        ? body.category
        : existing.category;

    const categoryChanged =
      categoryProvided
        ? String(existing.category || '') !==
          String(requestedCategory || '')
        : false;

    /**
     * Always validate the category if:
     *
     * - category is changed
     * - old product has no category
     */
    const category =
      categoryProvided ||
      !existing.category
        ? await validateProductCategory(
            requestedCategory
          )
        : await Category.findById(
            existing.category
          )
            .select('_id')
            .lean();

    const oldScope = {
      category:
        existing.category || null,

      isActive: true,
    };

    const newScope = {
      category:
        category?._id || null,

      isActive: true,
    };

    if (categoryProvided) {
      body.category =
        category?._id || null;
    }

    /**
     * Decide whether we need to move
     * the product in the serial order.
     */
    const sortOrderWasProvided =
      Object.prototype.hasOwnProperty.call(
        req.body,
        'sortOrder'
      );

    const requestedOrder =
      sortOrderWasProvided ||
      categoryChanged
        ? req.body.sortOrder
        : existing.sortOrder;

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
        'category',
        'name slug parent sortOrder'
      );

    res.json({
      ok: true,

      data: {
        product,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        ok: false,
        error: 'Duplicate',
      });
    }

    next(err);
  }
};

/**
 * Soft delete / deactivate product.
 *
 * After removing a product, the remaining
 * products are shifted up automatically.
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
export const deleteProduct = async (
  req,
  res,
  next
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        ok: false,
        error: 'Not found',
      });
    }

    const oldScope = {
      category:
        product.category || null,

      isActive: true,
    };

    const oldOrder =
      product.sortOrder;

    await product.updateOne({
      $set: {
        isActive: false,
      },
    });

    if (oldOrder) {
      await Product.updateMany(
        {
          ...oldScope,

          _id: {
            $ne: product._id,
          },

          sortOrder: {
            $gt: oldOrder,
          },
        },
        {
          $inc: {
            sortOrder: -1,
          },
        }
      );
    }

    res.json({
      ok: true,

      data: {
        message: 'Deactivated',
      },
    });
  } catch (err) {
    next(err);
  }
};
// ======================================================
// PERMANENT DELETE PRODUCT
// ======================================================

export const permanentlyDeleteProduct = async (
  req,
  res,
  next
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        ok: false,
        error: "Product not found",
      });
    }

    const oldCategory =
      product.category || null;

    const oldOrder =
      product.sortOrder;

    await Product.findByIdAndDelete(
      req.params.id
    );

    // Serial order gap fix
    if (
      oldCategory &&
      oldOrder
    ) {
      await Product.updateMany(
        {
          category: oldCategory,
          isActive: true,
          sortOrder: {
            $gt: oldOrder,
          },
        },
        {
          $inc: {
            sortOrder: -1,
          },
        }
      );
    }

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