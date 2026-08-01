"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllOrders } from "@/lib/adminApi";
import AdminShell from "@/components/admin/AdminShell";

const PAGE_SIZE = 10;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);

      const res = await getAllOrders();

      if (res?.success) {
        setOrders(res.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));

  const paginatedOrders = orders.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function goToPage(page) {
    const clamped = Math.min(Math.max(page, 1), totalPages);
    setCurrentPage(clamped);
  }

  function getPageNumbers() {
    const pages = [];
    const windowSize = 1;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - windowSize && i <= currentPage + windowSize)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "…") {
        pages.push("…");
      }
    }

    return pages;
  }

  if (loading) {
    return (
      <AdminShell pageTitle="Orders">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, color: "var(--nhf-muted)", fontSize: 13 }}>
          <svg className="nhf-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          &nbsp; Loading…
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell pageTitle="Orders">
      <div className="nhf-page-header">
        <div>
          <h1 className="nhf-page-title">All Orders</h1>
        </div>

        <div className="ord-total">
          Total Orders : <b>{orders.length}</b>
        </div>
      </div>

      <div className="nhf-form-section" style={{ padding: 0, overflow: "hidden" }}>
        <div className="ord-table-wrap">
          <table className="ord-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: "center" }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedOrders.map((order) => (
                <tr key={order._id}>
                  <td>#{order._id.slice(-8)}</td>
                  <td>{order.user?.name || "-"}</td>
                  <td>{order.user?.email || "-"}</td>
                  <td>₹{order.total}</td>

                  <td>
                    <span
                      className={`ord-badge ${
                        order.paymentStatus === "paid"
                          ? "ord-badge-success"
                          : "ord-badge-danger"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>

                  <td>{order.orderStatus}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>

                  <td style={{ textAlign: "center" }}>
                    <Link
                      href={`/admin/orders/${order._id}`}
                      className="nhf-btn nhf-btn-primary nhf-btn-sm"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 32, color: "var(--nhf-muted)" }}>
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {orders.length > 0 && (
          <div className="ord-pagination">
            <div className="ord-pagination-info">
              Showing{" "}
              <b>
                {(currentPage - 1) * PAGE_SIZE + 1}–
                {Math.min(currentPage * PAGE_SIZE, orders.length)}
              </b>{" "}
              of <b>{orders.length}</b>
            </div>

            <div className="ord-pagination-controls">
              <button
                type="button"
                className="nhf-btn nhf-btn-ghost nhf-btn-sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Prev
              </button>

              {getPageNumbers().map((page, idx) =>
                page === "…" ? (
                  <span key={`ellipsis-${idx}`} className="ord-page-ellipsis">
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    type="button"
                    className={`ord-page-btn ${
                      page === currentPage ? "ord-page-btn-active" : ""
                    }`}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                type="button"
                className="nhf-btn nhf-btn-ghost nhf-btn-sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .ord-total {
          font-size: 13px;
          color: var(--nhf-muted);
        }

        .ord-table-wrap {
          overflow-x: auto;
          border: 1px solid var(--nhf-border);
          border-radius: 12px;
        }

        .ord-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .ord-table thead {
          background: var(--nhf-bg-soft, #f7f7f2);
        }

        .ord-table th {
          text-align: left;
          padding: 12px 16px;
          font-weight: 600;
          font-size: 12px;
          color: var(--nhf-muted);
          text-transform: uppercase;
          letter-spacing: 0.03em;
          white-space: nowrap;
        }

        .ord-table td {
          padding: 14px 16px;
          border-top: 1px solid var(--nhf-border);
          white-space: nowrap;
          color: var(--nhf-text, #1a1a1a);
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

        .ord-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          padding: 16px;
          border-top: 1px solid var(--nhf-border);
        }

        .ord-pagination-info {
          font-size: 12px;
          color: var(--nhf-muted);
        }

        .ord-pagination-controls {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .ord-page-btn {
          min-width: 32px;
          height: 32px;
          padding: 0 8px;
          border: 1px solid var(--nhf-border);
          border-radius: 8px;
          background: #ffffff;
          color: var(--nhf-text, #1a1a1a);
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }

        .ord-page-btn:hover {
          border-color: #7b7f5c;
        }

        .ord-page-btn-active {
          background: #7b7f5c;
          border-color: #7b7f5c;
          color: #ffffff;
        }

        .ord-page-ellipsis {
          font-size: 12px;
          color: var(--nhf-muted);
          padding: 0 4px;
        }

        @media (max-width: 768px) {
          .nhf-page-header {
            flex-wrap: wrap;
            gap: 8px;
          }

          .ord-table th,
          .ord-table td {
            padding: 10px 12px;
            font-size: 12px;
          }

          .ord-pagination {
            flex-direction: column;
            align-items: flex-start;
          }

          .ord-pagination-controls {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </AdminShell>
  );
}