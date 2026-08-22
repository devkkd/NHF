import "dotenv/config";
import mongoose from "mongoose";

import Category from "../models/Category.js";
import Product from "../models/Product.js";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const connectDB = async () => {
  const mongoUri =
    process.env.MONGODB_URI ||
    process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error(
      "MongoDB connection string not found in environment variables."
    );
  }

  await mongoose.connect(mongoUri);

  console.log("MongoDB connected.");
};

const normalizeOrders = async (
  Model,
  scope,
  label
) => {
  const documents =
    await Model.find(scope)
      .sort({
        sortOrder: 1,
        createdAt: 1,
        _id: 1,
      })
      .select("_id name sortOrder category parent")
      .lean();

  if (!documents.length) {
    return 0;
  }

  const operations = [];

  documents.forEach(
    (document, index) => {
      const newOrder =
        index + 1;

      if (
        Number(document.sortOrder) !==
        newOrder
      ) {
        operations.push({
          updateOne: {
            filter: {
              _id: document._id,
            },

            update: {
              $set: {
                sortOrder:
                  newOrder,
              },
            },
          },
        });
      }
    }
  );

  if (operations.length) {
    await Model.bulkWrite(
      operations
    );
  }

  console.log(
    `${label}: ${documents.length} records checked, ${operations.length} updated.`
  );

  return documents.length;
};

/*
|--------------------------------------------------------------------------
| NORMALIZE CATEGORIES
|--------------------------------------------------------------------------
|
| Main categories:
|
| 1
| 2
| 3
| 4
|
|--------------------------------------------------------------------------
*/

const normalizeMainCategories =
  async () => {
    return normalizeOrders(
      Category,
      {
        parent: null,
        isActive: true,
      },
      "Main Categories"
    );
  };

/*
|--------------------------------------------------------------------------
| NORMALIZE SUBCATEGORIES
|--------------------------------------------------------------------------
|
| Every parent category gets its own serial numbering.
|
| Bedsheets
|   1 Cotton
|   2 Printed
|   3 Silk
|
| Curtains
|   1 Blackout
|   2 Sheer
|
|--------------------------------------------------------------------------
*/

const normalizeSubcategories =
  async () => {
    const parents =
      await Category.find({
        parent: null,
        isActive: true,
      })
        .select("_id name")
        .lean();

    let total = 0;

    for (const parent of parents) {
      const count =
        await normalizeOrders(
          Category,
          {
            parent:
              parent._id,
            isActive: true,
          },
          `Subcategories (${parent.name})`
        );

      total += count;
    }

    return total;
  };

/*
|--------------------------------------------------------------------------
| NORMALIZE PRODUCTS
|--------------------------------------------------------------------------
|
| Every subcategory gets its own product serial numbering.
|
| Cotton Bedsheets
|   1 Product A
|   2 Product B
|   3 Product C
|
| Printed Bedsheets
|   1 Product X
|   2 Product Y
|
|--------------------------------------------------------------------------
*/

const normalizeProducts =
  async () => {
    const subcategories =
      await Category.find({
        parent: {
          $ne: null,
        },
        isActive: true,
      })
        .select("_id name")
        .lean();

    let total = 0;

    for (const subcategory of subcategories) {
      const count =
        await normalizeOrders(
          Product,
          {
            category:
              subcategory._id,
            isActive: true,
          },
          `Products (${subcategory.name})`
        );

      total += count;
    }

    return total;
  };

/*
|--------------------------------------------------------------------------
| VALIDATE PRODUCT CATEGORY RELATION
|--------------------------------------------------------------------------
|
| Products must always belong to a subcategory.
|
| If old database contains:
|
| Product
|   ↓
| Main Category
|
| script will report it.
|
|--------------------------------------------------------------------------
*/

const validateProductRelations =
  async () => {
    const products =
      await Product.find({
        isActive: true,
      })
        .populate(
          "category",
          "_id name parent"
        )
        .select(
          "_id name sku category"
        )
        .lean();

    const invalidProducts =
      [];

    for (const product of products) {
      if (
        !product.category
      ) {
        invalidProducts.push({
          id: product._id,
          name:
            product.name,
          sku:
            product.sku,
          reason:
            "Product has no category/subcategory",
        });

        continue;
      }

      /*
        Main category has:
        parent = null

        Product is NOT allowed
        directly under it.
      */
      if (
        !product.category.parent
      ) {
        invalidProducts.push({
          id: product._id,
          name:
            product.name,
          sku:
            product.sku,
          reason:
            `Product is directly attached to main category "${product.category.name}"`,
        });
      }
    }

    if (
      invalidProducts.length
    ) {
      console.log(
        "\nWARNING: Invalid product relations found:\n"
      );

      invalidProducts.forEach(
        (product) => {
          console.log(
            `- ${product.name} (${product.sku || "NO SKU"})`
          );

          console.log(
            `  ${product.reason}`
          );
        }
      );
    } else {
      console.log(
        "\nAll active products belong to valid subcategories."
      );
    }

    return invalidProducts;
  };

/*
|--------------------------------------------------------------------------
| MAIN
|--------------------------------------------------------------------------
*/

const run = async () => {
  try {
    console.log(
      "\n========================================"
    );

    console.log(
      "NHF CATALOG ORDER NORMALIZATION"
    );

    console.log(
      "========================================\n"
    );

    await connectDB();

    /*
    |--------------------------------------------------------------------------
    | 1. Main Categories
    |--------------------------------------------------------------------------
    */

    const mainCategories =
      await normalizeMainCategories();

    /*
    |--------------------------------------------------------------------------
    | 2. Subcategories
    |--------------------------------------------------------------------------
    */

    const subcategories =
      await normalizeSubcategories();

    /*
    |--------------------------------------------------------------------------
    | 3. Products
    |--------------------------------------------------------------------------
    */

    const products =
      await normalizeProducts();

    /*
    |--------------------------------------------------------------------------
    | 4. Validate Product Relations
    |--------------------------------------------------------------------------
    */

    const invalidProducts =
      await validateProductRelations();

    /*
    |--------------------------------------------------------------------------
    | SUMMARY
    |--------------------------------------------------------------------------
    */

    console.log(
      "\n========================================"
    );

    console.log(
      "NORMALIZATION COMPLETE"
    );

    console.log(
      "========================================"
    );

    console.log(
      `Main categories checked: ${mainCategories}`
    );

    console.log(
      `Subcategories checked: ${subcategories}`
    );

    console.log(
      `Products checked: ${products}`
    );

    console.log(
      `Invalid product relations: ${invalidProducts.length}`
    );

    console.log(
      "========================================\n"
    );
  } catch (error) {
    console.error(
      "\nCatalog normalization failed:"
    );

    console.error(
      error
    );

    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();