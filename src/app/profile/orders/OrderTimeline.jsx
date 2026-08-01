"use client";

import {
  PackageCheck,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const steps = [
  {
    key: "pending",
    label: "Pending",
    icon: Package,
  },
  {
    key: "confirmed",
    label: "Confirmed",
    icon: PackageCheck,
  },
  {
    key: "packed",
    label: "Packed",
    icon: Package,
  },
  {
    key: "shipped",
    label: "Shipped",
    icon: Truck,
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: CheckCircle2,
  },
];

export default function OrderTimeline({ status }) {
  if (status === "cancelled") {
    return (
      <div className="otl-cancelled">
        <XCircle size={22} className="otl-cancelled-icon" />
        <span className="otl-cancelled-text">Order Cancelled</span>

        <style jsx>{`
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
          .otl-cancelled-text {
            font-family: "Mona Sans", sans-serif;
            font-weight: 700;
            font-size: 15px;
            color: #c1443f;
          }

          @media (max-width: 768px) {
            .otl-cancelled {
              padding: 16px;
              gap: 10px;
            }
            .otl-cancelled-text {
              font-size: 13px;
            }
          }
        `}</style>
      </div>
    );
  }

  const currentIndex = steps.findIndex((step) => step.key === status);
  const progressPercent =
    currentIndex <= 0
      ? 0
      : (currentIndex / (steps.length - 1)) * 100;

  return (
    <div className="otl-wrap">
      <h2 className="otl-heading">Order Progress</h2>

      <div className="otl-track">
        <div className="otl-line-bg" />
        <div
          className="otl-line-fill"
          style={{ width: `${progressPercent}%` }}
        />

        {steps.map((step, index) => {
          const Icon = step.icon;
          const active = index <= currentIndex;

          return (
            <div key={step.key} className="otl-step">
              <div className={`otl-icon ${active ? "otl-icon-active" : ""}`}>
                <Icon size={22} />
              </div>

              <p className={`otl-label ${active ? "otl-label-active" : ""}`}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .otl-wrap {
          border: 1px solid #e5e5da;
          border-radius: 14px;
          padding: 24px;
          background: #ffffff;
          box-sizing: border-box;
        }

        .otl-heading {
          font-family: "Tobias TRIAL", serif;
          font-size: 20px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0 0 32px 0;
        }

        .otl-track {
          position: relative;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .otl-line-bg,
        .otl-line-fill {
          position: absolute;
          top: 27px;
          left: calc(100% / 10);
          right: calc(100% / 10);
          height: 3px;
          border-radius: 2px;
          z-index: 0;
        }

        .otl-line-bg {
          background: #e5e5da;
        }

        .otl-line-fill {
          background: #7b7f5c;
          left: calc(100% / 10);
          right: auto;
          transition: width 0.3s ease;
        }

        .otl-step {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }

        .otl-icon {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eeeee2;
          color: #9a9a8e;
          transition: background 0.25s ease, color 0.25s ease;
        }

        .otl-icon-active {
          background: #7b7f5c;
          color: #FEFFF5;
        }

        .otl-label {
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #9a9a8e;
          margin: 12px 0 0 0;
          text-align: center;
        }

        .otl-label-active {
          color: #5c5f43;
        }

        @media (max-width: 768px) {
          .otl-wrap {
            padding: 16px;
            border-radius: 10px;
          }

          .otl-heading {
            font-size: 16px;
            margin-bottom: 24px;
          }

          .otl-line-bg,
          .otl-line-fill {
            top: 19px;
          }

          .otl-icon {
            width: 38px;
            height: 38px;
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