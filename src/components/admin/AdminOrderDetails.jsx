"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  getAdminOrder,
  updateOrderStatus,
  getAdminOrderApproval,
  approveAdminOrder,
  rejectAdminOrder,
  getAdminOrderTracking,
} from "@/lib/adminApi";

import AdminShell from "@/components/admin/AdminShell";

import {
  ArrowLeft,
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

const STATUS = [
  {
    value: "pending",
    label: "Pending",
  },
  {
    value: "confirmed",
    label: "Confirmed",
  },
  {
    value: "processing",
    label: "Processing",
  },
  {
    value: "packed",
    label: "Packed",
  },
  {
    value: "shipped",
    label: "Shipped",
  },
  {
    value: "out_for_delivery",
    label: "Out for Delivery",
  },
  {
    value: "delivered",
    label: "Delivered",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];

export default function AdminOrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [status, setStatus] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [
    approvalLoading,
    setApprovalLoading,
  ] = useState(false);

  const [
    trackingLoading,
    setTrackingLoading,
  ] = useState(false);

  const [approval, setApproval] =
    useState(null);

  const [
    rejectOpen,
    setRejectOpen,
  ] = useState(false);

  const [
    rejectReason,
    setRejectReason,
  ] = useState("");

  const [
    actionMessage,
    setActionMessage,
  ] = useState("");

  const [
    actionError,
    setActionError,
  ] = useState("");

  /* =====================================================
     LOAD ORDER
  ===================================================== */

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  async function loadOrder() {
    try {
      setLoading(true);
      setActionError("");

      const [
        orderRes,
        approvalRes,
      ] = await Promise.all([
        getAdminOrder(id),
        getAdminOrderApproval(id),
      ]);

      if (orderRes?.success) {
        const nextOrder =
          orderRes.order;

        setOrder(nextOrder);

        const currentStatus =
          String(
            nextOrder?.orderStatus ||
              "pending"
          ).toLowerCase();

        setStatus(
          STATUS.some(
            (item) =>
              item.value ===
              currentStatus
          )
            ? currentStatus
            : "pending"
        );

        setTracking({
          success: true,

          awbCode:
            nextOrder?.shiprocket
              ?.awbCode ||
            nextOrder?.awbCode ||
            "",

          courierName:
            nextOrder?.shiprocket
              ?.courierName ||
            nextOrder?.courierName ||
            "",

          trackingUrl:
            nextOrder?.shiprocket
              ?.trackingUrl ||
            nextOrder?.trackingUrl ||
            "",

          status:
            nextOrder?.shiprocket
              ?.status ||
            nextOrder?.orderStatus ||
            "",
        });
      }

      if (approvalRes?.success) {
        setApproval(
          approvalRes.approval ||
            approvalRes.adminApproval ||
            approvalRes.order
              ?.adminApproval ||
            null
        );
      } else if (
        orderRes?.success
      ) {
        setApproval(
          orderRes.order
            ?.adminApproval ||
            null
        );
      }
    } catch (err) {
      console.error(
        "Order load error:",
        err
      );

      setActionError(
        "Unable to load order details."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     TRACKING
  ===================================================== */

  async function refreshTracking() {
    try {
      setTrackingLoading(true);
      setActionError("");

      const res =
        await getAdminOrderTracking(
          id
        );

      if (!res?.success) {
        setActionError(
          res?.message ||
            "Unable to refresh tracking."
        );

        return;
      }

      const latestOrder =
        res.order ||
        res.data?.order ||
        null;

      const latestTracking =
        res.tracking ||
        res.data?.tracking ||
        latestOrder?.shiprocket ||
        null;

      if (latestOrder) {
        setOrder(latestOrder);

        const currentStatus =
          String(
            latestOrder?.orderStatus ||
              "pending"
          ).toLowerCase();

        setStatus(
          STATUS.some(
            (item) =>
              item.value ===
              currentStatus
          )
            ? currentStatus
            : "pending"
        );
      }

      if (latestTracking) {
        setTracking({
          success: true,

          awbCode:
            latestTracking?.awbCode ||
            latestOrder?.shiprocket
              ?.awbCode ||
            latestOrder?.awbCode ||
            "",

          courierName:
            latestTracking?.courierName ||
            latestOrder?.shiprocket
              ?.courierName ||
            latestOrder?.courierName ||
            "",

          trackingUrl:
            latestTracking?.trackingUrl ||
            latestOrder?.shiprocket
              ?.trackingUrl ||
            latestOrder?.trackingUrl ||
            "",

          status:
            latestTracking?.status ||
            latestOrder?.shiprocket
              ?.status ||
            latestOrder?.orderStatus ||
            "",
        });
      }

      setActionMessage(
        "Tracking updated successfully."
      );
    } catch (err) {
      console.error(
        "Tracking refresh error:",
        err
      );

      setActionError(
        "Unable to refresh tracking."
      );
    } finally {
      setTrackingLoading(
        false
      );
    }
  }

  /* =====================================================
     APPROVE
  ===================================================== */

  async function handleApproveOrder() {
    try {
      setApprovalLoading(true);
      setActionMessage("");
      setActionError("");

      const res =
        await approveAdminOrder(
          id
        );

      if (!res?.success) {
        setActionError(
          res?.message ||
            "Unable to approve order."
        );

        return;
      }

      setActionMessage(
        "Order approved successfully. Shiprocket shipment processing has started."
      );

      await loadOrder();
    } catch (err) {
      console.error(
        "Order approval error:",
        err
      );

      setActionError(
        err?.message ||
          "Unable to approve order."
      );
    } finally {
      setApprovalLoading(
        false
      );
    }
  }

  /* =====================================================
     REJECT
  ===================================================== */

  async function handleRejectOrder() {
    if (!rejectReason.trim()) {
      setActionError(
        "Please enter a rejection reason."
      );

      return;
    }

    try {
      setApprovalLoading(true);
      setActionMessage("");
      setActionError("");

      const res =
        await rejectAdminOrder(
          id,
          rejectReason
        );

      if (!res?.success) {
        setActionError(
          res?.message ||
            "Unable to reject order."
        );

        return;
      }

      setRejectOpen(false);
      setRejectReason("");

      setActionMessage(
        "Order rejected successfully."
      );

      await loadOrder();
    } catch (err) {
      console.error(
        "Order rejection error:",
        err
      );

      setActionError(
        err?.message ||
          "Unable to reject order."
      );
    } finally {
      setApprovalLoading(
        false
      );
    }
  }

  /* =====================================================
     STATUS UPDATE
  ===================================================== */

  async function handleStatusUpdate() {
    try {
      setSaving(true);

      const res =
        await updateOrderStatus(
          id,
          status
        );

      if (res.success) {
        await loadOrder();

        alert(
          "Order updated successfully."
        );
      }
    } catch (err) {
      console.error(
        "Order update error:",
        err
      );

      alert(
        "Unable to update order."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <AdminShell pageTitle="Order Details">
        <div className="ord-loading">
          <span className="ord-spinner" />
          Loading Order...
        </div>

        <style jsx>{`
          .ord-loading {
            min-height: 350px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            color: #000000;
            font-size: 16px;
            font-weight: 600;
          }

          .ord-spinner {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 2px solid #cccccc;
            border-top-color: #000000;
            animation: orderSpin
              0.8s linear infinite;
          }

          @keyframes orderSpin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </AdminShell>
    );
  }

  /* =====================================================
     NOT FOUND
  ===================================================== */

  if (!order) {
    return (
      <AdminShell pageTitle="Order Details">
        <div className="ord-not-found">
          Order not found.
        </div>

        <style jsx>{`
          .ord-not-found {
            margin: 25px 30px;
            padding: 18px 20px;
            border: 1px solid #d2d2d2;
            border-radius: 9px;
            background: #ffffff;
            color: #000000;
            font-size: 16px;
            line-height: 1.5;
            font-weight: 600;
          }
        `}</style>
      </AdminShell>
    );
  }

  const approvalStatus =
    String(
      approval?.status ||
        order.adminApproval
          ?.status ||
        "pending"
    ).toLowerCase();

  return (
    <AdminShell pageTitle="Order Details">
      <div className="ord-page">

        {/* =====================================================
            ALERT
        ===================================================== */}

        {(
          actionMessage ||
          actionError
        ) && (
          <div
            className={`ord-action-alert ${
              actionError
                ? "ord-action-alert-error"
                : "ord-action-alert-success"
            }`}
          >
            {actionError ? (
              <AlertCircle size={17} />
            ) : (
              <CheckCircle2 size={17} />
            )}

            <span>
              {actionError ||
                actionMessage}
            </span>
          </div>
        )}

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="ord-header">
          <div>
            <button
              type="button"
              className="ord-back-button"
              onClick={() =>
                (window.location.href =
                  "/admin/orders")
              }
            >
              <ArrowLeft
                size={18}
              />

              Back to Orders
            </button>

            <h1 className="ord-title">
              Order #
              {order._id.slice(
                -8
              )}
            </h1>

            <p className="ord-subtitle">
              Complete order
              information and shipment
              details
            </p>
          </div>

          <div className="ord-created">
            <div className="ord-label">
              Created
            </div>

            <div className="ord-created-value">
              {new Date(
                order.createdAt
              ).toLocaleString()}
            </div>
          </div>
        </div>

        {/* =====================================================
            SUMMARY
        ===================================================== */}

        <div className="ord-summary-grid">
          <SummaryCard
            icon={
              <CreditCard
                size={21}
              />
            }
            label="Order Total"
            value={`₹${order.total}`}
            large
          />

          <SummaryCard
            icon={
              <CreditCard
                size={21}
              />
            }
            label="Payment"
            customValue={
              <Badge
                success={
                  order.paymentStatus ===
                  "paid"
                }
              >
                {order.paymentStatus}
              </Badge>
            }
          />

          <SummaryCard
            icon={
              <Truck size={21} />
            }
            label="Order Status"
            value={
              order.orderStatus
            }
          />

          <SummaryCard
            icon={
              <CheckCircle2
                size={21}
              />
            }
            label="Admin Approval"
            customValue={
              <Badge
                success={
                  approvalStatus ===
                  "approved"
                }
              >
                {
                  approvalStatus
                }
              </Badge>
            }
          />

          <SummaryCard
            icon={
              <Package size={21} />
            }
            label="Items"
            value={
              order.items
                ?.length || 0
            }
          />
        </div>

        {/* =====================================================
            CUSTOMER + ADDRESS
        ===================================================== */}

        <div className="ord-two-col">

          <section className="ord-section">
            <SectionHeading
              icon={
                <User size={20} />
              }
              title="Customer Details"
            />

            <div className="ord-detail-list">
              <DetailItem
                label="Name"
                value={
                  order.user
                    ?.name || "-"
                }
              />

              <DetailItem
                label="Email"
                value={
                  order.user
                    ?.email || "-"
                }
              />

              <DetailItem
                label="Mobile"
                value={
                  order.user
                    ?.mobile ||
                  order.address
                    ?.mobile ||
                  "-"
                }
              />
            </div>
          </section>

          <section className="ord-section">
            <SectionHeading
              icon={
                <MapPin size={20} />
              }
              title="Shipping Address"
            />

            <div className="ord-address">
              <div>
                {`${order.address?.firstName || ""} ${order.address?.lastName || ""}`.trim() ||
                  "-"}
              </div>

              <div>
                {
                  order.address
                    ?.address1 ||
                  "-"
                }
              </div>

              {order.address
                ?.address2 && (
                <div>
                  {
                    order.address
                      .address2
                  }
                </div>
              )}

              <div>
                {
                  order.address
                    ?.city || "-"
                }
              </div>

              <div>
                {
                  order.address
                    ?.state || "-"
                }
              </div>

              <div>
                {
                  order.address
                    ?.pin || "-"
                }
              </div>

              <div>
                {
                  order.address
                    ?.country ||
                  "-"
                }
              </div>

              <div>
                {
                  order.address
                    ?.mobile ||
                  "-"
                }
              </div>
            </div>
          </section>
        </div>

        {/* =====================================================
            PRODUCTS
        ===================================================== */}

        <section className="ord-section ord-products-section">

          <SectionHeading
            icon={
              <Package size={20} />
            }
            title="Ordered Products"
          />

          <div className="ord-items">
            {order.items?.length ? (
              order.items.map(
                (item, index) => {
                  const quantity =
                    Number(
                      item.quantity ||
                        1
                    );

                  const unitPrice =
                    Number(
                      item.price ||
                        0
                    );

                  const unitShipping =
                    Number(
                      item.shippingCost ||
                        0
                    );

                  const lineSubtotal =
                    unitPrice *
                    quantity;

                  const lineShipping =
                    unitShipping *
                    quantity;

                  const itemKey = [
                    item._id,
                    item.product
                      ?._id ||
                      item.product,
                    item.selectedColor ||
                      item.color,
                    item.selectedSize ||
                      item.size,
                    index,
                  ]
                    .filter(Boolean)
                    .join("-");

                  return (
                    <div
                      key={
                        itemKey ||
                        `order-item-${index}`
                      }
                      className="ord-item"
                    >
                      <div className="ord-item-left">

                        <div className="ord-item-image-wrap">
                          <img
                            src={
                              item.image ||
                              item.mainImage ||
                              "/placeholder-product.png"
                            }
                            alt={
                              item.name ||
                              "Product"
                            }
                            className="ord-item-img"
                          />
                        </div>

                        <div className="ord-item-content">

                          <div className="ord-item-name">
                            {item.name ||
                              "Unnamed Product"}
                          </div>

                          <div className="ord-item-meta">

                            {(item.selectedColorName ||
                              item.selectedColor) && (
                              <span className="ord-item-chip">
                                Color:{" "}
                                {item.selectedColorName ||
                                  item.selectedColor}
                              </span>
                            )}

                            {item.selectedSize && (
                              <span className="ord-item-chip">
                                Size:{" "}
                                {
                                  item.selectedSize
                                }
                              </span>
                            )}

                            <span className="ord-item-chip">
                              Qty:{" "}
                              {quantity}
                            </span>
                          </div>

                          <div className="ord-item-breakdown">
                            <span>
                              ₹
                              {unitPrice.toLocaleString(
                                "en-IN"
                              )}{" "}
                              ×{" "}
                              {quantity}
                            </span>

                            <span className="ord-item-line-total">
                              ₹
                              {lineSubtotal.toLocaleString(
                                "en-IN"
                              )}
                            </span>
                          </div>

                          <div className="ord-item-shipping">
                            <Truck
                              size={14}
                            />

                            <span>
                              Shipping: ₹
                              {unitShipping.toLocaleString(
                                "en-IN"
                              )}{" "}
                              / item
                            </span>

                            <strong>
                              ₹
                              {lineShipping.toLocaleString(
                                "en-IN"
                              )}{" "}
                              total
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="ord-item-price-box">
                        <span className="ord-item-price-label">
                          Item Total
                        </span>

                        <div className="ord-item-price">
                          ₹
                          {lineSubtotal.toLocaleString(
                            "en-IN"
                          )}
                        </div>

                        <span className="ord-item-shipping-total">
                          + ₹
                          {lineShipping.toLocaleString(
                            "en-IN"
                          )}{" "}
                          shipping
                        </span>
                      </div>
                    </div>
                  );
                }
              )
            ) : (
              <div className="ord-products-empty">
                No products found in this
                order.
              </div>
            )}
          </div>

          <div className="ord-products-totals">

            <div className="ord-products-total-row">
              <span>
                Subtotal
              </span>

              <strong>
                ₹
                {Number(
                  order.subtotal ||
                    0
                ).toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <div className="ord-products-total-row">
              <span>
                Shipping
              </span>

              <strong>
                ₹
                {Number(
                  order.shipping ||
                    0
                ).toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            <div className="ord-products-total-row">
              <span>
                Tax
              </span>

              <strong>
                ₹
                {Number(
                  order.tax || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            {Number(
              order.discount || 0
            ) > 0 && (
              <div className="ord-products-total-row ord-products-discount">
                <span>
                  Discount
                </span>

                <strong>
                  - ₹
                  {Number(
                    order.discount
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>
            )}

            <div className="ord-products-total-row ord-products-grand-total">
              <span>
                Order Total
              </span>

              <strong>
                ₹
                {Number(
                  order.total || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>
          </div>
        </section>

        {/* =====================================================
            ADMIN APPROVAL
        ===================================================== */}

        <section className="ord-section ord-approval-section">

          <div className="ord-approval-heading-row">

            <SectionHeading
              icon={
                <CheckCircle2
                  size={20}
                />
              }
              title="Admin Approval"
            />

            <span
              className={`ord-approval-status ord-approval-status-${approvalStatus}`}
            >
              {approvalStatus}
            </span>
          </div>

          <div className="ord-approval-content">

            <div className="ord-approval-copy">

              <strong>
                {approvalStatus ===
                "pending"
                  ? "This order is waiting for your approval."
                  : approvalStatus ===
                    "approved"
                  ? "This order has been approved and can proceed through shipment."
                  : "This order has been rejected."}
              </strong>

              {(approval
                ?.rejectionReason ||
                order.adminApproval
                  ?.rejectionReason) && (
                <p>
                  Rejection
                  reason:{" "}
                  {approval?.rejectionReason ||
                    order
                      .adminApproval
                      ?.rejectionReason}
                </p>
              )}

              {(approval
                ?.approvedAt ||
                order.adminApproval
                  ?.approvedAt) && (
                <p>
                  Approved
                  at:{" "}
                  {new Date(
                    approval?.approvedAt ||
                      order
                        .adminApproval
                        ?.approvedAt
                  ).toLocaleString()}
                </p>
              )}
            </div>

            {approvalStatus ===
              "pending" &&
              String(
                order.orderStatus ||
                  ""
              ).toLowerCase() ===
                "pending" && (
                <div className="ord-approval-actions">

                  <button
                    type="button"
                    className="ord-approve-button"
                    onClick={
                      handleApproveOrder
                    }
                    disabled={
                      approvalLoading
                    }
                  >
                    <CheckCircle2
                      size={17}
                    />

                    {approvalLoading
                      ? "Processing..."
                      : "Approve Order"}
                  </button>

                  <button
                    type="button"
                    className="ord-reject-button"
                    onClick={() => {
                      setRejectOpen(
                        true
                      );

                      setActionError(
                        ""
                      );
                    }}
                    disabled={
                      approvalLoading
                    }
                  >
                    <XCircle
                      size={17}
                    />

                    Reject Order
                  </button>
                </div>
              )}
          </div>
        </section>

        {/* =====================================================
            SHIPMENT
        ===================================================== */}

        <section className="ord-section">

          <SectionHeading
            icon={
              <Truck size={20} />
            }
            title="Shipment Details"
          />

          <div className="ord-shipment-top">

            <p className="ord-muted">
              Shipment and carrier
              information from
              Shiprocket.
            </p>

            <button
              type="button"
              className="ord-refresh-button"
              onClick={
                refreshTracking
              }
              disabled={
                trackingLoading
              }
            >
              <RefreshCw
                size={15}
                className={
                  trackingLoading
                    ? "ord-refresh-spin"
                    : ""
                }
              />

              {trackingLoading
                ? "Refreshing..."
                : "Refresh Tracking"}
            </button>
          </div>

          {tracking ? (
            <div className="ord-info-grid">

              <DetailItem
                label="Shiprocket Order ID"
                value={
                  order.shiprocket
                    ?.orderId ||
                  order.shiprocketOrderId ||
                  "-"
                }
                breakWord
              />

              <DetailItem
                label="Shipment ID"
                value={
                  order.shiprocket
                    ?.shipmentId ||
                  order.shipmentId ||
                  "-"
                }
                breakWord
              />

              <DetailItem
                label="AWB Number"
                value={
                  tracking.awbCode ||
                  "-"
                }
                breakWord
              />

              <DetailItem
                label="Courier"
                value={
                  tracking.courierName ||
                  "-"
                }
              />

              <DetailItem
                label="Shipment Status"
                value={
                  tracking.status ||
                  "-"
                }
              />

              <div>
                <div className="ord-label">
                  Tracking
                </div>

                {tracking.trackingUrl ? (
                  <a
                    href={
                      tracking.trackingUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ord-track-link"
                  >
                    <ExternalLink
                      size={15}
                    />

                    Open Tracking
                  </a>
                ) : (
                  <div className="ord-value">
                    -
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="ord-muted">
              Tracking information not
              available.
            </p>
          )}
        </section>

        {/* =====================================================
            STATUS UPDATE
        ===================================================== */}

        <section className="ord-section">

          <SectionHeading
            title="Update Order Status"
          />

          <div className="ord-status-row">

            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value
                )
              }
              className="ord-status-select"
            >
              {STATUS.map(
                (item) => (
                  <option
                    key={
                      item.value
                    }
                    value={
                      item.value
                    }
                  >
                    {item.label}
                  </option>
                )
              )}
            </select>

            <button
              type="button"
              onClick={
                handleStatusUpdate
              }
              disabled={saving}
              className="ord-update-button"
            >
              {saving
                ? "Updating..."
                : "Update Status"}
            </button>
          </div>
        </section>

        {/* =====================================================
            PAYMENT DETAILS
        ===================================================== */}

        <section className="ord-section">

          <SectionHeading
            icon={
              <CreditCard
                size={20}
              />
            }
            title="Payment Details"
          />

          <div className="ord-info-grid">

            <DetailItem
              label="Payment Method"
              value={
                order.paymentMethod ||
                "-"
              }
            />

            <DetailItem
              label="Payment Status"
              value={
                order.paymentStatus ||
                "-"
              }
            />

            <DetailItem
              label="Razorpay Payment ID"
              value={
                order.razorpayPaymentId ||
                  order.transactionId ||
                  "-"
              }
              breakWord
            />

            <DetailItem
              label="Amount"
              value={`₹${order.total}`}
              price
            />
          </div>
        </section>

        {/* =====================================================
            REJECTION MODAL
        ===================================================== */}

        {rejectOpen && (
          <div
            className="ord-modal-overlay"
            onMouseDown={(
              event
            ) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                setRejectOpen(
                  false
                );
              }
            }}
          >
            <div className="ord-modal">

              <div className="ord-modal-header">

                <div>
                  <div className="ord-modal-kicker">
                    Order Rejection
                  </div>

                  <h2 className="ord-modal-title">
                    Reject this
                    order?
                  </h2>
                </div>

                <button
                  type="button"
                  className="ord-modal-close"
                  onClick={() =>
                    setRejectOpen(
                      false
                    )
                  }
                  disabled={
                    approvalLoading
                  }
                >
                  ×
                </button>
              </div>

              <div className="ord-modal-body">

                <p className="ord-modal-description">
                  Please provide a
                  reason for
                  rejecting Order #
                  {order._id.slice(
                    -8
                  )}
                  .
                </p>

                <label className="ord-field-label">
                  Rejection Reason
                </label>

                <textarea
                  value={
                    rejectReason
                  }
                  onChange={(e) =>
                    setRejectReason(
                      e.target.value
                    )
                  }
                  rows={5}
                  className="ord-reject-textarea"
                  placeholder="Enter the reason..."
                  disabled={
                    approvalLoading
                  }
                />

                {actionError && (
                  <div className="ord-modal-error">
                    {
                      actionError
                    }
                  </div>
                )}

                <div className="ord-modal-actions">

                  <button
                    type="button"
                    className="ord-modal-cancel"
                    onClick={() => {
                      setRejectOpen(
                        false
                      );

                      setActionError(
                        ""
                      );
                    }}
                    disabled={
                      approvalLoading
                    }
                  >
                    Keep Order
                  </button>

                  <button
                    type="button"
                    className="ord-modal-confirm-reject"
                    onClick={
                      handleRejectOrder
                    }
                    disabled={
                      approvalLoading
                    }
                  >
                    <XCircle
                      size={16}
                    />

                    {approvalLoading
                      ? "Rejecting..."
                      : "Confirm Rejection"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          STYLES
      ===================================================== */}

      <style jsx>{`
        .ord-page {
          width: 100%;
          max-width: 100%;
          min-width: 0;
          padding: 28px 30px 45px;
          box-sizing: border-box;
          overflow-x: hidden;
          color: #000000;
        }

        .ord-action-alert {
          margin-bottom: 18px;
          min-height: 46px;
          padding: 0 14px;
          border: 1px solid #dcdcdc;
          border-radius: 9px;
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 14px;
          line-height: 1.4;
          font-weight: 600;
          box-sizing: border-box;
        }

        .ord-action-alert-success {
          border-color: #bfe3cb;
          background: #f0faf2;
          color: #1a7f37;
        }

        .ord-action-alert-error {
          border-color: #ecc3c3;
          background: #fff5f5;
          color: #a52d2d;
        }

        .ord-header {
          width: 100%;
          min-width: 0;
          margin-bottom: 24px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 22px;
        }

        .ord-back-button {
          min-height: 42px;
          padding: 0 14px;
          margin-bottom: 13px;
          border: 1px solid #cccccc;
          border-radius: 8px;
          background: #ffffff;
          color: #000000;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 16px;
          line-height: 1;
          font-weight: 600;
          cursor: pointer;
          transition: background
            0.15s ease;
        }

        .ord-back-button:hover {
          background: #f5f5f5;
        }

        .ord-title {
          margin: 0;
          color: #000000;
          font-size: 22px;
          line-height: 1.3;
          font-weight: 700;
        }

        .ord-subtitle {
          margin: 7px 0 0;
          color: #000000;
          opacity: 0.58;
          font-size: 16px;
          line-height: 1.45;
        }

        .ord-created {
          text-align: right;
        }

        .ord-label {
          color: #000000;
          opacity: 0.58;
          font-size: 15px;
          line-height: 1.35;
          font-weight: 600;
        }

        .ord-created-value {
          margin-top: 5px;
          color: #000000;
          font-size: 16px;
          line-height: 1.45;
          font-weight: 600;
        }

        .ord-summary-grid {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(
            5,
            minmax(0, 1fr)
          );
          gap: 16px;
          margin-bottom: 20px;
        }

        .ord-summary-card {
          min-width: 0;
          min-height: 132px;
          padding: 19px;
          border: 1px solid #dddddd;
          border-radius: 11px;
          background: #ffffff;
          box-sizing: border-box;
        }

        .ord-summary-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 15px;
        }

        .ord-summary-icon {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: #eeeeee;
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ord-summary-value {
          margin-top: 5px;
          color: #000000;
          font-size: 20px;
          line-height: 1.3;
          font-weight: 700;
        }

        .ord-summary-value-large {
          font-size: 25px;
          line-height: 1.2;
        }

        .ord-two-col {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(
            2,
            minmax(0, 1fr)
          );
          gap: 20px;
          margin-bottom: 20px;
        }

        .ord-section {
          width: 100%;
          min-width: 0;
          padding: 22px 24px;
          border: 1px solid #dddddd;
          border-radius: 11px;
          background: #ffffff;
          box-sizing: border-box;
          margin-bottom: 20px;
        }

        .ord-products-section {
          padding: 0;
          overflow: hidden;
        }

        .ord-section-heading {
          min-height: 38px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 9px;
          color: #000000;
          font-size: 20px;
          line-height: 1.35;
          font-weight: 700;
        }

        .ord-section-heading-icon {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: #eeeeee;
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ord-products-section
          .ord-section-heading {
          padding: 21px 24px 0;
          margin-bottom: 19px;
        }

        .ord-detail-list {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .ord-value {
          margin-top: 5px;
          color: #000000;
          font-size: 16px;
          line-height: 1.5;
          font-weight: 600;
        }

        .ord-address {
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: #000000;
          font-size: 16px;
          line-height: 1.55;
          font-weight: 500;
        }

        .ord-items {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .ord-item {
          min-height: 91px;
          padding: 16px 24px;
          border-top: 1px solid #e5e5e5;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          box-sizing: border-box;
        }

        .ord-item-left {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .ord-item-image-wrap {
          width: 64px;
          height: 64px;
          flex-basis: 64px;
          flex-shrink: 0;
        }

        .ord-item-img {
          width: 64px;
          height: 64px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid #dddddd;
          background: #f5f5f5;
          flex-shrink: 0;
          display: block;
        }

        .ord-item-content {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ord-item-name {
          max-width: 600px;
          overflow: hidden;
          color: #000000;
          font-size: 16px;
          line-height: 1.45;
          font-weight: 700;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .ord-item-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .ord-item-chip {
          padding: 3px 10px;
          border: 1px solid #dddddd;
          border-radius: 999px;
          background: #f5f5f5;
          color: #000000;
          font-size: 13px;
          line-height: 1.4;
          font-weight: 600;
        }

        .ord-item-breakdown {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #000000;
          opacity: 0.75;
          font-size: 14px;
          line-height: 1.4;
          font-weight: 500;
        }

        .ord-item-line-total {
          font-weight: 700;
          opacity: 1;
        }

        .ord-item-shipping {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #000000;
          opacity: 0.58;
          font-size: 13px;
          line-height: 1.4;
          font-weight: 500;
        }

        .ord-item-price-box {
          flex-shrink: 0;
          min-width: 140px;
          padding-left: 20px;
          border-left: 1px solid #ededed;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          text-align: right;
        }

        .ord-item-price-label {
          color: #000000;
          opacity: 0.58;
          font-size: 13px;
          line-height: 1.4;
          font-weight: 600;
        }

        .ord-item-price {
          margin-top: 3px;
          color: #000000;
          font-size: 20px;
          line-height: 1.25;
          font-weight: 700;
        }

        .ord-item-shipping-total {
          margin-top: 3px;
          color: #000000;
          opacity: 0.58;
          font-size: 13px;
          line-height: 1.4;
          font-weight: 500;
        }

        .ord-products-empty {
          padding: 30px 24px;
          color: #000000;
          opacity: 0.58;
          font-size: 16px;
          line-height: 1.5;
          text-align: center;
        }

        .ord-products-totals {
          margin: 8px 24px 24px;
          padding-top: 14px;
          border-top: 1px solid #e5e5e5;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .ord-products-total-row {
          width: 260px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: #000000;
          font-size: 15px;
          line-height: 1.4;
          font-weight: 500;
        }

        .ord-products-discount {
          color: #1a7f37;
        }

        .ord-products-grand-total {
          margin-top: 6px;
          padding-top: 10px;
          border-top: 1px solid #dddddd;
          font-size: 18px;
          font-weight: 700;
        }

        .ord-approval-heading-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          flex-wrap: wrap;
        }

        .ord-approval-heading-row
          :global(
            .ord-section-heading
          ) {
          margin-bottom: 0;
        }

        .ord-approval-status {
          min-height: 31px;
          padding: 0 12px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .ord-approval-status-pending {
          background: #fff4d8;
          color: #8a6200;
        }

        .ord-approval-status-approved {
          background: #e6f4ea;
          color: #1a7f37;
        }

        .ord-approval-status-rejected {
          background: #fdeaea;
          color: #a52d2d;
        }

        .ord-approval-content {
          margin-top: 6px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }

        .ord-approval-copy {
          min-width: 240px;
          flex: 1;
        }

        .ord-approval-copy strong {
          display: block;
          color: #000000;
          font-size: 15px;
          line-height: 1.5;
        }

        .ord-approval-copy p {
          margin: 8px 0 0;
          color: #000000;
          opacity: 0.62;
          font-size: 13px;
          line-height: 1.5;
        }

        .ord-approval-actions {
          display: flex;
          align-items: center;
          gap: 9px;
          flex-wrap: wrap;
        }

        .ord-approve-button,
        .ord-reject-button {
          min-height: 45px;
          padding: 0 15px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .ord-approve-button {
          border: 1px solid #1a7f37;
          background: #1a7f37;
          color: #ffffff;
        }

        .ord-approve-button:hover:not(
          :disabled
        ) {
          background: #14652d;
          border-color: #14652d;
        }

        .ord-reject-button {
          border: 1px solid #c1443f;
          background: #ffffff;
          color: #c1443f;
        }

        .ord-reject-button:hover:not(
          :disabled
        ) {
          background: #fff2f2;
        }

        .ord-approve-button:disabled,
        .ord-reject-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ord-shipment-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .ord-shipment-top
          .ord-muted {
          margin: 0;
        }

        .ord-refresh-button {
          min-height: 40px;
          padding: 0 13px;
          border: 1px solid #cccccc;
          border-radius: 8px;
          background: #ffffff;
          color: #000000;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .ord-refresh-button:hover:not(
          :disabled
        ) {
          background: #f4f4f4;
        }

        .ord-refresh-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        :global(.ord-refresh-spin) {
          animation: ordRefreshSpin
            0.8s linear infinite;
        }

        @keyframes ordRefreshSpin {
          to {
            transform: rotate(360deg);
          }
        }

        .ord-info-grid {
          display: grid;
          grid-template-columns: repeat(
            4,
            minmax(0, 1fr)
          );
          gap: 22px;
        }

        .ord-track-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-top: 5px;
          color: #000000;
          font-size: 16px;
          line-height: 1.4;
          font-weight: 700;
          text-decoration: underline;
        }

        .ord-muted {
          margin: 0;
          color: #000000;
          opacity: 0.58;
          font-size: 16px;
          line-height: 1.5;
        }

        .ord-status-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .ord-status-select {
          width: 100%;
          max-width: 320px;
          height: 50px;
          padding: 0 14px;
          border: 1px solid #cccccc;
          border-radius: 8px;
          background: #ffffff;
          color: #000000;
          font-size: 16px;
          line-height: 1.4;
          outline: none;
          cursor: pointer;
          box-sizing: border-box;
        }

        .ord-update-button {
          min-height: 50px;
          padding: 0 20px;
          border: 1px solid #000000;
          border-radius: 8px;
          background: #000000;
          color: #ffffff;
          font-size: 16px;
          line-height: 1;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .ord-update-button:hover:not(
          :disabled
        ) {
          background: #222222;
        }

        .ord-update-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .ord-badge {
          min-height: 31px;
          padding: 0 11px;
          border: 1px solid #cccccc;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #eeeeee;
          color: #000000;
          font-size: 14px;
          line-height: 1;
          font-weight: 700;
          text-transform: capitalize;
          box-sizing: border-box;
        }

        .ord-badge-success {
          background: #e6f4ea;
          border-color: #bfe3cb;
          color: #1a7f37;
        }

        .ord-detail-item-label {
          color: #000000;
          opacity: 0.58;
          font-size: 15px;
          line-height: 1.35;
          font-weight: 600;
        }

        .ord-detail-item-value {
          margin-top: 5px;
          color: #000000;
          font-size: 16px;
          line-height: 1.5;
          font-weight: 600;
        }

        .ord-detail-item-value-price {
          font-size: 20px;
          line-height: 1.3;
          font-weight: 700;
        }

        .ord-detail-item-value-break {
          word-break: break-all;
        }

        /* =====================================================
           REJECTION MODAL
        ===================================================== */

        .ord-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 3000;
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(
            0,
            0,
            0,
            0.48
          );
          box-sizing: border-box;
        }

        .ord-modal {
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow-y: auto;
          border-radius: 13px;
          background: #ffffff;
          box-shadow: 0 22px 70px
            rgba(
              0,
              0,
              0,
              0.22
            );
        }

        .ord-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          padding: 20px 22px;
          border-bottom: 1px solid #e5e5e5;
        }

        .ord-modal-kicker {
          margin-bottom: 4px;
          color: #a52d2d;
          font-size: 11px;
          line-height: 1.3;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .ord-modal-title {
          margin: 0;
          color: #000000;
          font-size: 20px;
          line-height: 1.35;
          font-weight: 700;
        }

        .ord-modal-close {
          width: 34px;
          height: 34px;
          border: none;
          border-radius: 50%;
          background: #f2f2f2;
          color: #000000;
          font-size: 23px;
          line-height: 1;
          cursor: pointer;
        }

        .ord-modal-close:hover {
          background: #e9e9e9;
        }

        .ord-modal-body {
          padding: 22px;
        }

        .ord-modal-description {
          margin: 0 0 18px;
          color: #000000;
          opacity: 0.62;
          font-size: 14px;
          line-height: 1.55;
        }

        .ord-field-label {
          display: block;
          margin-bottom: 7px;
          color: #000000;
          font-size: 13px;
          line-height: 1.4;
          font-weight: 700;
        }

        .ord-reject-textarea {
          width: 100%;
          min-height: 125px;
          padding: 12px 13px;
          border: 1px solid #cccccc;
          border-radius: 8px;
          background: #ffffff;
          color: #000000;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.5;
          resize: vertical;
          outline: none;
          box-sizing: border-box;
        }

        .ord-reject-textarea:focus {
          border-color: #000000;
        }

        .ord-modal-error {
          margin-top: 12px;
          padding: 10px 12px;
          border: 1px solid #ecc3c3;
          border-radius: 7px;
          background: #fff5f5;
          color: #a52d2d;
          font-size: 12px;
          line-height: 1.45;
        }

        .ord-modal-actions {
          margin-top: 18px;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 9px;
          flex-wrap: wrap;
        }

        .ord-modal-cancel,
        .ord-modal-confirm-reject {
          min-height: 43px;
          padding: 0 14px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .ord-modal-cancel {
          border: 1px solid #cccccc;
          background: #ffffff;
          color: #000000;
        }

        .ord-modal-cancel:hover:not(
          :disabled
        ) {
          background: #f5f5f5;
        }

        .ord-modal-confirm-reject {
          border: 1px solid #c1443f;
          background: #c1443f;
          color: #ffffff;
        }

        .ord-modal-confirm-reject:hover:not(
          :disabled
        ) {
          background: #a83a36;
          border-color: #a83a36;
        }

        .ord-modal-cancel:disabled,
        .ord-modal-confirm-reject:disabled,
        .ord-modal-close:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 1100px) {
          .ord-summary-grid,
          .ord-info-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }
        }

        @media (max-width: 800px) {
          .ord-two-col {
            grid-template-columns: 1fr;
          }

          .ord-approval-content {
            align-items: stretch;
            flex-direction: column;
          }

          .ord-approval-actions {
            width: 100%;
          }

          .ord-approve-button,
          .ord-reject-button {
            flex: 1 1 0;
          }

          .ord-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .ord-created {
            text-align: left;
          }

          .ord-summary-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }
        }

        @media (max-width: 600px) {
          .ord-page {
            padding: 20px 14px 35px;
          }

          .ord-summary-grid,
          .ord-info-grid {
            grid-template-columns: 1fr;
          }

          .ord-section {
            padding: 18px;
          }

          .ord-products-section {
            padding: 0;
          }

          .ord-section-heading {
            font-size: 19px;
          }

          .ord-products-section
            .ord-section-heading {
            padding: 18px 18px 0;
          }

          .ord-item {
            padding: 14px 18px;
            align-items: flex-start;
            flex-direction: column;
            gap: 15px;
          }

          .ord-item-left {
            width: 100%;
          }

          .ord-item-image-wrap {
            width: 56px;
            height: 56px;
            flex-basis: 56px;
          }

          .ord-item-img {
            width: 56px;
            height: 56px;
          }

          .ord-item-name {
            max-width: 100%;
            white-space: normal;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .ord-item-price {
            font-size: 18px;
          }

          .ord-item-price-box {
            width: 100%;
            min-width: 0;
            padding-left: 0;
            padding-top: 12px;
            border-left: none;
            border-top: 1px solid #ededed;
            align-items: flex-start;
            text-align: left;
          }

          .ord-products-totals {
            margin: 0 18px 18px;
            align-items: stretch;
          }

          .ord-products-total-row {
            width: 100%;
          }

          .ord-status-row {
            flex-direction: column;
            align-items: stretch;
          }

          .ord-status-select {
            max-width: 100%;
          }

          .ord-update-button {
            width: 100%;
          }

          .ord-shipment-top {
            align-items: stretch;
            flex-direction: column;
          }

          .ord-refresh-button {
            width: 100%;
          }

          .ord-modal-overlay {
            padding: 12px;
          }

          .ord-modal-actions {
            flex-direction: column-reverse;
          }

          .ord-modal-cancel,
          .ord-modal-confirm-reject {
            width: 100%;
          }
        }
      `}</style>
    </AdminShell>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon,
  label,
  value,
  customValue,
  large,
}) {
  return (
    <div className="ord-summary-card">
      <div className="ord-summary-card-top">
        <div className="ord-summary-icon">
          {icon}
        </div>

        <div className="ord-label">
          {label}
        </div>
      </div>

      {customValue ? (
        customValue
      ) : (
        <div
          className={`ord-summary-value ${
            large
              ? "ord-summary-value-large"
              : ""
          }`}
        >
          {value}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   SECTION HEADING
========================================================= */

function SectionHeading({
  icon,
  title,
}) {
  return (
    <div className="ord-section-heading">
      {icon && (
        <div className="ord-section-heading-icon">
          {icon}
        </div>
      )}

      <span>
        {title}
      </span>
    </div>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
  label,
  value,
  breakWord = false,
  price = false,
}) {
  return (
    <div>
      <div className="ord-detail-item-label">
        {label}
      </div>

      <div
        className={[
          "ord-detail-item-value",
          price
            ? "ord-detail-item-value-price"
            : "",
          breakWord
            ? "ord-detail-item-value-break"
            : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

/* =========================================================
   BADGE
========================================================= */

function Badge({
  children,
  success,
}) {
  return (
    <span
      className={`ord-badge ${
        success
          ? "ord-badge-success"
          : ""
      }`}
    >
      {children}
    </span>
  );
}