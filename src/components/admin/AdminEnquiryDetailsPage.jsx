"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getEnquiry,
  updateEnquiryStatus,
  deleteEnquiry,
} from "@/lib/adminApi";
import AdminShell from "@/components/admin/AdminShell";

const STATUS = ["pending", "in_progress", "completed", "rejected"];

export default function AdminEnquiryDetailsPage({ enquiryId }) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [enquiry, setEnquiry] = useState(null);

  const [status, setStatus] = useState("pending");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    loadEnquiry();
  }, []);

  async function loadEnquiry() {
    try {
      setLoading(true);

      const res = await getEnquiry(enquiryId);

      if (res?.success) {
        setEnquiry(res.enquiry);

        setStatus(res.enquiry.status || "pending");
        setAdminNotes(res.enquiry.adminNotes || "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function saveChanges() {
    try {
      setSaving(true);

      const res = await updateEnquiryStatus(enquiryId, status, adminNotes);

      if (res.success) {
        alert("Updated successfully.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed.");
    } finally {
      setSaving(false);
    }
  }

  async function removeEnquiry() {
    if (!confirm("Delete this enquiry?")) return;

    try {
      const res = await deleteEnquiry(enquiryId);

      if (res.success) {
        router.push("/admin/enquiries");
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return (
      <AdminShell pageTitle="Enquiry Details">
        <div className="aed-loading-wrap">
          Loading...
          <style jsx>{`
            .aed-loading-wrap {
              min-height: 300px;
              display: flex;
              justify-content: center;
              align-items: center;
              font-family: "Mona Sans", sans-serif;
              color: #7b7f5c;
            }
          `}</style>
        </div>
      </AdminShell>
    );
  }

  if (!enquiry) {
    return (
      <AdminShell pageTitle="Enquiry Details">
        <div className="aed-notfound">
          Enquiry not found.
          <style jsx>{`
            .aed-notfound {
              font-family: "Mona Sans", sans-serif;
              color: #6b6b5f;
              padding: 40px;
              text-align: center;
            }
          `}</style>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell pageTitle="Enquiry Details">
      <div className="aed-wrap">
        <button className="aed-back-btn" onClick={() => router.back()}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M11 18l-6-6 6-6" />
          </svg>
          Back
        </button>

        <div className="aed-page-header">
          <h1 className="aed-page-title">Enquiry Details</h1>
        </div>

        <div className="aed-form-section">
          <div className="aed-grid">
            <div>
              <label className="aed-label">Name</label>
              <input className="aed-input" value={enquiry.fullName || ""} readOnly />
            </div>

            <div>
              <label className="aed-label">Email</label>
              <input className="aed-input" value={enquiry.email || ""} readOnly />
            </div>

            <div>
              <label className="aed-label">Company</label>
              <input className="aed-input" value={enquiry.companyName || ""} readOnly />
            </div>

            <div>
              <label className="aed-label">Mobile</label>
              <input className="aed-input" value={enquiry.mobile || ""} readOnly />
            </div>

            <div>
              <label className="aed-label">Country</label>
              <input className="aed-input" value={enquiry.country || ""} readOnly />
            </div>

            <div>
              <label className="aed-label">Type</label>
              <input className="aed-input" value={enquiry.type || ""} readOnly />
            </div>

            <div>
              <label className="aed-label">Category</label>
              <input className="aed-input" value={enquiry.productCategory || ""} readOnly />
            </div>

            <div>
              <label className="aed-label">Sub Category</label>
              <input
                className="aed-input"
                value={enquiry.productSubCategory || ""}
                readOnly
              />
            </div>

            <div className="aed-span-full">
              <label className="aed-label">Business Types</label>
              <input
                className="aed-input"
                value={(enquiry.businessTypes || []).join(", ")}
                readOnly
              />
            </div>

            <div className="aed-span-full">
              <label className="aed-label">Message</label>
              <textarea
                className="aed-input aed-textarea"
                rows={6}
                value={enquiry.message || ""}
                readOnly
              />
            </div>

            {enquiry.productSnapshot && (
              <div className="aed-span-full aed-product-box">
                <h3 className="aed-product-title">Product Information</h3>

                <p className="aed-product-line">
                  <b>Name :</b> {enquiry.productSnapshot.name}
                </p>

                <p className="aed-product-line">
                  <b>SKU :</b> {enquiry.productSnapshot.sku}
                </p>
              </div>
            )}

            {/* <div>
              <label className="aed-label">Status</label>
              <select
                className="aed-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div> */}

            {/* <div className="aed-span-full">
              <label className="aed-label">Admin Notes</label>
              <textarea
                className="aed-input aed-textarea"
                rows={5}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div> */}
          </div>

          <div className="aed-actions">
            {/* <button
              className="aed-btn aed-btn-primary"
              disabled={saving}
              onClick={saveChanges}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button> */}

            <button className="aed-btn aed-btn-danger" onClick={removeEnquiry}>
              Delete
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .aed-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #4a4a3f;
          background: #ffffff;
          border: 1px solid #e5e5da;
          border-radius: 8px;
          padding: 8px 16px;
          cursor: pointer;
          margin-bottom: 16px;
          transition: background 0.2s ease, border-color 0.2s ease;
        }

        .aed-back-btn:hover {
          background: #f4f5ec;
          border-color: #7b7f5c;
          color: #1a1a1a;
        }

        .aed-page-header {
          margin-bottom: 20px;
        }

        .aed-page-title {
          font-family: "Tobias TRIAL", serif;
          font-size: 26px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .aed-form-section {
          background: #ffffff;
          border: 1px solid #e5e5da;
          border-radius: 14px;
          padding: 28px;
          box-sizing: border-box;
        }

        .aed-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .aed-span-full {
          grid-column: 1 / -1;
        }

        .aed-label {
          display: block;
          font-family: "Mona Sans", sans-serif;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: #7b7f5c;
          margin-bottom: 6px;
        }

        .aed-input {
          width: 100%;
          box-sizing: border-box;
          font-family: "Mona Sans", sans-serif;
          font-size: 14px;
          color: #1a1a1a;
          padding: 12px 14px;
          border: 1px solid #e5e5da;
          border-radius: 8px;
          outline: none;
          background: #fbfbf4;
          transition: border-color 0.2s ease;
        }

        select.aed-input {
          cursor: pointer;
        }

        .aed-input:read-only {
          color: #55554d;
        }

        .aed-input:focus {
          border-color: #7b7f5c;
        }

        .aed-textarea {
          resize: vertical;
          line-height: 1.5;
        }

        .aed-product-box {
          background: #f4f5ec;
          border: 1px solid #e5e5da;
          border-radius: 10px;
          padding: 18px;
        }

        .aed-product-title {
          font-family: "Mona Sans", sans-serif;
          font-size: 15px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 12px 0;
        }

        .aed-product-line {
          font-family: "Mona Sans", sans-serif;
          font-size: 14px;
          color: #3a3a33;
          margin: 0 0 6px 0;
        }

        .aed-product-line:last-child {
          margin-bottom: 0;
        }

        .aed-actions {
          margin-top: 28px;
          display: flex;
          gap: 12px;
        }

        .aed-btn {
          font-family: "Mona Sans", sans-serif;
          font-size: 14px;
          font-weight: 600;
          padding: 12px 26px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: background 0.2s ease, opacity 0.2s ease;
        }

        .aed-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .aed-btn-primary {
          background: #7b7f5c;
          color: #feff;
        }

        .aed-btn-primary:hover:not(:disabled) {
          background: #686b4c;
        }

        .aed-btn-danger {
          background: #ffffff;
          color: #c1443f;
          border: 1px solid #f0c9c7;
        }

        .aed-btn-danger:hover {
          background: #fbe9e8;
        }

        /* ---------- RESPONSIVE ---------- */
        @media (max-width: 768px) {
          .aed-back-btn {
            font-size: 12px;
            padding: 7px 14px;
          }

          .aed-page-title {
            font-size: 21px;
          }

          .aed-form-section {
            padding: 18px;
            border-radius: 12px;
          }

          .aed-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .aed-label {
            font-size: 11px;
          }

          .aed-input {
            font-size: 13px;
            padding: 11px 13px;
          }

          .aed-product-box {
            padding: 14px;
          }

          .aed-product-title {
            font-size: 14px;
          }

          .aed-product-line {
            font-size: 13px;
          }

          .aed-actions {
            flex-direction: column;
            gap: 10px;
            margin-top: 22px;
          }

          .aed-btn {
            width: 100%;
            padding: 13px 20px;
            font-size: 13px;
          }
        }
      `}</style>
    </AdminShell>
  );
}