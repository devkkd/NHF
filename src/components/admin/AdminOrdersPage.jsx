"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
} from "lucide-react";

import { getAllOrders } from "@/lib/adminApi";
import AdminShell from "@/components/admin/AdminShell";

const PAGE_SIZE = 10;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");

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

  /* =====================================================
     FILTER
  ===================================================== */

  const filteredOrders = orders.filter((order) => {
    const query = search.trim().toLowerCase();

    const orderId = String(
      order?._id || ""
    ).toLowerCase();

    const customerName = String(
      order?.user?.name || ""
    ).toLowerCase();

    const customerEmail = String(
      order?.user?.email || ""
    ).toLowerCase();

    const matchesSearch =
      !query ||
      orderId.includes(query) ||
      customerName.includes(query) ||
      customerEmail.includes(query);

    const approvalStatus = String(
      order?.adminApproval?.status || "pending"
    ).toLowerCase();

    const matchesApproval =
      approvalFilter === "all" ||
      approvalStatus === approvalFilter;

    return (
      matchesSearch &&
      matchesApproval
    );
  });

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredOrders.length /
        PAGE_SIZE
    )
  );

  const paginatedOrders =
    filteredOrders.slice(
      (currentPage - 1) *
        PAGE_SIZE,
      currentPage *
        PAGE_SIZE
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, approvalFilter]);

  function goToPage(page) {
    const clamped = Math.min(
      Math.max(page, 1),
      totalPages
    );

    setCurrentPage(clamped);
  }

  function getPageNumbers() {
    const pages = [];
    const windowSize = 1;

    for (
      let i = 1;
      i <= totalPages;
      i++
    ) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >=
          currentPage -
            windowSize &&
          i <=
            currentPage +
              windowSize)
      ) {
        pages.push(i);
      } else if (
        pages[
          pages.length - 1
        ] !== "…"
      ) {
        pages.push("…");
      }
    }

    return pages;
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <AdminShell pageTitle="Orders">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "300px",
            color: "#000000",
            fontSize: "16px",
            fontWeight: 600,
            gap: "10px",
          }}
        >
          <svg
            className="nhf-spinner"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>

          <span>
            Loading Orders...
          </span>
        </div>
      </AdminShell>
    );
  }

  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <AdminShell pageTitle="Orders">
      <div className="nhf-page-header">
        <div>
          <h1
            className="nhf-page-title"
            style={{
              color: "#000000",
              fontSize: "22px",
              lineHeight: "1.3",
              fontWeight: 700,
            }}
          >
            All Orders
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: "#000000",
              opacity: 0.58,
              fontSize: "16px",
              lineHeight: "1.45",
            }}
          >
            Manage and view all
            customer orders.
          </p>
        </div>

        <div
          className="ord-total"
          style={{
            color: "#000000",
            fontSize: "16px",
            lineHeight: "1.4",
            fontWeight: 600,
          }}
        >
          Total Orders :{" "}
          <b
            style={{
              color: "#000000",
              fontSize: "17px",
              fontWeight: 700,
            }}
          >
            {
              filteredOrders.length
            }
          </b>
        </div>
      </div>

      {/* ==================================================
          SEARCH + FILTERS
      ================================================== */}

      <div className="ord-toolbar">
        <div className="ord-search-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search order, customer or email..."
            className="ord-search-input"
          />
        </div>

        <div className="ord-filter-group">
          {[
            {
              value: "all",
              label: "All",
            },
            {
              value: "pending",
              label: "Pending",
            },
            {
              value: "approved",
              label: "Approved",
            },
            {
              value: "rejected",
              label: "Rejected",
            },
          ].map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`ord-filter-btn ${
                approvalFilter ===
                filter.value
                  ? "ord-filter-btn-active"
                  : ""
              }`}
              onClick={() =>
                setApprovalFilter(
                  filter.value
                )
              }
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* ==================================================
          TABLE CARD
      ================================================== */}

      <div
        className="nhf-form-section"
        style={{
          padding: 0,
          overflow: "hidden",
        }}
      >
        <div className="ord-table-wrap">
          <table className="ord-table">
            <thead>
              <tr>
                <th>
                  Order ID
                </th>

                <th>
                  Customer
                </th>

                <th>
                  Email
                </th>

                <th>
                  Total
                </th>

                <th>
                  Payment
                </th>

                <th>
                  Status
                </th>

                <th>
                  Approval
                </th>

                <th>
                  Date
                </th>

                <th
                  style={{
                    textAlign:
                      "center",
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {paginatedOrders.map(
                (order) => (
                  <tr
                    key={
                      order._id
                    }
                  >
                    {/* ORDER ID */}

                    <td className="order-id-cell">
                      #
                      {
                        order._id?.slice(
                          -8
                        )
                      }
                    </td>

                    {/* CUSTOMER */}

                    <td className="customer-cell">
                      {
                        order.user
                          ?.name ||
                        "-"
                      }
                    </td>

                    {/* EMAIL */}

                    <td
                      className="email-cell"
                      title={
                        order.user
                          ?.email ||
                        ""
                      }
                    >
                      {
                        order.user
                          ?.email ||
                        "-"
                      }
                    </td>

                    {/* TOTAL */}

                    <td className="total-cell">
                      ₹
                      {
                        order.total
                      }
                    </td>

                    {/* PAYMENT */}

                    <td>
                      <span
                        className={`ord-badge ${
                          order.paymentStatus ===
                          "paid"
                            ? "ord-badge-success"
                            : "ord-badge-danger"
                        }`}
                      >
                        {
                          order.paymentStatus
                        }
                      </span>
                    </td>

                    {/* STATUS */}

                    <td className="status-cell">
                      {
                        order.orderStatus
                      }
                    </td>

                    {/* APPROVAL */}

                    <td>
                      {(() => {
                        const approval =
                          String(
                            order
                              ?.adminApproval
                              ?.status ||
                              "pending"
                          ).toLowerCase();

                        const label =
                          approval ===
                          "approved"
                            ? "Approved"
                            : approval ===
                              "rejected"
                            ? "Rejected"
                            : "Pending";

                        return (
                          <span
                            className={`ord-approval-badge ord-approval-${approval}`}
                          >
                            {
                              label
                            }
                          </span>
                        );
                      })()}
                    </td>

                    {/* DATE */}

                    <td className="date-cell">
                      {order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    {/* ACTION */}

                    <td
                      style={{
                        textAlign:
                          "center",
                      }}
                    >
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="ord-view-button"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                )
              )}

              {/* EMPTY */}

              {filteredOrders.length ===
                0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="ord-empty-cell"
                  >
                    <div
                      style={{
                        color:
                          "#000000",
                        fontSize:
                          "17px",
                        fontWeight:
                          600,
                      }}
                    >
                      No orders found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ==================================================
            PAGINATION
        ================================================== */}

        {filteredOrders.length >
          0 && (
          <div className="ord-pagination">
            <div className="ord-pagination-info">
              Showing{" "}
              <b>
                {(currentPage -
                  1) *
                  PAGE_SIZE +
                  1}
                –
                {Math.min(
                  currentPage *
                    PAGE_SIZE,
                  filteredOrders.length
                )}
              </b>{" "}
              of{" "}
              <b>
                {
                  filteredOrders.length
                }
              </b>
            </div>

            <div className="ord-pagination-controls">
              <button
                type="button"
                className="ord-page-arrow"
                onClick={() =>
                  goToPage(1)
                }
                disabled={
                  currentPage ===
                  1
                }
                title="First page"
              >
                <ChevronFirst
                  size={17}
                />
              </button>

              <button
                type="button"
                className="ord-page-arrow"
                onClick={() =>
                  goToPage(
                    currentPage -
                      1
                  )
                }
                disabled={
                  currentPage ===
                  1
                }
                title="Previous page"
              >
                <ChevronLeft
                  size={18}
                />
              </button>

              {getPageNumbers().map(
                (
                  page,
                  idx
                ) =>
                  page ===
                  "…" ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="ord-page-ellipsis"
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={page}
                      type="button"
                      className={`ord-page-btn ${
                        page ===
                        currentPage
                          ? "ord-page-btn-active"
                          : ""
                      }`}
                      onClick={() =>
                        goToPage(
                          page
                        )
                      }
                    >
                      {page}
                    </button>
                  )
              )}

              <button
                type="button"
                className="ord-page-arrow"
                onClick={() =>
                  goToPage(
                    currentPage +
                      1
                  )
                }
                disabled={
                  currentPage ===
                  totalPages
                }
                title="Next page"
              >
                <ChevronRight
                  size={18}
                />
              </button>

              <button
                type="button"
                className="ord-page-arrow"
                onClick={() =>
                  goToPage(
                    totalPages
                  )
                }
                disabled={
                  currentPage ===
                  totalPages
                }
                title="Last page"
              >
                <ChevronLast
                  size={17}
                />
              </button>
            </div>

            <div className="ord-page-count">
              Page{" "}
              <b>
                {
                  currentPage
                }
              </b>{" "}
              of{" "}
              <b>
                {
                  totalPages
                }
              </b>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .ord-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin: 18px 0;
          flex-wrap: wrap;
        }

        .ord-search-wrap {
          flex: 1 1 320px;
          min-width: 240px;
        }

        .ord-search-input {
          width: 100%;
          height: 44px;
          padding: 0 14px;
          border: 1px solid var(--nhf-border);
          border-radius: 8px;
          background: #ffffff;
          color: #000000;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
        }

        .ord-search-input:focus {
          border-color: #000000;
        }

        .ord-filter-group {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .ord-filter-btn {
          min-height: 38px;
          padding: 0 13px;
          border: 1px solid #d2d2d2;
          border-radius: 7px;
          background: #ffffff;
          color: #000000;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .ord-filter-btn:hover {
          background: #f4f4f4;
        }

        .ord-filter-btn-active {
          background: #000000;
          border-color: #000000;
          color: #ffffff;
        }

        .nhf-page-title {
          color: #000000 !important;
          font-size: 22px !important;
          line-height: 1.3 !important;
          font-weight: 700 !important;
        }

        .ord-total {
          color: #000000 !important;
          font-size: 16px !important;
          line-height: 1.4 !important;
          font-weight: 600 !important;
        }

        .ord-total b {
          color: #000000 !important;
          font-size: 17px !important;
          font-weight: 700 !important;
        }

        .ord-table-wrap {
          width: 100%;
          max-width: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          border: 1px solid var(--nhf-border);
          border-radius: 12px;
          -webkit-overflow-scrolling: touch;
        }

        .ord-table {
          width: 100%;
          min-width: 1180px;
          border-collapse: collapse;
          font-size: 16px;
          color: #000000;
        }

        .ord-table thead {
          background: #f7f7f2;
        }

        .ord-table th {
          text-align: left;
          padding: 15px 16px;
          height: 55px;
          font-weight: 700;
          font-size: 15px;
          line-height: 1.35;
          color: #000000;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          white-space: nowrap;
          border-bottom: 1px solid var(--nhf-border);
          box-sizing: border-box;
        }

        .ord-table td {
          height: 76px;
          padding: 14px 16px;
          border-top: 1px solid var(--nhf-border);
          white-space: nowrap;
          color: #000000;
          font-size: 16px;
          line-height: 1.45;
          font-weight: 500;
          vertical-align: middle;
          box-sizing: border-box;
        }

        .ord-table tbody tr:hover {
          background: #fafafa;
        }

        .order-id-cell {
          font-size: 16px !important;
          line-height: 1.4 !important;
          font-weight: 700 !important;
          color: #000000 !important;
        }

        .customer-cell {
          font-size: 16px !important;
          line-height: 1.45 !important;
          font-weight: 600 !important;
          color: #000000 !important;
        }

        .email-cell {
          max-width: 250px;
          overflow: hidden;
          text-overflow: ellipsis;
          font-size: 15px !important;
          color: #000000 !important;
        }

        .total-cell {
          font-size: 18px !important;
          line-height: 1.3 !important;
          font-weight: 700 !important;
          color: #000000 !important;
        }

        .ord-badge {
          display: inline-flex !important;
          align-items: center;
          justify-content: center;
          min-height: 31px;
          padding: 0 11px !important;
          border-radius: 999px !important;
          font-size: 14px !important;
          line-height: 1 !important;
          font-weight: 700 !important;
          text-transform: capitalize;
        }

        .ord-badge-success {
          background: #e7f3e6 !important;
          color: #000000 !important;
        }

        .ord-badge-danger {
          background: #fdf1f0 !important;
          color: #000000 !important;
        }

        .ord-approval-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 30px;
          padding: 0 10px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .ord-approval-pending {
          background: #fff4d8;
          color: #8a6200;
        }

        .ord-approval-approved {
          background: #e6f4ea;
          color: #1a7f37;
        }

        .ord-approval-rejected {
          background: #fdeaea;
          color: #a52d2d;
        }

        .status-cell {
          font-size: 16px !important;
          line-height: 1.4 !important;
          font-weight: 600 !important;
          color: #000000 !important;
        }

        .date-cell {
          font-size: 15px !important;
          line-height: 1.4 !important;
          font-weight: 500 !important;
          color: #000000 !important;
        }

        .ord-view-button {
          min-height: 42px;
          padding: 0 15px;
          border: 1px solid #000000;
          border-radius: 8px;
          background: #000000;
          color: #ffffff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          line-height: 1;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.2s ease;
        }

        .ord-view-button:hover {
          background: #222222;
          color: #ffffff;
        }

        .ord-empty-cell {
          height: 280px !important;
          text-align: center !important;
          color: #000000 !important;
          font-size: 17px !important;
          padding: 30px !important;
        }

        .ord-pagination {
          width: 100%;
          min-height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          flex-wrap: wrap;
          padding: 13px 17px;
          border-top: 1px solid var(--nhf-border);
          background: #ffffff;
          box-sizing: border-box;
        }

        .ord-pagination-info {
          min-width: 180px;
          color: #000000;
          opacity: 0.62;
          font-size: 14px;
          line-height: 1.4;
          font-weight: 500;
          white-space: nowrap;
        }

        .ord-pagination-info b {
          color: #000000;
          font-weight: 700;
        }

        .ord-pagination-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          flex-wrap: wrap;
        }

        .ord-page-btn,
        .ord-page-arrow {
          width: 38px;
          height: 38px;
          padding: 0;
          border: 1px solid #d2d2d2;
          border-radius: 7px;
          background: #ffffff;
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          line-height: 1;
          font-weight: 700;
          cursor: pointer;
          box-sizing: border-box;
        }

        .ord-page-btn:hover:not(
          .ord-page-btn-active
        ),
        .ord-page-arrow:hover:not(
          :disabled
        ) {
          background: #f3f3f3;
          border-color: #aaaaaa;
        }

        .ord-page-btn-active {
          background: #000000;
          border-color: #000000;
          color: #ffffff;
        }

        .ord-page-arrow:disabled {
          opacity: 0.32;
          cursor: not-allowed;
        }

        .ord-page-ellipsis {
          width: 24px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000000;
          opacity: 0.5;
          font-size: 16px;
          line-height: 1;
        }

        .ord-page-count {
          min-width: 110px;
          text-align: right;
          color: #000000;
          opacity: 0.62;
          font-size: 14px;
          line-height: 1.4;
          font-weight: 500;
          white-space: nowrap;
        }

        .ord-page-count b {
          color: #000000;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .ord-toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .ord-search-wrap {
            width: 100%;
            min-width: 0;
          }

          .ord-filter-group {
            width: 100%;
            justify-content: flex-start;
          }

          .ord-filter-btn {
            flex: 1 1 auto;
          }

          .nhf-page-header {
            flex-wrap: wrap;
            gap: 10px;
          }

          .ord-table-wrap {
            overflow-x: auto;
          }

          .ord-table {
            min-width: 1180px;
          }

          .ord-table th {
            padding: 13px 12px;
            font-size: 14px;
          }

          .ord-table td {
            padding: 13px 12px;
            font-size: 15px;
          }

          .ord-pagination {
            flex-direction: column;
            align-items: center;
          }

          .ord-pagination-info,
          .ord-page-count {
            width: 100%;
            min-width: 0;
            text-align: center;
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