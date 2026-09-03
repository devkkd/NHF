import mongoose from "mongoose";

import Order from "../models/Order.js";
import OrderRequest from "../models/OrderRequest.js";

/* =========================================================
   HELPERS
========================================================= */

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const normalizeString = (value) => {
  return String(value ?? "").trim();
};

/*
 * Current Order.js me order items ke liye:
 *
 * { _id: false }
 *
 * isliye orderItemId ko array index ke roop me use karenge.
 *
 * Example:
 *
 * 0 = first product
 * 1 = second product
 * 2 = third product
 */
const getOrderItem = (order, orderItemId) => {
  if (
    !order ||
    !Array.isArray(order.items)
  ) {
    return {
      item: null,
      index: -1,
    };
  }

  const value =
    normalizeString(
      orderItemId
    );

  if (!value) {
    return {
      item: null,
      index: -1,
    };
  }

  if (/^\d+$/.test(value)) {
    const index =
      Number(value);

    if (
      Number.isInteger(index) &&
      index >= 0 &&
      index < order.items.length
    ) {
      return {
        item:
          order.items[index],
        index,
      };
    }
  }

  /*
   * Future/backward compatibility:
   * agar kabhi order item me _id aa jaye.
   */
  const index =
    order.items.findIndex(
      (item) =>
        item?._id &&
        String(item._id) === value
    );

  if (index !== -1) {
    return {
      item:
        order.items[index],
      index,
    };
  }

  return {
    item: null,
    index: -1,
  };
};

/* =========================================================
   7-DAY DELIVERY WINDOW
========================================================= */

const getSevenDayWindow = (
  deliveredAt
) => {
  if (!deliveredAt) {
    return null;
  }

  const deliveredDate =
    new Date(
      deliveredAt
    );

  if (
    Number.isNaN(
      deliveredDate.getTime()
    )
  ) {
    return null;
  }

  const windowEndsAt =
    new Date(
      deliveredDate
    );

  windowEndsAt.setDate(
    windowEndsAt.getDate() + 7
  );

  return {
    deliveredAt:
      deliveredDate,

    windowEndsAt,
  };
};

/* =========================================================
   GET MY REQUESTS
========================================================= */

export const getMyOrderRequests =
  async (
    req,
    res
  ) => {
    try {
      const userId =
        req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Unauthorized.",
        });
      }

      const requests =
        await OrderRequest.find({
          user: userId,
        })
          .populate(
            "order",
            "_id orderStatus paymentStatus paymentMethod total deliveredAt createdAt"
          )
          .populate(
            "product",
            "name mainImage images price actualPrice sellingPrice"
          )
          .populate(
            "reviewedBy",
            "name email"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,

        count:
          requests.length,

        requests,
      });
    } catch (error) {
      console.error(
        "GET MY ORDER REQUESTS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to get order requests.",
      });
    }
  };

/* =========================================================
   GET MY SINGLE REQUEST
========================================================= */

export const getMyOrderRequestById =
  async (
    req,
    res
  ) => {
    try {
      const userId =
        req.user?._id;

      const {
        requestId,
      } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message:
            "Unauthorized.",
        });
      }

      if (
        !isValidObjectId(
          requestId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid request ID.",
        });
      }

      const request =
        await OrderRequest.findOne({
          _id:
            requestId,

          user:
            userId,
        })
          .populate(
            "order"
          )
          .populate(
            "product",
            "name mainImage images price actualPrice sellingPrice"
          )
          .populate(
            "reviewedBy",
            "name email"
          );

      if (!request) {
        return res.status(404).json({
          success: false,

          message:
            "Request not found.",
        });
      }

      return res.status(200).json({
        success: true,

        request,
      });
    } catch (error) {
      console.error(
        "GET MY ORDER REQUEST ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to get request.",
      });
    }
  };

/* =========================================================
   CREATE ORDER REQUEST

   POST /orders/requests/:orderId

   type:
   - cancel
   - return
   - replacement
========================================================= */

export const createOrderRequest =
  async (
    req,
    res
  ) => {
    try {
      const userId =
        req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,

          message:
            "Unauthorized.",
        });
      }

      const {
        orderId,
      } = req.params;

      const {
        type,
        orderItemId = "",
        reason = "other",
        description = "",
        customerNote = "",
      } = req.body || {};

      /* =====================================================
         BASIC VALIDATION
      ==================================================== */

      if (
        !isValidObjectId(
          orderId
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid order ID.",
        });
      }

      if (
        ![
          "cancel",
          "return",
          "replacement",
        ].includes(type)
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid request type.",
        });
      }

      /* =====================================================
         FIND ORDER
      ==================================================== */

      const order =
        await Order.findOne({
          _id:
            orderId,

          user:
            userId,
        });

      if (!order) {
        return res.status(404).json({
          success: false,

          message:
            "Order not found.",
        });
      }

      /* =====================================================
         CANCELLED ORDER
      ==================================================== */

      if (
        order.orderStatus ===
        "cancelled"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "This order is already cancelled.",
        });
      }

      /* =====================================================
         FIND ITEM
      ==================================================== */

      let orderItem = null;
      let orderItemIndex = -1;

      if (
        type === "return" ||
        type === "replacement"
      ) {
        if (
          normalizeString(
            orderItemId
          ) === ""
        ) {
          return res.status(400).json({
            success: false,

            message:
              "orderItemId is required for return/replacement.",
          });
        }

        const itemResult =
          getOrderItem(
            order,
            orderItemId
          );

        orderItem =
          itemResult.item;

        orderItemIndex =
          itemResult.index;

        if (!orderItem) {
          return res.status(404).json({
            success: false,

            message:
              "Selected order item was not found.",
          });
        }
      }

      /* =====================================================
         DUPLICATE ACTIVE REQUEST
      ==================================================== */

      const duplicateQuery = {
        order:
          order._id,

        user:
          userId,

        type,

        status: {
          $in: [
            "pending",
            "approved",
          ],
        },

        orderItemId:
          type === "cancel"
            ? ""
            : String(
                orderItemIndex
              ),
      };

      const existingRequest =
        await OrderRequest.findOne(
          duplicateQuery
        );

      if (existingRequest) {
        return res.status(400).json({
          success: false,

          message:
            `An active ${type} request already exists.`,

          requestId:
            existingRequest._id,
        });
      }

      /* =====================================================
         CANCEL REQUEST
      ==================================================== */

      if (
        type === "cancel"
      ) {
        /*
         * Cancellation is not allowed once shipment
         * has started / order delivered.
         */

        const blockedStatuses =
          [
            "shipped",
            "out_for_delivery",
            "delivered",
            "returned",
            "refunded",
          ];

        if (
          blockedStatuses.includes(
            order.orderStatus
          )
        ) {
          return res.status(400).json({
            success: false,

            message:
              "This order can no longer be cancelled.",
          });
        }

        const request =
          await OrderRequest.create({
            order:
              order._id,

            user:
              userId,

            type:
              "cancel",

            orderItemId:
              "",

            product:
              null,

            productName:
              "",

            selectedColor:
              "",

            selectedColorName:
              "",

            selectedSize:
              "",

            quantity:
              1,

            reason:
              normalizeString(
                reason
              ) || "other",

            description:
              normalizeString(
                description
              ),

            images:
              [],

            status:
              "pending",

            customerNote:
              normalizeString(
                customerNote
              ),
          });

        /*
         * Active request reference.
         */

        order.activeRequestId =
          request._id;

        await order.save();

        return res.status(201).json({
          success: true,

          message:
            "Cancellation request submitted successfully. Admin will review your request.",

          request,
        });
      }

      /* =====================================================
         RETURN REQUEST
      ==================================================== */

      if (
        type === "return"
      ) {
        if (
          order.orderStatus !==
          "delivered"
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Return can only be requested after the order is delivered.",
          });
        }

        if (
          !order.deliveredAt
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Delivery date is not available. Return eligibility cannot be verified.",
          });
        }

        const window =
          getSevenDayWindow(
            order.deliveredAt
          );

        if (
          !window
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Invalid delivery date.",
          });
        }

        if (
          new Date() >
          window.windowEndsAt
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Return window has expired. Return is allowed only within 7 days of delivery.",
          });
        }

        const request =
          await OrderRequest.create({
            order:
              order._id,

            user:
              userId,

            type:
              "return",

            orderItemId:
              String(
                orderItemIndex
              ),

            product:
              orderItem.product ||
              null,

            productName:
              orderItem.name ||
              "",

            selectedColor:
              orderItem.selectedColor ||
              "",

            selectedColorName:
              orderItem.selectedColorName ||
              "",

            selectedSize:
              orderItem.selectedSize ||
              "",

            quantity:
              Number(
                orderItem.quantity ||
                  1
              ),

            reason:
              normalizeString(
                reason
              ) || "other",

            description:
              normalizeString(
                description
              ),

            images:
              [],

            status:
              "pending",

            customerNote:
              normalizeString(
                customerNote
              ),
          });

        order.activeRequestId =
          request._id;

        await order.save();

        return res.status(201).json({
          success: true,

          message:
            "Return request submitted successfully. Admin will review your request.",

          request,
        });
      }

      /* =====================================================
         REPLACEMENT REQUEST
      ==================================================== */

      if (
        type ===
        "replacement"
      ) {
        /* ---------------------------------------------------
           ONLY AFTER DELIVERY
        --------------------------------------------------- */

        if (
          order.orderStatus !==
          "delivered"
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Replacement can only be requested after the order is delivered.",
          });
        }

        /* ---------------------------------------------------
           DELIVERY DATE REQUIRED
        --------------------------------------------------- */

        if (
          !order.deliveredAt
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Delivery date is not available. Replacement eligibility cannot be verified.",
          });
        }

        const window =
          getSevenDayWindow(
            order.deliveredAt
          );

        if (!window) {
          return res.status(400).json({
            success: false,

            message:
              "Invalid delivery date.",
          });
        }

        /* ---------------------------------------------------
           7 DAYS ONLY
        --------------------------------------------------- */

        if (
          new Date() >
          window.windowEndsAt
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Replacement window has expired. Replacement is allowed only within 7 days of delivery.",
          });
        }

        /* ---------------------------------------------------
           REPLACEMENT REASON
        --------------------------------------------------- */

        const allowedReasons =
          [
            "damaged",
            "defective",
            "wrong_product",
          ];

        const normalizedReason =
          normalizeString(
            reason
          ).toLowerCase();

        if (
          !allowedReasons.includes(
            normalizedReason
          )
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Replacement is allowed only for damaged, defective, or wrong product issues.",
          });
        }

        /* ---------------------------------------------------
           IMAGE URLS
        --------------------------------------------------- */

        let images =
          [];

        /*
         * Because your project uses presigned R2 uploads,
         * frontend will upload directly to R2 and then send
         * publicUrl/public URLs here.
         *
         * Possible request body:
         *
         * images: [
         *   "https://cdn.../replacement-requests/a.jpg",
         *   "https://cdn.../replacement-requests/b.jpg"
         * ]
         */

        if (
          req.body?.images
        ) {
          let bodyImages =
            req.body.images;

          if (
            typeof bodyImages ===
            "string"
          ) {
            try {
              bodyImages =
                JSON.parse(
                  bodyImages
                );
            } catch {
              bodyImages =
                [
                  bodyImages,
                ];
            }
          }

          if (
            Array.isArray(
              bodyImages
            )
          ) {
            images =
              bodyImages
                .map(
                  (image) =>
                    normalizeString(
                      image
                    )
                )
                .filter(
                  Boolean
                );
          }
        }

        /*
         * Also support multer in future,
         * although current R2 setup doesn't require it.
         */

        if (
          images.length === 0 &&
          Array.isArray(
            req.files
          )
        ) {
          images =
            req.files
              .map(
                (file) =>
                  file?.location ||
                  file?.publicUrl ||
                  file?.url ||
                  file?.secure_url ||
                  ""
              )
              .map(
                (image) =>
                  normalizeString(
                    image
                  )
              )
              .filter(
                Boolean
              );
        }

        /*
         * IMPORTANT:
         * Damage photo mandatory.
         */

        if (
          images.length ===
          0
        ) {
          return res.status(400).json({
            success: false,

            message:
              "At least one damage image is required for replacement.",
          });
        }

        /* ---------------------------------------------------
           LIMIT IMAGE COUNT
        --------------------------------------------------- */

        if (
          images.length > 5
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Maximum 5 damage images are allowed.",
          });
        }

        /* ---------------------------------------------------
           CREATE REPLACEMENT REQUEST
        --------------------------------------------------- */

        const request =
          await OrderRequest.create({
            order:
              order._id,

            user:
              userId,

            type:
              "replacement",

            orderItemId:
              String(
                orderItemIndex
              ),

            product:
              orderItem.product ||
              null,

            productName:
              orderItem.name ||
              "",

            selectedColor:
              orderItem.selectedColor ||
              "",

            selectedColorName:
              orderItem.selectedColorName ||
              "",

            selectedSize:
              orderItem.selectedSize ||
              "",

            quantity:
              Number(
                orderItem.quantity ||
                  1
              ),

            reason:
              normalizedReason,

            description:
              normalizeString(
                description
              ),

            images,

            status:
              "pending",

            replacementApproved:
              false,

            replacementCompleted:
              false,

            replacementWindowEndsAt:
              window.windowEndsAt,

            customerNote:
              normalizeString(
                customerNote
              ),
          });

        order.activeRequestId =
          request._id;

        await order.save();

        return res.status(201).json({
          success: true,

          message:
            "Replacement request submitted successfully. Admin will review the damage images.",

          request,
        });
      }

      return res.status(400).json({
        success: false,

        message:
          "Unable to process request.",
      });
    } catch (error) {
      console.error(
        "CREATE ORDER REQUEST ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to create order request.",
      });
    }
  };

/* =========================================================
   ADMIN - GET ALL REQUESTS
========================================================= */

export const getAllOrderRequests =
  async (
    req,
    res
  ) => {
    try {
      const {
        status,
        type,
      } = req.query;

      const filter =
        {};

      if (
        [
          "pending",
          "approved",
          "rejected",
          "cancelled",
          "completed",
        ].includes(
          status
        )
      ) {
        filter.status =
          status;
      }

      if (
        [
          "cancel",
          "return",
          "replacement",
        ].includes(
          type
        )
      ) {
        filter.type =
          type;
      }

      const requests =
        await OrderRequest.find(
          filter
        )
          .populate(
            "order",
            "_id orderStatus paymentStatus paymentMethod subtotal shipping tax total deliveredAt createdAt"
          )
          .populate(
            "user",
            "name firstName lastName email mobile phone"
          )
          .populate(
            "product",
            "name mainImage images price actualPrice sellingPrice"
          )
          .populate(
            "reviewedBy",
            "name email"
          )
          .sort({
            createdAt:
              -1,
          });

      return res.status(200).json({
        success: true,

        count:
          requests.length,

        requests,
      });
    } catch (error) {
      console.error(
        "GET ALL ORDER REQUESTS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to get order requests.",
      });
    }
  };

/* =========================================================
   ADMIN - GET SINGLE REQUEST
========================================================= */

export const getAdminOrderRequestById =
  async (
    req,
    res
  ) => {
    try {
      const {
        requestId,
      } = req.params;

      if (
        !isValidObjectId(
          requestId
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid request ID.",
        });
      }

      const request =
        await OrderRequest.findById(
          requestId
        )
          .populate("order")
          .populate(
            "user",
            "name firstName lastName email mobile phone"
          )
          .populate(
            "product",
            "name mainImage images price actualPrice sellingPrice"
          )
          .populate(
            "reviewedBy",
            "name email"
          );

      if (!request) {
        return res.status(404).json({
          success: false,

          message:
            "Order request not found.",
        });
      }

      return res.status(200).json({
        success: true,

        request,
      });
    } catch (error) {
      console.error(
        "GET ADMIN ORDER REQUEST ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to get order request.",
      });
    }
  };

/* =========================================================
   ADMIN - APPROVE REQUEST
========================================================= */

export const approveOrderRequest =
  async (
    req,
    res
  ) => {
    try {
      const adminId =
        req.user?._id;

      if (!adminId) {
        return res.status(401).json({
          success: false,

          message:
            "Unauthorized.",
        });
      }

      const {
        requestId,
      } = req.params;

      const {
        adminNote = "",
      } = req.body || {};

      if (
        !isValidObjectId(
          requestId
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid request ID.",
        });
      }

      const request =
        await OrderRequest.findById(
          requestId
        );

      if (!request) {
        return res.status(404).json({
          success: false,

          message:
            "Order request not found.",
        });
      }

      if (
        request.status !==
        "pending"
      ) {
        return res.status(400).json({
          success: false,

          message:
            `This request is already ${request.status}.`,
        });
      }

      const order =
        await Order.findById(
          request.order
        );

      if (!order) {
        return res.status(404).json({
          success: false,

          message:
            "Associated order not found.",
        });
      }

      /* =====================================================
         CANCEL
      ==================================================== */

      if (
        request.type ===
        "cancel"
      ) {
        const blockedStatuses =
          [
            "shipped",
            "out_for_delivery",
            "delivered",
            "returned",
            "refunded",
          ];

        if (
          blockedStatuses.includes(
            order.orderStatus
          )
        ) {
          return res.status(400).json({
            success: false,

            message:
              "This order can no longer be cancelled.",
          });
        }

        order.orderStatus =
          "cancelled";

        order.cancelledAt =
          new Date();

        order.cancelledBy =
          "admin";

        order.cancellationReason =
          request.reason ||
          request.description ||
          "Customer cancellation request.";

        order.activeRequestId =
          null;

        await order.save();
      }

      /* =====================================================
         RETURN
      ==================================================== */

      if (
        request.type ===
        "return"
      ) {
        if (
          order.orderStatus !==
          "delivered"
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Return can only be approved for a delivered order.",
          });
        }

        const window =
          getSevenDayWindow(
            order.deliveredAt
          );

        if (!window) {
          return res.status(400).json({
            success: false,

            message:
              "Delivery date is not available.",
          });
        }

        if (
          new Date() >
          window.windowEndsAt
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Return window has expired.",
          });
        }

        /*
         * Item-level return.
         *
         * Do not mark entire multi-item order returned.
         *
         * Actual return shipment/refund will be
         * handled in the next backend phase.
         */
      }

      /* =====================================================
         REPLACEMENT
      ==================================================== */

      if (
        request.type ===
        "replacement"
      ) {
        if (
          order.orderStatus !==
          "delivered"
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Replacement can only be approved for a delivered order.",
          });
        }

        const window =
          getSevenDayWindow(
            order.deliveredAt
          );

        if (!window) {
          return res.status(400).json({
            success: false,

            message:
              "Delivery date is not available.",
          });
        }

        /*
         * Re-check policy during approval.
         */

        if (
          new Date() >
          window.windowEndsAt
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Replacement window has expired. This request can no longer be approved.",
          });
        }

        /*
         * Damage evidence required.
         */

        if (
          !Array.isArray(
            request.images
          ) ||
          request.images.length ===
            0
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Replacement cannot be approved without damage images.",
          });
        }

        request.replacementApproved =
          true;

        /*
         * IMPORTANT:
         *
         * Actual replacement shipment will be created
         * in the next replacement logistics step.
         */
      }

      /* =====================================================
         UPDATE REQUEST
      ==================================================== */

      request.status =
        "approved";

      request.reviewedBy =
        adminId;

      request.reviewedAt =
        new Date();

      request.approvalDate =
        new Date();

      request.rejectionDate =
        null;

      request.rejectionReason =
        "";

      request.adminNote =
        normalizeString(
          adminNote
        );

      await request.save();

      /*
       * Clear active request after cancellation.
       * For return/replacement we leave the approved request
       * available in OrderRequest history.
       */

      if (
        request.type ===
          "return" ||
        request.type ===
          "replacement"
      ) {
        order.activeRequestId =
          request._id;

        await order.save();
      }

      const populatedRequest =
        await OrderRequest.findById(
          request._id
        )
          .populate(
            "order"
          )
          .populate(
            "user",
            "name firstName lastName email mobile phone"
          )
          .populate(
            "product",
            "name mainImage images price actualPrice sellingPrice"
          )
          .populate(
            "reviewedBy",
            "name email"
          );

      return res.status(200).json({
        success: true,

        message:
          `${request.type} request approved successfully.`,

        request:
          populatedRequest,

        order,
      });
    } catch (error) {
      console.error(
        "APPROVE ORDER REQUEST ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to approve order request.",
      });
    }
  };

/* =========================================================
   ADMIN - REJECT REQUEST
========================================================= */

export const rejectOrderRequest =
  async (
    req,
    res
  ) => {
    try {
      const adminId =
        req.user?._id;

      if (!adminId) {
        return res.status(401).json({
          success: false,

          message:
            "Unauthorized.",
        });
      }

      const {
        requestId,
      } = req.params;

      const {
        rejectionReason = "",
        adminNote = "",
      } = req.body || {};

      if (
        !isValidObjectId(
          requestId
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid request ID.",
        });
      }

      const reason =
        normalizeString(
          rejectionReason
        );

      if (!reason) {
        return res.status(400).json({
          success: false,

          message:
            "Rejection reason is required.",
        });
      }

      const request =
        await OrderRequest.findById(
          requestId
        );

      if (!request) {
        return res.status(404).json({
          success: false,

          message:
            "Order request not found.",
        });
      }

      if (
        request.status !==
        "pending"
      ) {
        return res.status(400).json({
          success: false,

          message:
            `This request is already ${request.status}.`,
        });
      }

      request.status =
        "rejected";

      request.reviewedBy =
        adminId;

      request.reviewedAt =
        new Date();

      request.rejectionDate =
        new Date();

      request.rejectionReason =
        reason;

      request.adminNote =
        normalizeString(
          adminNote
        );

      request.replacementApproved =
        false;

      await request.save();

      /*
       * If this was the currently active request,
       * clear the reference.
       */

      const order =
        await Order.findById(
          request.order
        );

      if (
        order &&
        String(
          order.activeRequestId || ""
        ) ===
          String(
            request._id
          )
      ) {
        order.activeRequestId =
          null;

        await order.save();
      }

      return res.status(200).json({
        success: true,

        message:
          `${request.type} request rejected successfully.`,

        request,
      });
    } catch (error) {
      console.error(
        "REJECT ORDER REQUEST ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to reject order request.",
      });
    }
  };

/* =========================================================
   USER - CANCEL PENDING REQUEST
========================================================= */

export const cancelMyOrderRequest =
  async (
    req,
    res
  ) => {
    try {
      const userId =
        req.user?._id;

      if (!userId) {
        return res.status(401).json({
          success: false,

          message:
            "Unauthorized.",
        });
      }

      const {
        requestId,
      } = req.params;

      if (
        !isValidObjectId(
          requestId
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid request ID.",
        });
      }

      const request =
        await OrderRequest.findOne({
          _id:
            requestId,

          user:
            userId,
        });

      if (!request) {
        return res.status(404).json({
          success: false,

          message:
            "Request not found.",
        });
      }

      if (
        request.status !==
        "pending"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Only pending requests can be cancelled.",
        });
      }

      request.status =
        "cancelled";

      await request.save();

      const order =
        await Order.findById(
          request.order
        );

      if (
        order &&
        String(
          order.activeRequestId || ""
        ) ===
          String(
            request._id
          )
      ) {
        order.activeRequestId =
          null;

        await order.save();
      }

      return res.status(200).json({
        success: true,

        message:
          "Request cancelled successfully.",

        request,
      });
    } catch (error) {
      console.error(
        "CANCEL MY ORDER REQUEST ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to cancel request.",
      });
    }
  };