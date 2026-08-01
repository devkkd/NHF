"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getOrderById, trackOrder } from "@/lib/api";
import OrderTimeline from "../OrderTimeline";

export default function OrderDetailsPage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(null);

  useEffect(() => {
    if (id) loadOrder();
  }, [id]);

  async function loadOrder() {
    setLoading(true);

    const res = await getOrderById(id);

    if (res.success) {
      setOrder(res.order);

      if (res.order.awbCode) {
        const track = await trackOrder(id);

        if (track.success) {
          setTracking(track.tracking);
        }
      }
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="odt-wrap">
        <p className="odt-status-text">Loading...</p>

        <style jsx>{`
          .odt-wrap {
            max-width: 1400px;
            margin: 0 auto;
            padding: 64px 32px;
            background: #FEFFF5;
            box-sizing: border-box;
          }
          .odt-status-text {
            font-family: "Mona Sans", sans-serif;
            color: #7b7f5c;
            font-size: 15px;
          }

          @media (max-width: 768px) {
            .odt-wrap {
              padding: 40px 20px;
            }
          }
        `}</style>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="odt-wrap">
        <p className="odt-status-text">Order not found.</p>

        <style jsx>{`
          .odt-wrap {
            max-width: 1400px;
            margin: 0 auto;
            padding: 64px 32px;
            background: #FEFFF5;
            box-sizing: border-box;
          }
          .odt-status-text {
            font-family: "Mona Sans", sans-serif;
            color: #6b6b5f;
            font-size: 15px;
          }

          @media (max-width: 768px) {
            .odt-wrap {
              padding: 40px 20px;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="odt-wrap">
      <h1 className="odt-title">Order Details</h1>

      {/* Order Info */}
      <div className="odt-card odt-info-card">
        <div className="odt-info-grid">
          <div>
            <h3 className="odt-section-heading">Order Information</h3>

            <p className="odt-row">
              <b>Order ID :</b> {order._id}
            </p>
            <p className="odt-row">
              <b>Status :</b> {order.orderStatus}
            </p>
            <p className="odt-row">
              <b>Payment :</b> {order.paymentStatus}
            </p>
            <p className="odt-row">
              <b>Payment Method :</b> {order.paymentMethod}
            </p>
            <p className="odt-row">
              <b>Total :</b> ₹{order.total}
            </p>
          </div>

          <div>
            <h3 className="odt-section-heading">Shipping Address</h3>

            <p className="odt-row">
              {order.address.firstName} {order.address.lastName}
            </p>
            <p className="odt-row">{order.address.address1}</p>
            <p className="odt-row">{order.address.address2}</p>
            <p className="odt-row">
              {order.address.city}, {order.address.state}
            </p>
            <p className="odt-row">{order.address.pin}</p>
            <p className="odt-row">{order.address.mobile}</p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="odt-card">
        <h3 className="odt-section-heading odt-section-heading-lg">
          Ordered Products
        </h3>

        <div className="odt-items">
          {order.items.map((item) => (
            <div key={item.product} className="odt-item">
              <img
                src={item.image}
                alt={item.name}
                className="odt-item-img"
              />

              <div className="odt-item-info">
                <h4 className="odt-item-name">{item.name}</h4>
                <p className="odt-item-meta">Qty : {item.quantity}</p>
                <p className="odt-item-meta">₹{item.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping */}
      <div className="odt-card">
        <h3 className="odt-section-heading odt-section-heading-lg">
          Shipping
        </h3>

        <p className="odt-row">
          <b>Courier :</b> {order.courierName || "-"}
        </p>
        <p className="odt-row">
          <b>Shipment ID :</b> {order.shipmentId || "-"}
        </p>
        <p className="odt-row">
          <b>Tracking ID :</b> {order.awbCode || "-"}
        </p>

        {order.trackingUrl ? (
          <a
            href={order.trackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="odt-track-btn"
          >
            Track Shipment
          </a>
        ) : (
          <p className="odt-track-pending">
            Tracking will be available soon.
          </p>
        )}
      </div>
      {/* Order Timeline */}
<div className="odt-card">
  <h3 className="odt-section-heading odt-section-heading-lg">
    Order Timeline
  </h3>

  <OrderTimeline order={order} />
</div>

      <style jsx>{`
        .odt-wrap {
        
          margin: 0 auto;
          padding: 88px 72px;
          background: #FEFFF5;
          box-sizing: border-box;
        }

        .odt-title {
          font-family: "Tobias TRIAL", serif;
          font-size: 34px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 32px 0;
        }

        .odt-card {
          border: 1px solid #e5e5da;
          border-radius: 14px;
          padding: 24px;
          background: #ffffff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
          box-sizing: border-box;
          margin-bottom: 32px;
        }

        .odt-info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .odt-section-heading {
          font-family: "Tobias TRIAL", serif;
          font-size: 16px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 16px 0;
        }

        .odt-section-heading-lg {
          font-size: 20px;
          margin-bottom: 20px;
        }

        .odt-row {
          font-family: "Mona Sans", sans-serif;
          font-size: 14px;
          color: #3a3a34;
          margin: 0 0 8px 0;
          line-height: 1.5;
        }

        .odt-row b {
          color: #1a1a1a;
          font-weight: 700;
        }

        .odt-items {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .odt-item {
          display: flex;
          gap: 20px;
          border-bottom: 1px solid #eeeee2;
          padding-bottom: 20px;
        }

        .odt-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .odt-item-img {
          width: 96px;
          height: 96px;
          border-radius: 10px;
          object-fit: cover;
          flex-shrink: 0;
        }

        .odt-item-info {
          flex: 1;
        }

        .odt-item-name {
          font-family: "Mona Sans", sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 6px 0;
        }

        .odt-item-meta {
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
          color: #6b6b5f;
          margin: 0 0 4px 0;
        }

        .odt-track-btn {
          display: inline-block;
          margin-top: 20px;
          background: #7b7f5c;
          color: #FEFFF5;
          font-family: "Mona Sans", sans-serif;
          font-weight: 600;
          font-size: 14px;
          padding: 12px 24px;
          border-radius: 8px;
          text-decoration: none;
          transition: background 0.25s ease;
        }

        .odt-track-btn:hover {
          background: #686b4c;
        }

        .odt-track-pending {
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
          color: #8a8a7e;
          margin-top: 20px;
        }

        @media (max-width: 768px) {
          .odt-wrap {
            padding: 52px 20px;
          }

          .odt-title {
            font-size: 24px;
            margin-bottom: 20px;
          }

          .odt-card {
            padding: 16px;
            border-radius: 10px;
            margin-bottom: 20px;
          }

          .odt-info-grid {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .odt-section-heading {
            font-size: 14px;
            margin-bottom: 12px;
          }

          .odt-section-heading-lg {
            font-size: 16px;
            margin-bottom: 16px;
          }

          .odt-row {
            font-size: 12px;
          }

          .odt-item {
            gap: 12px;
            padding-bottom: 16px;
          }

          .odt-item-img {
            width: 72px;
            height: 72px;
            border-radius: 8px;
          }

          .odt-item-name {
            font-size: 13px;
          }

          .odt-item-meta {
            font-size: 11px;
          }

          .odt-track-btn {
            width: 100%;
            text-align: center;
            font-size: 13px;
            padding: 10px 20px;
            margin-top: 16px;
          }

          .odt-track-pending {
            font-size: 11px;
            margin-top: 16px;
          }
        }
      `}</style>
    </div>
  );
}