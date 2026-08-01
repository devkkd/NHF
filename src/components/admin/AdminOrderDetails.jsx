"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  getAdminOrder,
  updateOrderStatus,
} from "@/lib/adminApi";

import { trackOrder } from "@/lib/api";
import AdminShell from "@/components/admin/AdminShell";
import { ArrowLeft } from "lucide-react";

const STATUS = [
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

export default function AdminOrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);

  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  async function loadOrder() {
    try {
      setLoading(true);

      const res = await getAdminOrder(id);

      if (res.success) {
        setOrder(res.order);
        setStatus(res.order.orderStatus);

        try {
          const t = await trackOrder(id);

          if (t.success) {
            setTracking(t);
          }
        } catch (err) {}
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusUpdate() {
    try {
      setSaving(true);

      const res = await updateOrderStatus(id, status);

      if (res.success) {
        await loadOrder();
        alert("Order updated successfully.");
      }
    } catch (err) {
      console.log(err);
      alert("Unable to update order.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminShell pageTitle="Order Details">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, color: "var(--nhf-muted)", fontSize: 13 }}>
          <svg className="nhf-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          &nbsp; Loading Order…
        </div>
      </AdminShell>
    );
  }

  if (!order) {
    return (
      <AdminShell pageTitle="Order Details">
        <div className="nhf-alert nhf-alert-error">Order not found.</div>
      </AdminShell>
    );
  }

  return (
    <AdminShell pageTitle="Order Details">
      <div className="ord-wrap">
        <div className="nhf-page-header">
          <div>
            <button
              type="button"
              className="nhf-btn nhf-btn-ghost nhf-btn-sm"
              onClick={() => (window.location.href = "/admin/orders")}
              style={{ marginBottom: 8 }}
            >
              <ArrowLeft size={13} /> Back to Orders
            </button>
            <h1 className="nhf-page-title">
              Order #{order._id.slice(-8)}
            </h1>
          </div>

          <div className="ord-created">
            <div className="ord-created-label">Created</div>
            <div className="ord-created-value">
              {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="ord-summary-grid">
          <div className="ord-summary-card">
            <div className="ord-label">Order Total</div>
            <div className="ord-summary-value">₹{order.total}</div>
          </div>

          <div className="ord-summary-card">
            <div className="ord-label">Payment</div>
            <div style={{ marginTop: 8 }}>
              <span
                className={`ord-badge ${
                  order.paymentStatus === "paid"
                    ? "ord-badge-success"
                    : "ord-badge-danger"
                }`}
              >
                {order.paymentStatus}
              </span>
            </div>
          </div>

          <div className="ord-summary-card">
            <div className="ord-label">Order Status</div>
            <div className="ord-summary-value ord-summary-value-sm">
              {order.orderStatus}
            </div>
          </div>

          <div className="ord-summary-card">
            <div className="ord-label">Items</div>
            <div className="ord-summary-value">{order.items.length}</div>
          </div>
        </div>

        {/* Customer + Address */}
        <div className="ord-two-col">
          <div className="nhf-form-section">
            <div className="nhf-form-section-title">Customer Details</div>

            <div className="ord-detail-list">
              <div>
                <div className="ord-label">Name</div>
                <div className="ord-value">{order.user?.name}</div>
              </div>

              <div>
                <div className="ord-label">Email</div>
                <div className="ord-value">{order.user?.email}</div>
              </div>

              <div>
                <div className="ord-label">Mobile</div>
                <div className="ord-value">
                  {order.user?.mobile || order.address?.mobile}
                </div>
              </div>
            </div>
          </div>

          <div className="nhf-form-section">
            <div className="nhf-form-section-title">Shipping Address</div>

            <div className="ord-address-list">
              <div>{order.address?.name}</div>
              <div>{order.address?.address}</div>
              <div>{order.address?.city}</div>
              <div>{order.address?.state}</div>
              <div>{order.address?.pincode}</div>
              <div>{order.address?.country}</div>
              <div>{order.address?.mobile}</div>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="nhf-form-section" style={{ padding: 0 }}>
          <div className="nhf-form-section-title" style={{ padding: "20px 24px 0" }}>
            Ordered Products
          </div>

          <div className="ord-items">
            {order.items.map((item) => (
              <div key={item._id} className="ord-item">
                <div className="ord-item-left">
                  <img
                    src={item.image || item.mainImage || "/placeholder-product.png"}
                    alt={item.name}
                    className="ord-item-img"
                  />

                  <div>
                    <div className="ord-item-name">{item.name}</div>
                    <div className="ord-item-qty">Qty : {item.quantity}</div>
                  </div>
                </div>

                <div className="ord-item-price">₹{item.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Shiprocket Tracking */}
        <div className="nhf-form-section">
          <div className="nhf-form-section-title">Shipment Details</div>

          {tracking ? (
            <div className="ord-tracking-grid">
              <div>
                <div className="ord-label">AWB Number</div>
                <div className="ord-value">{tracking.awbCode || "-"}</div>
              </div>

              <div>
                <div className="ord-label">Courier</div>
                <div className="ord-value">{tracking.courierName || "-"}</div>
              </div>

              <div>
                <div className="ord-label">Shipment Status</div>
                <div className="ord-value">{tracking.status || "-"}</div>
              </div>

              <div>
                <div className="ord-label">Tracking</div>

                {tracking.trackingUrl ? (
                  <a
                    href={tracking.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ord-track-link"
                  >
                    Open Tracking
                  </a>
                ) : (
                  <div className="ord-value">-</div>
                )}
              </div>
            </div>
          ) : (
            <p className="ord-muted-text">Tracking information not available.</p>
          )}
        </div>

        {/* Update Status */}
        <div className="nhf-form-section">
          <div className="nhf-form-section-title">Update Order Status</div>

          <div className="ord-status-row">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="nhf-form-input ord-status-select"
            >
              {STATUS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <button
              onClick={handleStatusUpdate}
              disabled={saving}
              className="nhf-btn nhf-btn-primary"
            >
              {saving ? "Updating…" : "Update Status"}
            </button>
          </div>
        </div>

        {/* Payment */}
        <div className="nhf-form-section">
          <div className="nhf-form-section-title">Payment Details</div>

          <div className="ord-tracking-grid">
            <div>
              <div className="ord-label">Payment Method</div>
              <div className="ord-value">{order.paymentMethod}</div>
            </div>

            <div>
              <div className="ord-label">Payment Status</div>
              <div className="ord-value">{order.paymentStatus}</div>
            </div>

            <div>
              <div className="ord-label">Razorpay Payment ID</div>
              <div className="ord-value" style={{ wordBreak: "break-all" }}>
                {order.paymentId || "-"}
              </div>
            </div>

            <div>
              <div className="ord-label">Amount</div>
              <div className="ord-summary-value ord-summary-value-sm">
                ₹{order.total}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .ord-wrap {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .ord-created {
          text-align: right;
        }

        .ord-created-label {
          font-size: 12px;
          color: var(--nhf-muted);
        }

        .ord-created-value {
          font-family: "Mona Sans", sans-serif;
          font-weight: 600;
          font-size: 13px;
          color: var(--nhf-text, #1a1a1a);
          margin-top: 2px;
        }

        .ord-summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .ord-summary-card {
          border: 1px solid var(--nhf-border);
          border-radius: 12px;
          padding: 18px;
          background: #ffffff;
        }

        .ord-label {
          font-size: 12px;
          color: var(--nhf-muted);
        }

        .ord-value {
          font-family: "Mona Sans", sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: var(--nhf-text, #1a1a1a);
          margin-top: 4px;
        }

        .ord-summary-value {
          font-family: "Tobias TRIAL", serif;
          font-size: 26px;
          font-weight: 600;
          color: var(--nhf-text, #1a1a1a);
          margin-top: 6px;
        }

        .ord-summary-value-sm {
          font-size: 17px;
        }

        .ord-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .ord-badge-success {
          background: #e7f3e6;
          color: #3f8f4f;
        }

        .ord-badge-danger {
          background: #fdf1f0;
          color: #c1443f;
        }

        .ord-two-col {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .ord-detail-list,
        .ord-address-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
          color: var(--nhf-text, #1a1a1a);
        }

        .ord-address-list {
          gap: 6px;
        }

        .ord-items {
          display: flex;
          flex-direction: column;
        }

        .ord-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-top: 1px solid var(--nhf-border);
        }

        .ord-item-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .ord-item-img {
          width: 56px;
          height: 56px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid var(--nhf-border);
          flex-shrink: 0;
          background: #f7f7f2;
        }

        .ord-item-name {
          font-family: "Mona Sans", sans-serif;
          font-weight: 700;
          font-size: 14px;
          color: var(--nhf-text, #1a1a1a);
        }

        .ord-item-qty {
          font-size: 12px;
          color: var(--nhf-muted);
          margin-top: 2px;
        }

        .ord-item-price {
          font-family: "Mona Sans", sans-serif;
          font-weight: 700;
          font-size: 14px;
          color: var(--nhf-text, #1a1a1a);
        }

        .ord-tracking-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .ord-track-link {
          display: inline-block;
          margin-top: 4px;
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #7b7f5c;
          text-decoration: underline;
        }

        .ord-muted-text {
          font-size: 13px;
          color: var(--nhf-muted);
        }

        .ord-status-row {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }

        .ord-status-select {
          width: 100%;
          max-width: 280px;
        }

        @media (max-width: 1024px) {
          .ord-summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .ord-tracking-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .ord-wrap {
            gap: 16px;
          }

          .nhf-page-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .ord-created {
            text-align: left;
          }

          .ord-summary-grid,
          .ord-two-col,
          .ord-tracking-grid {
            grid-template-columns: 1fr;
          }

          .ord-summary-card {
            padding: 14px;
          }

          .ord-summary-value {
            font-size: 20px;
          }

          .ord-item {
            padding: 14px 16px;
          }

          .ord-item-img {
            width: 44px;
            height: 44px;
          }

          .ord-item-name {
            font-size: 13px;
          }

          .ord-status-row {
            flex-direction: column;
          }

          .ord-status-select {
            max-width: 100%;
          }
        }
      `}</style>
    </AdminShell>
  );
}