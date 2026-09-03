"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import {
  getOrderById,
  trackOrder,
  getMyOrderRequests,
  createOrderRequest,
  getUploadPresignedUrl,
  uploadFileToR2,
} from "@/lib/api";
import OrderTimeline from "../OrderTimeline";

const ACTIVE_REQUEST_STATUSES = ["pending", "approved", "completed"];
const CANCEL_STATUSES = ["pending", "confirmed", "processing", "packed"];
const REQUEST_TYPES = ["cancel", "return", "replacement"];

const REQUEST_LABELS = {
  pending: "Request Pending",
  approved: "Request Approved",
  rejected: "Request Rejected",
  cancelled: "Request Cancelled",
  completed: "Request Completed",
};

const REQUEST_TYPE_LABELS = {
  cancel: "Cancellation",
  return: "Return",
  replacement: "Replacement",
};

const REASONS = {
  cancel: [
    ["change_of_mind", "Changed my mind"],
    ["ordered_by_mistake", "Ordered by mistake"],
    ["found_better_price", "Found a better price"],
    ["delivery_too_slow", "Delivery is taking too long"],
    ["other", "Other"],
  ],
  return: [
    ["change_of_mind", "Changed my mind"],
    ["not_as_expected", "Not as expected"],
    ["damaged", "Product arrived damaged"],
    ["defective", "Product is defective"],
    ["wrong_product", "Wrong product received"],
  ],
  replacement: [
    ["damaged", "Product arrived damaged"],
    ["defective", "Product is defective"],
    ["wrong_product", "Wrong product received"],
  ],
};

function normalizeRequestsResponse(response) {
  if (Array.isArray(response?.requests)) return response.requests;
  if (Array.isArray(response?.data?.requests)) return response.data.requests;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
}

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase();
}

function isActiveRequest(request) {
  return ACTIVE_REQUEST_STATUSES.includes(normalizeStatus(request?.status));
}

function requestStatusLabel(status) {
  const normalized = normalizeStatus(status);
  return REQUEST_LABELS[normalized] || status || "Unknown";
}

function requestTypeLabel(type) {
  return REQUEST_TYPE_LABELS[normalizeStatus(type)] || type || "Request";
}

export default function OrderDetailsPage() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);

  const [activeModal, setActiveModal] = useState(null);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  async function loadRequests() {
    setRequestLoading(true);

    try {
      const response = await getMyOrderRequests();
      const list = normalizeRequestsResponse(response);

      const orderRequests = list.filter((request) => {
        const requestOrderId =
          request?.order?._id || request?.order?.id || request?.order;
        return String(requestOrderId || "") === String(id || "");
      });

      setRequests(orderRequests);
    } catch (error) {
      console.error("Failed to load order requests:", error);
      setRequests([]);
    } finally {
      setRequestLoading(false);
    }
  }

  async function loadOrder() {
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    try {
      const res = await getOrderById(id);

      if (res?.success) {
        const loadedOrder = res.order;
        setOrder(loadedOrder);

        const awbCode = loadedOrder?.shiprocket?.awbCode || loadedOrder?.awbCode || "";

        if (awbCode) {
          try {
            const trackRes = await trackOrder(id);

            if (trackRes?.success) {
              setTracking(trackRes?.tracking || trackRes?.data || null);
            }

            const refreshed = await getOrderById(id);
            if (refreshed?.success) {
              setOrder(refreshed.order);
            }
          } catch (trackingError) {
            console.error("Tracking refresh failed:", trackingError);
          }
        } else {
          setTracking(null);
        }

        await loadRequests();
      } else {
        setOrder(null);
        await loadRequests();
      }
    } catch (error) {
      console.error("Failed to load order:", error);
      setOrder(null);
      await loadRequests();
    } finally {
      setLoading(false);
    }
  }

  const awbCode = order?.shiprocket?.awbCode || order?.awbCode || "";
  const courierName = order?.shiprocket?.courierName || order?.courierName || "";
  const shipmentId = order?.shiprocket?.shipmentId || order?.shipmentId || "";
  const trackingUrl = order?.shiprocket?.trackingUrl || order?.trackingUrl || "";
  const orderStatus = normalizeStatus(order?.orderStatus || "pending");

  const cancelRequest = useMemo(
    () =>
      requests
        .filter((request) => normalizeStatus(request?.type) === "cancel")
        .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))[0] || null,
    [requests]
  );

  const itemRequests = useMemo(() => {
    const result = {};

    for (const request of requests) {
      const type = normalizeStatus(request?.type);
      if (type !== "return" && type !== "replacement") continue;

      const itemIndex = String(request?.orderItemId ?? "");
      if (!itemIndex) continue;

      if (!result[itemIndex]) result[itemIndex] = [];
      result[itemIndex].push(request);
    }

    Object.values(result).forEach((list) => {
      list.sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));
    });

    return result;
  }, [requests]);

  function getLatestItemRequest(itemIndex, type) {
    const list = itemRequests[String(itemIndex)] || [];
    return list.find((request) => normalizeStatus(request?.type) === type) || null;
  }

  function getDeliveredDate() {
    return order?.deliveredAt || order?.shiprocket?.deliveredAt || null;
  }

  function getReturnWindow() {
    const deliveredAt = getDeliveredDate();
    if (!deliveredAt) {
      return { eligible: false, expired: true, daysRemaining: 0 };
    }

    const deliveredDate = new Date(deliveredAt);
    if (Number.isNaN(deliveredDate.getTime())) {
      return { eligible: false, expired: true, daysRemaining: 0 };
    }

    const expiresAt = new Date(deliveredDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();
    const remaining = expiresAt.getTime() - now.getTime();

    return {
      eligible: orderStatus === "delivered" && remaining >= 0,
      expired: remaining < 0,
      daysRemaining: Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000))),
    };
  }

  function canCancel() {
    return CANCEL_STATUSES.includes(orderStatus) && !isActiveRequest(cancelRequest);
  }

  function canReturnReplace() {
    return getReturnWindow().eligible;
  }

  function canStartItemRequest(itemIndex, type) {
    const request = getLatestItemRequest(itemIndex, type);
    return !isActiveRequest(request);
  }

  function clearModal() {
    if (actionLoading) return;
    setActiveModal(null);
    setReason("");
    setDescription("");
    setFiles([]);
    setErrorMessage("");
  }

  function openRequestModal(type, itemIndex = null) {
    setMessage("");
    setErrorMessage("");
    setReason("");
    setDescription("");
    setFiles([]);

    if (type === "cancel") {
      if (!canCancel()) return;
    } else {
      if (!canReturnReplace()) {
        setMessage("Return and replacement requests are available only within 7 days of delivery.");
        return;
      }

      if (itemIndex === null) return;
      if (!canStartItemRequest(itemIndex, type)) return;
    }

    setActiveModal({ type, itemIndex });
  }

  function handleFileChange(event) {
    const selected = Array.from(event.target.files || []).filter((file) =>
      file.type.startsWith("image/")
    );

    if (selected.length > 5) {
      setErrorMessage("You can upload maximum 5 images.");
      setFiles(selected.slice(0, 5));
      return;
    }

    setErrorMessage("");
    setFiles(selected);
  }

  async function uploadImages() {
    if (!files.length) return [];

    const urls = [];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`${file.name} is larger than 10MB.`);
      }

      const presignRes = await getUploadPresignedUrl({
        mimeType: file.type,
        fileSize: file.size,
        folder: "replacement-requests",
      });

      if (!presignRes?.ok) {
        throw new Error(
          presignRes?.data?.message || "Could not prepare image upload."
        );
      }

      const data =
        presignRes?.data?.data || presignRes?.data || presignRes;

      if (!data?.uploadUrl || !data?.publicUrl) {
        console.error("Presign response:", presignRes);
        throw new Error("Invalid image upload response.");
      }

      const uploadRes = await uploadFileToR2(data.uploadUrl, file);

      if (!uploadRes?.ok) {
        throw new Error(`Failed to upload ${file.name}.`);
      }

      urls.push(data.publicUrl);
    }

    return urls;
  }

  async function submitRequest() {
    if (!activeModal || !order?._id) return;

    const { type, itemIndex } = activeModal;

    if (!reason) {
      setErrorMessage("Please select a reason.");
      return;
    }

    if (type === "replacement" && files.length === 0) {
      setErrorMessage("Please upload at least one damage image.");
      return;
    }

    if (type === "cancel" && !canCancel() && !isActiveRequest(cancelRequest)) {
      setErrorMessage("This order can no longer be cancelled.");
      return;
    }

    if ((type === "return" || type === "replacement") && !canReturnReplace()) {
      setErrorMessage("This request is available only within 7 days of delivery.");
      return;
    }

    if (
      (type === "return" || type === "replacement") &&
      !canStartItemRequest(itemIndex, type)
    ) {
      setErrorMessage("An active request already exists for this item.");
      return;
    }

    setActionLoading(true);
    setErrorMessage("");
    setMessage("");

    try {
      const uploadedImages = type === "replacement" ? await uploadImages() : [];
      const item = itemIndex !== null ? order?.items?.[itemIndex] : null;

      const payload = {
        type,
        reason,
        description: description.trim(),
        ...(itemIndex !== null
          ? {
              orderItemId: String(itemIndex),
              productId: item?.product || item?.productId || null,
            }
          : {}),
        images: uploadedImages,
      };

      const response = await createOrderRequest(order._id, payload);

      if (!response?.ok) {
        throw new Error(
          response?.data?.message || `Unable to submit ${type} request.`
        );
      }

      setMessage(
        type === "cancel"
          ? "Cancellation request submitted successfully."
          : type === "return"
            ? "Return request submitted successfully."
            : "Replacement request submitted successfully."
      );

      setActiveModal(null);
      setReason("");
      setDescription("");
      setFiles([]);
      await loadRequests();
      await loadOrderOnly();
    } catch (error) {
      console.error("Order request failed:", error);
      setErrorMessage(error?.message || "Something went wrong. Please try again.");
    } finally {
      setActionLoading(false);
    }
  }

  async function loadOrderOnly() {
    try {
      const res = await getOrderById(id);
      if (res?.success) setOrder(res.order);
    } catch (error) {
      console.error("Failed to refresh order:", error);
    }
  }

  if (loading) {
    return (
      <div className="odt-wrap">
        <p className="odt-status-text">Loading...</p>
        <style jsx>{`
          .odt-wrap { margin: 0 auto; padding: 64px 32px; background: #fefff5; min-height: 60vh; box-sizing: border-box; }
          .odt-status-text { font-family: "Mona Sans", sans-serif; color: #7b7f5c; font-size: 15px; }
        `}</style>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="odt-wrap">
        <p className="odt-status-text">Order not found.</p>
        <style jsx>{`
          .odt-wrap { margin: 0 auto; padding: 64px 32px; background: #fefff5; min-height: 60vh; box-sizing: border-box; }
          .odt-status-text { font-family: "Mona Sans", sans-serif; color: #6b6b5f; font-size: 15px; }
        `}</style>
      </div>
    );
  }

  const returnWindow = getReturnWindow();

  return (
    <div className="odt-wrap">
      <h1 className="odt-title">Order Details</h1>

      {message ? <div className="odt-alert odt-success">{message}</div> : null}
      {errorMessage && !activeModal ? (
        <div className="odt-alert odt-error">{errorMessage}</div>
      ) : null}

      <div className="odt-card odt-info-card">
        <div className="odt-info-grid">
          <div>
            <h3 className="odt-section-heading">Order Information</h3>
            <p className="odt-row"><b>Order ID :</b> {order._id}</p>
            <p className="odt-row"><b>Status :</b> {order.orderStatus || "-"}</p>
            <p className="odt-row"><b>Payment :</b> {order.paymentStatus || "-"}</p>
            <p className="odt-row"><b>Payment Method :</b> {order.paymentMethod || "-"}</p>
            <p className="odt-row"><b>Total :</b> ₹{Number(order.total || 0).toLocaleString("en-IN")}</p>
            {order.adminApproval?.status ? (
              <p className="odt-row"><b>Order Approval :</b> {order.adminApproval.status}</p>
            ) : null}
            {order.cancellationReason ? (
              <p className="odt-row"><b>Cancellation Reason :</b> {order.cancellationReason}</p>
            ) : null}
          </div>

          <div>
            <h3 className="odt-section-heading">Shipping Address</h3>
            {order.address ? (
              <>
                <p className="odt-row">{order.address.firstName} {order.address.lastName}</p>
                <p className="odt-row">{order.address.address1}</p>
                {order.address.address2 ? <p className="odt-row">{order.address.address2}</p> : null}
                <p className="odt-row">{order.address.city}, {order.address.state}</p>
                <p className="odt-row">{order.address.pin}</p>
                <p className="odt-row">{order.address.mobile}</p>
              </>
            ) : (
              <p className="odt-row">Shipping address unavailable.</p>
            )}
          </div>
        </div>

        <div className="odt-order-actions">
          {isActiveRequest(cancelRequest) ? (
            <div className="odt-request-status">
              <span className="odt-request-type">Cancellation</span>
              <span className="odt-request-pill">{requestStatusLabel(cancelRequest.status)}</span>
            </div>
          ) : null}

          {canCancel() ? (
            <button
              type="button"
              className="odt-cancel-btn"
              onClick={() => openRequestModal("cancel")}
            >
              Cancel Order
            </button>
          ) : null}
        </div>
      </div>

      <div className="odt-card">
        <h3 className="odt-section-heading odt-section-heading-lg">Ordered Products</h3>

        <div className="odt-items">
          {Array.isArray(order.items) && order.items.length > 0 ? (
            order.items.map((item, index) => {
              const returnRequest = getLatestItemRequest(index, "return");
              const replacementRequest = getLatestItemRequest(index, "replacement");
              const returnActive = isActiveRequest(returnRequest);
              const replacementActive = isActiveRequest(replacementRequest);

              return (
                <div key={`${item?.product || "item"}-${index}`} className="odt-item">
                  <img
                    src={item?.image || "/placeholder-product.png"}
                    alt={item?.name || "Product"}
                    className="odt-item-img"
                  />

                  <div className="odt-item-info">
                    <h4 className="odt-item-name">{item?.name || "Unnamed Product"}</h4>
                    <p className="odt-item-meta">Qty : {item?.quantity || 0}</p>
                    <p className="odt-item-meta">₹{Number(item?.price || 0).toLocaleString("en-IN")}</p>
                    {item?.selectedColorName || item?.selectedColor ? (
                      <p className="odt-item-meta">Colour : {item?.selectedColorName || item?.selectedColor}</p>
                    ) : null}
                    {item?.selectedSize ? <p className="odt-item-meta">Size : {item.selectedSize}</p> : null}

                    {returnActive ? (
                      <div className="odt-item-request-row">
                        <span>Return</span>
                        <span className="odt-request-pill">{requestStatusLabel(returnRequest.status)}</span>
                      </div>
                    ) : null}

                    {replacementActive ? (
                      <div className="odt-item-request-row">
                        <span>Replacement</span>
                        <span className="odt-request-pill">{requestStatusLabel(replacementRequest.status)}</span>
                      </div>
                    ) : null}

                    {returnWindow.eligible ? (
                      <div className="odt-item-actions">
                        {!returnActive ? (
                          <button
                            type="button"
                            className="odt-return-btn"
                            onClick={() => openRequestModal("return", index)}
                          >
                            Return Item
                          </button>
                        ) : null}

                        {!replacementActive ? (
                          <button
                            type="button"
                            className="odt-replace-btn"
                            onClick={() => openRequestModal("replacement", index)}
                          >
                            Replace Item
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="odt-row">No products found.</p>
          )}
        </div>
      </div>

      <div className="odt-card">
        <h3 className="odt-section-heading odt-section-heading-lg">Requests</h3>

        {requestLoading ? (
          <p className="odt-track-pending">Loading request status...</p>
        ) : requests.length === 0 ? (
          <p className="odt-track-pending">No cancellation, return or replacement requests.</p>
        ) : (
          <div className="odt-request-list">
            {requests.map((request) => (
              <div key={request?._id || `${request.type}-${request.createdAt}`} className="odt-request-card">
                <div className="odt-request-card-head">
                  <div>
                    <p className="odt-request-type">{requestTypeLabel(request?.type)}</p>
                    <p className="odt-request-date">
                      {request?.createdAt
                        ? new Date(request.createdAt).toLocaleString("en-IN")
                        : ""}
                    </p>
                  </div>
                  <span
                    className={`odt-request-pill ${
                      normalizeStatus(request?.status) === "rejected"
                        ? "odt-request-rejected"
                        : normalizeStatus(request?.status) === "cancelled"
                          ? "odt-request-cancelled"
                          : ""
                    }`}
                  >
                    {requestStatusLabel(request?.status)}
                  </span>
                </div>

                {request?.reason ? <p className="odt-request-detail"><b>Reason:</b> {request.reason}</p> : null}
                {request?.description ? <p className="odt-request-detail"><b>Details:</b> {request.description}</p> : null}
                {request?.rejectionReason ? (
                  <p className="odt-request-detail"><b>Rejection:</b> {request.rejectionReason}</p>
                ) : null}
                {request?.adminNote ? <p className="odt-request-detail"><b>Admin Note:</b> {request.adminNote}</p> : null}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="odt-card">
        <h3 className="odt-section-heading odt-section-heading-lg">Shipping</h3>
        <p className="odt-row"><b>Courier :</b> {courierName || "-"}</p>
        <p className="odt-row"><b>Shipment ID :</b> {shipmentId || "-"}</p>
        <p className="odt-row"><b>Tracking ID :</b> {awbCode || "-"}</p>
        {tracking?.status ? <p className="odt-row"><b>Courier Status :</b> {tracking.status}</p> : null}
        {tracking?.currentLocation ? <p className="odt-row"><b>Current Location :</b> {tracking.currentLocation}</p> : null}

        {trackingUrl ? (
          <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="odt-track-btn">
            Track Shipment
          </a>
        ) : (
          <p className="odt-track-pending">Tracking will be available soon.</p>
        )}
      </div>

      <div className="odt-card">
        <OrderTimeline
          status={orderStatus}
          requestStatus={
            requests.find((request) => isActiveRequest(request))?.status || ""
          }
        />
      </div>

      {activeModal ? (
        <div
          className="odt-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) clearModal();
          }}
        >
          <div className="odt-modal">
            <div className="odt-modal-header">
              <div>
                <p className="odt-modal-kicker">{requestTypeLabel(activeModal.type)}</p>
                <h2 className="odt-modal-title">
                  {activeModal.type === "cancel"
                    ? "Why do you want to cancel?"
                    : activeModal.type === "return"
                      ? "Why do you want to return this item?"
                      : "Tell us what happened"}
                </h2>
              </div>
              <button type="button" className="odt-modal-close" onClick={clearModal} disabled={actionLoading}>×</button>
            </div>

            <div className="odt-modal-body">
              {activeModal.itemIndex !== null ? (
                <div className="odt-selected-item">
                  <img
                    src={order?.items?.[activeModal.itemIndex]?.image || "/placeholder-product.png"}
                    alt="Product"
                    className="odt-selected-image"
                  />
                  <div>
                    <p className="odt-selected-label">Selected Item</p>
                    <p className="odt-selected-name">{order?.items?.[activeModal.itemIndex]?.name || "Product"}</p>
                  </div>
                </div>
              ) : null}

              <label className="odt-field-label">Reason</label>
              <select
                className="odt-select"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                disabled={actionLoading}
              >
                <option value="">Select reason</option>
                {(REASONS[activeModal.type] || []).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>

              {activeModal.type === "replacement" ? (
                <>
                  <label className="odt-field-label">Damage Images</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    disabled={actionLoading}
                    className="odt-file-input"
                  />
                  <p className="odt-upload-note">Upload 1–5 images. Maximum 10MB per image.</p>
                  {files.length > 0 ? (
                    <div className="odt-file-list">
                      {files.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="odt-file-row">
                          <span>{file.name}</span>
                          <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : null}

              <label className="odt-field-label">Additional Details</label>
              <textarea
                className="odt-textarea"
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={
                  activeModal.type === "replacement"
                    ? "Describe the damage or issue..."
                    : "Tell us more..."
                }
                disabled={actionLoading}
              />

              {activeModal.type !== "cancel" ? (
                <p className="odt-modal-note">
                  Return and replacement requests must be submitted within 7 days of delivery.
                </p>
              ) : null}

              {errorMessage ? <div className="odt-modal-error">{errorMessage}</div> : null}

              <div className="odt-modal-actions">
                <button type="button" className="odt-modal-secondary" onClick={clearModal} disabled={actionLoading}>
                  Back
                </button>
                <button
                  type="button"
                  className={`odt-modal-submit ${activeModal.type === "cancel" ? "odt-modal-submit-danger" : ""}`}
                  onClick={submitRequest}
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Submitting..."
                    : activeModal.type === "cancel"
                      ? "Submit Cancellation"
                      : activeModal.type === "return"
                        ? "Submit Return"
                        : "Submit Replacement"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx>{`
        .odt-wrap {
          margin: 0 auto;
          padding: 88px 72px;
          background: #FEFFF5;
          box-sizing: border-box;
          min-height: 100vh;
        }

        .odt-title {
          font-family: "Tobias TRIAL", serif;
          font-size: 34px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 32px;
        }

        .odt-alert {
          margin-bottom: 20px;
          padding: 13px 16px;
          border-radius: 8px;
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
        }

        .odt-success { border: 1px solid #c9e4ce; background: #f2faf4; color: #2e7d32; }
        .odt-error { border: 1px solid #e7b2b2; background: #fff5f5; color: #a52d2d; }

        .odt-card {
          border: 1px solid #e5e5da;
          border-radius: 14px;
          padding: 24px;
          background: #ffffff;
          box-shadow: 0 2px 10px rgba(0,0,0,.03);
          box-sizing: border-box;
          margin-bottom: 24px;
        }

        .odt-info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
        .odt-section-heading { font-family: "Tobias TRIAL", serif; font-size: 16px; font-weight: 600; color: #1a1a1a; margin: 0 0 16px; }
        .odt-section-heading-lg { font-size: 20px; margin-bottom: 20px; }
        .odt-row { font-family: "Mona Sans", sans-serif; font-size: 14px; color: #3a3a34; margin: 0 0 8px; line-height: 1.5; }
        .odt-row b { color: #1a1a1a; font-weight: 700; }

        .odt-order-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; border-top: 1px solid #eeeeE2; padding-top: 18px; margin-top: 20px; }
        .odt-cancel-btn { border: 1px solid #efc8c8; background: #fff5f5; color: #b23b3b; border-radius: 8px; padding: 10px 16px; font-family: "Mona Sans", sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; }
        .odt-cancel-btn:hover { background: #fbeaea; }

        .odt-request-status { display: flex; align-items: center; gap: 10px; font-family: "Mona Sans", sans-serif; font-size: 12px; }
        .odt-request-type { margin: 0; font-weight: 700; color: #1a1a1a; }
        .odt-request-pill { display: inline-flex; align-items: center; padding: 6px 10px; border-radius: 999px; background: #f0effb; color: #5f5c94; font-family: "Mona Sans", sans-serif; font-size: 10px; font-weight: 800; white-space: nowrap; }
        .odt-request-rejected { background: #fff0f0; color: #b23b3b; }
        .odt-request-cancelled { background: #f4f4ef; color: #77786b; }

        .odt-items { display: flex; flex-direction: column; gap: 20px; }
        .odt-item { display: flex; gap: 20px; border-bottom: 1px solid #eeeee2; padding-bottom: 20px; }
        .odt-item:last-child { border-bottom: none; padding-bottom: 0; }
        .odt-item-img { width: 96px; height: 96px; border-radius: 10px; object-fit: cover; flex-shrink: 0; }
        .odt-item-info { flex: 1; min-width: 0; }
        .odt-item-name { font-family: "Mona Sans", sans-serif; font-size: 15px; font-weight: 700; color: #1a1a1a; margin: 0 0 6px; }
        .odt-item-meta { font-family: "Mona Sans", sans-serif; font-size: 13px; color: #6b6b5f; margin: 0 0 4px; }
        .odt-item-request-row { display: flex; align-items: center; gap: 8px; margin-top: 10px; font-family: "Mona Sans", sans-serif; font-size: 11px; font-weight: 700; color: #444; }
        .odt-item-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
        .odt-return-btn, .odt-replace-btn { font-family: "Mona Sans", sans-serif; font-size: 11px; font-weight: 700; padding: 8px 13px; border-radius: 7px; cursor: pointer; }
        .odt-return-btn { color: #111; background: #fff; border: 1px solid #111; }
        .odt-return-btn:hover { background: #111; color: #fff; }
        .odt-replace-btn { color: #fff; background: #7b7f5c; border: 1px solid #7b7f5c; }
        .odt-replace-btn:hover { background: #686b4c; border-color: #686b4c; }

        .odt-request-list { display: flex; flex-direction: column; gap: 12px; }
        .odt-request-card { border: 1px solid #e5e5da; border-radius: 10px; background: #fafbf3; padding: 14px; }
        .odt-request-card-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
        .odt-request-date { margin: 4px 0 0; font-family: "Mona Sans", sans-serif; color: #8a8a7e; font-size: 10px; }
        .odt-request-detail { margin: 8px 0 0; font-family: "Mona Sans", sans-serif; color: #55554d; font-size: 12px; line-height: 1.5; }

        .odt-track-btn { display: inline-block; margin-top: 20px; background: #7b7f5c; color: #FEFFF5; font-family: "Mona Sans", sans-serif; font-weight: 600; font-size: 14px; padding: 12px 24px; border-radius: 8px; text-decoration: none; }
        .odt-track-btn:hover { background: #686b4c; }
        .odt-track-pending { font-family: "Mona Sans", sans-serif; font-size: 13px; color: #8a8a7e; margin-top: 20px; }

        .odt-modal-overlay { position: fixed; inset: 0; z-index: 3000; background: rgba(17,17,17,.52); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box; }
        .odt-modal { width: 100%; max-width: 540px; max-height: 90vh; overflow-y: auto; background: #fff; border-radius: 16px; box-shadow: 0 24px 80px rgba(0,0,0,.2); }
        .odt-modal-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; padding: 22px 24px; border-bottom: 1px solid #e5e5da; }
        .odt-modal-kicker { margin: 0 0 5px; font-family: "Mona Sans", sans-serif; font-size: 10px; text-transform: uppercase; letter-spacing: .12em; color: #7b7f5c; font-weight: 700; }
        .odt-modal-title { margin: 0; font-family: "Tobias TRIAL", serif; font-size: 22px; font-weight: 600; color: #1a1a1a; line-height: 1.25; }
        .odt-modal-close { width: 34px; height: 34px; border: none; border-radius: 50%; background: #f5f5ef; color: #111; font-size: 24px; line-height: 1; cursor: pointer; }
        .odt-modal-body { padding: 24px; }
        .odt-selected-item { display: flex; align-items: center; gap: 12px; padding: 12px; border: 1px solid #e5e5da; background: #fafbf3; border-radius: 10px; margin-bottom: 20px; }
        .odt-selected-image { width: 54px; height: 54px; object-fit: cover; border-radius: 7px; }
        .odt-selected-label { margin: 0 0 3px; font-family: "Mona Sans", sans-serif; font-size: 10px; color: #8a8a7e; text-transform: uppercase; letter-spacing: .08em; }
        .odt-selected-name { margin: 0; font-family: "Mona Sans", sans-serif; font-size: 13px; font-weight: 700; color: #1a1a1a; }
        .odt-field-label { display: block; margin: 0 0 7px; font-family: "Mona Sans", sans-serif; font-size: 12px; font-weight: 700; color: #444; }
        .odt-select, .odt-textarea, .odt-file-input { width: 100%; box-sizing: border-box; font-family: "Mona Sans", sans-serif; }
        .odt-select { border: 1px solid #dcded0; border-radius: 8px; background: #fafbf3; color: #111; padding: 11px 13px; font-size: 13px; outline: none; margin-bottom: 18px; }
        .odt-textarea { resize: vertical; min-height: 105px; border: 1px solid #dcded0; border-radius: 8px; background: #fafbf3; color: #111; padding: 12px 13px; font-size: 13px; line-height: 1.5; outline: none; margin-bottom: 15px; }
        .odt-file-input { border: 1px dashed #c8cab4; border-radius: 8px; padding: 11px; background: #fafbf3; font-size: 12px; margin-bottom: 6px; }
        .odt-upload-note, .odt-modal-note { margin: 0 0 14px; color: #888; font-family: "Mona Sans", sans-serif; font-size: 11px; line-height: 1.5; }
        .odt-file-list { border: 1px solid #e5e5da; border-radius: 8px; overflow: hidden; margin-bottom: 18px; }
        .odt-file-row { display: flex; justify-content: space-between; gap: 10px; padding: 9px 11px; font-family: "Mona Sans", sans-serif; font-size: 11px; border-bottom: 1px solid #efefe7; }
        .odt-file-row:last-child { border-bottom: none; }
        .odt-modal-error { margin-bottom: 14px; padding: 10px 12px; border: 1px solid #e7b2b2; background: #fff5f5; color: #a52d2d; border-radius: 8px; font-family: "Mona Sans", sans-serif; font-size: 12px; }
        .odt-modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
        .odt-modal-secondary, .odt-modal-submit { border-radius: 8px; padding: 11px 16px; font-family: "Mona Sans", sans-serif; font-size: 12px; font-weight: 700; cursor: pointer; }
        .odt-modal-secondary { background: #f5f5ef; border: 1px solid #dedfd4; color: #444; }
        .odt-modal-submit { background: #7b7f5c; border: 1px solid #7b7f5c; color: #fff; }
        .odt-modal-submit-danger { background: #b23b3b; border-color: #b23b3b; }

        @media (max-width: 768px) {
          .odt-wrap { padding: 52px 20px; }
          .odt-title { font-size: 24px; margin-bottom: 20px; }
          .odt-card { padding: 16px; border-radius: 10px; margin-bottom: 18px; }
          .odt-info-grid { grid-template-columns: 1fr; gap: 20px; }
          .odt-section-heading { font-size: 14px; margin-bottom: 12px; }
          .odt-section-heading-lg { font-size: 16px; margin-bottom: 16px; }
          .odt-row { font-size: 12px; }
          .odt-item { gap: 12px; padding-bottom: 16px; }
          .odt-item-img { width: 72px; height: 72px; border-radius: 8px; }
          .odt-item-name { font-size: 13px; }
          .odt-item-meta { font-size: 11px; }
          .odt-request-card-head { gap: 8px; }
          .odt-track-btn { width: 100%; text-align: center; font-size: 13px; padding: 10px 20px; }
          .odt-modal { max-height: 94vh; }
          .odt-modal-header, .odt-modal-body { padding: 18px; }
          .odt-modal-title { font-size: 19px; }
          .odt-modal-actions { flex-direction: column-reverse; }
          .odt-modal-secondary, .odt-modal-submit { width: 100%; }
        }
      `}</style>
    </div>
  );
}
