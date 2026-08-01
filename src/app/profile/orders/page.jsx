"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyOrders } from "@/lib/api";

const ITEMS_PER_PAGE = 6;

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);

    const res = await getMyOrders();

    if (res?.success) {
      setOrders(res.orders);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="ord-wrap">
        <h1 className="ord-title">My Orders</h1>
        <p className="ord-loading">Loading...</p>

        <style jsx>{`
          .ord-wrap {
            max-width: 1400px;
            margin: 0 auto;
            padding: 64px 32px;
            background: #FEFFF5;
            box-sizing: border-box;
          }
          .ord-title {
            font-family: "Tobias TRIAL", serif;
            font-size: 32px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 32px;
          }
          .ord-loading {
            font-family: "Mona Sans", sans-serif;
            color: #7b7f5c;
          }

          @media (max-width: 768px) {
            .ord-wrap {
              padding: 40px 20px;
            }
            .ord-title {
              font-size: 24px;
              margin-bottom: 20px;
            }
          }
        `}</style>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="ord-empty-wrap">
        <h2 className="ord-empty-title">No Orders Yet</h2>
        <p className="ord-empty-text">
          You haven&apos;t placed any orders yet.
        </p>

        <Link href="/products" className="ord-empty-btn">
          Continue Shopping
        </Link>

        <style jsx>{`
          .ord-empty-wrap {
            max-width: 1400px;
            margin: 0 auto;
            padding: 80px 32px;
            text-align: center;
            background: #FEFFF5;
            box-sizing: border-box;
          }
          .ord-empty-title {
            font-family: "Tobias TRIAL", serif;
            font-size: 26px;
            font-weight: 600;
            color: #1a1a1a;
          }
          .ord-empty-text {
            font-family: "Mona Sans", sans-serif;
            color: #6b6b5f;
            margin-top: 12px;
            font-size: 15px;
          }
          .ord-empty-btn {
            display: inline-block;
            margin-top: 32px;
            background: #7b7f5c;
            color: #FEFFF5;
            font-family: "Mona Sans", sans-serif;
            font-weight: 600;
            font-size: 14px;
            padding: 14px 28px;
            border-radius: 8px;
            text-decoration: none;
            transition: background 0.25s ease;
          }
          .ord-empty-btn:hover {
            background: #686b4c;
          }

          @media (max-width: 768px) {
            .ord-empty-wrap {
              padding: 56px 20px;
            }
            .ord-empty-title {
              font-size: 20px;
            }
            .ord-empty-text {
              font-size: 13px;
            }
            .ord-empty-btn {
              width: 100%;
              padding: 12px 20px;
              font-size: 13px;
              margin-top: 24px;
            }
          }
        `}</style>
      </div>
    );
  }

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = orders.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function getPageNumbers() {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }

    return pages;
  }

  return (
    <div className="ord-wrap">
      <h1 className="ord-title">My Orders</h1>

      <div className="ord-list">
        {paginatedOrders.map((order) => (
          <div key={order._id} className="ord-card">
            <div className="ord-card-top">
              <div>
                <h2 className="ord-card-id">
                  Order #{order._id.slice(-8)}
                </h2>
                <p className="ord-card-date">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>

              <Link href={`/profile/orders/${order._id}`} className="ord-view-btn">
                View Details
              </Link>
            </div>

            <div className="ord-grid">
              <div className="ord-grid-item">
                <p className="ord-label">Total</p>
                <p className="ord-value">₹{order.total}</p>
              </div>

              <div className="ord-grid-item">
                <p className="ord-label">Payment</p>
                <span
                  className={`ord-value ${
                    order.paymentStatus === "paid"
                      ? "ord-status-paid"
                      : "ord-status-unpaid"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </div>

              <div className="ord-grid-item">
                <p className="ord-label">Status</p>
                <span className="ord-value">{order.orderStatus}</span>
              </div>

              <div className="ord-grid-item">
                <p className="ord-label">Items</p>
                <span className="ord-value">{order.items.length}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="ord-pagination">
          <button
            className="ord-page-btn ord-page-nav"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {getPageNumbers().map((p, idx) =>
            p === "..." ? (
              <span key={`dots-${idx}`} className="ord-page-dots">
                ...
              </span>
            ) : (
              <button
                key={p}
                className={`ord-page-btn ${
                  p === currentPage ? "ord-page-active" : ""
                }`}
                onClick={() => goToPage(p)}
              >
                {p}
              </button>
            )
          )}

          <button
            className="ord-page-btn ord-page-nav"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      <style jsx>{`
        .ord-wrap {
          
          margin: 0 auto;
          padding: 88px 72px;
          background: #FEFFF5;
          box-sizing: border-box;
        }

        .ord-title {
          font-family: "Tobias TRIAL", serif;
          font-size: 34px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 40px 0;
        }

        .ord-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .ord-card {
          border: 1px solid #e5e5da;
          border-radius: 14px;
          padding: 24px;
          background: #ffffff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
          box-sizing: border-box;
        }

        .ord-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .ord-card-id {
          font-family: "Mona Sans", sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .ord-card-date {
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
          color: #8a8a7e;
          margin: 4px 0 0 0;
        }

        .ord-view-btn {
          font-family: "Mona Sans", sans-serif;
          background: #7b7f5c;
          color: #FEFFF5;
          font-size: 13px;
          font-weight: 600;
          padding: 10px 20px;
          border-radius: 8px;
          text-decoration: none;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 0.25s ease;
        }

        .ord-view-btn:hover {
          background: #686b4c;
        }

        .ord-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-top: 24px;
        }

        .ord-label {
          font-family: "Mona Sans", sans-serif;
          font-size: 12px;
          color: #8a8a7e;
          margin: 0 0 4px 0;
        }

        .ord-value {
          font-family: "Mona Sans", sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #1a1a1a;
        }

        .ord-status-paid {
          color: #3f8f4f;
        }

        .ord-status-unpaid {
          color: #c1443f;
        }

        .ord-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 40px;
        }

        .ord-page-btn {
          font-family: "Mona Sans", sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #1a1a1a;
          background: #ffffff;
          border: 1px solid #e5e5da;
          border-radius: 8px;
          padding: 8px 14px;
          min-width: 38px;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .ord-page-btn:hover:not(:disabled) {
          background: #f1f1e6;
        }

        .ord-page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .ord-page-active {
          background: #7b7f5c;
          border-color: #7b7f5c;
          color: #FEFFF5;
        }

        .ord-page-nav {
          padding: 8px 16px;
        }

        .ord-page-dots {
          font-family: "Mona Sans", sans-serif;
          color: #8a8a7e;
          padding: 0 4px;
        }

        @media (max-width: 768px) {
          .ord-wrap {
            padding: 52px 20px;
          }

          .ord-title {
            font-size: 24px;
            margin-bottom: 24px;
          }

          .ord-list {
            gap: 16px;
          }

          .ord-card {
            padding: 16px;
            border-radius: 10px;
          }

          .ord-card-id {
            font-size: 14px;
          }

          .ord-card-date {
            font-size: 11px;
          }

          .ord-view-btn {
            font-size: 12px;
            padding: 8px 16px;
            width: 100%;
          }

          .ord-card-top {
            flex-direction: column;
            align-items: flex-start;
          }

          .ord-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-top: 16px;
          }

          .ord-label {
            font-size: 11px;
          }

          .ord-value {
            font-size: 13px;
          }

          .ord-pagination {
            gap: 6px;
            margin-top: 28px;
          }

          .ord-page-btn {
            font-size: 12px;
            padding: 6px 10px;
            min-width: 32px;
          }

          .ord-page-nav {
            padding: 6px 12px;
          }
        }

        @media (max-width: 400px) {
          .ord-page-nav {
            flex: 1 1 auto;
          }
        }
      `}</style>
    </div>
  );
}