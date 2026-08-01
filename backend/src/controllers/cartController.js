import Cart from "../models/Cart.js";
import Product from "../models/Product.js";


// ========================
// ADD TO CART
// ========================
export const addToCart = async (req, res) => {
  try {
   
const userId = req.user._id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        ok: false,
        message: "productId is required",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: "Product not found",
      });
    }
let cart = await Cart.findOne({ user: userId });

    if (!cart) {
     cart = new Cart({
  user: userId,
  items: [],
});
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({
        product: productId,
        quantity: Number(quantity),
      });
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate("items.product");

    res.json({
      ok: true,
      message: "Product added to cart",
      cart: populatedCart,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
};

// ========================
// GET CART
// ========================
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
  user: req.user._id,
}).populate("items.product");

    res.json({
      ok: true,
      cart: cart || { items: [] },
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
};

// ========================
// UPDATE CART
// ========================
export const updateCart = async (req, res) => {
  try {
const cart = await Cart.findOne({
  user: req.user._id,
});

    const { productId, quantity } = req.body;


    if (!cart) {
      return res.status(404).json({
        ok: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (i) => i.product.toString() === productId
    );

    if (!item) {
      return res.status(404).json({
        ok: false,
        message: "Item not found",
      });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(
        (i) => i.product.toString() !== productId
      );
    } else {
      item.quantity = Number(quantity);
    }

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate("items.product");

    res.json({
      ok: true,
      cart: populatedCart,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
};

// ========================
// REMOVE ITEM
// ========================
export const removeCartItem = async (req, res) => {
  try {
const cart = await Cart.findOne({
  user: req.user._id,
});

    const { productId } = req.body;



    if (!cart) {
      return res.status(404).json({
        ok: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (i) => i.product.toString() !== productId
    );

    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate("items.product");

    res.json({
      ok: true,
      cart: populatedCart,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
};