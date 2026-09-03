"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Package,
  Tag,
  ShoppingBag,
  Users,
  MessageSquare,
  Image as ImageIcon,
  Star,
  CalendarDays,
  RefreshCw,
  ArrowUpRight,
  Clock3,
  CheckCircle2,
  AlertCircle,
  ShoppingCart,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

import { apiFetch } from "@/lib/adminApi";
import AdminShell from "@/components/admin/AdminShell";

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  black: "#000000",
  white: "#ffffff",

  text: "#000000",
  muted: "#555555",
  lightText: "#666666",

  border: "#dddddd",
  softBorder: "#e8e8e8",

  softBg: "#f7f7f7",
  iconBg: "#eeeeee",

  successBg: "#f1f1f1",
  warningBg: "#f7f7f7",
};

/* =========================================================
   CONSTANTS
========================================================= */

const ITEMS_PER_PAGE = 5;
const API_LIMIT = 50;

/* =========================================================
   HELPERS
========================================================= */

function getTotal(response) {
  return (
    response?.data?.data?.total ??
    response?.data?.total ??
    response?.data?.count ??
    response?.data?.data?.count ??
    0
  );
}

function getItems(response) {
  const root = response?.data;
  const data = root?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(data?.products)) {
    return data.products;
  }

  if (Array.isArray(data?.categories)) {
    return data.categories;
  }

  if (Array.isArray(data?.orders)) {
    return data.orders;
  }

  if (Array.isArray(data?.customers)) {
    return data.customers;
  }

  if (Array.isArray(data?.enquiries)) {
    return data.enquiries;
  }

  if (Array.isArray(data?.banners)) {
    return data.banners;
  }

  if (Array.isArray(data?.testimonials)) {
    return data.testimonials;
  }

  if (Array.isArray(data?.tradeFairs)) {
    return data.tradeFairs;
  }

  if (Array.isArray(root?.items)) {
    return root.items;
  }

  return [];
}

function getName(item, fallback = "Untitled") {
  return (
    item?.name ||
    item?.title ||
    item?.productName ||
    item?.categoryName ||
    item?.customerName ||
    item?.fullName ||
    item?.subject ||
    fallback
  );
}

function getDate(item) {
  return (
    item?.createdAt ||
    item?.updatedAt ||
    item?.date ||
    item?.createdDate ||
    null
  );
}

function formatDate(date) {
  if (!date) return "—";

  try {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function getStatus(item) {
  if (item?.status) {
    return item.status;
  }

  if (item?.orderStatus) {
    return item.orderStatus;
  }

  if (item?.isActive === true) {
    return "Active";
  }

  if (item?.isActive === false) {
    return "Inactive";
  }

  return null;
}

/* =========================================================
   SKELETON
========================================================= */

function Skeleton({
  width = "100%",
  height = 18,
  borderRadius = 7,
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background:
          "linear-gradient(90deg, #eeeeee 25%, #f8f8f8 50%, #eeeeee 75%)",
        backgroundSize: "200% 100%",
        animation: "nhfSkeleton 1.4s infinite",
        flexShrink: 0,
      }}
    />
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  loading,
  error,
  icon: Icon,
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "154px",
        minHeight: "154px",
        maxHeight: "154px",
        boxSizing: "border-box",

        padding: "22px",

        background: COLORS.white,
        border: `1px solid ${COLORS.border}`,
        borderRadius: "12px",

        color: COLORS.black,

        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",

        overflow: "hidden",

        boxShadow:
          "0 2px 10px rgba(0,0,0,0.04)",
      }}
    >
      {/* TOP */}

      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "15px",
        }}
      >
        <div
          style={{
            color: COLORS.black,
            fontSize: "16px",
            fontWeight: 600,
            lineHeight: "1.4",
          }}
        >
          {label}
        </div>

        <div
          style={{
            width: "42px",
            height: "42px",
            minWidth: "42px",
            borderRadius: "9px",

            background: COLORS.iconBg,
            color: COLORS.black,

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            flexShrink: 0,
          }}
        >
          <Icon
            size={21}
            strokeWidth={1.8}
          />
        </div>
      </div>

      {/* VALUE */}

      <div
        style={{
          minHeight: "38px",
          display: "flex",
          alignItems: "center",
        }}
      >
        {loading ? (
          <Skeleton
            width="90px"
            height="35px"
            borderRadius={6}
          />
        ) : error ? (
          <div
            style={{
              color: COLORS.black,
              fontSize: "15px",

              display: "flex",
              alignItems: "center",
              gap: "7px",
            }}
          >
            <AlertCircle size={16} />

            {error}
          </div>
        ) : (
          <div
            style={{
              color: COLORS.black,
              fontSize: "32px",
              fontWeight: 700,
              lineHeight: "1",
              letterSpacing: "-0.5px",
            }}
          >
            {typeof value === "number"
              ? value.toLocaleString("en-IN")
              : value ?? "—"}
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  title,
  subtitle,
  icon: Icon,
  href,
}) {
  return (
    <div
      style={{
        height: "62px",
        minHeight: "62px",
        maxHeight: "62px",

        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

        gap: "16px",

        paddingBottom: "14px",
        marginBottom: "14px",

        boxSizing: "border-box",

        borderBottom: `1px solid ${COLORS.softBorder}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",

          minWidth: 0,
          overflow: "hidden",
        }}
      >
        {Icon && (
          <div
            style={{
              width: "42px",
              height: "42px",
              minWidth: "42px",

              borderRadius: "9px",

              background: COLORS.iconBg,
              color: COLORS.black,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              flexShrink: 0,
            }}
          >
            <Icon
              size={20}
              strokeWidth={1.8}
            />
          </div>
        )}

        <div
          style={{
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <h2
            style={{
              margin: 0,
              padding: 0,

              color: COLORS.black,

              fontSize: "20px",
              fontWeight: 700,
              lineHeight: "1.25",

              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </h2>

          {subtitle && (
            <p
              style={{
                margin: "3px 0 0",
                padding: 0,

                color: COLORS.black,
                opacity: 0.65,

                fontSize: "16px",
                fontWeight: 400,
                lineHeight: "1.25",

                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {href && (
        <a
          href={href}
          style={{
            color: COLORS.black,

            fontSize: "16px",
            fontWeight: 600,

            textDecoration: "none",

            display: "inline-flex",
            alignItems: "center",
            gap: "5px",

            whiteSpace: "nowrap",

            flexShrink: 0,
          }}
        >
          View All

          <ArrowUpRight size={17} />
        </a>
      )}
    </div>
  );
}

/* =========================================================
   PAGINATION
========================================================= */

function Pagination({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}) {
  if (totalPages <= 1) {
    return (
      <div
        style={{
          height: "42px",
          minHeight: "42px",

          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",

          borderTop: `1px solid ${COLORS.softBorder}`,

          marginTop: "12px",
          paddingTop: "10px",

          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            color: COLORS.black,
            opacity: 0.55,
            fontSize: "14px",
          }}
        >
          Showing all items
        </span>

        <span
          style={{
            color: COLORS.black,
            opacity: 0.55,
            fontSize: "14px",
          }}
        >
          Page 1 of 1
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "42px",
        minHeight: "42px",

        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

        borderTop: `1px solid ${COLORS.softBorder}`,

        marginTop: "12px",
        paddingTop: "10px",

        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          color: COLORS.black,
          opacity: 0.6,
          fontSize: "14px",
          fontWeight: 400,
        }}
      >
        Page {currentPage} of {totalPages}
      </span>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentPage <= 1}
          style={{
            width: "32px",
            height: "32px",

            border: `1px solid ${COLORS.border}`,
            borderRadius: "7px",

            background: COLORS.white,
            color: COLORS.black,

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            cursor:
              currentPage <= 1
                ? "not-allowed"
                : "pointer",

            opacity:
              currentPage <= 1 ? 0.35 : 1,
          }}
        >
          <ChevronLeft size={17} />
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={currentPage >= totalPages}
          style={{
            width: "32px",
            height: "32px",

            border: `1px solid ${COLORS.border}`,
            borderRadius: "7px",

            background: COLORS.white,
            color: COLORS.black,

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            cursor:
              currentPage >= totalPages
                ? "not-allowed"
                : "pointer",

            opacity:
              currentPage >= totalPages
                ? 0.35
                : 1,
          }}
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({ text }) {
  return (
    <div
      style={{
        height: "250px",
        minHeight: "250px",

        display: "flex",
        flexDirection: "column",

        alignItems: "center",
        justifyContent: "center",

        gap: "10px",

        color: COLORS.black,
      }}
    >
      <div
        style={{
          width: "48px",
          height: "48px",

          borderRadius: "10px",

          background: COLORS.iconBg,

          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Package
          size={24}
          strokeWidth={1.6}
        />
      </div>

      <p
        style={{
          margin: 0,

          color: COLORS.black,

          fontSize: "16px",
          fontWeight: 400,
        }}
      >
        {text}
      </p>
    </div>
  );
}

/* =========================================================
   LIST ITEM
========================================================= */

function ListItem({
  item,
  type,
}) {
  const name = getName(item);
  const status = getStatus(item);

  let meta = "";

  if (type === "product") {
    meta =
      item?.sku ||
      item?.category?.name ||
      item?.categoryName ||
      "Product";
  }

  if (type === "category") {
    meta =
      item?.parent?.name ||
      item?.parentCategory?.name ||
      "Category";
  }

  if (type === "order") {
    meta =
      item?.orderNumber ||
      item?.orderId ||
      (item?._id
        ? `#${String(item._id).slice(-8)}`
        : "Order");
  }

  if (type === "customer") {
    meta =
      item?.email ||
      item?.phone ||
      "Customer";
  }

  if (type === "enquiry") {
    meta =
      item?.email ||
      item?.phone ||
      "Enquiry";
  }

  let Icon = Package;

  if (type === "category") {
    Icon = Tag;
  }

  if (type === "order") {
    Icon = ShoppingBag;
  }

  if (type === "customer") {
    Icon = Users;
  }

  if (type === "enquiry") {
    Icon = MessageSquare;
  }

  const normalizedStatus =
    String(status || "").toLowerCase();

  const isSuccess =
    normalizedStatus === "active" ||
    normalizedStatus === "completed" ||
    normalizedStatus === "delivered" ||
    normalizedStatus === "paid";

  const isWarning =
    normalizedStatus === "pending" ||
    normalizedStatus === "processing";

  return (
    <div
      style={{
        height: "58px",
        minHeight: "58px",
        maxHeight: "58px",

        boxSizing: "border-box",

        padding: "8px 11px",

        border: `1px solid ${COLORS.softBorder}`,
        borderRadius: "8px",

        background: COLORS.white,

        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",

        gap: "12px",

        flexShrink: 0,

        overflow: "hidden",
      }}
    >
      {/* LEFT */}

      <div
        style={{
          display: "flex",
          alignItems: "center",

          gap: "11px",

          minWidth: 0,
          flex: 1,

          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "38px",
            height: "38px",
            minWidth: "38px",

            borderRadius: "8px",

            background: COLORS.iconBg,
            color: COLORS.black,

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            flexShrink: 0,
          }}
        >
          <Icon
            size={18}
            strokeWidth={1.8}
          />
        </div>

        <div
          style={{
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <div
            title={name}
            style={{
              color: COLORS.black,

              fontSize: "16px",
              fontWeight: 600,

              lineHeight: "1.3",

              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </div>

          <div
            title={meta}
            style={{
              marginTop: "2px",

              color: COLORS.black,
              opacity: 0.6,

              fontSize: "14px",
              fontWeight: 400,

              lineHeight: "1.25",

              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {meta}
          </div>
        </div>
      </div>

      {/* RIGHT */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",

          gap: "8px",

          flexShrink: 0,
        }}
      >
        {status && (
          <span
            style={{
              height: "26px",
              minHeight: "26px",

              padding: "0 9px",

              boxSizing: "border-box",

              borderRadius: "999px",

              border: `1px solid ${
                isSuccess || isWarning
                  ? "#c8c8c8"
                  : "#dddddd"
              }`,

              background: isSuccess
                ? COLORS.successBg
                : isWarning
                  ? COLORS.warningBg
                  : COLORS.white,

              color: COLORS.black,

              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",

              fontSize: "13px",
              fontWeight: 600,

              whiteSpace: "nowrap",
            }}
          >
            {status}
          </span>
        )}

        <span
          style={{
            color: COLORS.black,
            opacity: 0.6,

            fontSize: "13px",
            fontWeight: 400,

            whiteSpace: "nowrap",
          }}
        >
          {formatDate(getDate(item))}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   FIXED SECTION CARD
========================================================= */

function SectionCard({
  children,
}) {
  return (
    <section
      style={{
        width: "100%",

        height: "455px",
        minHeight: "455px",
        maxHeight: "455px",

        boxSizing: "border-box",

        background: COLORS.white,

        border: `1px solid ${COLORS.border}`,
        borderRadius: "12px",

        padding: "20px",

        color: COLORS.black,

        overflow: "hidden",

        boxShadow:
          "0 2px 10px rgba(0,0,0,0.025)",

        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </section>
  );
}

/* =========================================================
   PAGINATED LIST
========================================================= */

function PaginatedList({
  items,
  loading,
  type,
  emptyText,
}) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(
      items.length / ITEMS_PER_PAGE
    )
  );

  /* Reset if data changes */

  useEffect(() => {
    setPage(1);
  }, [items.length]);

  /* Safety */

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const visibleItems = useMemo(() => {
    const start =
      (page - 1) * ITEMS_PER_PAGE;

    return items.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [items, page]);

  return (
    <>
      {/* FIXED LIST AREA */}

      <div
        style={{
          height: "315px",
          minHeight: "315px",
          maxHeight: "315px",

          overflowY: "auto",
          overflowX: "hidden",

          paddingRight: "4px",

          boxSizing: "border-box",

          scrollbarWidth: "thin",

          display: "flex",
          flexDirection: "column",
          gap: "7px",
        }}
      >
        {loading ? (
          <>
            <Skeleton height="58px" />
            <Skeleton height="58px" />
            <Skeleton height="58px" />
            <Skeleton height="58px" />
            <Skeleton height="58px" />
          </>
        ) : visibleItems.length > 0 ? (
          visibleItems.map(
            (item, index) => (
              <ListItem
                key={
                  item?._id ||
                  item?.id ||
                  `${type}-${index}`
                }
                item={item}
                type={type}
              />
            )
          )
        ) : (
          <EmptyState text={emptyText} />
        )}
      </div>

      {/* PAGINATION */}

      {!loading && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPrevious={() =>
            setPage((p) =>
              Math.max(1, p - 1)
            )
          }
          onNext={() =>
            setPage((p) =>
              Math.min(
                totalPages,
                p + 1
              )
            )
          }
        />
      )}
    </>
  );
}

/* =========================================================
   ADMIN DASHBOARD
========================================================= */

export default function AdminDashboard() {
  /* =======================================================
     STATES
  ======================================================= */

  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    customers: 0,
    enquiries: 0,
    banners: 0,
    testimonials: 0,
    tradeFairs: 0,
  });

  const [recent, setRecent] = useState({
    products: [],
    categories: [],
    orders: [],
    customers: [],
    enquiries: [],
  });

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState(null);

  /* =======================================================
     FETCH DASHBOARD DATA
  ======================================================= */

  const fetchDashboard =
    useCallback(async () => {
      try {
        setError(null);

        /*
         * Fetch more data because dashboard
         * pagination is handled locally.
         */

        const results =
          await Promise.allSettled([
            apiFetch(
              `/products/admin/all?limit=${API_LIMIT}`
            ),

            apiFetch(
              `/categories/admin/all?limit=${API_LIMIT}`
            ),

            apiFetch(
              `/orders/admin/all?limit=${API_LIMIT}`
            ),

            apiFetch(
              `/customers/admin/all?limit=${API_LIMIT}`
            ),

            apiFetch(
              `/enquiries/admin/all?limit=${API_LIMIT}`
            ),

            apiFetch(
              `/banners/admin/all?limit=${API_LIMIT}`
            ),

            apiFetch(
              `/testimonials/admin/all?limit=${API_LIMIT}`
            ),

            apiFetch(
              `/trade-fairs/admin/all?limit=${API_LIMIT}`
            ),
          ]);

        const [
          productsResult,
          categoriesResult,
          ordersResult,
          customersResult,
          enquiriesResult,
          bannersResult,
          testimonialsResult,
          tradeFairsResult,
        ] = results;

        /* =================================================
           VALIDATE RESPONSES
        ================================================= */

        const products =
          productsResult.status ===
            "fulfilled" &&
          productsResult.value?.ok
            ? productsResult.value
            : null;

        const categories =
          categoriesResult.status ===
            "fulfilled" &&
          categoriesResult.value?.ok
            ? categoriesResult.value
            : null;

        const orders =
          ordersResult.status ===
            "fulfilled" &&
          ordersResult.value?.ok
            ? ordersResult.value
            : null;

        const customers =
          customersResult.status ===
            "fulfilled" &&
          customersResult.value?.ok
            ? customersResult.value
            : null;

        const enquiries =
          enquiriesResult.status ===
            "fulfilled" &&
          enquiriesResult.value?.ok
            ? enquiriesResult.value
            : null;

        const banners =
          bannersResult.status ===
            "fulfilled" &&
          bannersResult.value?.ok
            ? bannersResult.value
            : null;

        const testimonials =
          testimonialsResult.status ===
            "fulfilled" &&
          testimonialsResult.value?.ok
            ? testimonialsResult.value
            : null;

        const tradeFairs =
          tradeFairsResult.status ===
            "fulfilled" &&
          tradeFairsResult.value?.ok
            ? tradeFairsResult.value
            : null;

        /* =================================================
           COUNTS
        ================================================= */

        setStats({
          products: products
            ? getTotal(products)
            : 0,

          categories: categories
            ? getTotal(categories)
            : 0,

          orders: orders
            ? getTotal(orders)
            : 0,

          customers: customers
            ? getTotal(customers)
            : 0,

          enquiries: enquiries
            ? getTotal(enquiries)
            : 0,

          banners: banners
            ? getTotal(banners)
            : 0,

          testimonials: testimonials
            ? getTotal(testimonials)
            : 0,

          tradeFairs: tradeFairs
            ? getTotal(tradeFairs)
            : 0,
        });

        /* =================================================
           RECENT DATA
        ================================================= */

        setRecent({
          products: products
            ? getItems(products)
            : [],

          categories: categories
            ? getItems(categories)
            : [],

          orders: orders
            ? getItems(orders)
            : [],

          customers: customers
            ? getItems(customers)
            : [],

          enquiries: enquiries
            ? getItems(enquiries)
            : [],
        });

        /* =================================================
           PARTIAL FAILURE
        ================================================= */

        const failed =
          results.some(
            (result) =>
              result.status ===
                "rejected" ||
              (result.status ===
                "fulfilled" &&
                !result.value?.ok)
          );

        if (failed) {
          setError(
            "Some dashboard data could not be loaded."
          );
        }
      } catch (err) {
        console.error(
          "Admin dashboard error:",
          err
        );

        setError(
          err?.message ||
            "Unable to load dashboard data."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    }, []);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  /* =======================================================
     REFRESH
  ======================================================= */

  const handleRefresh =
    async () => {
      if (refreshing) return;

      setRefreshing(true);

      await fetchDashboard();
    };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <AdminShell>
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
            PAGE HEADER
        ================================================= */}

        <div
          style={{
            height: "70px",
            minHeight: "70px",

            display: "flex",
            alignItems: "flex-start",
            justifyContent:
              "space-between",

            gap: "20px",

            marginBottom: "25px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,

                color: COLORS.black,

                fontSize: "28px",
                lineHeight: "1.2",
                fontWeight: 700,

                letterSpacing: "-0.4px",
              }}
            >
              Dashboard
            </h1>

            <p
              style={{
                margin: "7px 0 0",

                color: COLORS.black,
                opacity: 0.7,

                fontSize: "16px",
                lineHeight: "1.5",
                fontWeight: 400,
              }}
            >
              Overview of your store and
              current activity
            </p>
          </div>

          {/* REFRESH */}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              height: "44px",
              minHeight: "44px",

              padding: "0 18px",

              border: `1px solid ${COLORS.black}`,
              borderRadius: "8px",

              background: COLORS.white,
              color: COLORS.black,

              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",

              gap: "9px",

              fontSize: "16px",
              fontWeight: 600,

              cursor: refreshing
                ? "not-allowed"
                : "pointer",

              opacity: refreshing
                ? 0.6
                : 1,
            }}
          >
            <RefreshCw
              size={18}
              style={{
                animation: refreshing
                  ? "nhfSpin 0.8s linear infinite"
                  : "none",
              }}
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
          <div
            style={{
              width: "100%",

              boxSizing: "border-box",

              padding: "15px 18px",

              marginBottom: "20px",

              border: `1px solid ${COLORS.border}`,
              borderRadius: "10px",

              background: "#f8f8f8",

              color: COLORS.black,

              display: "flex",
              alignItems: "flex-start",

              gap: "12px",
            }}
          >
            <AlertCircle
              size={20}
              style={{
                flexShrink: 0,
                marginTop: "2px",
              }}
            />

            <div>
              <strong
                style={{
                  display: "block",

                  color: COLORS.black,

                  fontSize: "16px",
                  fontWeight: 700,

                  marginBottom: "3px",
                }}
              >
                Dashboard Warning
              </strong>

              <p
                style={{
                  margin: 0,

                  color: COLORS.black,

                  fontSize: "16px",
                  lineHeight: "1.5",
                  fontWeight: 400,
                }}
              >
                {error}
              </p>
            </div>
          </div>
        )}

        {/* =================================================
            MAIN STATS
        ================================================= */}

        <div
          style={{
            width: "100%",

            display: "grid",

            gridTemplateColumns:
              "repeat(4, minmax(0, 1fr))",

            gap: "18px",

            marginBottom: "18px",
          }}
        >
          <StatCard
            label="Total Products"
            value={stats.products}
            loading={loading}
            icon={Package}
          />

          <StatCard
            label="Total Categories"
            value={stats.categories}
            loading={loading}
            icon={Tag}
          />

          <StatCard
            label="Total Orders"
            value={stats.orders}
            loading={loading}
            icon={ShoppingBag}
          />

          <StatCard
            label="Total Customers"
            value={stats.customers}
            loading={loading}
            icon={Users}
          />
        </div>

        {/* =================================================
            SECONDARY STATS
        ================================================= */}

        <div
          style={{
            width: "100%",

            display: "grid",

            gridTemplateColumns:
              "repeat(4, minmax(0, 1fr))",

            gap: "18px",

            marginBottom: "25px",
          }}
        >
          <StatCard
            label="Total Enquiries"
            value={stats.enquiries}
            loading={loading}
            icon={MessageSquare}
          />

          <StatCard
            label="Total Banners"
            value={stats.banners}
            loading={loading}
            icon={ImageIcon}
          />

          <StatCard
            label="Total Testimonials"
            value={stats.testimonials}
            loading={loading}
            icon={Star}
          />

          <StatCard
            label="Total Trade Fairs"
            value={stats.tradeFairs}
            loading={loading}
            icon={CalendarDays}
          />
        </div>

        {/* =================================================
            QUICK LINKS
        ================================================= */}

        <div
          style={{
            width: "100%",

            height: "105px",
            minHeight: "105px",
            maxHeight: "105px",

            boxSizing: "border-box",

            padding: "20px",

            marginBottom: "25px",

            border: `1px solid ${COLORS.border}`,
            borderRadius: "12px",

            background: COLORS.white,

            display: "flex",
            alignItems: "center",

            gap: "15px",

            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "46px",
              height: "46px",
              minWidth: "46px",

              borderRadius: "9px",

              background: COLORS.iconBg,
              color: COLORS.black,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              flexShrink: 0,
            }}
          >
            <TrendingUp size={22} />
          </div>

          <div
            style={{
              flex: 1,
              minWidth: 0,

              overflow: "hidden",
            }}
          >
            <h2
              style={{
                margin: "0 0 4px",

                color: COLORS.black,

                fontSize: "20px",
                lineHeight: "1.3",
                fontWeight: 700,
              }}
            >
              Quick Links
            </h2>

            <p
              style={{
                margin: 0,

                color: COLORS.black,
                opacity: 0.7,

                fontSize: "16px",
                lineHeight: "1.4",
                fontWeight: 400,

                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              Quickly manage your store
              content from the admin panel.
            </p>
          </div>

          {/* ACTIONS */}

          <div
            style={{
              display: "flex",
              alignItems: "center",

              gap: "7px",

              flexShrink: 0,
            }}
          >
            <a
              href="/admin/products"
              style={{
                height: "38px",

                padding: "0 12px",

                border: `1px solid ${COLORS.border}`,
                borderRadius: "7px",

                background: COLORS.white,
                color: COLORS.black,

                textDecoration: "none",

                display: "inline-flex",
                alignItems: "center",

                gap: "5px",

                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              Products

              <ArrowUpRight size={15} />
            </a>

            <a
              href="/admin/categories"
              style={{
                height: "38px",

                padding: "0 12px",

                border: `1px solid ${COLORS.border}`,
                borderRadius: "7px",

                background: COLORS.white,
                color: COLORS.black,

                textDecoration: "none",

                display: "inline-flex",
                alignItems: "center",

                gap: "5px",

                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              Categories

              <ArrowUpRight size={15} />
            </a>

            <a
              href="/admin/orders"
              style={{
                height: "38px",

                padding: "0 12px",

                border: `1px solid ${COLORS.border}`,
                borderRadius: "7px",

                background: COLORS.white,
                color: COLORS.black,

                textDecoration: "none",

                display: "inline-flex",
                alignItems: "center",

                gap: "5px",

                fontSize: "15px",
                fontWeight: 600,
              }}
            >
              Orders

              <ArrowUpRight size={15} />
            </a>
          </div>
        </div>

        {/* =================================================
            PRODUCTS + CATEGORIES
        ================================================= */}

        <div
          style={{
            width: "100%",

            display: "grid",

            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",

            gap: "20px",

            marginBottom: "20px",
          }}
        >
          {/* PRODUCTS */}

          <SectionCard>
            <SectionHeader
              title="Recent Products"
              subtitle="Latest products added to your store"
              icon={Package}
              href="/admin/products"
            />

            <PaginatedList
              items={recent.products}
              loading={loading}
              type="product"
              emptyText="No products found"
            />
          </SectionCard>

          {/* CATEGORIES */}

          <SectionCard>
            <SectionHeader
              title="Recent Categories"
              subtitle="Latest categories added"
              icon={Tag}
              href="/admin/categories"
            />

            <PaginatedList
              items={recent.categories}
              loading={loading}
              type="category"
              emptyText="No categories found"
            />
          </SectionCard>
        </div>

        {/* =================================================
            ORDERS + CUSTOMERS
        ================================================= */}

        <div
          style={{
            width: "100%",

            display: "grid",

            gridTemplateColumns:
              "repeat(2, minmax(0, 1fr))",

            gap: "20px",

            marginBottom: "20px",
          }}
        >
          {/* ORDERS */}

          <SectionCard>
            <SectionHeader
              title="Recent Orders"
              subtitle="Latest customer orders"
              icon={ShoppingBag}
              href="/admin/orders"
            />

            <PaginatedList
              items={recent.orders}
              loading={loading}
              type="order"
              emptyText="No orders found"
            />
          </SectionCard>

          {/* CUSTOMERS */}

          <SectionCard>
            <SectionHeader
              title="Recent Customers"
              subtitle="Latest registered customers"
              icon={Users}
              href="/admin/customers"
            />

            <PaginatedList
              items={recent.customers}
              loading={loading}
              type="customer"
              emptyText="No customers found"
            />
          </SectionCard>
        </div>

        {/* =================================================
            ENQUIRIES
        ================================================= */}

        <div
          style={{
            width: "100%",
            marginBottom: "20px",
          }}
        >
          <SectionCard>
            <SectionHeader
              title="Recent Enquiries"
              subtitle="Latest customer enquiries"
              icon={MessageSquare}
              href="/admin/enquiries"
            />

            <PaginatedList
              items={recent.enquiries}
              loading={loading}
              type="enquiry"
              emptyText="No enquiries found"
            />
          </SectionCard>
        </div>

        {/* =================================================
            STORE ACTIVITY
        ================================================= */}

        <div
          style={{
            width: "100%",

            height: "210px",
            minHeight: "210px",
            maxHeight: "210px",

            boxSizing: "border-box",

            background: COLORS.white,

            border: `1px solid ${COLORS.border}`,
            borderRadius: "12px",

            padding: "20px",

            marginBottom: "30px",

            overflow: "hidden",
          }}
        >
          {/* HEADER */}

          <div
            style={{
              height: "48px",

              display: "flex",
              alignItems: "center",

              gap: "12px",

              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                minWidth: "42px",

                borderRadius: "9px",

                background: COLORS.iconBg,
                color: COLORS.black,

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShoppingCart size={20} />
            </div>

            <div>
              <h2
                style={{
                  margin: 0,

                  color: COLORS.black,

                  fontSize: "20px",
                  fontWeight: 700,
                  lineHeight: "1.3",
                }}
              >
                Store Activity
              </h2>

              <p
                style={{
                  margin: "3px 0 0",

                  color: COLORS.black,
                  opacity: 0.65,

                  fontSize: "16px",
                  fontWeight: 400,
                }}
              >
                Current overview of your store
              </p>
            </div>
          </div>

          {/* ACTIVITY GRID */}

          <div
            style={{
              width: "100%",

              height: "105px",

              display: "grid",

              gridTemplateColumns:
                "repeat(4, minmax(0, 1fr))",

              gap: "12px",
            }}
          >
            {/* PRODUCTS */}

            <div
              style={{
                height: "105px",
                boxSizing: "border-box",

                padding: "15px",

                border: `1px solid ${COLORS.softBorder}`,
                borderRadius: "9px",

                display: "flex",
                alignItems: "center",

                gap: "12px",

                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  minWidth: "40px",

                  borderRadius: "8px",

                  background: COLORS.iconBg,
                  color: COLORS.black,

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CheckCircle2 size={19} />
              </div>

              <div>
                <strong
                  style={{
                    display: "block",

                    color: COLORS.black,

                    fontSize: "20px",
                    fontWeight: 700,
                    lineHeight: "1.2",
                  }}
                >
                  {loading
                    ? "—"
                    : stats.products}
                </strong>

                <span
                  style={{
                    display: "block",

                    marginTop: "3px",

                    color: COLORS.black,
                    opacity: 0.65,

                    fontSize: "16px",
                  }}
                >
                  Products
                </span>
              </div>
            </div>

            {/* CATEGORIES */}

            <div
              style={{
                height: "105px",
                boxSizing: "border-box",

                padding: "15px",

                border: `1px solid ${COLORS.softBorder}`,
                borderRadius: "9px",

                display: "flex",
                alignItems: "center",

                gap: "12px",

                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  minWidth: "40px",

                  borderRadius: "8px",

                  background: COLORS.iconBg,
                  color: COLORS.black,

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Tag size={19} />
              </div>

              <div>
                <strong
                  style={{
                    display: "block",

                    color: COLORS.black,

                    fontSize: "20px",
                    fontWeight: 700,
                    lineHeight: "1.2",
                  }}
                >
                  {loading
                    ? "—"
                    : stats.categories}
                </strong>

                <span
                  style={{
                    display: "block",

                    marginTop: "3px",

                    color: COLORS.black,
                    opacity: 0.65,

                    fontSize: "16px",
                  }}
                >
                  Categories
                </span>
              </div>
            </div>

            {/* ORDERS */}

            <div
              style={{
                height: "105px",
                boxSizing: "border-box",

                padding: "15px",

                border: `1px solid ${COLORS.softBorder}`,
                borderRadius: "9px",

                display: "flex",
                alignItems: "center",

                gap: "12px",

                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  minWidth: "40px",

                  borderRadius: "8px",

                  background: COLORS.iconBg,
                  color: COLORS.black,

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShoppingBag size={19} />
              </div>

              <div>
                <strong
                  style={{
                    display: "block",

                    color: COLORS.black,

                    fontSize: "20px",
                    fontWeight: 700,
                    lineHeight: "1.2",
                  }}
                >
                  {loading
                    ? "—"
                    : stats.orders}
                </strong>

                <span
                  style={{
                    display: "block",

                    marginTop: "3px",

                    color: COLORS.black,
                    opacity: 0.65,

                    fontSize: "16px",
                  }}
                >
                  Orders
                </span>
              </div>
            </div>

            {/* ENQUIRIES */}

            <div
              style={{
                height: "105px",
                boxSizing: "border-box",

                padding: "15px",

                border: `1px solid ${COLORS.softBorder}`,
                borderRadius: "9px",

                display: "flex",
                alignItems: "center",

                gap: "12px",

                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  minWidth: "40px",

                  borderRadius: "8px",

                  background: COLORS.iconBg,
                  color: COLORS.black,

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Clock3 size={19} />
              </div>

              <div>
                <strong
                  style={{
                    display: "block",

                    color: COLORS.black,

                    fontSize: "20px",
                    fontWeight: 700,
                    lineHeight: "1.2",
                  }}
                >
                  {loading
                    ? "—"
                    : stats.enquiries}
                </strong>

                <span
                  style={{
                    display: "block",

                    marginTop: "3px",

                    color: COLORS.black,
                    opacity: 0.65,

                    fontSize: "16px",
                  }}
                >
                  Enquiries
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          GLOBAL ANIMATIONS
      ================================================= */}

      <style jsx global>{`
        @keyframes nhfSkeleton {
          0% {
            background-position: 200% 0;
          }

          100% {
            background-position: -200% 0;
          }
        }

        @keyframes nhfSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        /* Scrollbar */

        * {
          scrollbar-width: thin;
          scrollbar-color: #cfcfcf transparent;
        }

        *::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        *::-webkit-scrollbar-track {
          background: transparent;
        }

        *::-webkit-scrollbar-thumb {
          background: #cfcfcf;
          border-radius: 10px;
        }

        *::-webkit-scrollbar-thumb:hover {
          background: #999999;
        }

        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 1200px) {
          .nhf-dashboard-responsive {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }
        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 900px) {
          .nhf-dashboard-responsive {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </AdminShell>
  );
}