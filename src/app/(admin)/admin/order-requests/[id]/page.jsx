"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  getAdminOrderRequest,
  approveOrderRequest,
  rejectOrderRequest,
} from "@/lib/adminApi";

import AdminShell from "@/components/admin/AdminShell";

import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Repeat2,
  Package,
  User,
  MapPin,
  CalendarDays,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

export default function AdminOrderRequestDetailsPage() {
  const { id } = useParams();

  const [request, setRequest] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [modal, setModal] =
    useState(null);

  const [adminNote, setAdminNote] =
    useState("");

  const [pageError, setPageError] =
    useState("");

  const [pageSuccess, setPageSuccess] =
    useState("");

  /* =====================================================
     LOAD REQUEST
  ===================================================== */

  useEffect(() => {
    if (id) {
      loadRequest();
    }
  }, [id]);

  async function loadRequest() {
    try {
      setLoading(true);
      setPageError("");

      const res =
        await getAdminOrderRequest(id);

      if (!res?.success) {
        setPageError(
          res?.message ||
            "Unable to load request."
        );

        return;
      }

      setRequest(
        res.request ||
          res.orderRequest ||
          res.data?.request ||
          res.data?.orderRequest ||
          null
      );
    } catch (error) {
      console.error(
        "Request load error:",
        error
      );

      setPageError(
        error?.message ||
          "Unable to load request."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     HELPERS
  ===================================================== */

  function getType() {
    return String(
      request?.type ||
        request?.requestType ||
        ""
    ).toLowerCase();
  }

  function getStatus() {
    return String(
      request?.status ||
        "pending"
    ).toLowerCase();
  }

  function getTypeLabel() {
    const type = getType();

    if (type === "cancel") {
      return "Cancellation";
    }

    if (type === "return") {
      return "Return";
    }

    if (type === "replacement") {
      return "Replacement";
    }

    return type || "Request";
  }

  function getTypeIcon(
    size = 21
  ) {
    const type = getType();

    if (type === "cancel") {
      return (
        <XCircle size={size} />
      );
    }

    if (type === "return") {
      return (
        <RotateCcw size={size} />
      );
    }

    if (type === "replacement") {
      return (
        <Repeat2 size={size} />
      );
    }

    return (
      <Package size={size} />
    );
  }

  function getStatusLabel() {
    const status =
      getStatus();

    if (
      status === "approved"
    ) {
      return "Approved";
    }

    if (
      status === "rejected"
    ) {
      return "Rejected";
    }

    if (
      status === "cancelled"
    ) {
      return "Cancelled";
    }

    return "Pending";
  }

  function getOrderId() {
    return (
      request?.order?._id ||
      request?.orderId ||
      request?.order ||
      null
    );
  }

  function getCustomer() {
    return (
      request?.user ||
      request?.customer ||
      request?.order?.user ||
      null
    );
  }

  function getProduct() {
    return (
      request?.productSnapshot ||
      request?.product ||
      request?.item ||
      null
    );
  }

  function getProductName() {
    const product =
      getProduct();

    return (
      product?.name ||
      request?.productName ||
      "-"
    );
  }

  function getProductImage() {
    const product =
      getProduct();

    return (
      product?.image ||
      product?.mainImage ||
      product?.images?.[0] ||
      request?.productImage ||
      "/placeholder-product.png"
    );
  }

  function getProductPrice() {
    const product =
      getProduct();

    const value =
      product?.price ??
      product?.sellingPrice ??
      request?.price ??
      null;

    if (
      value === null ||
      value === undefined
    ) {
      return "-";
    }

    return `₹${Number(
      value
    ).toLocaleString(
      "en-IN"
    )}`;
  }

  function getImages() {
    const images =
      request?.images ||
      request?.damageImages ||
      request?.proofImages ||
      [];

    if (
      !Array.isArray(images)
    ) {
      return [];
    }

    return images.filter(Boolean);
  }

  function formatDate(
    value,
    withTime = true
  ) {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    return date.toLocaleString(
      "en-IN",
      withTime
        ? {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        : {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
    );
  }

  /* =====================================================
     OPEN APPROVE MODAL
  ===================================================== */

  function openApproveModal() {
    setPageError("");
    setPageSuccess("");

    setAdminNote("");

    setModal("approve");
  }

  /* =====================================================
     OPEN REJECT MODAL
  ===================================================== */

  function openRejectModal() {
    setPageError("");
    setPageSuccess("");

    setAdminNote("");

    setModal("reject");
  }

  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  function closeModal() {
    if (actionLoading) {
      return;
    }

    setModal(null);
    setAdminNote("");
  }

  /* =====================================================
     APPROVE REQUEST
  ===================================================== */

  async function handleApprove() {
    try {
      setActionLoading(true);
      setPageError("");
      setPageSuccess("");

      const res =
        await approveOrderRequest(
          id,
          adminNote
        );

      if (!res?.success) {
        setPageError(
          res?.message ||
            "Unable to approve request."
        );

        return;
      }

      setModal(null);
      setAdminNote("");

      setPageSuccess(
        `${getTypeLabel()} request approved successfully.`
      );

      await loadRequest();
    } catch (error) {
      console.error(
        "Approve request error:",
        error
      );

      setPageError(
        error?.message ||
          "Unable to approve request."
      );
    } finally {
      setActionLoading(
        false
      );
    }
  }

  /* =====================================================
     REJECT REQUEST
  ===================================================== */

  async function handleReject() {
    if (!adminNote.trim()) {
      setPageError(
        "Please enter a rejection reason."
      );

      return;
    }

    try {
      setActionLoading(true);
      setPageError("");
      setPageSuccess("");

      const res =
        await rejectOrderRequest(
          id,
          adminNote
        );

      if (!res?.success) {
        setPageError(
          res?.message ||
            "Unable to reject request."
        );

        return;
      }

      setModal(null);
      setAdminNote("");

      setPageSuccess(
        `${getTypeLabel()} request rejected successfully.`
      );

      await loadRequest();
    } catch (error) {
      console.error(
        "Reject request error:",
        error
      );

      setPageError(
        error?.message ||
          "Unable to reject request."
      );
    } finally {
      setActionLoading(
        false
      );
    }
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <AdminShell pageTitle="Request Details">
        <div className="request-loading">
          <span className="request-spinner" />

          <span>
            Loading request...
          </span>
        </div>

        <style jsx>{`
          .request-loading {
            min-height: 350px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            color: #000000;
            font-size: 16px;
            font-weight: 600;
          }

          .request-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #d5d5d5;
            border-top-color: #000000;
            border-radius: 50%;
            animation: spin 0.8s
              linear infinite;
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
     ERROR / NOT FOUND
  ===================================================== */

  if (!request) {
    return (
      <AdminShell pageTitle="Request Details">

        <div className="request-page">

          <button
            type="button"
            className="back-button"
            onClick={() =>
              (window.location.href =
                "/admin/order-requests")
            }
          >
            <ArrowLeft
              size={17}
            />

            Back to Requests
          </button>

          <div className="not-found">
            <AlertCircle
              size={25}
            />

            <div>
              <strong>
                Request not found
              </strong>

              <p>
                {pageError ||
                  "The requested order request could not be found."}
              </p>
            </div>
          </div>

        </div>

        <style jsx>{`
          .request-page {
            padding: 28px 30px 45px;
          }

          .back-button {
            min-height: 42px;
            padding: 0 14px;
            border: 1px solid #cccccc;
            border-radius: 8px;
            background: #ffffff;
            color: #000000;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
          }

          .not-found {
            margin-top: 20px;
            padding: 24px;
            border: 1px solid #dddddd;
            border-radius: 11px;
            background: #ffffff;
            display: flex;
            align-items: flex-start;
            gap: 12px;
            color: #000000;
          }

          .not-found p {
            margin: 6px 0 0;
            color: #777777;
            font-size: 13px;
          }
        `}</style>
      </AdminShell>
    );
  }

  const type =
    getType();

  const requestStatus =
    getStatus();

  const customer =
    getCustomer();

  const product =
    getProduct();

  const images =
    getImages();

  const orderId =
    getOrderId();

  const isPending =
    requestStatus ===
    "pending";

  return (
    <AdminShell pageTitle="Request Details">

      <div className="request-page">

        {/* =================================================
            ALERTS
        ================================================= */}

        {pageSuccess && (
          <div className="alert alert-success">
            <CheckCircle2
              size={17}
            />

            <span>
              {pageSuccess}
            </span>
          </div>
        )}

        {pageError && (
          <div className="alert alert-error">
            <AlertCircle
              size={17}
            />

            <span>
              {pageError}
            </span>
          </div>
        )}

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="request-header">

          <div>

            <button
              type="button"
              className="back-button"
              onClick={() =>
                (window.location.href =
                  "/admin/order-requests")
              }
            >
              <ArrowLeft
                size={17}
              />

              Back to Requests
            </button>

            <div className="title-row">

              <div
                className={`type-icon type-${type}`}
              >
                {getTypeIcon(
                  22
                )}
              </div>

              <div>
                <div className="eyebrow">
                  {getTypeLabel()} Request
                </div>

                <h1 className="request-title">
                  Request #
                  {String(
                    request._id ||
                      ""
                  ).slice(-8)}
                </h1>

                <p className="request-subtitle">
                  Complete request
                  information and review
                  details.
                </p>
              </div>

            </div>

          </div>

          <div className="header-status">

            <div className="status-label">
              Request Status
            </div>

            <span
              className={`status-badge status-${requestStatus}`}
            >
              {getStatusLabel()}
            </span>

          </div>

        </div>

        {/* =================================================
            ACTION BAR
        ================================================= */}

        {isPending && (
          <section className="action-section">

            <div className="action-copy">

              <div className="action-title">
                Action Required
              </div>

              <p>
                Review the customer's
                request and decide whether
                to approve or reject it.
              </p>

            </div>

            <div className="action-buttons">

              <button
                type="button"
                className="approve-button"
                onClick={
                  openApproveModal
                }
              >
                <CheckCircle2
                  size={17}
                />

                Approve Request
              </button>

              <button
                type="button"
                className="reject-button"
                onClick={
                  openRejectModal
                }
              >
                <XCircle
                  size={17}
                />

                Reject Request
              </button>

            </div>

          </section>
        )}

        {/* =================================================
            BASIC INFORMATION
        ================================================= */}

        <div className="summary-grid">

          <SummaryCard
            icon={
              <FileText
                size={20}
              />
            }
            label="Request Type"
            value={
              getTypeLabel()
            }
          />

          <SummaryCard
            icon={
              <CalendarDays
                size={20}
              />
            }
            label="Requested On"
            value={formatDate(
              request.createdAt
            )}
          />

          <SummaryCard
            icon={
              <Package
                size={20}
              />
            }
            label="Order"
            value={
              orderId
                ? `#${String(
                    orderId
                  ).slice(-8)}`
                : "-"
            }
          />

          <SummaryCard
            icon={
              getTypeIcon(20)
            }
            label="Reason"
            value={
              request.reason ||
              "-"
            }
          />

        </div>

        {/* =================================================
            CUSTOMER + ORDER
        ================================================= */}

        <div className="two-column">

          {/* CUSTOMER */}

          <section className="section-card">

            <SectionHeading
              icon={
                <User size={19} />
              }
              title="Customer Details"
            />

            <div className="detail-list">

              <DetailItem
                label="Name"
                value={
                  customer?.name ||
                  "-"
                }
              />

              <DetailItem
                label="Email"
                value={
                  customer?.email ||
                  "-"
                }
              />

              <DetailItem
                label="Mobile"
                value={
                  customer?.mobile ||
                  customer?.phone ||
                  "-"
                }
              />

            </div>

          </section>

          {/* ORDER */}

          <section className="section-card">

            <SectionHeading
              icon={
                <Package
                  size={19}
                />
              }
              title="Order Details"
            />

            <div className="detail-list">

              <DetailItem
                label="Order ID"
                value={
                  orderId
                    ? `#${String(
                        orderId
                      ).slice(
                        -12
                      )}`
                    : "-"
                }
                breakWord
              />

              <DetailItem
                label="Order Status"
                value={
                  request.order
                    ?.orderStatus ||
                  request.orderStatus ||
                  "-"
                }
              />

              <DetailItem
                label="Payment Status"
                value={
                  request.order
                    ?.paymentStatus ||
                  request.paymentStatus ||
                  "-"
                }
              />

            </div>

          </section>

        </div>

        {/* =================================================
            PRODUCT
        ================================================= */}

        {type !==
          "cancel" && (
          <section className="section-card">

            <SectionHeading
              icon={
                <Package
                  size={19}
                />
              }
              title="Requested Product"
            />

            <div className="product-card">

              <div className="product-image-wrap">

                <img
                  src={
                    getProductImage()
                  }
                  alt={
                    getProductName()
                  }
                  className="product-image"
                />

              </div>

              <div className="product-content">

                <div className="product-name">
                  {getProductName()}
                </div>

                <div className="product-meta">

                  <span>
                    Qty:{" "}
                    {request.quantity ||
                      request.productSnapshot
                        ?.quantity ||
                      "-"}
                  </span>

                  <span>
                    Price:{" "}
                    {getProductPrice()}
                  </span>

                </div>

                {(product?.selectedColor ||
                  request.selectedColor ||
                  request.productSnapshot
                    ?.selectedColor) && (
                  <div className="product-meta">
                    Color:{" "}
                    {product?.selectedColor ||
                      request.selectedColor ||
                      request.productSnapshot
                        ?.selectedColor}
                  </div>
                )}

                {(product?.selectedSize ||
                  request.selectedSize ||
                  request.productSnapshot
                    ?.selectedSize) && (
                  <div className="product-meta">
                    Size:{" "}
                    {product?.selectedSize ||
                      request.selectedSize ||
                      request.productSnapshot
                        ?.selectedSize}
                  </div>
                )}

              </div>

            </div>

          </section>
        )}

        {/* =================================================
            REASON + DESCRIPTION
        ================================================= */}

        <section className="section-card">

          <SectionHeading
            icon={
              <FileText
                size={19}
              />
            }
            title="Request Details"
          />

          <div className="request-detail-grid">

            <div className="detail-box">

              <div className="box-label">
                Request Type
              </div>

              <div className="box-value">
                {getTypeLabel()}
              </div>

            </div>

            <div className="detail-box">

              <div className="box-label">
                Reason
              </div>

              <div className="box-value">
                {request.reason ||
                  "-"}
              </div>

            </div>

          </div>

          <div className="description-box">

            <div className="box-label">
              Customer Description
            </div>

            <p className="description-text">
              {request.description ||
                "No additional description provided."}
            </p>

          </div>

        </section>

        {/* =================================================
            DAMAGE IMAGES
        ================================================= */}

        {images.length >
          0 && (
          <section className="section-card">

            <SectionHeading
              icon={
                <ImageIcon
                  size={19}
                />
              }
              title={
                type ===
                "replacement"
                  ? "Damage / Issue Images"
                  : "Uploaded Images"
              }
            />

            <div className="images-grid">

              {images.map(
                (
                  image,
                  index
                ) => (
                  <a
                    key={`${image}-${index}`}
                    href={
                      image
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="image-card"
                  >

                    <img
                      src={
                        image
                      }
                      alt={`Request image ${
                        index + 1
                      }`}
                      className="request-image"
                    />

                    <div className="image-overlay">

                      <ExternalLink
                        size={16}
                      />

                      Open Image
                    </div>

                  </a>
                )
              )}

            </div>

          </section>
        )}

        {/* =================================================
            REQUEST TIMELINE / REVIEW
        ================================================= */}

        <section className="section-card">

          <SectionHeading
            icon={
              <CalendarDays
                size={19}
              />
            }
            title="Request Timeline"
          />

          <div className="timeline">

            <TimelineItem
              active
              title="Request Submitted"
              date={formatDate(
                request.createdAt
              )}
            />

            {request.reviewedAt ? (
              <TimelineItem
                active
                title={
                  requestStatus ===
                  "approved"
                    ? "Request Approved"
                    : "Request Rejected"
                }
                date={formatDate(
                  request.reviewedAt
                )}
              />
            ) : (
              <TimelineItem
                title="Awaiting Admin Review"
              />
            )}

          </div>

          {(request.adminNote ||
            request.reviewNote ||
            request.rejectionReason) && (
            <div className="review-note">

              <div className="box-label">
                Admin Note
              </div>

              <p>
                {request.adminNote ||
                  request.reviewNote ||
                  request.rejectionReason}
              </p>

            </div>
          )}

        </section>

        {/* =================================================
            APPROVE / REJECT MODAL
        ================================================= */}

        {modal && (
          <div
            className="modal-overlay"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeModal();
              }
            }}
          >

            <div className="modal">

              <div className="modal-header">

                <div>
                  <div
                    className={`modal-kicker ${
                      modal ===
                      "reject"
                        ? "modal-kicker-danger"
                        : ""
                    }`}
                  >
                    {modal ===
                    "approve"
                      ? "Approve Request"
                      : "Reject Request"}
                  </div>

                  <h2 className="modal-title">
                    {modal ===
                    "approve"
                      ? `Approve ${getTypeLabel().toLowerCase()} request?`
                      : `Reject ${getTypeLabel().toLowerCase()} request?`}
                  </h2>
                </div>

                <button
                  type="button"
                  className="modal-close"
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

              <div className="modal-body">

                <p className="modal-description">

                  {modal ===
                  "approve"
                    ? "This request will be marked as approved. Add an optional note for the customer."
                    : "Please provide a clear reason for rejecting this request."}

                </p>

                <label className="modal-label">
                  {modal ===
                  "approve"
                    ? "Admin Note (Optional)"
                    : "Rejection Reason"}
                </label>

                <textarea
                  value={
                    adminNote
                  }
                  onChange={(e) =>
                    setAdminNote(
                      e.target
                        .value
                    )
                  }
                  rows={5}
                  className="modal-textarea"
                  placeholder={
                    modal ===
                    "approve"
                      ? "Enter any note for the customer..."
                      : "Enter the reason for rejection..."
                  }
                  disabled={
                    actionLoading
                  }
                />

                {pageError && (
                  <div className="modal-error">
                    <AlertCircle
                      size={15}
                    />

                    <span>
                      {pageError}
                    </span>
                  </div>
                )}

                <div className="modal-actions">

                  <button
                    type="button"
                    className="modal-secondary"
                    onClick={
                      closeModal
                    }
                    disabled={
                      actionLoading
                    }
                  >
                    Cancel
                  </button>

                  {modal ===
                  "approve" ? (
                    <button
                      type="button"
                      className="modal-approve"
                      onClick={
                        handleApprove
                      }
                      disabled={
                        actionLoading
                      }
                    >
                      <CheckCircle2
                        size={16}
                      />

                      {actionLoading
                        ? "Approving..."
                        : "Confirm Approval"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="modal-reject"
                      onClick={
                        handleReject
                      }
                      disabled={
                        actionLoading
                      }
                    >
                      <XCircle
                        size={16}
                      />

                      {actionLoading
                        ? "Rejecting..."
                        : "Confirm Rejection"}
                    </button>
                  )}

                </div>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* =================================================
          STYLES
      ================================================= */}

      <style jsx>{`

        .request-page {
          width: 100%;
          padding: 28px 30px 50px;
          box-sizing: border-box;
          color: #000000;
        }

        /* ================================================
           ALERTS
        ================================================= */

        .alert {
          min-height: 45px;
          margin-bottom: 16px;
          padding: 0 14px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 600;
        }

        .alert-success {
          border: 1px solid #bfe3cb;
          background: #f0faf2;
          color: #1a7f37;
        }

        .alert-error {
          border: 1px solid #ecc3c3;
          background: #fff5f5;
          color: #a52d2d;
        }

        /* ================================================
           HEADER
        ================================================= */

        .request-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 25px;
          margin-bottom: 20px;
        }

        .back-button {
          min-height: 40px;
          padding: 0 13px;
          margin-bottom: 16px;
          border: 1px solid #cccccc;
          border-radius: 8px;
          background: #ffffff;
          color: #000000;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .back-button:hover {
          background: #f5f5f5;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .type-icon {
          width: 48px;
          height: 48px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .type-cancel {
          background: #fff0f0;
          color: #b23b3b;
        }

        .type-return {
          background: #f0f3ff;
          color: #4058a7;
        }

        .type-replacement {
          background: #edf8ef;
          color: #2f7a3b;
        }

        .type-icon:not(
          .type-cancel
        ):not(.type-return):not(
            .type-replacement
          ) {
          background: #eeeeee;
          color: #000000;
        }

        .eyebrow {
          margin-bottom: 4px;
          color: #7b7f5c;
          font-size: 10px;
          line-height: 1.3;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.09em;
        }

        .request-title {
          margin: 0;
          color: #000000;
          font-size: 24px;
          line-height: 1.3;
          font-weight: 700;
        }

        .request-subtitle {
          margin: 5px 0 0;
          color: #777777;
          font-size: 13px;
          line-height: 1.5;
        }

        .header-status {
          min-width: 130px;
          text-align: right;
        }

        .status-label {
          margin-bottom: 7px;
          color: #777777;
          font-size: 11px;
          font-weight: 700;
        }

        .status-badge {
          min-height: 32px;
          padding: 0 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          text-transform: capitalize;
        }

        .status-pending {
          background: #fff4d8;
          color: #8a6200;
        }

        .status-approved {
          background: #e7f4ea;
          color: #1a7f37;
        }

        .status-rejected {
          background: #fdeaea;
          color: #a52d2d;
        }

        .status-cancelled {
          background: #eeeeee;
          color: #555555;
        }

        /* ================================================
           ACTION
        ================================================= */

        .action-section {
          margin-bottom: 20px;
          padding: 17px 18px;
          border: 1px solid #dfdfdf;
          border-radius: 11px;
          background: #fafafa;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }

        .action-title {
          font-size: 14px;
          font-weight: 800;
        }

        .action-copy p {
          margin: 5px 0 0;
          color: #777777;
          font-size: 12px;
          line-height: 1.5;
        }

        .action-buttons {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .approve-button,
        .reject-button {
          min-height: 43px;
          padding: 0 15px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .approve-button {
          background: #1a7f37;
          border: 1px solid #1a7f37;
          color: #ffffff;
        }

        .approve-button:hover {
          background: #14652d;
        }

        .reject-button {
          background: #ffffff;
          border: 1px solid #c1443f;
          color: #c1443f;
        }

        .reject-button:hover {
          background: #fff3f3;
        }

        /* ================================================
           SUMMARY
        ================================================= */

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(
            4,
            minmax(0, 1fr)
          );
          gap: 13px;
          margin-bottom: 20px;
        }

        .summary-card {
          min-height: 120px;
          padding: 17px;
          border: 1px solid #dddddd;
          border-radius: 10px;
          background: #ffffff;
          box-sizing: border-box;
        }

        .summary-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .summary-icon {
          width: 37px;
          height: 37px;
          border-radius: 8px;
          background: #eeeeee;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000000;
        }

        .summary-label {
          color: #777777;
          font-size: 11px;
          font-weight: 700;
        }

        .summary-value {
          margin-top: 16px;
          color: #000000;
          font-size: 17px;
          line-height: 1.35;
          font-weight: 800;
          text-transform: capitalize;
        }

        /* ================================================
           TWO COLUMN
        ================================================= */

        .two-column {
          display: grid;
          grid-template-columns: repeat(
            2,
            minmax(0, 1fr)
          );
          gap: 18px;
        }

        .section-card {
          margin-bottom: 18px;
          padding: 21px 22px;
          border: 1px solid #dddddd;
          border-radius: 11px;
          background: #ffffff;
          box-sizing: border-box;
        }

        .section-heading {
          min-height: 38px;
          margin-bottom: 19px;
          display: flex;
          align-items: center;
          gap: 9px;
          color: #000000;
          font-size: 17px;
          font-weight: 800;
        }

        .section-heading-icon {
          width: 35px;
          height: 35px;
          border-radius: 8px;
          background: #eeeeee;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .detail-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .detail-label {
          color: #777777;
          font-size: 11px;
          font-weight: 700;
        }

        .detail-value {
          margin-top: 4px;
          color: #000000;
          font-size: 14px;
          line-height: 1.5;
          font-weight: 650;
        }

        .detail-value-break {
          word-break: break-all;
        }

        /* ================================================
           PRODUCT
        ================================================= */

        .product-card {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 14px;
          border: 1px solid #e5e5e5;
          border-radius: 9px;
          background: #fafafa;
        }

        .product-image-wrap {
          width: 78px;
          height: 78px;
          flex-shrink: 0;
        }

        .product-image {
          width: 78px;
          height: 78px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #dddddd;
          background: #ffffff;
        }

        .product-content {
          min-width: 0;
        }

        .product-name {
          color: #000000;
          font-size: 15px;
          line-height: 1.4;
          font-weight: 800;
        }

        .product-meta {
          margin-top: 6px;
          color: #777777;
          font-size: 12px;
          line-height: 1.45;
        }

        /* ================================================
           REQUEST DETAIL
        ================================================= */

        .request-detail-grid {
          display: grid;
          grid-template-columns: repeat(
            2,
            minmax(0, 1fr)
          );
          gap: 12px;
        }

        .detail-box {
          padding: 13px;
          border: 1px solid #e4e4e4;
          border-radius: 8px;
          background: #fafafa;
        }

        .box-label {
          color: #777777;
          font-size: 11px;
          line-height: 1.4;
          font-weight: 700;
        }

        .box-value {
          margin-top: 6px;
          color: #000000;
          font-size: 14px;
          line-height: 1.45;
          font-weight: 750;
        }

        .description-box {
          margin-top: 12px;
          padding: 14px;
          border: 1px solid #e4e4e4;
          border-radius: 8px;
          background: #ffffff;
        }

        .description-text {
          margin: 8px 0 0;
          color: #444444;
          font-size: 13px;
          line-height: 1.65;
        }

        /* ================================================
           IMAGES
        ================================================= */

        .images-grid {
          display: grid;
          grid-template-columns: repeat(
            4,
            minmax(0, 1fr)
          );
          gap: 12px;
        }

        .image-card {
          position: relative;
          display: block;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          border-radius: 9px;
          border: 1px solid #dddddd;
          background: #f5f5f5;
          text-decoration: none;
        }

        .request-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .image-overlay {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          min-height: 36px;
          padding: 0 10px;
          background: rgba(
            0,
            0,
            0,
            0.68
          );
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          opacity: 0;
          transition: opacity
            0.2s ease;
        }

        .image-card:hover
          .image-overlay {
          opacity: 1;
        }

        /* ================================================
           TIMELINE
        ================================================= */

        .timeline {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .timeline-item {
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .timeline-dot {
          width: 12px;
          height: 12px;
          flex-shrink: 0;
          margin-top: 4px;
          border-radius: 50%;
          background: #d7d7d7;
        }

        .timeline-dot-active {
          background: #1a7f37;
        }

        .timeline-title {
          font-size: 13px;
          font-weight: 750;
        }

        .timeline-date {
          margin-top: 3px;
          color: #777777;
          font-size: 11px;
        }

        .review-note {
          margin-top: 19px;
          padding: 14px;
          border: 1px solid #e2e2e2;
          border-radius: 8px;
          background: #fafafa;
        }

        .review-note p {
          margin: 7px 0 0;
          color: #444444;
          font-size: 13px;
          line-height: 1.55;
        }

        /* ================================================
           MODAL
        ================================================= */

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 4000;
          padding: 20px;
          background: rgba(
            0,
            0,
            0,
            0.5
          );
          display: flex;
          align-items: center;
          justify-content: center;
          box-sizing: border-box;
        }

        .modal {
          width: 100%;
          max-width: 510px;
          border-radius: 13px;
          background: #ffffff;
          box-shadow:
            0 25px 80px
              rgba(
                0,
                0,
                0,
                0.22
              );
          overflow: hidden;
        }

        .modal-header {
          padding: 20px 22px;
          border-bottom: 1px solid #e5e5e5;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
        }

        .modal-kicker {
          margin-bottom: 5px;
          color: #1a7f37;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .modal-kicker-danger {
          color: #b23b3b;
        }

        .modal-title {
          margin: 0;
          color: #000000;
          font-size: 19px;
          line-height: 1.4;
          font-weight: 800;
        }

        .modal-close {
          width: 34px;
          height: 34px;
          border: none;
          border-radius: 50%;
          background: #f2f2f2;
          color: #000000;
          font-size: 22px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .modal-close:hover {
          background: #e8e8e8;
        }

        .modal-body {
          padding: 22px;
        }

        .modal-description {
          margin: 0 0 18px;
          color: #777777;
          font-size: 13px;
          line-height: 1.55;
        }

        .modal-label {
          display: block;
          margin-bottom: 7px;
          color: #000000;
          font-size: 12px;
          font-weight: 750;
        }

        .modal-textarea {
          width: 100%;
          min-height: 125px;
          padding: 12px;
          border: 1px solid #cccccc;
          border-radius: 8px;
          background: #ffffff;
          color: #000000;
          font-family: inherit;
          font-size: 13px;
          line-height: 1.55;
          resize: vertical;
          outline: none;
          box-sizing: border-box;
        }

        .modal-textarea:focus {
          border-color: #000000;
        }

        .modal-error {
          margin-top: 12px;
          padding: 10px 12px;
          border: 1px solid #ecc3c3;
          border-radius: 7px;
          background: #fff5f5;
          color: #a52d2d;
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          line-height: 1.45;
        }

        .modal-actions {
          margin-top: 18px;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          flex-wrap: wrap;
        }

        .modal-secondary,
        .modal-approve,
        .modal-reject {
          min-height: 43px;
          padding: 0 14px;
          border-radius: 8px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .modal-secondary {
          border: 1px solid #cccccc;
          background: #ffffff;
          color: #000000;
        }

        .modal-secondary:hover:not(
          :disabled
        ) {
          background: #f5f5f5;
        }

        .modal-approve {
          border: 1px solid #1a7f37;
          background: #1a7f37;
          color: #ffffff;
        }

        .modal-approve:hover:not(
          :disabled
        ) {
          background: #14652d;
        }

        .modal-reject {
          border: 1px solid #c1443f;
          background: #c1443f;
          color: #ffffff;
        }

        .modal-reject:hover:not(
          :disabled
        ) {
          background: #a83a36;
        }

        .modal-secondary:disabled,
        .modal-approve:disabled,
        .modal-reject:disabled,
        .modal-close:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ================================================
           RESPONSIVE
        ================================================= */

        @media (max-width: 1050px) {
          .summary-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }

          .images-grid {
            grid-template-columns: repeat(
              3,
              minmax(0, 1fr)
            );
          }
        }

        @media (max-width: 800px) {
          .request-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .header-status {
            text-align: left;
          }

          .two-column {
            grid-template-columns: 1fr;
          }

          .action-section {
            align-items: stretch;
            flex-direction: column;
          }

          .action-buttons {
            width: 100%;
          }

          .approve-button,
          .reject-button {
            flex: 1 1 0;
          }
        }

        @media (max-width: 600px) {
          .request-page {
            padding: 20px 14px 35px;
          }

          .request-title {
            font-size: 21px;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .request-detail-grid {
            grid-template-columns: 1fr;
          }

          .images-grid {
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
          }

          .product-card {
            align-items: flex-start;
          }

          .product-image-wrap,
          .product-image {
            width: 65px;
            height: 65px;
          }

          .action-buttons {
            flex-direction: column;
          }

          .approve-button,
          .reject-button {
            width: 100%;
          }

          .modal-overlay {
            padding: 12px;
          }

          .modal-actions {
            flex-direction: column-reverse;
          }

          .modal-secondary,
          .modal-approve,
          .modal-reject {
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
}) {
  return (
    <div className="summary-card">

      <div className="summary-card-top">

        <div className="summary-icon">
          {icon}
        </div>

        <div className="summary-label">
          {label}
        </div>

      </div>

      <div className="summary-value">
        {value}
      </div>

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
    <div className="section-heading">

      <div className="section-heading-icon">
        {icon}
      </div>

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
}) {
  return (
    <div>

      <div className="detail-label">
        {label}
      </div>

      <div
        className={`detail-value ${
          breakWord
            ? "detail-value-break"
            : ""
        }`}
      >
        {value}
      </div>

    </div>
  );
}

/* =========================================================
   TIMELINE ITEM
========================================================= */

function TimelineItem({
  active = false,
  title,
  date,
}) {
  return (
    <div className="timeline-item">

      <div
        className={`timeline-dot ${
          active
            ? "timeline-dot-active"
            : ""
        }`}
      />

      <div>

        <div className="timeline-title">
          {title}
        </div>

        {date && (
          <div className="timeline-date">
            {date}
          </div>
        )}

      </div>

    </div>
  );
}