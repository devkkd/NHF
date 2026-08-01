import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Razorpay from "razorpay";
import crypto from "crypto";

import {
  createShiprocketOrder,
  getTrackingDetails,
} from "../services/shiprocketService.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* =======================================================
   CREATE ORDER
======================================================= */

export const createOrder = async (req, res) => {
  try {
    const { addressId, paymentMethod = "razorpay" } = req.body;

    if (!["razorpay", "cod"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method.",
      });
    }

    const cart = await Cart.findOne({
      user: req.user._id,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty.",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    const items = [];
    let subtotal = 0;

    for (const item of cart.items) {
      if (!item.product) {
        return res.status(400).json({
          success: false,
          message: "Product not found.",
        });
      }

      items.push({
        product: item.product._id,
        name: item.product.name,
        image: item.product.mainImage,
        price: item.product.price,
        quantity: item.quantity,
      });

      subtotal += item.product.price * item.quantity;
    }

    const shipping = 0;
    const tax = 0;
    const discount = 0;
    const couponCode = "";

    const total = subtotal + shipping + tax - discount;

    const order = await Order.create({
      user: req.user._id,

      items,

      address: {
  ...address.toObject(),
  email: user.email,
},

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

    return res.status(201).json({
      success: true,
      message: "Order created successfully.",
      order,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/* =======================================================
   CREATE RAZORPAY ORDER
======================================================= */

export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required.",
      });
    }

    const dbOrder = await Order.findById(orderId);

    if (!dbOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (dbOrder.paymentStatus === "paid") {
      return res.status(400).json({
        success: false,
        message: "Order is already paid.",
      });
    }

    const options = {
      amount: Math.round(dbOrder.total * 100), // Razorpay accepts paise
      currency: "INR",
      receipt: dbOrder._id.toString(),
      notes: {
        orderId: dbOrder._id.toString(),
        userId: req.user._id.toString(),
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    dbOrder.razorpayOrderId = razorpayOrder.id;

    await dbOrder.save();

    return res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,

      orderId: dbOrder._id,

      order: razorpayOrder,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to create Razorpay order.",
    });
  }
};
/* =======================================================
   VERIFY PAYMENT
======================================================= */

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment details are missing.",
      });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      const failedOrder = await Order.findOne({
        razorpayOrderId: razorpay_order_id,
      });

      if (failedOrder) {
        failedOrder.paymentStatus = "failed";
        await failedOrder.save();
      }

      return res.status(400).json({
        success: false,
        message: "Payment verification failed.",
      });
    }

    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    if (order.paymentStatus === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified.",
        order,
      });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";

    order.paymentDate = new Date();

    order.transactionId = razorpay_payment_id;

    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;

    await order.save();

    /* ==========================
       CLEAR CART
    ========================== */

    const cart = await Cart.findOne({
      user: order.user,
    });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

   /* ==========================
   SHIPROCKET
========================== */

try {
  console.log("🚀 Calling Shiprocket...");

  await createShiprocketOrder(order);

  console.log("✅ Shiprocket Completed");
} catch (err) {
  console.log("❌ Shiprocket Error:", err.message);
}

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully.",
      order,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Verification failed.",
    });
  }
};
export const trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!order.awbCode) {
      return res.status(400).json({
        success: false,
        message: "Tracking not available yet",
      });
    }

    const tracking = await getTrackingDetails(order.awbCode);

    order.trackingUrl =
      tracking?.tracking_data?.track_url || "";

    await order.save();

    res.json({
      success: true,
      tracking,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
/* =======================================================
   GET MY ORDERS
======================================================= */

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email mobile")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =======================================================
   GET SINGLE ORDER
======================================================= */

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const getAdminOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email mobile");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.orderStatus = orderStatus;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};