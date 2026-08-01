import Order from "../models/Order.js";
import { createRazorpayOrder } from "../services/razorpayService.js";
import crypto from "crypto";
import Cart from "../models/Cart.js";
import { createShiprocketOrder } from "../services/shiprocketService.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

export const createPaymentOrder = async (req, res) => {
  try {
    const {
  addressId,
  paymentMethod = "razorpay",
  couponCode = "",
} = req.body;

    if (!items?.length) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }
    const user = await User.findById(req.user._id);

const selectedAddress = user.addresses.id(addressId);

if (!selectedAddress) {
  return res.status(404).json({
    success: false,
    message: "Address not found",
  });
}

    if (!address) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }
    const cart = await Cart.findOne({
  user: req.user._id,
}).populate("items.product");

    const order = await Order.create({
      user: req.user._id,

    items: orderItems,
     address: selectedAddress.toObject(),

      subtotal,
      shipping,
      tax,
      discount,
      total,

      couponCode,

      paymentMethod,

      paymentStatus: "pending",
      orderStatus: "pending",
    });

    const razorpayOrder = await createRazorpayOrder({
      amount: total,
      receipt: order._id.toString(),
      notes: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    order.razorpayOrderId = razorpayOrder.id;

    await order.save();

    return res.status(201).json({
      success: true,

      message: "Payment order created",

      orderId: order._id,

      razorpay: {
        key: process.env.RAZORPAY_KEY_ID,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const verifyPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      order.paymentStatus = "failed";

      await order.save();

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";

    order.paymentDate = new Date();

    order.transactionId = razorpay_payment_id;

    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;

    await order.save();

    /* ---------------- Shiprocket ---------------- */

    try {
      await createShiprocketOrder(order);
    } catch (err) {
      console.log("Shiprocket Error:", err.message);
    }

    /* ---------------- Clear Cart ---------------- */

   const cart = await Cart.findOne({
  user: order.user,
});

if (cart) {
  cart.items = [];
  await cart.save();
}

    return res.json({
      success: true,
      message: "Payment Verified Successfully",
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};