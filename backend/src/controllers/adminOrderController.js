import Order from "../models/Order.js";

import {
  createShiprocketOrder,
  assignAWB,
  requestPickup,
} from "../services/shiprocketService.js";

/* =========================================================
   HELPERS
========================================================= */

const getShiprocketOrderId = (order) => {
  return (
    order?.shiprocket?.orderId ||
    order?.shiprocketOrderId ||
    ""
  );
};

const getShipmentId = (order) => {
  return (
    order?.shiprocket?.shipmentId ||
    order?.shipmentId ||
    ""
  );
};

const getAwbCode = (order) => {
  return (
    order?.shiprocket?.awbCode ||
    order?.awbCode ||
    ""
  );
};

/* =========================================================
   GET ALL PENDING APPROVAL ORDERS
========================================================= */

export const getPendingApprovalOrders =
  async (req, res) => {
    try {
      const orders =
        await Order.find({
          "adminApproval.status":
            "pending",

          orderStatus:
            "pending",
        })
          .populate(
            "user",
            "name email phone mobile"
          )
          .populate(
            "items.product",
            "name mainImage price actualPrice sellingPrice shippingCost"
          )
          .sort({
            createdAt: -1,
          });

      return res.status(200).json({
        success: true,

        count:
          orders.length,

        orders,
      });
    } catch (error) {
      console.error(
        "GET PENDING APPROVAL ORDERS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to get pending approval orders.",
      });
    }
  };

/* =========================================================
   GET SINGLE ORDER FOR APPROVAL
========================================================= */

export const getApprovalOrder =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      const order =
        await Order.findById(id)
          .populate(
            "user",
            "name email phone mobile"
          )
          .populate(
            "items.product",
            "name mainImage images price actualPrice sellingPrice shippingCost"
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
        "GET APPROVAL ORDER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to get approval order.",
      });
    }
  };

/* =========================================================
   ADMIN APPROVE ORDER

   FLOW:

   pending
      ↓
   payment check
      ↓
   Shiprocket create
      ↓
   AWB assign
      ↓
   pickup request
      ↓
   adminApproval = approved
      ↓
   orderStatus = confirmed
========================================================= */

export const approveOrder =
  async (req, res) => {
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
        id,
      } = req.params;

      /* =====================================================
         FIND ORDER
      ==================================================== */

      const order =
        await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,

          message:
            "Order not found.",
        });
      }

      /* =====================================================
         ALREADY CANCELLED
      ==================================================== */

      if (
        order.orderStatus ===
        "cancelled"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Cancelled order cannot be approved.",
        });
      }

      /* =====================================================
         ALREADY APPROVED
      ==================================================== */

      if (
        order.adminApproval?.status ===
        "approved"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Order is already approved.",
        });
      }

      /* =====================================================
         ALREADY REJECTED
      ==================================================== */

      if (
        order.adminApproval?.status ===
        "rejected"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Rejected order cannot be approved.",
        });
      }

      /* =====================================================
         ORDER MUST BE PENDING
      ==================================================== */

      if (
        order.orderStatus !==
        "pending"
      ) {
        return res.status(400).json({
          success: false,

          message:
            `Order cannot be approved from status "${order.orderStatus}".`,
        });
      }

      /* =====================================================
         PAYMENT VALIDATION
      ==================================================== */

      /*
       * COD:
       * paymentStatus = pending is valid.
       *
       * Razorpay:
       * paymentStatus MUST be paid.
       */

      if (
        order.paymentMethod ===
        "razorpay"
      ) {
        if (
          order.paymentStatus !==
          "paid"
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Razorpay payment has not been verified. Order cannot be approved.",
          });
        }
      }

      /* =====================================================
         EXISTING SHIPROCKET ORDER
      ==================================================== */

      let shiprocketOrderId =
        getShiprocketOrderId(
          order
        );

      /*
       * In normal flow this should be empty because
       * Shiprocket is only called after admin approval.
       *
       * Still kept for safety/idempotency.
       */

      if (
        !shiprocketOrderId
      ) {
        try {
          console.log(
            "===================================="
          );

          console.log(
            "🚀 ADMIN APPROVE → SHIPROCKET"
          );

          console.log(
            "Order:",
            order._id.toString()
          );

          console.log(
            "===================================="
          );

          await createShiprocketOrder(
            order
          );
        } catch (shiprocketError) {
          console.error(
            "❌ SHIPROCKET ORDER CREATION FAILED:",
            shiprocketError.message
          );

          /*
           * VERY IMPORTANT:
           *
           * Shiprocket failed.
           *
           * Therefore admin approval is NOT completed.
           *
           * Order remains:
           *
           * adminApproval.pending
           * orderStatus.pending
           */

          return res.status(502).json({
            success: false,

            message:
              "Order could not be sent to Shiprocket. Approval was not completed.",

            error:
              shiprocketError.message,
          });
        }
      }

      /* =====================================================
         RELOAD ORDER
      ==================================================== */

      let currentOrder =
        await Order.findById(
          order._id
        );

      if (!currentOrder) {
        return res.status(500).json({
          success: false,

          message:
            "Unable to reload order after Shiprocket creation.",
        });
      }

      shiprocketOrderId =
        getShiprocketOrderId(
          currentOrder
        );

      let shipmentId =
        getShipmentId(
          currentOrder
        );

      let awbCode =
        getAwbCode(
          currentOrder
        );

      /* =====================================================
         AWB ASSIGN
      ==================================================== */

      let awbAssigned =
        Boolean(
          awbCode
        );

      if (
        shipmentId &&
        !awbCode
      ) {
        try {
          console.log(
            "🚚 Assigning AWB..."
          );

          await assignAWB(
            currentOrder,
            shipmentId
          );

          /*
           * assignAWB saves the order,
           * so fetch latest version.
           */

          currentOrder =
            await Order.findById(
              currentOrder._id
            );

          if (
            !currentOrder
          ) {
            return res.status(500).json({
              success: false,

              message:
                "Unable to reload order after AWB assignment.",
            });
          }

          shipmentId =
            getShipmentId(
              currentOrder
            );

          awbCode =
            getAwbCode(
              currentOrder
            );

          awbAssigned =
            Boolean(
              awbCode
            );
        } catch (awbError) {
          console.error(
            "⚠️ AWB ASSIGNMENT FAILED:",
            awbError.message
          );
        }
      }

      /* =====================================================
         PICKUP REQUEST
      ==================================================== */

      let pickupRequested =
        false;

      /*
       * Pickup can only be requested when shipment exists.
       *
       * If AWB is not available yet, we don't attempt
       * pickup because Shiprocket may still be assigning
       * courier.
       */

      if (
        shipmentId &&
        awbAssigned
      ) {
        try {
          console.log(
            "📦 Requesting Shiprocket pickup..."
          );

          await requestPickup(
            currentOrder
          );

          pickupRequested =
            true;
        } catch (pickupError) {
          console.error(
            "⚠️ PICKUP REQUEST FAILED:",
            pickupError.message
          );
        }
      }

      /* =====================================================
         FINAL APPROVAL
      ==================================================== */

      /*
       * Shiprocket order creation succeeded.
       *
       * Therefore admin approval can be recorded.
       *
       * Even if AWB or pickup is temporarily delayed,
       * the order has already been successfully sent
       * to Shiprocket.
       */

      currentOrder =
        await Order.findById(
          order._id
        );

      if (!currentOrder) {
        return res.status(500).json({
          success: false,

          message:
            "Unable to reload order for final approval.",
        });
      }

      if (
        !currentOrder.adminApproval
      ) {
        currentOrder.adminApproval =
          {};
      }

      currentOrder.adminApproval.status =
        "approved";

      currentOrder.adminApproval.approvedBy =
        String(
          adminId
        );

      currentOrder.adminApproval.approvedAt =
        new Date();

      /*
       * Clear rejection information.
       */

      currentOrder.adminApproval.rejectedBy =
        "";

      currentOrder.adminApproval.rejectedAt =
        null;

      currentOrder.adminApproval.rejectionReason =
        "";

      /* -----------------------------------------------------
         CONFIRM ORDER
      ----------------------------------------------------- */

      currentOrder.orderStatus =
        "confirmed";

      currentOrder.confirmedAt =
        currentOrder.confirmedAt ||
        new Date();

      await currentOrder.save();

      /* =====================================================
         RESPONSE
      ==================================================== */

      return res.status(200).json({
        success: true,

        message:
          pickupRequested
            ? "Order approved and sent to Shiprocket successfully."
            : "Order approved. Shiprocket order created; AWB/pickup may still be pending.",

        order:
          currentOrder,

        shiprocket: {
          orderId:
            getShiprocketOrderId(
              currentOrder
            ),

          shipmentId:
            getShipmentId(
              currentOrder
            ),

          awbCode:
            getAwbCode(
              currentOrder
            ),

          pickupRequested,

          awbAssigned:
            Boolean(
              getAwbCode(
                currentOrder
              )
            ),
        },
      });
    } catch (error) {
      console.error(
        "APPROVE ORDER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to approve order.",
      });
    }
  };

/* =========================================================
   ADMIN REJECT ORDER
========================================================= */

export const rejectOrder =
  async (req, res) => {
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
        id,
      } = req.params;

      const {
        reason = "",
      } = req.body || {};

      const rejectionReason =
        String(
          reason
        ).trim();

      /* =====================================================
         REASON REQUIRED
      ==================================================== */

      if (!rejectionReason) {
        return res.status(400).json({
          success: false,

          message:
            "Rejection reason is required.",
        });
      }

      /* =====================================================
         FIND ORDER
      ==================================================== */

      const order =
        await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,

          message:
            "Order not found.",
        });
      }

      /* =====================================================
         APPROVED ORDER
      ==================================================== */

      if (
        order.adminApproval?.status ===
        "approved"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Approved order cannot be rejected. Use cancellation/request flow instead.",
        });
      }

      /* =====================================================
         SHIPROCKET ALREADY CREATED
      ==================================================== */

      const shiprocketOrderId =
        getShiprocketOrderId(
          order
        );

      if (
        shiprocketOrderId
      ) {
        return res.status(400).json({
          success: false,

          message:
            "This order has already been sent to Shiprocket and cannot be rejected from the approval stage.",
        });
      }

      /* =====================================================
         ALREADY REJECTED
      ==================================================== */

      if (
        order.adminApproval?.status ===
        "rejected"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Order is already rejected.",
        });
      }

      /* =====================================================
         APPROVAL OBJECT
      ==================================================== */

      if (
        !order.adminApproval
      ) {
        order.adminApproval =
          {};
      }

      order.adminApproval.status =
        "rejected";

      order.adminApproval.rejectedBy =
        String(
          adminId
        );

      order.adminApproval.rejectedAt =
        new Date();

      order.adminApproval.rejectionReason =
        rejectionReason;

      order.adminApproval.approvedBy =
        "";

      order.adminApproval.approvedAt =
        null;

      /* =====================================================
         ORDER STATUS
      ==================================================== */

      order.orderStatus =
        "cancelled";

      order.cancelledAt =
        new Date();

      order.cancelledBy =
        "admin";

      order.cancellationReason =
        rejectionReason;

      await order.save();

      return res.status(200).json({
        success: true,

        message:
          "Order rejected successfully.",

        order,
      });
    } catch (error) {
      console.error(
        "REJECT ORDER ERROR:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to reject order.",
      });
    }
  };