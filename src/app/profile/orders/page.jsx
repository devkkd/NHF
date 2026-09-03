"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  getMyOrders,
  getMyOrderRequests,
  createOrderRequest,
  getUploadPresignedUrl,
  uploadFileToR2,
} from "@/lib/api";

const ITEMS_PER_PAGE = 6;

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [orderRequests, setOrderRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // ======================================================
  // MODAL STATE
  // ======================================================

  const [activeModal, setActiveModal] = useState(null);
  /*
    null

    {
      type: "cancel" | "return" | "replacement",
      order: order,
      itemIndex: number | null
    }
  */

  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const [files, setFiles] = useState([]);

  const [actionLoading, setActionLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ======================================================
  // LOAD ORDERS
  // ======================================================

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);

    try {
      const [ordersRes, requestsRes] =
        await Promise.all([
          getMyOrders(),
          getMyOrderRequests(),
        ]);

      if (ordersRes?.success) {
        setOrders(
          Array.isArray(ordersRes.orders)
            ? ordersRes.orders
            : []
        );
      } else {
        setOrders([]);
      }

      /*
       * Backend may return:
       * {
       *   success: true,
       *   requests: [...]
       * }
       *
       * or:
       * {
       *   success: true,
       *   data: [...]
       * }
       *
       * Keep the frontend tolerant to both shapes.
       */
      const requests =
        Array.isArray(requestsRes?.requests)
          ? requestsRes.requests
          : Array.isArray(requestsRes?.data)
            ? requestsRes.data
            : Array.isArray(requestsRes)
              ? requestsRes
              : [];

      setOrderRequests(requests);
    } catch (error) {
      console.error(
        "Failed to load orders / requests:",
        error
      );

      /*
       * Orders should still render even if
       * request loading fails.
       */
      try {
        const fallbackOrders =
          await getMyOrders();

        setOrders(
          fallbackOrders?.success &&
          Array.isArray(fallbackOrders.orders)
            ? fallbackOrders.orders
            : []
        );
      } catch (fallbackError) {
        console.error(
          "Fallback order load failed:",
          fallbackError
        );
        setOrders([]);
      }

      setOrderRequests([]);
    } finally {
      setLoading(false);
    }
  }

  // ======================================================
  // REQUEST HELPERS
  // ======================================================

  function getRequestOrderId(request) {
    return String(
      request?.order?._id ||
      request?.order?.id ||
      request?.orderId ||
      request?.order ||
      ""
    );
  }

  function getRequestItemId(request) {
    const value =
      request?.orderItemId ??
      request?.itemIndex ??
      request?.orderItem?.index ??
      null;

    return value === null || value === undefined
      ? null
      : String(value);
  }

  function normalizeRequestStatus(status) {
    return String(status || "pending")
      .trim()
      .toLowerCase();
  }

  function getRequestStatusLabel(request) {
    const type =
      String(request?.type || "").toLowerCase();

    const status =
      normalizeRequestStatus(request?.status);

    const typeLabel =
      type === "cancel"
        ? "Cancellation"
        : type === "return"
          ? "Return"
          : type === "replacement"
            ? "Replacement"
            : "Request";

    if (status === "pending") {
      return `${typeLabel} Requested`;
    }

    if (status === "approved") {
      return `${typeLabel} Approved`;
    }

    if (status === "rejected") {
      return `${typeLabel} Rejected`;
    }

    if (status === "completed") {
      return `${typeLabel} Completed`;
    }

    if (status === "cancelled") {
      return `${typeLabel} Cancelled`;
    }

    return `${typeLabel} ${status}`;
  }

  /*
   * Latest request wins. Requests are normally returned newest-first,
   * but we explicitly sort by createdAt so the UI remains correct even
   * when backend ordering changes.
   */
  function getLatestRequest({
    order,
    type,
    itemIndex = null,
  }) {
    if (!order?._id || !Array.isArray(orderRequests)) {
      return null;
    }

    const orderId = String(order._id);

    const matches = orderRequests
      .filter((request) => {
        if (
          getRequestOrderId(request) !== orderId
        ) {
          return false;
        }

        if (
          String(request?.type || "").toLowerCase() !==
          String(type || "").toLowerCase()
        ) {
          return false;
        }

        if (itemIndex === null) {
          /*
           * Cancel requests are order-level.
           */
          return true;
        }

        return (
          getRequestItemId(request) ===
          String(itemIndex)
        );
      })
      .sort((a, b) => {
        const first = new Date(
          a?.createdAt || 0
        ).getTime();

        const second = new Date(
          b?.createdAt || 0
        ).getTime();

        return second - first;
      });

    return matches[0] || null;
  }

  function hasActiveRequest(request) {
    if (!request) {
      return false;
    }

    const status =
      normalizeRequestStatus(request.status);

    /*
     * Pending / approved / completed requests should remove
     * the action button. Rejected requests can be submitted again.
     */
    return [
      "pending",
      "approved",
      "rejected",
      "completed",
    ].includes(status);
  }

  function getRequestPillClass(status) {
    const normalized =
      normalizeRequestStatus(status);

    if (normalized === "approved") {
      return "ord-request-approved";
    }

    if (normalized === "rejected") {
      return "ord-request-rejected";
    }

    if (normalized === "completed") {
      return "ord-request-completed";
    }

    if (normalized === "cancelled") {
      return "ord-request-cancelled";
    }

    return "ord-request-pending";
  }

  // ======================================================
  // STATUS HELPERS
  // ======================================================

  function canCancelOrder(order) {
    return [
      "pending",
      "confirmed",
      "processing",
      "packed",
    ].includes(
      String(order?.orderStatus || "").toLowerCase()
    );
  }

  function getDeliveredDate(order) {
    return (
      order?.deliveredAt ||
      order?.shiprocket?.deliveredAt ||
      null
    );
  }

  function getReturnWindow(order) {
    const deliveredAt =
      getDeliveredDate(order);

    if (!deliveredAt) {
      return {
        eligible: false,
        expired: true,
        daysRemaining: 0,
      };
    }

    const deliveredDate =
      new Date(deliveredAt);

    if (
      Number.isNaN(
        deliveredDate.getTime()
      )
    ) {
      return {
        eligible: false,
        expired: true,
        daysRemaining: 0,
      };
    }

    const expiresAt =
      new Date(
        deliveredDate.getTime() +
          7 * 24 * 60 * 60 * 1000
      );

    const now = new Date();

    const remaining =
      expiresAt.getTime() -
      now.getTime();

    const daysRemaining = Math.max(
      0,
      Math.ceil(
        remaining /
          (24 * 60 * 60 * 1000)
      )
    );

    const status =
      String(
        order?.orderStatus || ""
      ).toLowerCase();

    return {
      eligible:
        status === "delivered" &&
        now.getTime() <=
          expiresAt.getTime(),

      expired:
        now.getTime() >
        expiresAt.getTime(),

      daysRemaining,
    };
  }

  function canReturnOrReplace(order) {
    const window =
      getReturnWindow(order);

    return window.eligible;
  }

  function getStatusLabel(status) {
    const labels = {
      pending: "Pending",
      confirmed: "Confirmed",
      processing: "Processing",
      packed: "Packed",
      shipped: "Shipped",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
      return_requested: "Return Requested",
      return_approved: "Return Approved",
      returned: "Returned",
      replacement_requested: "Replacement Requested",
      replacement_approved: "Replacement Approved",
      replacement_shipped: "Replacement Shipped",
      replacement_delivered: "Replacement Delivered",
      refunded: "Refunded",
    };

    return (
      labels[
        String(status || "").toLowerCase()
      ] || String(status || "Unknown")
    );
  }

  function getStatusClass(status) {
    const value =
      String(status || "").toLowerCase();

    if (value === "delivered") {
      return "status-delivered";
    }

    if (
      value === "cancelled" ||
      value === "refunded"
    ) {
      return "status-danger";
    }

    if (
      value.includes("return") ||
      value.includes("replacement")
    ) {
      return "status-request";
    }

    if (
      value === "shipped" ||
      value === "out_for_delivery"
    ) {
      return "status-shipping";
    }

    if (value === "confirmed" || value === "packed") {
      return "status-confirmed";
    }

    return "status-pending";
  }

  // ======================================================
  // OPEN CANCEL
  // ======================================================

  function openCancelModal(order) {
    if (!canCancelOrder(order)) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    setReason("");
    setDescription("");
    setFiles([]);

    setActiveModal({
      type: "cancel",
      order,
      itemIndex: null,
    });
  }

  // ======================================================
  // OPEN RETURN
  // ======================================================

  function openReturnModal(
    order,
    itemIndex
  ) {
    if (
      !canReturnOrReplace(order)
    ) {
      setSuccessMessage(
        "Return is available only within 7 days of delivery."
      );

      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    setReason("");
    setDescription("");
    setFiles([]);

    setActiveModal({
      type: "return",
      order,
      itemIndex,
    });
  }

  // ======================================================
  // OPEN REPLACEMENT
  // ======================================================

  function openReplacementModal(
    order,
    itemIndex
  ) {
    if (
      !canReturnOrReplace(order)
    ) {
      setSuccessMessage(
        "Replacement is available only within 7 days of delivery."
      );

      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    setReason("");
    setDescription("");
    setFiles([]);

    setActiveModal({
      type: "replacement",
      order,
      itemIndex,
    });
  }

  // ======================================================
  // CLOSE MODAL
  // ======================================================

  function closeModal() {
    if (actionLoading) {
      return;
    }

    setActiveModal(null);

    setReason("");
    setDescription("");
    setFiles([]);

    setErrorMessage("");
  }

  // ======================================================
  // FILE SELECT
  // ======================================================

  function handleFileChange(event) {
    const selected =
      Array.from(
        event.target.files || []
      );

    const images =
      selected.filter((file) =>
        file.type.startsWith(
          "image/"
        )
      );

    if (images.length > 5) {
      setErrorMessage(
        "You can upload maximum 5 images."
      );

      setFiles(
        images.slice(0, 5)
      );

      return;
    }

    setErrorMessage("");
    setFiles(images);
  }

  // ======================================================
  // UPLOAD IMAGES
  // ======================================================

  async function uploadImages() {
    if (!files.length) {
      return [];
    }

    const urls = [];

    for (const file of files) {
      if (
        file.size >
        10 * 1024 * 1024
      ) {
        throw new Error(
          `${file.name} is larger than 10MB.`
        );
      }

      const presignRes =
        await getUploadPresignedUrl({
          mimeType: file.type,
          fileSize: file.size,
          folder:
            "replacement-requests",
        });

      if (!presignRes?.ok) {
        throw new Error(
          presignRes?.data?.message ||
            "Could not prepare image upload."
        );
      }

   const data =
  presignRes?.data?.data ||
  presignRes?.data ||
  presignRes;

if (
  !data?.uploadUrl ||
  !data?.publicUrl
) {
  console.error(
    "Presign response:",
    presignRes
  );

  throw new Error(
    "Invalid image upload response."
  );
}

      const uploadRes =
        await uploadFileToR2(
          data.uploadUrl,
          file
        );

      if (!uploadRes?.ok) {
        throw new Error(
          `Failed to upload ${file.name}.`
        );
      }

      urls.push(
        data.publicUrl
      );
    }

    return urls;
  }

  // ======================================================
  // SUBMIT ACTION
  // ======================================================

  async function submitAction() {
    if (!activeModal?.order) {
      return;
    }

    const {
      type,
      order,
      itemIndex,
    } = activeModal;

    // -----------------------------
    // Reason required
    // -----------------------------

    if (!reason) {
      setErrorMessage(
        "Please select a reason."
      );

      return;
    }

    // -----------------------------
    // Replacement images required
    // -----------------------------

    if (
      type === "replacement" &&
      files.length === 0
    ) {
      setErrorMessage(
        "Please upload at least one damage image."
      );

      return;
    }

    // -----------------------------
    // Validate cancel
    // -----------------------------

    if (
      type === "cancel" &&
      !canCancelOrder(order)
    ) {
      setErrorMessage(
        "This order can no longer be cancelled."
      );

      return;
    }

    // -----------------------------
    // Validate return/replacement
    // -----------------------------

    if (
      (type === "return" ||
        type === "replacement") &&
      !canReturnOrReplace(order)
    ) {
      setErrorMessage(
        "This request is available only within 7 days of delivery."
      );

      return;
    }

    try {
      setActionLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      let uploadedImages = [];

      if (
        type === "replacement"
      ) {
        uploadedImages =
          await uploadImages();
      }

      const item =
        itemIndex !== null
          ? order?.items?.[
              itemIndex
            ]
          : null;

      const payload = {
        type,

        reason,

        description:
          description.trim(),

        ...(itemIndex !== null
          ? {
              orderItemId:
                String(itemIndex),

              productId:
                item?.product ||
                item?.productId ||
                null,
            }
          : {}),

        images: uploadedImages,
      };

      const response =
        await createOrderRequest(
          order._id,
          payload
        );

      if (!response?.ok) {
        throw new Error(
          response?.data?.message ||
            `Unable to submit ${type} request.`
        );
      }

      if (type === "cancel") {
        setSuccessMessage(
          "Cancellation request submitted successfully."
        );
      }

      if (type === "return") {
        setSuccessMessage(
          "Return request submitted successfully."
        );
      }

      if (type === "replacement") {
        setSuccessMessage(
          "Replacement request submitted successfully."
        );
      }

      closeModal();

      await loadOrders();

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error(
        "Order action failed:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ======================================================
  // PAGINATION
  // ======================================================

  const totalPages = Math.ceil(
    orders.length /
      ITEMS_PER_PAGE
  );

  const startIdx =
    (currentPage - 1) *
    ITEMS_PER_PAGE;

  const paginatedOrders =
    orders.slice(
      startIdx,
      startIdx +
        ITEMS_PER_PAGE
    );

  function goToPage(page) {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function getPageNumbers() {
    const pages = [];
    const maxVisible = 5;

    if (
      totalPages <=
      maxVisible
    ) {
      for (
        let i = 1;
        i <= totalPages;
        i++
      ) {
        pages.push(i);
      }

      return pages;
    }

    if (currentPage <= 3) {
      pages.push(
        1,
        2,
        3,
        4,
        "...",
        totalPages
      );
    } else if (
      currentPage >=
      totalPages - 2
    ) {
      pages.push(
        1,
        "...",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages
      );
    }

    return pages;
  }

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="ord-wrap">
        <h1 className="ord-title">
          My Orders
        </h1>

        <p className="ord-loading">
          Loading...
        </p>

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
            margin: 0 0 32px 0;
          }

          .ord-loading {
            font-family: "Mona Sans", sans-serif;
            color: #7b7f5c;
          }

          @media (max-width: 768px) {
            .ord-wrap {
              padding: 52px 20px;
            }

            .ord-title {
              font-size: 24px;
            }
          }
        `}</style>
      </div>
    );
  }

  // ======================================================
  // EMPTY
  // ======================================================

  if (orders.length === 0) {
    return (
      <div className="ord-empty-wrap">
        <h2 className="ord-empty-title">
          No Orders Yet
        </h2>

        <p className="ord-empty-text">
          You haven&apos;t placed any orders yet.
        </p>

        <Link
          href="/products"
          className="ord-empty-btn"
        >
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
        `}</style>
      </div>
    );
  }

  // ======================================================
  // MAIN
  // ======================================================

  return (
    <div className="ord-wrap">

      <div className="ord-heading">
        <div>
          <p className="ord-eyebrow">
            ACCOUNT / ORDERS
          </p>

          <h1 className="ord-title">
            My Orders
          </h1>

          <p className="ord-subtitle">
            Track your orders, manage deliveries and raise requests.
          </p>
        </div>

        <div className="ord-count-box">
          <span className="ord-count-number">
            {orders.length}
          </span>

          <span className="ord-count-label">
            {orders.length === 1
              ? "Order"
              : "Orders"}
          </span>
        </div>
      </div>

      {/* ==================================================
          SUCCESS / ERROR
      ================================================== */}

      {successMessage && (
        <div className="ord-success">
          {successMessage}
        </div>
      )}

      {errorMessage &&
        !activeModal && (
          <div className="ord-error">
            {errorMessage}
          </div>
        )}

      {/* ==================================================
          ORDER LIST
      ================================================== */}

      <div className="ord-list">

        {paginatedOrders.map(
          (order) => {
            const cancelRequest =
              getLatestRequest({
                order,
                type: "cancel",
              });

            const cancelRequestActive =
              hasActiveRequest(
                cancelRequest
              );

            const cancelAllowed =
              canCancelOrder(order) &&
              !cancelRequestActive;

            const returnAllowed =
              canReturnOrReplace(order);

            const returnWindow =
              getReturnWindow(order);

            const items =
              Array.isArray(
                order.items
              )
                ? order.items
                : [];

            return (
              <div
                key={order._id}
                className="ord-card"
              >

                {/* ========================================
                    TOP
                ======================================== */}

                <div className="ord-card-top">

                  <div>
                    <h2 className="ord-card-id">
                      Order #
                      {order._id.slice(
                        -8
                      )}
                    </h2>

                    <p className="ord-card-date">
                      {order.createdAt
                        ? new Date(
                            order.createdAt
                          ).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "-"}
                    </p>
                  </div>

                  <Link
                    href={`/profile/orders/${order._id}`}
                    className="ord-view-btn"
                  >
                    View Details
                  </Link>

                </div>

                {/* ========================================
                    BASIC INFO
                ======================================== */}

                <div className="ord-grid">

                  <div className="ord-grid-item">
                    <p className="ord-label">
                      Total
                    </p>

                    <p className="ord-value">
                      ₹
                      {Number(
                        order.total || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>

                  <div className="ord-grid-item">
                    <p className="ord-label">
                      Payment
                    </p>

                    <span
                      className={`ord-value ${
                        order.paymentStatus ===
                        "paid"
                          ? "ord-status-paid"
                          : "ord-status-unpaid"
                      }`}
                    >
                      {order.paymentStatus ||
                        "-"}
                    </span>
                  </div>

                  <div className="ord-grid-item">
                    <p className="ord-label">
                      Status
                    </p>

                    <span
                      className={`ord-status-pill ${getStatusClass(
                        order.orderStatus
                      )}`}
                    >
                      <span className="ord-status-dot" />
                      {getStatusLabel(
                        order.orderStatus
                      )}
                    </span>
                  </div>

                  <div className="ord-grid-item">
                    <p className="ord-label">
                      Items
                    </p>

                    <span className="ord-value">
                      {items.length}
                    </span>
                  </div>

                </div>

                {/* ========================================
                    ITEMS
                ======================================== */}

                {items.length > 0 && (
                  <div className="ord-items">

                    {items.map(
                      (
                        item,
                        itemIndex
                      ) => {
                        const returnRequest =
                          getLatestRequest({
                            order,
                            type: "return",
                            itemIndex,
                          });

                        const replacementRequest =
                          getLatestRequest({
                            order,
                            type: "replacement",
                            itemIndex,
                          });

                        const returnActive =
                          hasActiveRequest(
                            returnRequest
                          );

                        const replacementActive =
                          hasActiveRequest(
                            replacementRequest
                          );

                        return (
                          <div
                            key={`${order._id}-${itemIndex}`}
                            className="ord-item"
                          >

                          <img
                            src={
                              item?.image ||
                              "/placeholder-product.png"
                            }
                            alt={
                              item?.name ||
                              "Product"
                            }
                            className="ord-item-image"
                          />

                          <div className="ord-item-content">

                            <h3 className="ord-item-name">
                              {item?.name ||
                                "Product"}
                            </h3>

                            <p className="ord-item-info">
                              Qty:{" "}
                              {item?.quantity ||
                                0}
                            </p>

                            <p className="ord-item-price">
                              ₹
                              {Number(
                                item?.price ||
                                  0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </p>

                            {item?.selectedColorName ||
                            item?.selectedColor ? (
                              <p className="ord-item-info">
                                Colour:{" "}
                                {item.selectedColorName ||
                                  item.selectedColor}
                              </p>
                            ) : null}

                            {item?.selectedSize ? (
                              <p className="ord-item-info">
                                Size:{" "}
                                {
                                  item.selectedSize
                                }
                              </p>
                            ) : null}

                            {/* ==================================
                                RETURN / REPLACE
                            ================================== */}

                            {returnAllowed &&
                              (returnActive ||
                                replacementActive) && (
                                <div className="ord-item-request-list">

                                  {returnActive &&
                                    returnRequest && (
                                      <span
                                        className={`ord-request-pill ${getRequestPillClass(
                                          returnRequest.status
                                        )}`}
                                      >
                                        {getRequestStatusLabel(
                                          returnRequest
                                        )}
                                      </span>
                                    )}

                                  {replacementActive &&
                                    replacementRequest && (
                                      <span
                                        className={`ord-request-pill ${getRequestPillClass(
                                          replacementRequest.status
                                        )}`}
                                      >
                                        {getRequestStatusLabel(
                                          replacementRequest
                                        )}
                                      </span>
                                    )}

                                </div>
                              )}

                            {returnAllowed &&
                              !returnActive &&
                              !replacementActive && (
                                <div className="ord-item-actions">

                                  {/* <button
                                    type="button"
                                    className="ord-return-btn"
                                    onClick={() =>
                                      openReturnModal(
                                        order,
                                        itemIndex
                                      )
                                    }
                                  >
                                    Return Item
                                  </button> */}

                                  <button
                                    type="button"
                                    className="ord-replace-btn"
                                    onClick={() =>
                                      openReplacementModal(
                                        order,
                                        itemIndex
                                      )
                                    }
                                  >
                                    Replace Item
                                  </button>

                                </div>
                              )}

                            {returnActive &&
                              returnRequest?.status ===
                                "rejected" && (
                                <div className="ord-retry-text">
                                  Return request was rejected. You may submit a new request.
                                </div>
                              )}

                            {replacementActive &&
                              replacementRequest?.status ===
                                "rejected" && (
                                <div className="ord-retry-text">
                                  Replacement request was rejected. You may submit a new request.
                                </div>
                              )}

                          </div>

                        </div>
                        );
                      }
                    )}

                  </div>
                )}

                {/* ========================================
                    ORDER ACTIONS
                ======================================== */}

                <div className="ord-actions">

                  {/* {cancelAllowed && (
                    <button
                      type="button"
                      className="ord-cancel-btn"
                      onClick={() =>
                        openCancelModal(
                          order
                        )
                      }
                    >
                      Cancel Order
                    </button>
                  )} */}

                  {cancelRequestActive &&
                    cancelRequest && (
                      <span
                        className={`ord-request-pill ${getRequestPillClass(
                          cancelRequest.status
                        )}`}
                      >
                        {getRequestStatusLabel(
                          cancelRequest
                        )}
                      </span>
                    )}

                  {returnAllowed && (
                    <div className="ord-window-text">
                      Return / replacement available for{" "}
                      {
                        returnWindow.daysRemaining
                      }{" "}
                      {returnWindow.daysRemaining ===
                      1
                        ? "day"
                        : "days"}
                    </div>
                  )}

                  {String(
                    order.orderStatus ||
                      ""
                  ).toLowerCase() ===
                    "delivered" &&
                    returnWindow.expired && (
                      <div className="ord-expired-text">
                        Return & replacement window expired
                      </div>
                    )}

                  {cancelRequest &&
                    normalizeRequestStatus(
                      cancelRequest.status
                    ) === "rejected" && (
                      <div className="ord-retry-text">
                        Cancellation request was rejected. You may submit a new request.
                      </div>
                    )}

                </div>

              </div>
            );
          }
        )}

      </div>

      {/* ==================================================
          PAGINATION
      ================================================== */}

      {totalPages > 1 && (
        <>
          <div className="ord-pagination-summary">
            Showing{" "}
            <strong>
              {startIdx + 1}
            </strong>
            {"–"}
            <strong>
              {Math.min(
                startIdx + ITEMS_PER_PAGE,
                orders.length
              )}
            </strong>
            {" of "}
            <strong>
              {orders.length}
            </strong>
            {" orders"}
          </div>

          <div className="ord-pagination">

            <button
            className="ord-page-btn ord-page-nav"
            onClick={() =>
              goToPage(
                currentPage - 1
              )
            }
            disabled={
              currentPage ===
              1
            }
          >
            Prev
          </button>

          {getPageNumbers().map(
            (p, idx) =>
              p === "..." ? (
                <span
                  key={`dots-${idx}`}
                  className="ord-page-dots"
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  className={`ord-page-btn ${
                    p === currentPage
                      ? "ord-page-active"
                      : ""
                  }`}
                  onClick={() =>
                    goToPage(p)
                  }
                >
                  {p}
                </button>
              )
          )}

            <button
              className="ord-page-btn ord-page-nav"
              onClick={() =>
                goToPage(
                  currentPage + 1
                )
              }
              disabled={
                currentPage ===
                totalPages
              }
            >
              Next
            </button>

          </div>
        </>
      )}

      {/* ==================================================
          CANCEL / RETURN / REPLACE MODAL
      ================================================== */}

      {activeModal && (
        <div
          className="ord-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="ord-modal">

            {/* ==========================
                HEADER
            ========================== */}

            <div className="ord-modal-header">

              <div>
                <p className="ord-modal-kicker">
                  {activeModal.type ===
                    "cancel" &&
                    "Cancel Order"}

                  {activeModal.type ===
                    "return" &&
                    "Return Item"}

                  {activeModal.type ===
                    "replacement" &&
                    "Replace Item"}
                </p>

                <h2 className="ord-modal-title">
                  {activeModal.type ===
                    "cancel" &&
                    "Why do you want to cancel?"}

                  {activeModal.type ===
                    "return" &&
                    "Why do you want to return this item?"}

                  {activeModal.type ===
                    "replacement" &&
                    "Tell us what happened"}
                </h2>
              </div>

              <button
                type="button"
                className="ord-modal-close"
                onClick={
                  closeModal
                }
                disabled={
                  actionLoading
                }
              >
                ×
              </button>

            </div>

            {/* ==========================
                BODY
            ========================== */}

            <div className="ord-modal-body">

              {/* SELECTED ITEM */}

              {activeModal.itemIndex !==
                null && (
                <div className="ord-selected-item">

                  <img
                    src={
                      activeModal
                        ?.order
                        ?.items?.[
                        activeModal
                          .itemIndex
                      ]?.image ||
                      "/placeholder-product.png"
                    }
                    alt="Product"
                    className="ord-selected-image"
                  />

                  <div>
                    <p className="ord-selected-label">
                      Selected Item
                    </p>

                    <p className="ord-selected-name">
                      {
                        activeModal
                          ?.order
                          ?.items?.[
                          activeModal
                            .itemIndex
                        ]?.name
                      }
                    </p>
                  </div>

                </div>
              )}

              {/* ==========================
                  REASON
              ========================== */}

              <label className="ord-field-label">
                Reason
              </label>

              {activeModal.type ===
                "cancel" && (
                <select
                  className="ord-select"
                  value={reason}
                  onChange={(e) =>
                    setReason(
                      e.target.value
                    )
                  }
                  disabled={
                    actionLoading
                  }
                >
                  <option value="">
                    Select reason
                  </option>

                  <option value="changed_mind">
                    Changed my mind
                  </option>

                  <option value="ordered_by_mistake">
                    Ordered by mistake
                  </option>

                  <option value="found_better_price">
                    Found a better price
                  </option>

                  <option value="delivery_too_slow">
                    Delivery is taking too long
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>
              )}

              {activeModal.type ===
                "return" && (
                <select
                  className="ord-select"
                  value={reason}
                  onChange={(e) =>
                    setReason(
                      e.target.value
                    )
                  }
                  disabled={
                    actionLoading
                  }
                >
                  <option value="">
                    Select reason
                  </option>

                  <option value="changed_mind">
                    Changed my mind
                  </option>

                  <option value="not_as_expected">
                    Not as expected
                  </option>

                  <option value="damaged">
                    Product arrived damaged
                  </option>

                  <option value="defective">
                    Product is defective
                  </option>

                  <option value="wrong_product">
                    Wrong product received
                  </option>
                </select>
              )}

              {activeModal.type ===
                "replacement" && (
                <select
                  className="ord-select"
                  value={reason}
                  onChange={(e) =>
                    setReason(
                      e.target.value
                    )
                  }
                  disabled={
                    actionLoading
                  }
                >
                  <option value="">
                    Select reason
                  </option>

                  <option value="damaged">
                    Product arrived damaged
                  </option>

                  <option value="defective">
                    Product is defective
                  </option>

                  <option value="wrong_product">
                    Wrong product received
                  </option>
                </select>
              )}

              {/* ==========================
                  REPLACEMENT IMAGES
              ========================== */}

              {activeModal.type ===
                "replacement" && (
                <>
                  <label className="ord-field-label">
                    Damage Images
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={
                      handleFileChange
                    }
                    disabled={
                      actionLoading
                    }
                    className="ord-file-input"
                  />

                  <p className="ord-upload-note">
                    Upload 1–5 images. Maximum 10MB per image.
                  </p>

                  {files.length > 0 && (
                    <div className="ord-file-list">

                      {files.map(
                        (
                          file,
                          index
                        ) => (
                          <div
                            key={`${file.name}-${index}`}
                            className="ord-file-row"
                          >
                            <span>
                              {file.name}
                            </span>

                            <span>
                              {(
                                file.size /
                                1024 /
                                1024
                              ).toFixed(
                                1
                              )}{" "}
                              MB
                            </span>
                          </div>
                        )
                      )}

                    </div>
                  )}
                </>
              )}

              {/* ==========================
                  DESCRIPTION
              ========================== */}

              <label className="ord-field-label">
                Additional Details
              </label>

              <textarea
                className="ord-textarea"
                rows={4}
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder={
                  activeModal.type ===
                  "replacement"
                    ? "Describe the damage or issue..."
                    : "Tell us more..."
                }
                disabled={
                  actionLoading
                }
              />

              {/* ==========================
                  INFO
              ========================== */}

              {activeModal.type !==
                "cancel" && (
                <p className="ord-modal-note">
                  Return and replacement requests must be submitted within 7 days of delivery.
                </p>
              )}

              {/* ==========================
                  ERROR
              ========================== */}

              {errorMessage && (
                <div className="ord-modal-error">
                  {errorMessage}
                </div>
              )}

              {/* ==========================
                  ACTIONS
              ========================== */}

              <div className="ord-modal-actions">

                <button
                  type="button"
                  className="ord-modal-secondary"
                  onClick={
                    closeModal
                  }
                  disabled={
                    actionLoading
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className={`ord-modal-submit ${
                    activeModal.type ===
                    "cancel"
                      ? "ord-modal-submit-danger"
                      : ""
                  }`}
                  onClick={
                    submitAction
                  }
                  disabled={
                    actionLoading
                  }
                >
                  {actionLoading
                    ? "Submitting..."
                    : activeModal.type ===
                      "cancel"
                    ? "Submit Cancellation"
                    : activeModal.type ===
                      "return"
                    ? "Submit Return"
                    : "Submit Replacement"}
                </button>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* ==================================================
          STYLES
      ================================================== */}

      <style jsx>{`

        .ord-wrap {
          min-height: 100vh;
          margin: 0 auto;
          padding: 122px 72px 88px;
          background:
            radial-gradient(circle at top right, rgba(123, 127, 92, 0.08), transparent 28%),
            #FEFFF5;
          box-sizing: border-box;
        }

        .ord-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 28px;
          margin-bottom: 38px;
        }

        .ord-eyebrow {
          margin: 0 0 8px;
          font-family: "Mona Sans", sans-serif;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.18em;
          color: #7b7f5c;
          text-transform: uppercase;
        }

        .ord-title {
          font-family: "Tobias TRIAL", serif;
          font-size: 42px;
          font-weight: 600;
          line-height: 1;
          color: #1a1a1a;
          margin: 0;
        }

        .ord-subtitle {
          margin: 12px 0 0;
          max-width: 520px;
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
          line-height: 1.55;
          color: #858578;
        }

        .ord-count-box {
          min-width: 110px;
          padding: 14px 18px;
          border: 1px solid #e5e5da;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.78);
          text-align: center;
          box-shadow: 0 8px 24px rgba(44, 47, 28, 0.05);
        }

        .ord-count-number {
          display: block;
          font-family: "Tobias TRIAL", serif;
          font-size: 28px;
          line-height: 1;
          color: #1a1a1a;
        }

        .ord-count-label {
          display: block;
          margin-top: 6px;
          font-family: "Mona Sans", sans-serif;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #8a8a7e;
        }

        .ord-list {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .ord-card {
          position: relative;
          overflow: hidden;
          border: 1px solid #e5e5da;
          border-radius: 18px;
          padding: 24px;
          background: rgba(255, 255, 255, 0.94);
          box-shadow:
            0 8px 28px rgba(44, 47, 28, 0.05),
            0 1px 2px rgba(44, 47, 28, 0.03);
          box-sizing: border-box;
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .ord-card::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 3px;
          background: #7b7f5c;
        }

        .ord-card:hover {
          transform: translateY(-2px);
          box-shadow:
            0 14px 36px rgba(44, 47, 28, 0.08),
            0 2px 4px rgba(44, 47, 28, 0.04);
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
          margin: 4px 0 0;
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

        .ord-grid-item {
          min-width: 0;
          padding: 12px 14px;
          border: 1px solid #eeeeE2;
          border-radius: 10px;
          background: #fcfcf7;
        }

        .ord-label {
          font-family: "Mona Sans", sans-serif;
          font-size: 12px;
          color: #8a8a7e;
          margin: 0 0 4px;
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

        .ord-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 10px;
          border-radius: 999px;
          font-family: "Mona Sans", sans-serif;
          font-size: 11px;
          font-weight: 800;
          line-height: 1;
          white-space: nowrap;
        }

        .ord-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          flex-shrink: 0;
        }

        .status-delivered {
          color: #2e7d32;
          background: #edf8ef;
        }

        .status-confirmed,
        .status-shipping {
          color: #52633a;
          background: #f0f3e7;
        }

        .status-pending {
          color: #9a7023;
          background: #fff7df;
        }

        .status-request {
          color: #5f5c94;
          background: #f0effb;
        }

        .status-danger {
          color: #b23b3b;
          background: #fff0f0;
        }

        /* ==========================================
           ITEMS
        ========================================== */

        .ord-items {
          margin-top: 28px;
          border-top: 1px solid #eeeeE2;
          padding-top: 20px;
        }

        .ord-item {
          display: flex;
          gap: 16px;
          padding: 16px 0;
          border-bottom: 1px solid #eeeeE2;
        }

        .ord-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .ord-item-image {
          width: 84px;
          height: 84px;
          flex-shrink: 0;
          object-fit: cover;
          border-radius: 9px;
          background: #f7f7ef;
        }

        .ord-item-content {
          min-width: 0;
          flex: 1;
        }

        .ord-item-name {
          font-family: "Mona Sans", sans-serif;
          color: #1a1a1a;
          font-size: 14px;
          font-weight: 700;
          margin: 0 0 7px;
        }

        .ord-item-info {
          font-family: "Mona Sans", sans-serif;
          color: #8a8a7e;
          font-size: 12px;
          margin: 3px 0;
        }

        .ord-item-price {
          font-family: "Mona Sans", sans-serif;
          color: #1a1a1a;
          font-size: 13px;
          font-weight: 700;
          margin: 5px 0;
        }

        .ord-item-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .ord-return-btn,
        .ord-replace-btn {
          font-family: "Mona Sans", sans-serif;
          font-size: 11px;
          font-weight: 700;
          padding: 8px 13px;
          border-radius: 7px;
          cursor: pointer;
          transition:
            background 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease;
        }

        .ord-return-btn {
          color: #111111;
          background: #ffffff;
          border: 1px solid #111111;
        }

        .ord-return-btn:hover {
          background: #111111;
          color: #ffffff;
        }

        .ord-replace-btn {
          color: #ffffff;
          background: #7b7f5c;
          border: 1px solid #7b7f5c;
        }

        .ord-replace-btn:hover {
          background: #686b4c;
          border-color: #686b4c;
        }

        /* ==========================================
           REQUEST STATUS
        ========================================== */

        .ord-item-request-list {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .ord-request-pill {
          display: inline-flex;
          align-items: center;
          min-height: 28px;
          padding: 7px 11px;
          border-radius: 999px;
          font-family: "Mona Sans", sans-serif;
          font-size: 11px;
          font-weight: 800;
          line-height: 1;
          border: 1px solid transparent;
          white-space: nowrap;
        }

        .ord-request-pending {
          color: #8a6418;
          background: #fff7df;
          border-color: #ecd99e;
        }

        .ord-request-approved {
          color: #31663a;
          background: #edf8ef;
          border-color: #c9e4ce;
        }

        .ord-request-rejected {
          color: #9a3f3f;
          background: #fff0f0;
          border-color: #efc8c8;
        }

        .ord-request-completed {
          color: #4d597f;
          background: #eff2fb;
          border-color: #d4dbef;
        }

        .ord-request-cancelled {
          color: #707070;
          background: #f3f3f0;
          border-color: #ddddda;
        }

        .ord-retry-text {
          margin-top: 8px;
          font-family: "Mona Sans", sans-serif;
          font-size: 11px;
          line-height: 1.5;
          color: #9a3f3f;
        }

        /* ==========================================
           ORDER ACTIONS
        ========================================== */

        .ord-actions {
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid #eeeeE2;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .ord-cancel-btn {
          font-family: "Mona Sans", sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #b23b3b;
          background: #fff5f5;
          border: 1px solid #efc8c8;
          border-radius: 8px;
          padding: 10px 16px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .ord-cancel-btn:hover {
          background: #fbeaea;
        }

        .ord-window-text {
          font-family: "Mona Sans", sans-serif;
          color: #7b7f5c;
          font-size: 11px;
        }

        .ord-expired-text {
          font-family: "Mona Sans", sans-serif;
          color: #a25c5c;
          font-size: 11px;
        }

        /* ==========================================
           ALERTS
        ========================================== */

        .ord-success {
          margin-bottom: 22px;
          padding: 13px 16px;
          border-radius: 8px;
          border: 1px solid #c9e4ce;
          background: #f2faf4;
          color: #2e7d32;
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
        }

        .ord-error {
          margin-bottom: 22px;
          padding: 13px 16px;
          border-radius: 8px;
          border: 1px solid #e7b2b2;
          background: #fff5f5;
          color: #a52d2d;
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
        }

        /* ==========================================
           MODAL
        ========================================== */

        .ord-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 3000;
          background: rgba(17, 17, 17, 0.52);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          box-sizing: border-box;
        }

        .ord-modal {
          width: 100%;
          max-width: 540px;
          max-height: 90vh;
          overflow-y: auto;
          background: #ffffff;
          border-radius: 16px;
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2);
        }

        .ord-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          padding: 22px 24px;
          border-bottom: 1px solid #e5e5da;
        }

        .ord-modal-kicker {
          margin: 0 0 5px;
          font-family: "Mona Sans", sans-serif;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #7b7f5c;
          font-weight: 700;
        }

        .ord-modal-title {
          margin: 0;
          font-family: "Tobias TRIAL", serif;
          font-size: 22px;
          font-weight: 600;
          color: #1a1a1a;
          line-height: 1.25;
        }

        .ord-modal-close {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          border: none;
          border-radius: 50%;
          background: #f5f5ef;
          color: #111111;
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
        }

        .ord-modal-close:hover {
          background: #ececdf;
        }

        .ord-modal-body {
          padding: 24px;
        }

        /* ==========================================
           SELECTED ITEM
        ========================================== */

        .ord-selected-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid #e5e5da;
          background: #fafbf3;
          border-radius: 10px;
          margin-bottom: 20px;
        }

        .ord-selected-image {
          width: 54px;
          height: 54px;
          object-fit: cover;
          border-radius: 7px;
        }

        .ord-selected-label {
          margin: 0 0 3px;
          font-family: "Mona Sans", sans-serif;
          font-size: 10px;
          color: #8a8a7e;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .ord-selected-name {
          margin: 0;
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
          font-weight: 700;
          color: #1a1a1a;
        }

        /* ==========================================
           FORM
        ========================================== */

        .ord-field-label {
          display: block;
          margin: 0 0 7px;
          font-family: "Mona Sans", sans-serif;
          font-size: 12px;
          font-weight: 700;
          color: #444444;
        }

        .ord-select,
        .ord-textarea,
        .ord-file-input {
          width: 100%;
          box-sizing: border-box;
          font-family: "Mona Sans", sans-serif;
        }

        .ord-select {
          border: 1px solid #dcded0;
          border-radius: 8px;
          background: #fafbf3;
          color: #111111;
          padding: 11px 13px;
          font-size: 13px;
          outline: none;
          margin-bottom: 18px;
        }

        .ord-select:focus {
          border-color: #7b7f5c;
        }

        .ord-textarea {
          resize: vertical;
          min-height: 105px;
          border: 1px solid #dcded0;
          border-radius: 8px;
          background: #fafbf3;
          color: #111111;
          padding: 12px 13px;
          font-size: 13px;
          line-height: 1.5;
          outline: none;
          margin-bottom: 15px;
        }

        .ord-textarea:focus {
          border-color: #7b7f5c;
        }

        .ord-file-input {
          border: 1px dashed #c8cab4;
          border-radius: 8px;
          padding: 11px;
          background: #fafbf3;
          font-size: 12px;
          margin-bottom: 6px;
        }

        .ord-upload-note {
          margin: 0 0 14px;
          color: #888888;
          font-family: "Mona Sans", sans-serif;
          font-size: 11px;
          line-height: 1.5;
        }

        .ord-file-list {
          border: 1px solid #e5e5da;
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 18px;
        }

        .ord-file-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 9px 11px;
          font-family: "Mona Sans", sans-serif;
          font-size: 11px;
          color: #555555;
          border-bottom: 1px solid #eeeeE2;
        }

        .ord-file-row:last-child {
          border-bottom: none;
        }

        .ord-modal-note {
          margin: 0 0 16px;
          font-family: "Mona Sans", sans-serif;
          color: #7b7f5c;
          font-size: 11px;
          line-height: 1.5;
        }

        .ord-modal-error {
          margin-bottom: 16px;
          padding: 10px 12px;
          border-radius: 7px;
          border: 1px solid #e7b2b2;
          background: #fff5f5;
          color: #a52d2d;
          font-family: "Mona Sans", sans-serif;
          font-size: 12px;
          line-height: 1.45;
        }

        /* ==========================================
           MODAL BUTTONS
        ========================================== */

        .ord-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }

        .ord-modal-secondary,
        .ord-modal-submit {
          min-height: 44px;
          padding: 11px 18px;
          border-radius: 8px;
          font-family: "Mona Sans", sans-serif;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .ord-modal-secondary {
          background: #ffffff;
          color: #111111;
          border: 1px solid #111111;
        }

        .ord-modal-secondary:hover:not(:disabled) {
          background: #111111;
          color: #ffffff;
        }

        .ord-modal-submit {
          background: #7b7f5c;
          color: #ffffff;
          border: 1px solid #7b7f5c;
        }

        .ord-modal-submit:hover:not(:disabled) {
          background: #686b4c;
          border-color: #686b4c;
        }

        .ord-modal-submit-danger {
          background: #b23b3b;
          border-color: #b23b3b;
        }

        .ord-modal-submit-danger:hover:not(:disabled) {
          background: #962f2f;
          border-color: #962f2f;
        }

        .ord-modal-secondary:disabled,
        .ord-modal-submit:disabled,
        .ord-modal-close:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ==========================================
           PAGINATION
        ========================================== */

        .ord-pagination-summary {
          margin-top: 32px;
          text-align: center;
          font-family: "Mona Sans", sans-serif;
          font-size: 11px;
          color: #8a8a7e;
        }

        .ord-pagination-summary strong {
          color: #1a1a1a;
          font-weight: 800;
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
          transition:
            background 0.2s ease,
            color 0.2s ease;
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

        /* ==========================================
           MOBILE
        ========================================== */

        @media (max-width: 768px) {

          .ord-wrap {
            padding: 48px 20px 64px;
          }

          .ord-heading {
            align-items: flex-start;
            margin-bottom: 28px;
          }

          .ord-title {
            font-size: 30px;
          }

          .ord-subtitle {
            font-size: 12px;
            max-width: 320px;
          }

          .ord-count-box {
            min-width: 82px;
            padding: 12px;
          }

          .ord-count-number {
            font-size: 22px;
          }

          .ord-list {
            gap: 16px;
          }

          .ord-card {
            padding: 16px;
            border-radius: 10px;
          }

          .ord-card-top {
            flex-direction: column;
            align-items: flex-start;
          }

          .ord-card-id {
            font-size: 14px;
          }

          .ord-card-date {
            font-size: 11px;
          }

          .ord-view-btn {
            width: 100%;
            font-size: 12px;
            padding: 9px 16px;
          }

          .ord-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-top: 18px;
          }

          .ord-label {
            font-size: 11px;
          }

          .ord-value {
            font-size: 13px;
          }

          .ord-item {
            gap: 11px;
          }

          .ord-item-image {
            width: 68px;
            height: 68px;
          }

          .ord-item-name {
            font-size: 12px;
          }

          .ord-item-info {
            font-size: 10px;
          }

          .ord-item-price {
            font-size: 12px;
          }

          .ord-item-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .ord-return-btn,
          .ord-replace-btn {
            width: 100%;
          }

          .ord-actions {
            align-items: stretch;
            flex-direction: column;
          }

          .ord-cancel-btn {
            width: 100%;
          }

          .ord-window-text,
          .ord-expired-text {
            text-align: center;
          }

          .ord-modal-overlay {
            padding: 12px;
          }

          .ord-modal {
            max-height: 92vh;
            border-radius: 12px;
          }

          .ord-modal-header {
            padding: 18px;
          }

          .ord-modal-body {
            padding: 18px;
          }

          .ord-modal-title {
            font-size: 19px;
          }

          .ord-modal-actions {
            flex-direction: column-reverse;
          }

          .ord-modal-secondary,
          .ord-modal-submit {
            width: 100%;
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