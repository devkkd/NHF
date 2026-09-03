import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

/* =========================================================
   CONFIG
========================================================= */

// Optional tax.
// Example:
// ORDER_TAX_RATE=0.03
//
// Missing / empty / 0 => no tax.
const TAX_RATE = Number(process.env.ORDER_TAX_RATE || 0);

/* =========================================================
   HELPERS
========================================================= */

const normalizeValue = (value) => {
  return String(value ?? "").trim();
};

const roundMoney = (value) => {
  return Math.round((Number(value) || 0) * 100) / 100;
};

/* =========================================================
   COLOR
========================================================= */

const validateColor = (product, selectedColor) => {
  const color = normalizeValue(selectedColor);

  if (!color) {
    return true;
  }

  if (!Array.isArray(product?.colors)) {
    return false;
  }

  return product.colors.some(
    (item) =>
      normalizeValue(item).toLowerCase() ===
      color.toLowerCase()
  );
};

/* =========================================================
   SIZE
========================================================= */

const findSelectedSize = (product, selectedSize) => {
  const sizeName = normalizeValue(selectedSize);

  if (
    !sizeName ||
    !Array.isArray(product?.sizes)
  ) {
    return null;
  }

  return (
    product.sizes.find(
      (size) =>
        normalizeValue(size?.name).toLowerCase() ===
        sizeName.toLowerCase()
    ) || null
  );
};

/* =========================================================
   PRICE
========================================================= */

const getVariantPricing = (
  product,
  selectedSize
) => {
  /* -------------------------------------------------------
     SIZE PRICE
  ------------------------------------------------------- */

  if (selectedSize) {
    const actualPrice = Number(
      selectedSize.actualPrice ?? 0
    );

    const sellingPrice = Number(
      selectedSize.sellingPrice ?? actualPrice
    );

    return {
      actualPrice: Number.isFinite(actualPrice)
        ? actualPrice
        : 0,

      sellingPrice: Number.isFinite(sellingPrice)
        ? sellingPrice
        : 0,
    };
  }

  /* -------------------------------------------------------
     PRODUCT PRICE
  ------------------------------------------------------- */

  let actualPrice = Number(
    product?.actualPrice ??
      product?.price ??
      0
  );

  let sellingPrice = Number(
    product?.sellingPrice ??
      product?.price ??
      0
  );

  if (!Number.isFinite(actualPrice)) {
    actualPrice = 0;
  }

  if (!Number.isFinite(sellingPrice)) {
    sellingPrice = 0;
  }

  return {
    actualPrice,
    sellingPrice,
  };
};

/* =========================================================
   BUILD CART ITEM SNAPSHOT
========================================================= */

const buildCartItemData = (
  product,
  {
    selectedColor = "",
    selectedColorName = "",
    selectedSize = "",
    quantity = 1,
  }
) => {
  const cleanColor = normalizeValue(
    selectedColor
  );

  const cleanColorName = normalizeValue(
    selectedColorName
  );

  const cleanSize = normalizeValue(
    selectedSize
  );

  const selectedSizeObject =
    findSelectedSize(
      product,
      cleanSize
    );

  const pricing =
    getVariantPricing(
      product,
      selectedSizeObject
    );

  const shippingCost = Number(
    product?.shippingCost ?? 0
  );

  return {
    product: product._id,

    quantity: Math.max(
      1,
      Number(quantity) || 1
    ),

    selectedColor: cleanColor,

    selectedColorName:
      cleanColorName ||
      cleanColor,

    selectedSize:
      selectedSizeObject
        ? normalizeValue(
            selectedSizeObject.name
          )
        : cleanSize,

    selectedSizeActualPrice:
      selectedSizeObject
        ? pricing.actualPrice
        : 0,

    selectedSizeSellingPrice:
      selectedSizeObject
        ? pricing.sellingPrice
        : 0,

    selectedActualPrice:
      pricing.actualPrice,

    selectedSellingPrice:
      pricing.sellingPrice,

    selectedShippingCost:
      Number.isFinite(shippingCost)
        ? roundMoney(shippingCost)
        : 0,
  };
};

/* =========================================================
   SAME VARIANT CHECK
========================================================= */

const isSameCartVariant = (
  item,
  {
    productId,
    selectedColor = "",
    selectedSize = "",
  }
) => {
  const itemProductId =
    item?.product?.toString();

  if (
    itemProductId !==
    productId?.toString()
  ) {
    return false;
  }

  const itemColor = normalizeValue(
    item?.selectedColor
  ).toLowerCase();

  const currentColor = normalizeValue(
    selectedColor
  ).toLowerCase();

  const itemSize = normalizeValue(
    item?.selectedSize
  ).toLowerCase();

  const currentSize = normalizeValue(
    selectedSize
  ).toLowerCase();

  return (
    itemColor === currentColor &&
    itemSize === currentSize
  );
};

/* =========================================================
   CART SUMMARY
========================================================= */

const calculateCartSummary = (cart) => {
  let subtotal = 0;
  let shipping = 0;
  let itemCount = 0;

  for (const item of cart?.items || []) {
    const quantity = Math.max(
      1,
      Number(item?.quantity || 1)
    );

    /*
     * Price already stored by backend
     * when cart item was created/updated.
     */
    const sellingPrice = Number(
      item?.selectedSellingPrice ??
        item?.selectedSizeSellingPrice ??
        item?.price ??
        0
    );

    /*
     * Product shipping snapshot.
     */
    const shippingCost = Number(
      item?.selectedShippingCost ?? 0
    );

    subtotal +=
      (Number.isFinite(sellingPrice)
        ? sellingPrice
        : 0) * quantity;

    shipping +=
      (Number.isFinite(shippingCost)
        ? shippingCost
        : 0) * quantity;

    itemCount += quantity;
  }

  subtotal = roundMoney(subtotal);
  shipping = roundMoney(shipping);

  /*
   * OPTIONAL TAX
   *
   * ORDER_TAX_RATE=0.03 => 3%
   * ORDER_TAX_RATE=0    => no tax
   * missing variable     => no tax
   */
  const tax = roundMoney(
    subtotal * TAX_RATE
  );

  /*
   * No frontend coupon discount is trusted here.
   * Coupon system can be added later.
   */
  const discount = 0;

  const grandTotal = roundMoney(
    Math.max(
      subtotal +
        shipping +
        tax -
        discount,
      0
    )
  );

  return {
    subtotal,
    shipping,
    tax,
    discount,
    total: grandTotal,
    grandTotal,
    itemCount,
  };
};

/* =========================================================
   POPULATED CART RESPONSE
========================================================= */

const getPopulatedCartResponse = async (
  cart
) => {
  const populatedCart =
    await Cart.findById(
      cart._id
    ).populate(
      "items.product"
    );

  const summary =
    calculateCartSummary(
      populatedCart
    );

  return {
    cart: populatedCart,
    summary,
  };
};

/* =========================================================
   ADD TO CART
========================================================= */

export const addToCart = async (
  req,
  res
) => {
  try {
    const userId = req.user._id;

    const {
      productId,
      quantity = 1,
      selectedColor = "",
      selectedColorName = "",
      selectedSize = "",
    } = req.body;

    if (!productId) {
      return res.status(400).json({
        ok: false,
        message:
          "productId is required",
      });
    }

    const product =
      await Product.findById(
        productId
      );

    if (!product) {
      return res.status(404).json({
        ok: false,
        message:
          "Product not found",
      });
    }

    /* -------------------------------------------------------
       COLOR
    ------------------------------------------------------- */

    if (
      selectedColor &&
      !validateColor(
        product,
        selectedColor
      )
    ) {
      return res.status(400).json({
        ok: false,
        message:
          "Selected colour is not available for this product.",
      });
    }

    /* -------------------------------------------------------
       SIZE
    ------------------------------------------------------- */

    const selectedSizeObject =
      findSelectedSize(
        product,
        selectedSize
      );

    if (
      selectedSize &&
      !selectedSizeObject
    ) {
      return res.status(400).json({
        ok: false,
        message:
          "Selected size is not available for this product.",
      });
    }

    /* -------------------------------------------------------
       QUANTITY
    ------------------------------------------------------- */

    const cleanQuantity =
      Number(quantity);

    if (
      !Number.isInteger(
        cleanQuantity
      ) ||
      cleanQuantity < 1
    ) {
      return res.status(400).json({
        ok: false,
        message:
          "Quantity must be at least 1.",
      });
    }

    /* -------------------------------------------------------
       GET / CREATE CART
    ------------------------------------------------------- */

    let cart =
      await Cart.findOne({
        user: userId,
      });

    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
      });
    }

    /* -------------------------------------------------------
       SAME PRODUCT + COLOR + SIZE
    ------------------------------------------------------- */

    const existingItem =
      cart.items.find(
        (item) =>
          isSameCartVariant(
            item,
            {
              productId,
              selectedColor,
              selectedSize,
            }
          )
      );

    if (existingItem) {
      existingItem.quantity +=
        cleanQuantity;

      const freshData =
        buildCartItemData(
          product,
          {
            selectedColor,
            selectedColorName,
            selectedSize,
            quantity:
              existingItem.quantity,
          }
        );

      existingItem.set(
        freshData
      );
    } else {
      const newItem =
        buildCartItemData(
          product,
          {
            selectedColor,
            selectedColorName,
            selectedSize,
            quantity:
              cleanQuantity,
          }
        );

      cart.items.push(
        newItem
      );
    }

    await cart.save();

    const result =
      await getPopulatedCartResponse(
        cart
      );

    return res.status(200).json({
      ok: true,
      message:
        "Product added to cart",
      cart: result.cart,
      summary: result.summary,
    });
  } catch (err) {
    console.error(
      "ADD TO CART ERROR:",
      err
    );

    return res.status(500).json({
      ok: false,
      message:
        err.message ||
        "Failed to add product to cart.",
    });
  }
};

/* =========================================================
   GET CART
========================================================= */

export const getCart = async (
  req,
  res
) => {
  try {
    const cart =
      await Cart.findOne({
        user: req.user._id,
      });

    /* -------------------------------------------------------
       EMPTY CART
    ------------------------------------------------------- */

    if (!cart) {
      return res.json({
        ok: true,

        cart: {
          items: [],
        },

        summary: {
          subtotal: 0,
          shipping: 0,
          tax: 0,
          discount: 0,
          total: 0,
          grandTotal: 0,
          itemCount: 0,
        },
      });
    }

    const result =
      await getPopulatedCartResponse(
        cart
      );

    return res.json({
      ok: true,
      cart: result.cart,
      summary: result.summary,
    });
  } catch (err) {
    console.error(
      "GET CART ERROR:",
      err
    );

    return res.status(500).json({
      ok: false,
      message:
        err.message ||
        "Failed to get cart.",
    });
  }
};

/* =========================================================
   UPDATE CART QUANTITY
========================================================= */

export const updateCart = async (
  req,
  res
) => {
  try {
    const {
      productId,
      quantity,
      selectedColor = "",
      selectedSize = "",
    } = req.body;

    if (!productId) {
      return res.status(400).json({
        ok: false,
        message:
          "productId is required",
      });
    }

    const nextQuantity =
      Number(quantity);

    if (
      !Number.isInteger(
        nextQuantity
      )
    ) {
      return res.status(400).json({
        ok: false,
        message:
          "Quantity must be a valid number.",
      });
    }

    const cart =
      await Cart.findOne({
        user: req.user._id,
      });

    if (!cart) {
      return res.status(404).json({
        ok: false,
        message:
          "Cart not found",
      });
    }

    let itemIndex = -1;

    /* -------------------------------------------------------
       EXACT VARIANT
    ------------------------------------------------------- */

    if (
      selectedColor ||
      selectedSize
    ) {
      itemIndex =
        cart.items.findIndex(
          (item) =>
            isSameCartVariant(
              item,
              {
                productId,
                selectedColor,
                selectedSize,
              }
            )
        );
    }

    /* -------------------------------------------------------
       BACKWARD COMPATIBILITY
    ------------------------------------------------------- */

    if (itemIndex === -1) {
      itemIndex =
        cart.items.findIndex(
          (item) =>
            item.product?.toString() ===
            productId
        );
    }

    if (itemIndex === -1) {
      return res.status(404).json({
        ok: false,
        message:
          "Item not found",
      });
    }

    /* -------------------------------------------------------
       REMOVE
    ------------------------------------------------------- */

    if (nextQuantity <= 0) {
      cart.items.splice(
        itemIndex,
        1
      );
    } else {
      const item =
        cart.items[itemIndex];

      const product =
        await Product.findById(
          productId
        );

      if (!product) {
        return res.status(404).json({
          ok: false,
          message:
            "Product not found",
        });
      }

      const freshData =
        buildCartItemData(
          product,
          {
            selectedColor:
              item.selectedColor,

            selectedColorName:
              item.selectedColorName,

            selectedSize:
              item.selectedSize,

            quantity:
              nextQuantity,
          }
        );

      item.quantity =
        nextQuantity;

      item.selectedActualPrice =
        freshData.selectedActualPrice;

      item.selectedSellingPrice =
        freshData.selectedSellingPrice;

      item.selectedSizeActualPrice =
        freshData.selectedSizeActualPrice;

      item.selectedSizeSellingPrice =
        freshData.selectedSizeSellingPrice;

      item.selectedShippingCost =
        freshData.selectedShippingCost;
    }

    await cart.save();

    const result =
      await getPopulatedCartResponse(
        cart
      );

    return res.json({
      ok: true,
      message:
        "Cart updated successfully.",
      cart: result.cart,
      summary: result.summary,
    });
  } catch (err) {
    console.error(
      "UPDATE CART ERROR:",
      err
    );

    return res.status(500).json({
      ok: false,
      message:
        err.message ||
        "Failed to update cart.",
    });
  }
};

/* =========================================================
   UPDATE CART VARIANT
========================================================= */

export const updateCartVariant =
  async (req, res) => {
    try {
      const {
        productId,
        currentColor = "",
        currentSize = "",
        selectedColor = "",
        selectedColorName = "",
        selectedSize = "",
      } = req.body;

      if (!productId) {
        return res.status(400).json({
          ok: false,
          message:
            "productId is required",
        });
      }

      const cart =
        await Cart.findOne({
          user: req.user._id,
        });

      if (!cart) {
        return res.status(404).json({
          ok: false,
          message:
            "Cart not found",
        });
      }

      const product =
        await Product.findById(
          productId
        );

      if (!product) {
        return res.status(404).json({
          ok: false,
          message:
            "Product not found",
        });
      }

      /* -------------------------------------------------------
         COLOR
      ------------------------------------------------------- */

      if (
        selectedColor &&
        !validateColor(
          product,
          selectedColor
        )
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "Selected colour is not available.",
        });
      }

      /* -------------------------------------------------------
         SIZE
      ------------------------------------------------------- */

      if (
        selectedSize &&
        !findSelectedSize(
          product,
          selectedSize
        )
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "Selected size is not available.",
        });
      }

      /* -------------------------------------------------------
         CURRENT ITEM
      ------------------------------------------------------- */

      const currentIndex =
        cart.items.findIndex(
          (item) =>
            isSameCartVariant(
              item,
              {
                productId,
                selectedColor:
                  currentColor,

                selectedSize:
                  currentSize,
              }
            )
        );

      if (
        currentIndex === -1
      ) {
        return res.status(404).json({
          ok: false,
          message:
            "Current cart variant not found.",
        });
      }

      const currentItem =
        cart.items[currentIndex];

      const existingQuantity =
        Number(
          currentItem.quantity || 1
        );

      /* -------------------------------------------------------
         DUPLICATE NEW VARIANT
      ------------------------------------------------------- */

      const duplicateIndex =
        cart.items.findIndex(
          (item, index) =>
            index !== currentIndex &&
            isSameCartVariant(
              item,
              {
                productId,
                selectedColor,
                selectedSize,
              }
            )
        );

      if (
        duplicateIndex !== -1
      ) {
        cart.items[
          duplicateIndex
        ].quantity +=
          existingQuantity;

        cart.items.splice(
          currentIndex,
          1
        );
      } else {
        const freshData =
          buildCartItemData(
            product,
            {
              selectedColor,
              selectedColorName,
              selectedSize,
              quantity:
                existingQuantity,
            }
          );

        currentItem.set(
          freshData
        );
      }

      await cart.save();

      const result =
        await getPopulatedCartResponse(
          cart
        );

      return res.json({
        ok: true,
        message:
          "Cart variant updated successfully.",
        cart: result.cart,
        summary: result.summary,
      });
    } catch (err) {
      console.error(
        "UPDATE CART VARIANT ERROR:",
        err
      );

      return res.status(500).json({
        ok: false,
        message:
          err.message ||
          "Failed to update cart variant.",
      });
    }
  };

/* =========================================================
   REMOVE ITEM
========================================================= */

export const removeCartItem =
  async (req, res) => {
    try {
      const {
        productId,
        selectedColor = "",
        selectedSize = "",
      } = req.body;

      if (!productId) {
        return res.status(400).json({
          ok: false,
          message:
            "productId is required",
        });
      }

      const cart =
        await Cart.findOne({
          user: req.user._id,
        });

      if (!cart) {
        return res.status(404).json({
          ok: false,
          message:
            "Cart not found",
        });
      }

      let itemIndex = -1;

      /* -------------------------------------------------------
         EXACT VARIANT
      ------------------------------------------------------- */

      if (
        selectedColor ||
        selectedSize
      ) {
        itemIndex =
          cart.items.findIndex(
            (item) =>
              isSameCartVariant(
                item,
                {
                  productId,
                  selectedColor,
                  selectedSize,
                }
              )
          );
      }

      /* -------------------------------------------------------
         BACKWARD COMPATIBILITY
      ------------------------------------------------------- */

      if (itemIndex === -1) {
        itemIndex =
          cart.items.findIndex(
            (item) =>
              item.product?.toString() ===
              productId
          );
      }

      if (itemIndex === -1) {
        return res.status(404).json({
          ok: false,
          message:
            "Item not found",
        });
      }

      cart.items.splice(
        itemIndex,
        1
      );

      await cart.save();

      const result =
        await getPopulatedCartResponse(
          cart
        );

      return res.json({
        ok: true,
        message:
          "Item removed from cart.",
        cart: result.cart,
        summary: result.summary,
      });
    } catch (err) {
      console.error(
        "REMOVE CART ITEM ERROR:",
        err
      );

      return res.status(500).json({
        ok: false,
        message:
          err.message ||
          "Failed to remove cart item.",
      });
    }
  };