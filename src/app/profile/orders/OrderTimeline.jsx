"use client";

import {
  PackageCheck,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Settings,
  Box,
} from "lucide-react";

const steps = [
  { key: "pending", label: "Pending", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: PackageCheck },
  { key: "processing", label: "Processing", icon: Settings },
  { key: "packed", label: "Packed", icon: Box },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

/*
 * Return / replacement requests do not represent a change
 * in the original physical shipment timeline.
 *
 * The order can still remain "Delivered" while a request
 * is pending / approved / rejected.
 *
 * Replacement shipment itself can move to "Shipped".
 */
const STATUS_ALIASES = {
  replacement_requested: "delivered",
  replacement_approved: "delivered",
  replacement_shipped: "shipped",
  replacement_delivered: "delivered",

  return_requested: "delivered",
  return_approved: "delivered",
  returned: "delivered",
  refunded: "delivered",
};

const REQUEST_LABELS = {
  pending: "Request Pending",
  approved: "Request Approved",
  rejected: "Request Rejected",
  cancelled: "Request Cancelled",
  completed: "Request Completed",
};

const REQUEST_TYPES = {
  cancel: "Cancellation",
  cancellation: "Cancellation",
  return: "Return",
  replacement: "Replacement",
};

/*
 * Convert request type to a clean label.
 */
function getRequestTypeLabel(type) {
  const normalized = String(type || "").toLowerCase().trim();

  return REQUEST_TYPES[normalized] || "";
}

/*
 * Convert unknown request status into a readable label.
 */
function getRequestStatusLabel(status) {
  const normalized = String(status || "").toLowerCase().trim();

  if (!normalized) return "";

  return (
    REQUEST_LABELS[normalized] ||
    normalized
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

export default function OrderTimeline({ status, requestStatus }) {
  /*
   * -----------------------------------------
   * ORDER STATUS
   * -----------------------------------------
   */
  const rawStatus = String(status || "pending")
    .toLowerCase()
    .trim();

  const normalizedStatus =
    STATUS_ALIASES[rawStatus] || rawStatus || "pending";

  /*
   * -----------------------------------------
   * REQUEST STATUS
   * -----------------------------------------
   *
   * Supports:
   *
   * requestStatus="pending"
   *
   * OR
   *
   * requestStatus={{
   *   status: "pending",
   *   type: "replacement"
   * }}
   */
  let normalizedRequestStatus = "";
  let requestType = "";

  if (typeof requestStatus === "string") {
    normalizedRequestStatus = requestStatus.toLowerCase().trim();
  } else if (
    requestStatus &&
    typeof requestStatus === "object"
  ) {
    normalizedRequestStatus = String(
      requestStatus.status || ""
    )
      .toLowerCase()
      .trim();

    requestType = String(
      requestStatus.type ||
        requestStatus.requestType ||
        requestStatus.request_type ||
        ""
    )
      .toLowerCase()
      .trim();
  }

  /*
   * -----------------------------------------
   * INFER REQUEST TYPE FROM ORDER STATUS
   * -----------------------------------------
   *
   * This makes the component work even when
   * parent only sends:
   *
   * status="replacement_requested"
   */
  if (!requestType) {
    if (rawStatus.startsWith("replacement_")) {
      requestType = "replacement";
    } else if (rawStatus.startsWith("return_")) {
      requestType = "return";
    } else if (rawStatus === "cancelled") {
      requestType = "cancel";
    }
  }

  /*
   * -----------------------------------------
   * REQUEST LABELS
   * -----------------------------------------
   */
  const requestTypeLabel = getRequestTypeLabel(requestType);

  const requestLabel = getRequestStatusLabel(
    normalizedRequestStatus
  );

  /*
   * -----------------------------------------
   * REQUEST / CANCEL FLOW
   * -----------------------------------------
   *
   * Any cancel / return / replacement flow
   * will make the progress line RED.
   */
  const isRequestFlow =
    requestType === "return" ||
    requestType === "replacement" ||
    requestType === "cancel" ||
    rawStatus === "cancelled" ||
    rawStatus.startsWith("return_") ||
    rawStatus.startsWith("replacement_");

  /*
   * -----------------------------------------
   * CURRENT TIMELINE STEP
   * -----------------------------------------
   */
  let currentIndex = steps.findIndex(
    (step) => step.key === normalizedStatus
  );

  if (currentIndex === -1) {
    currentIndex = 0;
  }

  /*
   * Progress from first step to current step.
   */
  const progressPercent =
    steps.length <= 1
      ? 0
      : (currentIndex / (steps.length - 1)) * 100;

  /*
   * -----------------------------------------
   * CANCELLED ORDER
   * -----------------------------------------
   */
  if (normalizedStatus === "cancelled") {
    return (
      <div className="otl-wrap">
        <div className="otl-cancelled">
          <XCircle
            size={22}
            className="otl-cancelled-icon"
          />

          <div className="otl-cancelled-content">
            <span className="otl-cancelled-text">
              Order Cancelled
            </span>

            {requestTypeLabel &&
            requestType !== "cancel" ? (
              <span className="otl-cancelled-type">
                {requestTypeLabel}
              </span>
            ) : null}
          </div>
        </div>

        {requestLabel ? (
          <div
            className={`otl-request-badge ${getRequestBadgeClass(
              normalizedRequestStatus
            )}`}
          >
            {requestTypeLabel &&
            requestType !== "cancel"
              ? `${requestTypeLabel}: ${requestLabel}`
              : requestLabel}
          </div>
        ) : null}

        <style jsx>{`
          .otl-wrap {
            width: 100%;
            box-sizing: border-box;
          }

          .otl-cancelled {
            border: 1px solid #f3c6c4;
            border-radius: 14px;
            padding: 24px;
            background: #fdf1f0;
            display: flex;
            align-items: center;
            gap: 12px;
            box-sizing: border-box;
          }

          .otl-cancelled-icon {
            color: #c1443f;
            flex-shrink: 0;
          }

          .otl-cancelled-content {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .otl-cancelled-text {
            font-family: "Mona Sans", sans-serif;
            font-weight: 700;
            font-size: 15px;
            color: #c1443f;
          }

          .otl-cancelled-type {
            font-family: "Mona Sans", sans-serif;
            font-size: 11px;
            font-weight: 600;
            color: #a85a56;
          }

          .otl-request-badge {
            display: inline-flex;
            align-items: center;
            margin-top: 12px;
            padding: 7px 11px;
            border-radius: 999px;
            background: #f0effb;
            color: #5f5c94;
            font-family: "Mona Sans", sans-serif;
            font-size: 11px;
            font-weight: 800;
            white-space: nowrap;
          }

          .otl-request-rejected {
            background: #fff0f0;
            color: #b23b3b;
          }

          .otl-request-cancelled {
            background: #f4f4ef;
            color: #77786b;
          }

          .otl-request-completed {
            background: #eef6ed;
            color: #557451;
          }

          @media (max-width: 768px) {
            .otl-cancelled {
              padding: 16px;
              gap: 10px;
              border-radius: 10px;
            }

            .otl-cancelled-text {
              font-size: 13px;
            }

            .otl-cancelled-type {
              font-size: 10px;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="otl-wrap">
      {/* -----------------------------------------
          HEADER
      ----------------------------------------- */}
      <div className="otl-header">
        <h2 className="otl-heading">
          Order Progress
        </h2>

        {requestLabel ? (
          <span
            className={`otl-request-badge ${getRequestBadgeClass(
              normalizedRequestStatus
            )}`}
          >
            {requestTypeLabel
              ? `${requestTypeLabel}: ${requestLabel}`
              : requestLabel}
          </span>
        ) : null}
      </div>

      {/* -----------------------------------------
          TIMELINE
      ----------------------------------------- */}
      <div className="otl-track">
        {/* Background line */}
        <div
          className={`otl-line-bg ${
            isRequestFlow
              ? "otl-line-request"
              : ""
          }`}
        />

        {/* Progress line */}
        <div
          className={`otl-line-fill ${
            isRequestFlow
              ? "otl-line-fill-request"
              : ""
          }`}
          style={{
            transform: `scaleX(${progressPercent / 100})`,
          }}
        />

        {steps.map((step, index) => {
          const Icon = step.icon;

          const active = index <= currentIndex;
          const current = index === currentIndex;

          return (
            <div
              key={step.key}
              className="otl-step"
            >
              <div
                className={`otl-icon ${
                  active ? "otl-icon-active" : ""
                } ${
                  current
                    ? "otl-icon-current"
                    : ""
                } ${
                  isRequestFlow &&
                  active
                    ? "otl-icon-request"
                    : ""
                }`}
              >
                <Icon size={22} />
              </div>

              <p
                className={`otl-label ${
                  active
                    ? "otl-label-active"
                    : ""
                } ${
                  isRequestFlow &&
                  active
                    ? "otl-label-request"
                    : ""
                }`}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* -----------------------------------------
          STYLES
      ----------------------------------------- */}
      <style jsx>{`
        .otl-wrap {
          border: 1px solid #e5e5da;
          border-radius: 14px;
          padding: 24px;
          background: #ffffff;
          box-sizing: border-box;
          width: 100%;
        }

        .otl-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .otl-heading {
          font-family: "Tobias TRIAL", serif;
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        /* -----------------------------------------
           REQUEST BADGE
        ----------------------------------------- */

        .otl-request-badge {
          display: inline-flex;
          align-items: center;
          padding: 7px 11px;
          border-radius: 999px;
          background: #f0effb;
          color: #5f5c94;
          font-family: "Mona Sans", sans-serif;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .otl-request-rejected {
          background: #fff0f0;
          color: #b23b3b;
        }

        .otl-request-cancelled {
          background: #f4f4ef;
          color: #77786b;
        }

        .otl-request-completed {
          background: #eef6ed;
          color: #557451;
        }

        /* -----------------------------------------
           TRACK
        ----------------------------------------- */

        .otl-track {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          width: 100%;
        }

        /*
         * Both lines start and end at the center
         * of the first/last circles.
         */
        .otl-line-bg,
        .otl-line-fill {
          position: absolute;
          top: 27px;
          left: calc(100% / 14);
          right: calc(100% / 14);
          height: 3px;
          border-radius: 2px;
          z-index: 0;
          transform-origin: left center;
        }

        /*
         * Normal background line.
         */
        .otl-line-bg {
          background: #e5e5da;
        }

        /*
         * Request flow background line becomes
         * light red so the whole request path is
         * visually marked.
         */
        .otl-line-bg.otl-line-request {
          background: #f3cccc;
        }

        /*
         * Normal completed progress line.
         */
        .otl-line-fill {
          background: #7b7f5c;
          transform-origin: left center;
          transition:
            transform 0.35s ease,
            background 0.25s ease;
        }

        /*
         * Return / replacement / cancellation
         * progress line.
         */
        .otl-line-fill-request {
          background: #c1443f;
        }

        /* -----------------------------------------
           STEP
        ----------------------------------------- */

        .otl-step {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          min-width: 0;
        }

        /* -----------------------------------------
           ICON
        ----------------------------------------- */

        .otl-icon {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eeeee2;
          color: #9a9a8e;
          transition:
            background 0.25s ease,
            color 0.25s ease,
            transform 0.25s ease;
        }

        .otl-icon-active {
          background: #7b7f5c;
          color: #fefff5;
        }

        /*
         * Return / replacement active icons become
         * red too so the request state is obvious.
         */
        .otl-icon-request {
          background: #c1443f;
          color: #ffffff;
        }

        .otl-icon-current {
          transform: scale(1.04);
        }

        /* -----------------------------------------
           LABEL
        ----------------------------------------- */

        .otl-label {
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #9a9a8e;
          margin: 12px 0 0 0;
          text-align: center;
          line-height: 1.3;
        }

        .otl-label-active {
          color: #5c5f43;
        }

        /*
         * Return / replacement labels become red.
         */
        .otl-label-request {
          color: #b23b3b;
        }

        /* -----------------------------------------
           TABLET
        ----------------------------------------- */

        @media (max-width: 900px) {
          .otl-header {
            margin-bottom: 24px;
          }

          .otl-label {
            font-size: 11px;
          }

          .otl-icon {
            width: 46px;
            height: 46px;
          }

          .otl-line-bg,
          .otl-line-fill {
            top: 23px;
          }
        }

        /* -----------------------------------------
           MOBILE
        ----------------------------------------- */

        @media (max-width: 768px) {
          .otl-wrap {
            padding: 16px;
            border-radius: 10px;
            overflow-x: auto;
          }

          .otl-heading {
            font-size: 16px;
          }

          .otl-request-badge {
            font-size: 10px;
            padding: 6px 9px;
          }

          .otl-track {
            min-width: 620px;
          }

          .otl-line-bg,
          .otl-line-fill {
            top: 19px;
          }

          .otl-icon {
            width: 38px;
            height: 38px;
          }

          .otl-icon svg {
            width: 17px;
            height: 17px;
          }

          .otl-label {
            font-size: 10px;
            margin-top: 8px;
          }
        }
      `}</style>
    </div>
  );
}

/*
 * -----------------------------------------
 * REQUEST BADGE CLASS
 * -----------------------------------------
 */
function getRequestBadgeClass(status) {
  const normalized = String(status || "")
    .toLowerCase()
    .trim();

  if (normalized === "rejected") {
    return "otl-request-rejected";
  }

  if (normalized === "cancelled") {
    return "otl-request-cancelled";
  }

  if (normalized === "completed") {
    return "otl-request-completed";
  }

  return "";
}