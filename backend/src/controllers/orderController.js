import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import User from "../models/User.js";
import Razorpay from "razorpay";
import crypto from "crypto";

import {
  getTrackingDetails,
} from "../services/shiprocketService.js";

/* =========================================================
   CONFIG
========================================================= */

/*
 * .env
 *
 * ORDER_TAX_RATE=0.03
 *
 * Missing / 0 => no tax
 */
const TAX_RATE = Number(
  process.env.ORDER_TAX_RATE || 0
);

/* =========================================================
   RAZORPAY
========================================================= */

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* =========================================================
   HELPERS
========================================================= */

const roundMoney = (value) => {
  return Math.round(
    (Number(value) || 0) * 100
  ) / 100;
};

const normalizeString = (value) => {
  return String(value || "").trim();
};

const normalizeLower = (value) => {
  return normalizeString(value).toLowerCase();
};

const isValidObjectId = (value) => {
  return /^[a-f\d]{24}$/i.test(
    String(value || "")
  );
};

/* =========================================================
   PRODUCT PRICE
========================================================= */

const getProductPricing = (
  product,
  selectedSize = ""
) => {
  const requestedSize = normalizeString(
    selectedSize
  );

  /* -------------------------------------------------------
     SIZE PRICE
  ------------------------------------------------------- */

  if (requestedSize) {
    const size = Array.isArray(product?.sizes)
      ? product.sizes.find(
          (item) =>
            normalizeLower(item?.name) ===
            normalizeLower(requestedSize)
        )
      : null;

    if (!size) {
      throw new Error(
        `Selected size "${requestedSize}" is not available for ${product.name}.`
      );
    }

    const actualPrice = roundMoney(
      size.actualPrice
    );

    const sellingPrice = roundMoney(
      size.sellingPrice
    );

    return {
      actualPrice,
      sellingPrice,
      selectedSize: size.name,
    };
  }

  /* -------------------------------------------------------
     NORMAL PRODUCT PRICE
  ------------------------------------------------------- */

  let actualPrice = Number(
    product?.actualPrice || 0
  );

  let sellingPrice = Number(
    product?.sellingPrice || 0
  );

  /* BACKWARD COMPATIBILITY */

  if (sellingPrice <= 0) {
    sellingPrice = Number(
      product?.price || 0
    );
  }

  if (actualPrice <= 0) {
    actualPrice = Number(
      product?.price ||
        sellingPrice ||
        0
    );
  }

  return {
    actualPrice: roundMoney(
      actualPrice
    ),

    sellingPrice: roundMoney(
      sellingPrice
    ),

    selectedSize: "",
  };
};

/* =========================================================
   COLOR
========================================================= */

const getSelectedColor = (
  product,
  selectedColor,
  selectedColorName
) => {
  const color = normalizeString(
    selectedColor
  );

  const colorName = normalizeString(
    selectedColorName
  );

  if (!color && !colorName) {
    return {
      selectedColor: "",
      selectedColorName: "",
    };
  }

  const productColors = Array.isArray(
    product?.colors
  )
    ? product.colors.map((item) =>
        normalizeString(item)
      )
    : [];

  if (productColors.length > 0) {
    const requested =
      colorName || color;

    const matchedColor =
      productColors.find(
        (item) =>
          normalizeLower(item) ===
          normalizeLower(requested)
      );

    if (!matchedColor) {
      throw new Error(
        `Selected color "${requested}" is not available for ${product.name}.`
      );
    }

    return {
      selectedColor:
        color || matchedColor,

      selectedColorName:
        colorName || matchedColor,
    };
  }

  return {
    selectedColor: color,

    selectedColorName:
      colorName || color,
  };
};

/* =========================================================
   BUILD ORDER ITEMS
========================================================= */

const buildOrderItems = (cart) => {
  const items = [];

  let subtotal = 0;
  let shipping = 0;

  for (const cartItem of cart.items) {
    if (!cartItem.product) {
      throw new Error(
        "A product in your cart is no longer available."
      );
    }

    const product = cartItem.product;

    if (product.isActive === false) {
      throw new Error(
        `${product.name} is no longer available.`
      );
    }

    const quantity = Number(
      cartItem.quantity || 1
    );

    if (
      !Number.isInteger(quantity) ||
      quantity < 1
    ) {
      throw new Error(
        `Invalid quantity for ${product.name}.`
      );
    }

    /* -------------------------------------------------------
       PRICE
    ------------------------------------------------------- */

    const pricing =
      getProductPricing(
        product,
        cartItem.selectedSize
      );

    /* -------------------------------------------------------
       COLOR
    ------------------------------------------------------- */

    const color =
      getSelectedColor(
        product,
        cartItem.selectedColor,
        cartItem.selectedColorName
      );

    /* -------------------------------------------------------
       SHIPPING
       PRODUCT LEVEL ONLY
    ------------------------------------------------------- */

    const itemShippingCost =
      roundMoney(
        cartItem.selectedShippingCost ??
          product.shippingCost ??
          0
      );

    const lineSubtotal =
      roundMoney(
        pricing.sellingPrice *
          quantity
      );

    const lineShipping =
      roundMoney(
        itemShippingCost *
          quantity
      );

    subtotal += lineSubtotal;
    shipping += lineShipping;

    items.push({
      product: product._id,

      name: product.name,

      image:
        product.mainImage || "",

      price:
        pricing.sellingPrice,

      actualPrice:
        pricing.actualPrice,

      quantity,

      selectedColor:
        color.selectedColor,

      selectedColorName:
        color.selectedColorName,

      selectedSize:
        pricing.selectedSize,

      shippingCost:
        itemShippingCost,
    });
  }

  return {
    items,

    subtotal:
      roundMoney(subtotal),

    shipping:
      roundMoney(shipping),
  };
};

/* =========================================================
   COUPON
========================================================= */

const calculateCouponDiscount = async ({
  couponCode,
}) => {
  const normalizedCode =
    normalizeString(
      couponCode
    ).toUpperCase();

  if (!normalizedCode) {
    return {
      couponCode: "",
      discount: 0,
    };
  }

  /*
   * Coupon system abhi connected nahi hai.
   *
   * Frontend discount ko trust nahi karna.
   */

  return {
    couponCode: normalizedCode,
    discount: 0,
  };
};

/* =========================================================
   FINAL TOTALS
========================================================= */

const calculateTotals = ({
  subtotal,
  shipping,
  couponDiscount = 0,
}) => {
  const safeSubtotal =
    roundMoney(subtotal);

  const safeShipping =
    roundMoney(shipping);

  /*
   * TAX IS CALCULATED ON SUBTOTAL.
   */

  const tax =
    roundMoney(
      safeSubtotal *
        TAX_RATE
    );

  const discount =
    Math.min(
      roundMoney(
        couponDiscount
      ),

      safeSubtotal +
        safeShipping +
        tax
    );

  const total =
    Math.max(
      roundMoney(
        safeSubtotal +
          safeShipping +
          tax -
          discount
      ),
      0
    );

  return {
    subtotal:
      safeSubtotal,

    shipping:
      safeShipping,

    tax,

    discount,

    total,
  };
};

/* =========================================================
   CREATE ORDER
========================================================= */

export const createOrder = async (
  req,
  res
) => {
  try {
    const {
      addressId,
      paymentMethod = "razorpay",
      couponCode = "",
    } = req.body || {};

    /* -------------------------------------------------------
       PAYMENT METHOD
    ------------------------------------------------------- */

    if (
      ![
        "razorpay",
        "cod",
      ].includes(
        paymentMethod
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment method.",
      });
    }

    /* -------------------------------------------------------
       CART
    ------------------------------------------------------- */

    const cart =
      await Cart.findOne({
        user: req.user._id,
      }).populate(
        "items.product"
      );

    if (
      !cart ||
      !Array.isArray(
        cart.items
      ) ||
      cart.items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cart is empty.",
      });
    }

    /* -------------------------------------------------------
       USER
    ------------------------------------------------------- */

    const user =
      await User.findById(
        req.user._id
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }

    /* -------------------------------------------------------
       ADDRESS
    ------------------------------------------------------- */

    if (!addressId) {
      return res.status(400).json({
        success: false,
        message:
          "Address is required.",
      });
    }

    const address =
      user.addresses?.id(
        addressId
      );

    if (!address) {
      return res.status(404).json({
        success: false,
        message:
          "Address not found.",
      });
    }

    /* -------------------------------------------------------
       BUILD ITEMS
    ------------------------------------------------------- */

    const {
      items,
      subtotal,
      shipping,
    } =
      buildOrderItems(
        cart
      );

    /* -------------------------------------------------------
       COUPON
    ------------------------------------------------------- */

    const couponResult =
      await calculateCouponDiscount({
        couponCode,
      });

    /* -------------------------------------------------------
       TOTALS
    ------------------------------------------------------- */

    const totals =
      calculateTotals({
        subtotal,
        shipping,
        couponDiscount:
          couponResult.discount,
      });

    /* -------------------------------------------------------
       ADDRESS SNAPSHOT
    ------------------------------------------------------- */

    const addressObject =
      address.toObject
        ? address.toObject()
        : address;

    const orderAddress = {
      firstName:
        addressObject.firstName ||
        "",

      lastName:
        addressObject.lastName ||
        "",

      address1:
        addressObject.address1 ||
        "",

      address2:
        addressObject.address2 ||
        "",

      city:
        addressObject.city ||
        "",

      state:
        addressObject.state ||
        "",

      country:
        addressObject.country ||
        "",

      pin:
        addressObject.pin ||
        "",

      mobile:
        addressObject.mobile ||
        "",

      email:
        user.email ||
        "",
    };

    /* -------------------------------------------------------
       CREATE ORDER

       VERY IMPORTANT:
       New order ALWAYS starts as pending.
       Shiprocket is NOT called here.
       Admin approval is required.
    ------------------------------------------------------- */

    const order =
      await Order.create({
        user:
          req.user._id,

        items,

        address:
          orderAddress,

        subtotal:
          totals.subtotal,

        shipping:
          totals.shipping,

        tax:
          totals.tax,

        discount:
          totals.discount,

        total:
          totals.total,

        couponCode:
          couponResult.couponCode,

        paymentMethod,

        paymentStatus:
          "pending",

        orderStatus:
          "pending",

        adminApproval: {
          status: "pending",
        },
      });

    /* -------------------------------------------------------
       COD

       COD payment remains pending.
       Order remains pending.
       Admin must approve it.
    ------------------------------------------------------- */

    if (
      paymentMethod ===
      "cod"
    ) {
      /*
       * Cart can be cleared after order creation.
       *
       * No Shiprocket call here.
       */

      cart.items = [];

      await cart.save();
    }

    return res.status(201).json({
      success: true,

      message:
        paymentMethod ===
        "cod"
          ? "Order placed successfully. Your order is pending admin approval."
          : "Order created successfully. Complete your payment.",

      order,

      pricing: {
        subtotal:
          totals.subtotal,

        shipping:
          totals.shipping,

        tax:
          totals.tax,

        discount:
          totals.discount,

        total:
          totals.total,
      },
    });
  } catch (error) {
    console.error(
      "CREATE ORDER ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Unable to create order.",
    });
  }
};

/* =========================================================
   CREATE RAZORPAY ORDER
========================================================= */

export const createRazorpayOrder =
  async (
    req,
    res
  ) => {
    try {
      const {
        orderId,
      } =
        req.body || {};

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message:
            "Order ID is required.",
        });
      }

      const dbOrder =
        await Order.findOne({
          _id: orderId,
          user:
            req.user._id,
        });

      if (!dbOrder) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      if (
        dbOrder.paymentMethod !==
        "razorpay"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This order does not use Razorpay.",
        });
      }

      if (
        dbOrder.paymentStatus ===
        "paid"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Order is already paid.",
        });
      }

      if (
        dbOrder.orderStatus ===
        "cancelled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cancelled order cannot be paid.",
        });
      }

      const totalAmount =
        roundMoney(
          dbOrder.total
        );

      if (
        totalAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order amount.",
        });
      }

      /* -------------------------------------------------------
         RAZORPAY ORDER
      ------------------------------------------------------- */

      const razorpayOrder =
        await razorpay.orders.create({
          amount:
            Math.round(
              totalAmount * 100
            ),

          currency:
            "INR",

          receipt:
            `order_${dbOrder._id.toString()}`,

          notes: {
            orderId:
              dbOrder._id.toString(),

            userId:
              req.user._id.toString(),
          },
        });

      dbOrder.razorpayOrderId =
        razorpayOrder.id;

      await dbOrder.save();

      return res.status(200).json({
        success: true,

        key:
          process.env
            .RAZORPAY_KEY_ID,

        orderId:
          dbOrder._id,

        amount:
          totalAmount,

        currency:
          "INR",

        order:
          razorpayOrder,
      });
    } catch (error) {
      console.error(
        "CREATE RAZORPAY ORDER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to create Razorpay order.",
      });
    }
  };

/* =========================================================
   VERIFY PAYMENT
========================================================= */

export const verifyPayment =
  async (
    req,
    res
  ) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } =
        req.body || {};

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Payment details are missing.",
        });
      }

      /* -------------------------------------------------------
         FIND USER ORDER
      ------------------------------------------------------- */

      const order =
        await Order.findOne({
          razorpayOrderId:
            razorpay_order_id,

          user:
            req.user._id,
        });

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      /* -------------------------------------------------------
         ALREADY PAID
      ------------------------------------------------------- */

      if (
        order.paymentStatus ===
        "paid"
      ) {
        return res.status(200).json({
          success: true,

          message:
            "Payment already verified.",

          order,
        });
      }

      /* -------------------------------------------------------
         SIGNATURE
      ------------------------------------------------------- */

      const body =
        `${razorpay_order_id}|${razorpay_payment_id}`;

      const expectedSignature =
        crypto
          .createHmac(
            "sha256",
            process.env
              .RAZORPAY_KEY_SECRET
          )
          .update(body)
          .digest("hex");

      let signaturesMatch =
        false;

      try {
        signaturesMatch =
          crypto.timingSafeEqual(
            Buffer.from(
              expectedSignature,
              "utf8"
            ),

            Buffer.from(
              razorpay_signature,
              "utf8"
            )
          );
      } catch {
        signaturesMatch =
          false;
      }

      if (
        !signaturesMatch
      ) {
        order.paymentStatus =
          "failed";

        await order.save();

        return res.status(400).json({
          success: false,
          message:
            "Payment verification failed.",
        });
      }

      /* -------------------------------------------------------
         MARK PAYMENT PAID

         IMPORTANT:
         Payment success does NOT confirm the order.
         Admin approval is still required.
      ------------------------------------------------------- */

      order.paymentStatus =
        "paid";

      order.paymentDate =
        new Date();

      order.transactionId =
        razorpay_payment_id;

      order.razorpayPaymentId =
        razorpay_payment_id;

      order.razorpaySignature =
        razorpay_signature;

      /*
       * DO NOT:
       *
       * order.orderStatus = "confirmed"
       *
       * because admin still has to approve.
       */

      if (
        !order.adminApproval
      ) {
        order.adminApproval = {
          status: "pending",
        };
      }

      if (
        order.adminApproval.status !==
        "approved"
      ) {
        order.orderStatus =
          "pending";
      }

      await order.save();

      /* -------------------------------------------------------
         CLEAR CART
      ------------------------------------------------------- */

      const cart =
        await Cart.findOne({
          user:
            order.user,
        });

      if (cart) {
        cart.items = [];

        await cart.save();
      }

      /*
       * IMPORTANT:
       *
       * Shiprocket is NOT called here.
       *
       * Admin approval controller will call Shiprocket.
       */

      return res.status(200).json({
        success: true,

        message:
          "Payment verified successfully. Order is pending admin approval.",

        order,
      });
    } catch (error) {
      console.error(
        "VERIFY PAYMENT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Verification failed.",
      });
    }
  };

/* =========================================================
   TRACK ORDER
========================================================= */

export const trackOrder =
  async (
    req,
    res
  ) => {
    try {
      /*
       * User can track only their own order.
       */

      const order =
        await Order.findOne({
          _id:
            req.params.id,

          user:
            req.user._id,
        });

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      /*
       * Support both:
       *
       * new:
       * order.shiprocket.awbCode
       *
       * old:
       * order.awbCode
       */

      const awbCode =
        order.shiprocket?.awbCode ||
        order.awbCode ||
        "";

      if (!awbCode) {
        return res.status(400).json({
          success: false,
          message:
            "Tracking not available yet.",
        });
      }

      /* -------------------------------------------------------
         SHIPROCKET TRACKING
      ------------------------------------------------------- */

      const tracking =
        await getTrackingDetails(
          awbCode
        );

      const trackingData =
        tracking?.tracking_data ||
        {};

      const currentStatus =
        normalizeLower(
          trackingData?.shipment_status ||
          trackingData?.status ||
          trackingData?.track_status ||
          ""
        );

      const trackingUrl =
        trackingData?.track_url ||
        trackingData?.tracking_url ||
        "";

      /* -------------------------------------------------------
         UPDATE SHIPROCKET SNAPSHOT
      ------------------------------------------------------- */

      if (
        !order.shiprocket
      ) {
        order.shiprocket = {};
      }

      order.shiprocket.awbCode =
        awbCode;

      order.shiprocket.trackingUrl =
        trackingUrl;

      order.shiprocket.status =
        trackingData?.shipment_status ||
        trackingData?.status ||
        "";

      order.shiprocket.lastSyncedAt =
        new Date();

      /* -------------------------------------------------------
         BACKWARD-COMPATIBLE FIELDS
      ------------------------------------------------------- */

      order.awbCode =
        awbCode;

      order.trackingUrl =
        trackingUrl;

      /* -------------------------------------------------------
         MAP SHIPROCKET → LOCAL STATUS
      ------------------------------------------------------- */

      const now = new Date();

      if (
        [
          "delivered",
          "delivery",
          "delivered successfully",
        ].some(
          (status) =>
            currentStatus.includes(
              status
            )
        )
      ) {
        if (
          order.orderStatus !==
          "returned" &&
          order.orderStatus !==
          "cancelled"
        ) {
          order.orderStatus =
            "delivered";
        }

        if (
          !order.deliveredAt
        ) {
          order.deliveredAt =
            now;
        }

        order.shiprocket.deliveredAt =
          order.shiprocket
            .deliveredAt ||
          now;
      } else if (
        [
          "out for delivery",
          "out_for_delivery",
        ].some(
          (status) =>
            currentStatus.includes(
              status
            )
        )
      ) {
        if (
          order.orderStatus !==
          "cancelled"
        ) {
          order.orderStatus =
            "out_for_delivery";
        }

        order.outForDeliveryAt =
          order.outForDeliveryAt ||
          now;
      } else if (
        [
          "shipped",
          "in transit",
          "in_transit",
          "dispatched",
        ].some(
          (status) =>
            currentStatus.includes(
              status
            )
        )
      ) {
        if (
          order.orderStatus !==
          "cancelled"
        ) {
          order.orderStatus =
            "shipped";
        }

        order.shippedAt =
          order.shippedAt ||
          now;

        order.shiprocket.shippedAt =
          order.shiprocket
            .shippedAt ||
          now;
      } else if (
        [
          "picked up",
          "picked_up",
          "pickup",
        ].some(
          (status) =>
            currentStatus.includes(
              status
            )
        )
      ) {
        if (
          order.orderStatus !==
          "cancelled"
        ) {
          order.orderStatus =
            "processing";
        }

        order.shiprocket.pickedUpAt =
          order.shiprocket
            .pickedUpAt ||
          now;
      }

      await order.save();

      return res.status(200).json({
        success: true,

        tracking,

        order,
      });
    } catch (error) {
      console.error(
        "TRACK ORDER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to track order.",
      });
    }
  };

/* =========================================================
   GET MY ORDERS
========================================================= */

export const getMyOrders =
  async (
    req,
    res
  ) => {
    try {
      const orders =
        await Order.find({
          user:
            req.user._id,
        }).sort({
          createdAt:
            -1,
        });

      return res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      console.error(
        "GET MY ORDERS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to get orders.",
      });
    }
  };

/* =========================================================
   GET SINGLE USER ORDER
========================================================= */

export const getOrderById =
  async (
    req,
    res
  ) => {
    try {
      const order =
        await Order.findOne({
          _id:
            req.params.id,

          user:
            req.user._id,
        });

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      return res.status(200).json({
        success: true,
        order,
      });
    } catch (error) {
      console.error(
        "GET ORDER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to get order.",
      });
    }
  };

/* =========================================================
   ADMIN - ALL ORDERS
========================================================= */

export const getAllOrders =
  async (
    req,
    res
  ) => {
    try {
      const orders =
        await Order.find()
          .populate(
            "user",
            "name email phone mobile"
          )
          .sort({
            createdAt:
              -1,
          });

      return res.status(200).json({
        success: true,
        orders,
      });
    } catch (error) {
      console.error(
        "GET ALL ORDERS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to get orders.",
      });
    }
  };

/* =========================================================
   ADMIN - SINGLE ORDER
========================================================= */

export const getAdminOrderById =
  async (
    req,
    res
  ) => {
    try {
      const order =
        await Order.findById(
          req.params.id
        )
          .populate(
            "user",
            "name email phone mobile"
          )
          .populate(
            "items.product",
            "name mainImage price actualPrice sellingPrice shippingCost"
          );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      return res.status(200).json({
        success: true,
        order,
      });
    } catch (error) {
      console.error(
        "GET ADMIN ORDER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to get order.",
      });
    }
  };

/* =========================================================
   ADMIN - UPDATE ORDER STATUS
========================================================= */

export const updateOrderStatus =
  async (
    req,
    res
  ) => {
    try {
      const {
        orderStatus,
      } =
        req.body || {};

      const allowedStatuses = [
        "pending",
        "confirmed",
        "processing",
        "packed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ];

      if (
        !allowedStatuses.includes(
          orderStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order status.",
        });
      }

      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found.",
        });
      }

      /* -------------------------------------------------------
         IMPORTANT:
         Confirmed order requires admin approval.
      ------------------------------------------------------- */

      if (
        orderStatus ===
        "confirmed"
      ) {
        const approvalStatus =
          order.adminApproval?.status ||
          "pending";

        if (
          approvalStatus !==
          "approved"
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Order must be approved before it can be confirmed.",
          });
        }
      }

      /* -------------------------------------------------------
         DELIVERED
         Save deliveredAt if not already available.
      ------------------------------------------------------- */

      if (
        orderStatus ===
        "delivered"
      ) {
        order.deliveredAt =
          order.deliveredAt ||
          new Date();

        if (
          order.shiprocket
        ) {
          order.shiprocket.deliveredAt =
            order.shiprocket
              .deliveredAt ||
            order.deliveredAt;
        }
      }

      /* -------------------------------------------------------
         CANCELLED
      ------------------------------------------------------- */

      if (
        orderStatus ===
        "cancelled"
      ) {
        order.cancelledAt =
          order.cancelledAt ||
          new Date();

        if (
          !order.cancelledBy
        ) {
          order.cancelledBy =
            "admin";
        }
      }

      /* -------------------------------------------------------
         STATUS DATES
      ------------------------------------------------------- */

      const now = new Date();

      if (
        orderStatus ===
        "confirmed"
      ) {
        order.confirmedAt =
          order.confirmedAt ||
          now;
      }

      if (
        orderStatus ===
        "processing"
      ) {
        order.processingAt =
          order.processingAt ||
          now;
      }

      if (
        orderStatus ===
        "packed"
      ) {
        order.packedAt =
          order.packedAt ||
          now;
      }

      if (
        orderStatus ===
        "shipped"
      ) {
        order.shippedAt =
          order.shippedAt ||
          now;
      }

      if (
        orderStatus ===
        "out_for_delivery"
      ) {
        order.outForDeliveryAt =
          order.outForDeliveryAt ||
          now;
      }

      order.orderStatus =
        orderStatus;

      await order.save();

      return res.status(200).json({
        success: true,

        message:
          "Order updated successfully.",

        order,
      });
    } catch (error) {
      console.error(
        "UPDATE ORDER STATUS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to update order.",
      });
    }
  };

/* =========================================================
   ADMIN - REFRESH ORDER TRACKING
========================================================= */

export const adminTrackOrder =
  async (
    req,
    res
  ) => {
    try {
      const order =
        await Order.findById(
          req.params.id
        );

      if (!order) {
        return res.status(404).json({
          success: false,

          message:
            "Order not found.",
        });
      }

      const awbCode =
        order.shiprocket?.awbCode ||
        order.awbCode ||
        "";

      if (!awbCode) {
        return res.status(400).json({
          success: false,

          message:
            "Tracking not available yet.",
        });
      }

      const tracking =
        await getTrackingDetails(
          awbCode
        );

      const trackingData =
        tracking?.tracking_data ||
        {};

      const trackingUrl =
        trackingData?.track_url ||
        trackingData?.tracking_url ||
        "";

      const currentStatus =
        normalizeLower(
          trackingData?.shipment_status ||
          trackingData?.status ||
          trackingData?.track_status ||
          ""
        );

      if (!order.shiprocket) {
        order.shiprocket = {};
      }

      order.shiprocket.awbCode =
        awbCode;

      order.shiprocket.trackingUrl =
        trackingUrl;

      order.shiprocket.status =
        trackingData?.shipment_status ||
        trackingData?.status ||
        "";

      order.shiprocket.lastSyncedAt =
        new Date();

      /* BACKWARD COMPATIBILITY */

      order.awbCode =
        awbCode;

      order.trackingUrl =
        trackingUrl;

      /* -------------------------------------------------------
         DELIVERED
      ------------------------------------------------------- */

      if (
        [
          "delivered",
          "delivery",
          "delivered successfully",
        ].some(
          (status) =>
            currentStatus.includes(
              status
            )
        )
      ) {
        if (
          order.orderStatus !==
            "cancelled" &&
          order.orderStatus !==
            "returned"
        ) {
          order.orderStatus =
            "delivered";
        }

        if (
          !order.deliveredAt
        ) {
          order.deliveredAt =
            new Date();
        }

        order.shiprocket.deliveredAt =
          order.shiprocket
            .deliveredAt ||
          order.deliveredAt;
      }

      /* -------------------------------------------------------
         OUT FOR DELIVERY
      ------------------------------------------------------- */

      else if (
        [
          "out for delivery",
          "out_for_delivery",
        ].some(
          (status) =>
            currentStatus.includes(
              status
            )
        )
      ) {
        if (
          order.orderStatus !==
          "cancelled"
        ) {
          order.orderStatus =
            "out_for_delivery";
        }

        order.outForDeliveryAt =
          order.outForDeliveryAt ||
          new Date();
      }

      /* -------------------------------------------------------
         SHIPPED
      ------------------------------------------------------- */

      else if (
        [
          "shipped",
          "in transit",
          "in_transit",
          "dispatched",
        ].some(
          (status) =>
            currentStatus.includes(
              status
            )
        )
      ) {
        if (
          order.orderStatus !==
          "cancelled"
        ) {
          order.orderStatus =
            "shipped";
        }

        order.shippedAt =
          order.shippedAt ||
          new Date();

        order.shiprocket.shippedAt =
          order.shiprocket
            .shippedAt ||
          order.shippedAt;
      }

      await order.save();

      return res.status(200).json({
        success: true,

        tracking,

        order,
      });
    } catch (error) {
      console.error(
        "ADMIN TRACK ORDER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to track order.",
      });
    }
  };