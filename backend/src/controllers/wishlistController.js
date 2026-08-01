import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

// ==========================
// GET WISHLIST
// ==========================
export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    }).populate("items.product");

    return res.json({
      ok: true,
      wishlist: wishlist || { items: [] },
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
};

// ==========================
// ADD TO WISHLIST
// ==========================
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        ok: false,
        message: "Product not found",
      });
    }

    let wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user._id,
        items: [],
      });
    }

    const exists = wishlist.items.find(
      (item) => item.product.toString() === productId
    );

    if (!exists) {
      wishlist.items.push({
        product: productId,
      });
    }

    await wishlist.save();

    const populated = await Wishlist.findById(wishlist._id)
      .populate("items.product");

    res.json({
      ok: true,
      wishlist: populated,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
};

// ==========================
// REMOVE FROM WISHLIST
// ==========================
export const removeWishlistItem = async (req, res) => {
  try {
    const { productId } = req.body;

    const wishlist = await Wishlist.findOne({
      user: req.user._id,
    });

    if (!wishlist) {
      return res.status(404).json({
        ok: false,
        message: "Wishlist not found",
      });
    }

    wishlist.items = wishlist.items.filter(
      (item) => item.product.toString() !== productId
    );

    await wishlist.save();

    const populated = await Wishlist.findById(wishlist._id)
      .populate("items.product");

    res.json({
      ok: true,
      wishlist: populated,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
};