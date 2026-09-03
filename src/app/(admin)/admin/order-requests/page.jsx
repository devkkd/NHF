"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import {
  Search,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  Package,
  RotateCcw,
  XCircle,
  Repeat2,
} from "lucide-react";

import {
  getAllOrderRequests,
} from "@/lib/adminApi";

import AdminShell from "@/components/admin/AdminShell";

const COLORS = {
  black: "#111111",
  white: "#ffffff",
  text: "#222222",
  muted: "#666666",
  border: "#dddddd",
  light: "#f7f7f2",
  red: "#b23b3b",
  redLight: "#fff0f0",
};

const PAGE_SIZE = 10;

const FILTERS = [
  {
    value: "all",
    label: "All Requests",
  },
  {
    value: "cancel",
    label: "Cancellations",
  },
  {
    value: "return",
    label: "Returns",
  },
  {
    value: "replacement",
    label: "Replacements",
  },
];

export default function AdminOrderRequestsPage() {
  const [requests, setRequests] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [currentPage, setCurrentPage] =
    useState(1);

  const [activeFilter, setActiveFilter] =
    useState("all");

  const [search, setSearch] =
    useState("");

  const [error, setError] =
    useState("");

  /* =====================================================
     LOAD REQUESTS
  ===================================================== */

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests(
    showRefresh = false
  ) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const res =
        await getAllOrderRequests();

      if (res?.success) {
        setRequests(
          Array.isArray(
            res.requests
          )
            ? res.requests
            : Array.isArray(
                res.orderRequests
              )
            ? res.orderRequests
            : []
        );
      } else {
        setError(
          res?.message ||
            "Unable to load order requests."
        );
      }
    } catch (err) {
      console.error(
        "Order request load error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load order requests."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  /* =====================================================
     HELPERS
  ===================================================== */

  function getRequestType(request) {
    return String(
      request?.type ||
        request?.requestType ||
        ""
    ).toLowerCase();
  }

  function getRequestStatus(request) {
    return String(
      request?.status ||
        "pending"
    ).toLowerCase();
  }

  function getRequestLabel(type) {
    switch (type) {
      case "cancel":
        return "Cancellation";

      case "return":
        return "Return";

      case "replacement":
        return "Replacement";

      default:
        return type || "Request";
    }
  }

  function getRequestIcon(type) {
    switch (type) {
      case "cancel":
        return <XCircle size={17} />;

      case "return":
        return <RotateCcw size={17} />;

      case "replacement":
        return <Repeat2 size={17} />;

      default:
        return <Package size={17} />;
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case "pending":
        return "Pending";

      case "approved":
        return "Approved";

      case "rejected":
        return "Rejected";

      case "cancelled":
        return "Cancelled";

      default:
        return (
          status || "Pending"
        );
    }
  }

  function getOrderId(request) {
    return (
      request?.order?._id ||
      request?.orderId ||
      request?.order ||
      ""
    );
  }

  function getCustomerName(
    request
  ) {
    return (
      request?.user?.name ||
      request?.customer?.name ||
      request?.order?.user?.name ||
      "-"
    );
  }

  function getCustomerEmail(
    request
  ) {
    return (
      request?.user?.email ||
      request?.customer?.email ||
      request?.order?.user?.email ||
      "-"
    );
  }

  function getProductName(
    request
  ) {
    return (
      request?.productSnapshot
        ?.name ||
      request?.product?.name ||
      request?.item?.name ||
      "-"
    );
  }

  function getReason(request) {
    return (
      request?.reason ||
      "No reason provided"
    );
  }

  /* =====================================================
     FILTER + SEARCH
  ===================================================== */

  const filteredRequests =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      return requests.filter(
        (request) => {
          const type =
            getRequestType(
              request
            );

          const orderId =
            String(
              getOrderId(request)
            ).toLowerCase();

          const requestId =
            String(
              request?._id || ""
            ).toLowerCase();

          const customer =
            getCustomerName(
              request
            ).toLowerCase();

          const email =
            getCustomerEmail(
              request
            ).toLowerCase();

          const matchesType =
            activeFilter ===
              "all" ||
            type ===
              activeFilter;

          const matchesSearch =
            !query ||
            orderId.includes(
              query
            ) ||
            requestId.includes(
              query
            ) ||
            customer.includes(
              query
            ) ||
            email.includes(
              query
            );

          return (
            matchesType &&
            matchesSearch
          );
        }
      );
    }, [
      requests,
      activeFilter,
      search,
    ]);

  /* =====================================================
     COUNTS
  ===================================================== */

  const pendingCount =
    requests.filter(
      (item) =>
        getRequestStatus(
          item
        ) === "pending"
    ).length;

  const returnCount =
    requests.filter(
      (item) =>
        getRequestType(item) ===
        "return"
    ).length;

  const replacementCount =
    requests.filter(
      (item) =>
        getRequestType(item) ===
        "replacement"
    ).length;

  const cancelCount =
    requests.filter(
      (item) =>
        getRequestType(item) ===
        "cancel"
    ).length;

  /* =====================================================
     PAGINATION
  ===================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredRequests.length /
        PAGE_SIZE
    )
  );

  const paginatedRequests =
    filteredRequests.slice(
      (currentPage - 1) *
        PAGE_SIZE,
      currentPage *
        PAGE_SIZE
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    activeFilter,
    search,
  ]);

  function goToPage(page) {
    const nextPage = Math.min(
      Math.max(
        page,
        1
      ),
      totalPages
    );

    setCurrentPage(
      nextPage
    );
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
      <AdminShell pageTitle="Order Requests">
        <div className="request-loading">
          <span className="request-spinner" />

          <span>
            Loading order requests...
          </span>
        </div>

        <style jsx>{`
          .request-loading {
            min-height: 350px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            color: ${COLORS.black};
            font-size: 16px;
            font-weight: 600;
          }

          .request-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #d5d5d5;
            border-top-color: #000000;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </AdminShell>
    );
  }

  /* =====================================================
     MAIN
  ===================================================== */

  return (
    <AdminShell pageTitle="Order Requests">

      <div
        style={{
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          color: COLORS.black,
          fontSize: "16px",
          paddingBottom: "30px",
        }}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="request-header">

          <div>
            <h1 className="request-title">
              Order Requests
            </h1>

            <p className="request-subtitle">
              Manage customer cancellation,
              return and replacement requests.
            </p>
          </div>

          <button
            type="button"
            className="request-refresh-button"
            onClick={() =>
              loadRequests(true)
            }
            disabled={refreshing}
          >
            <RefreshCw
              size={16}
              className={
                refreshing
                  ? "refresh-spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="request-error">
            {error}
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="request-stats">

          <div className="request-stat-card">
            <div className="request-stat-label">
              Total Requests
            </div>

            <div className="request-stat-value">
              {requests.length}
            </div>
          </div>

          <div className="request-stat-card">
            <div className="request-stat-label">
              Pending
            </div>

            <div className="request-stat-value request-stat-pending">
              {pendingCount}
            </div>
          </div>

          <div className="request-stat-card">
            <div className="request-stat-label">
              Returns
            </div>

            <div className="request-stat-value">
              {returnCount}
            </div>
          </div>

          <div className="request-stat-card">
            <div className="request-stat-label">
              Replacements
            </div>

            <div className="request-stat-value">
              {replacementCount}
            </div>
          </div>

          <div className="request-stat-card">
            <div className="request-stat-label">
              Cancellations
            </div>

            <div className="request-stat-value">
              {cancelCount}
            </div>
          </div>

        </div>

        {/* =================================================
            FILTER BAR
        ================================================= */}

        <div className="request-toolbar">

          <div className="request-search">

            <Search
              size={17}
              className="request-search-icon"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder="Search request, order, customer or email..."
              className="request-search-input"
            />

          </div>

          <div className="request-filters">

            {FILTERS.map(
              (filter) => (
                <button
                  key={
                    filter.value
                  }
                  type="button"
                  className={`request-filter ${
                    activeFilter ===
                    filter.value
                      ? "request-filter-active"
                      : ""
                  }`}
                  onClick={() =>
                    setActiveFilter(
                      filter.value
                    )
                  }
                >
                  {filter.label}
                </button>
              )
            )}

          </div>

        </div>

        {/* =================================================
            TABLE
        ================================================= */}

        <div className="request-card">

          <div className="request-table-wrap">

            <table className="request-table">

              <thead>
                <tr>
                  <th>
                    Request
                  </th>

                  <th>
                    Order
                  </th>

                  <th>
                    Customer
                  </th>

                  <th>
                    Product
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Reason
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>

                {paginatedRequests.map(
                  (request) => {
                    const type =
                      getRequestType(
                        request
                      );

                    const status =
                      getRequestStatus(
                        request
                      );

                    const orderId =
                      getOrderId(
                        request
                      );

                    return (
                      <tr
                        key={
                          request._id
                        }
                      >

                        {/* REQUEST */}

                        <td>
                          <div className="request-id">
                            #
                            {String(
                              request._id ||
                                ""
                            ).slice(
                              -8
                            )}
                          </div>
                        </td>

                        {/* ORDER */}

                        <td>
                          <div className="order-id">
                            {orderId
                              ? `#${String(
                                  orderId
                                ).slice(
                                  -8
                                )}`
                              : "-"}
                          </div>
                        </td>

                        {/* CUSTOMER */}

                        <td>
                          <div className="customer-name">
                            {
                              getCustomerName(
                                request
                              )
                            }
                          </div>

                          <div className="customer-email">
                            {
                              getCustomerEmail(
                                request
                              )
                            }
                          </div>
                        </td>

                        {/* PRODUCT */}

                        <td>
                          <div className="product-name">
                            {
                              getProductName(
                                request
                              )
                            }
                          </div>
                        </td>

                        {/* TYPE */}

                        <td>
                          <span
                            className={`type-badge type-${type}`}
                          >
                            {
                              getRequestIcon(
                                type
                              )
                            }

                            {
                              getRequestLabel(
                                type
                              )
                            }
                          </span>
                        </td>

                        {/* REASON */}

                        <td>
                          <div
                            className="reason-cell"
                            title={getReason(
                              request
                            )}
                          >
                            {
                              getReason(
                                request
                              )
                            }
                          </div>
                        </td>

                        {/* STATUS */}

                        <td>
                          <span
                            className={`status-badge status-${status}`}
                          >
                            {
                              getStatusLabel(
                                status
                              )
                            }
                          </span>
                        </td>

                        {/* DATE */}

                        <td>
                          <div className="date-cell">
                            {request.createdAt
                              ? new Date(
                                  request.createdAt
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "-"}
                          </div>
                        </td>

                        {/* ACTION */}

                        <td>
                          <Link
                            href={`/admin/order-requests/${request._id}`}
                            className="view-button"
                          >
                            <Eye
                              size={15}
                            />

                            View
                          </Link>
                        </td>

                      </tr>
                    );
                  }
                )}

                {filteredRequests.length ===
                  0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="empty-cell"
                    >
                      <Package
                        size={30}
                      />

                      <strong>
                        No requests found
                      </strong>

                      <span>
                        Try changing the
                        search or filter.
                      </span>
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>

          {/* =================================================
              PAGINATION
          ================================================= */}

          {filteredRequests.length >
            0 && (
            <div className="pagination">

              <div className="pagination-info">
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
                    filteredRequests.length
                  )}
                </b>{" "}
                of{" "}
                <b>
                  {
                    filteredRequests.length
                  }
                </b>
              </div>

              <div className="pagination-controls">

                <button
                  type="button"
                  className="page-arrow"
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
                    size={16}
                  />
                </button>

                <button
                  type="button"
                  className="page-arrow"
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
                    size={17}
                  />
                </button>

                {getPageNumbers().map(
                  (
                    page,
                    index
                  ) =>
                    page ===
                    "…" ? (
                      <span
                        key={`dots-${index}`}
                        className="page-dots"
                      >
                        …
                      </span>
                    ) : (
                      <button
                        key={page}
                        type="button"
                        className={`page-number ${
                          page ===
                          currentPage
                            ? "page-number-active"
                            : ""
                        }`}
                        onClick={() =>
                          goToPage(
                            page
                          )
                        }
                      >
                        {
                          page
                        }
                      </button>
                    )
                )}

                <button
                  type="button"
                  className="page-arrow"
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
                    size={17}
                  />
                </button>

                <button
                  type="button"
                  className="page-arrow"
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
                    size={16}
                  />
                </button>

              </div>

              <div className="page-count">
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

      </div>

      {/* ===================================================
          STYLES
      =================================================== */}

      <style jsx>{`
        .request-header {
          width: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
          box-sizing: border-box;
        }

        .request-title {
          margin: 0;
          color: ${COLORS.black};
          font-size: 22px;
          line-height: 1.3;
          font-weight: 700;
        }

        .request-subtitle {
          margin: 7px 0 0;
          color: ${COLORS.muted};
          font-size: 14px;
          line-height: 1.5;
          font-weight: 400;
        }

        .request-refresh-button {
          min-height: 40px;
          padding: 0 13px;
          border: 1px solid ${COLORS.border};
          border-radius: 7px;
          background: ${COLORS.white};
          color: ${COLORS.black};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .request-refresh-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .refresh-spin {
          animation: refreshSpin 0.8s linear infinite;
        }

        @keyframes refreshSpin {
          to {
            transform: rotate(360deg);
          }
        }

        .request-error {
          margin-bottom: 18px;
          padding: 11px 13px;
          border: 1px solid #e5bdbd;
          border-radius: 7px;
          background: ${COLORS.redLight};
          color: ${COLORS.red};
          font-size: 13px;
          font-weight: 600;
          box-sizing: border-box;
        }

        /* STATS */

        .request-stats {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 18px;
        }

        .request-stat-card {
          min-height: 88px;
          padding: 15px;
          border: 1px solid ${COLORS.border};
          border-radius: 9px;
          background: ${COLORS.white};
          box-sizing: border-box;
        }

        .request-stat-label {
          color: ${COLORS.muted};
          font-size: 12px;
          line-height: 1.4;
          font-weight: 600;
        }

        .request-stat-value {
          margin-top: 9px;
          color: ${COLORS.black};
          font-size: 24px;
          line-height: 1.2;
          font-weight: 700;
        }

        .request-stat-pending {
          color: #8a6200;
        }

        /* TOOLBAR */

        .request-toolbar {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 16px;
          box-sizing: border-box;
        }

        .request-search {
          position: relative;
          flex: 1 1 320px;
          min-width: 250px;
        }

        .request-search-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #777777;
          pointer-events: none;
        }

        .request-search-input {
          width: 100%;
          height: 42px;
          padding: 0 14px 0 40px;
          border: 1px solid ${COLORS.border};
          border-radius: 7px;
          outline: none;
          background: ${COLORS.white};
          color: ${COLORS.black};
          font-size: 13px;
          box-sizing: border-box;
        }

        .request-search-input::placeholder {
          color: #888888;
        }

        .request-search-input:focus {
          border-color: ${COLORS.black};
        }

        .request-filters {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .request-filter {
          min-height: 38px;
          padding: 0 12px;
          border: 1px solid ${COLORS.border};
          border-radius: 7px;
          background: ${COLORS.white};
          color: ${COLORS.black};
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .request-filter-active {
          background: ${COLORS.black};
          border-color: ${COLORS.black};
          color: ${COLORS.white};
        }

        /* TABLE */

        .request-card {
          width: 100%;
          border: 1px solid ${COLORS.border};
          border-radius: 10px;
          background: ${COLORS.white};
          overflow: hidden;
          box-sizing: border-box;
        }

        .request-table-wrap {
          width: 100%;
          overflow-x: auto;
        }

        .request-table {
          width: 100%;
          min-width: 1120px;
          border-collapse: collapse;
          color: ${COLORS.text};
        }

        .request-table th {
          height: 50px;
          padding: 0 14px;
          background: ${COLORS.light};
          border-bottom: 1px solid ${COLORS.border};
          color: ${COLORS.black};
          text-align: left;
          font-size: 11px;
          line-height: 1.3;
          font-weight: 700;
          white-space: nowrap;
        }

        .request-table td {
          min-height: 72px;
          padding: 12px 14px;
          border-top: 1px solid #eeeeee;
          vertical-align: middle;
          color: ${COLORS.text};
          font-size: 13px;
        }

        .request-id,
        .order-id {
          font-weight: 700;
          font-size: 13px;
          color: ${COLORS.black};
        }

        .customer-name {
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 600;
          color: ${COLORS.black};
        }

        .customer-email {
          margin-top: 3px;
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: ${COLORS.muted};
          font-size: 11px;
        }

        .product-name {
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-weight: 500;
          color: ${COLORS.text};
        }

        .reason-cell {
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: ${COLORS.muted};
        }

        .date-cell {
          color: ${COLORS.muted};
          white-space: nowrap;
        }

        /* TYPE */

        .type-badge {
          min-height: 28px;
          padding: 0 9px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          border-radius: 999px;
          font-size: 11px;
          line-height: 1;
          font-weight: 700;
          white-space: nowrap;
        }

        .type-cancel {
          background: #fff0f0;
          color: #a33a3a;
        }

        .type-return {
          background: #f1f1f1;
          color: #555555;
        }

        .type-replacement {
          background: #f1f1f1;
          color: #555555;
        }

        /* STATUS */

        .status-badge {
          min-height: 28px;
          padding: 0 9px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          font-size: 11px;
          line-height: 1;
          font-weight: 700;
        }

        .status-pending {
          background: #fff4d8;
          color: #8a6200;
        }

        .status-approved {
          background: #edf6ef;
          color: #347142;
        }

        .status-rejected {
          background: #fff0f0;
          color: #a33a3a;
        }

        .status-cancelled {
          background: #f1f1f1;
          color: #666666;
        }

        /* VIEW */

        .view-button {
          min-height: 34px;
          padding: 0 10px;
          border: 1px solid ${COLORS.black};
          border-radius: 7px;
          background: ${COLORS.black};
          color: ${COLORS.white};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
        }

        /* EMPTY */

        .empty-cell {
          height: 260px;
          text-align: center;
          padding: 30px !important;
          color: ${COLORS.muted} !important;
        }

        .empty-cell strong {
          display: block;
          margin-top: 10px;
          color: ${COLORS.black};
          font-size: 15px;
        }

        .empty-cell span {
          display: block;
          margin-top: 5px;
          color: ${COLORS.muted};
          font-size: 12px;
        }

        /* PAGINATION */

        .pagination {
          min-height: 68px;
          padding: 11px 15px;
          border-top: 1px solid ${COLORS.border};
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
          box-sizing: border-box;
        }

        .pagination-info,
        .page-count {
          color: ${COLORS.muted};
          font-size: 12px;
          white-space: nowrap;
        }

        .pagination-info b,
        .page-count b {
          color: ${COLORS.black};
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .page-arrow,
        .page-number {
          width: 34px;
          height: 34px;
          padding: 0;
          border: 1px solid ${COLORS.border};
          border-radius: 7px;
          background: ${COLORS.white};
          color: ${COLORS.black};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
        }

        .page-arrow:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .page-number-active {
          background: ${COLORS.black};
          border-color: ${COLORS.black};
          color: ${COLORS.white};
        }

        .page-dots {
          width: 24px;
          text-align: center;
          color: ${COLORS.muted};
        }

        /* RESPONSIVE */

        @media (max-width: 1100px) {
          .request-stats {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 900px) {
          .request-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .request-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .request-refresh-button {
            width: auto;
          }
        }

        @media (max-width: 600px) {
          .request-stats {
            grid-template-columns: 1fr;
          }

          .request-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .request-search {
            min-width: 0;
          }

          .request-filters {
            width: 100%;
          }

          .request-filter {
            flex: 1 1 auto;
          }

          .pagination {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>

    </AdminShell>
  );
}