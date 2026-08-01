"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getAllEnquiries,
  deleteEnquiry,
} from "@/lib/adminApi";
import AdminShell from "@/components/admin/AdminShell";

const PAGE_SIZE = 10;

export default function AdminEnquiriesPage() {
  const [loading, setLoading] = useState(true);
  const [enquiries, setEnquiries] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadEnquiries();
  }, []);

  async function loadEnquiries() {
    try {
      setLoading(true);

      const res = await getAllEnquiries();

      if (res?.success) {
        setEnquiries(res.enquiries || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this enquiry?")) return;

    try {
      const res = await deleteEnquiry(id);

      if (res.success) {
        setEnquiries((prev) => prev.filter((x) => x._id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = enquiries.filter((item) => {
    const q = search.toLowerCase();

    return (
      item.fullName?.toLowerCase().includes(q) ||
      item.email?.toLowerCase().includes(q) ||
      item.companyName?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }

  function getPageNumbers() {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }

    return pages;
  }

  if (loading) {
    return (
      <AdminShell pageTitle="Enquiries">
        <div className="enq-loading-wrap">
          Loading...
          <style jsx>{`
            .enq-loading-wrap {
              min-height: 300px;
              display: flex;
              justify-content: center;
              align-items: center;
              font-family: "Mona Sans", sans-serif;
              color: #7b7f5c;
              background: #feff f5;
            }
          `}</style>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell pageTitle="Enquiries">
      <div className="enq-wrap">
        <div className="enq-page-header">
          <div>
            <h1 className="enq-page-title">Customer Enquiries</h1>
          </div>

          <div className="enq-total">
            Total : <b>{filtered.length}</b>
          </div>
        </div>

        <div className="enq-form-section">
          <input
            placeholder="Search..."
            className="enq-input"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />

          {/* ---------- DESKTOP / TABLET TABLE ---------- */}
          <div className="enq-table-wrap">
            <table className="enq-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: "center" }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((item) => (
                  <tr key={item._id}>
                    <td>{item.fullName}</td>
                    <td>{item.email}</td>
                    <td>{item.companyName}</td>
                    <td>{item.type}</td>
                    <td>
                      <span
                        className={`enq-badge ${
                          item.status === "completed"
                            ? "enq-badge-success"
                            : item.status === "rejected"
                            ? "enq-badge-danger"
                            : ""
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    <td style={{ textAlign: "center" }}>
                      <Link
                        href={`/admin/enquiries/${item._id}`}
                        className="enq-btn enq-btn-primary"
                      >
                        View
                      </Link>

                      <button
                        className="enq-btn enq-btn-danger"
                        style={{ marginLeft: 8 }}
                        onClick={() => handleDelete(item._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="enq-empty-cell">
                      No enquiries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ---------- MOBILE CARD LIST ---------- */}
          <div className="enq-cards">
            {paginated.map((item) => (
              <div className="enq-card" key={item._id}>
                <div className="enq-card-top">
                  <div>
                    <p className="enq-card-name">{item.fullName}</p>
                    <p className="enq-card-date">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`enq-badge ${
                      item.status === "completed"
                        ? "enq-badge-success"
                        : item.status === "rejected"
                        ? "enq-badge-danger"
                        : ""
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="enq-card-grid">
                  <div className="enq-card-row">
                    <span className="enq-card-label">Email</span>
                    <span className="enq-card-value">{item.email}</span>
                  </div>
                  <div className="enq-card-row">
                    <span className="enq-card-label">Company</span>
                    <span className="enq-card-value">{item.companyName}</span>
                  </div>
                  <div className="enq-card-row">
                    <span className="enq-card-label">Type</span>
                    <span className="enq-card-value">{item.type}</span>
                  </div>
                </div>

                <div className="enq-card-actions">
                  <Link
                    href={`/admin/enquiries/${item._id}`}
                    className="enq-btn enq-btn-primary enq-btn-block"
                  >
                    View
                  </Link>

                  <button
                    className="enq-btn enq-btn-danger enq-btn-block"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="enq-empty-cell">No enquiries found.</div>
            )}
          </div>

          {/* ---------- PAGINATION ---------- */}
          {filtered.length > 0 && (
            <div className="enq-pagination">
              <button
                className="enq-page-btn enq-page-nav"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Prev
              </button>

              {getPageNumbers().map((p, idx) =>
                p === "..." ? (
                  <span key={`dots-${idx}`} className="enq-page-dots">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    className={`enq-page-btn ${
                      p === currentPage ? "enq-page-active" : ""
                    }`}
                    onClick={() => goToPage(p)}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                className="enq-page-btn enq-page-nav"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .enq-wrap {
          background: #feff f5;
          background: #feff f5;
        }

        .enq-page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 20px;
        }

        .enq-page-title {
          font-family: "Tobias TRIAL", serif;
          font-size: 26px;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .enq-total {
          font-family: "Mona Sans", sans-serif;
          font-size: 14px;
          color: #4a4a3f;
          background: #ffffff;
          border: 1px solid #e5e5da;
          padding: 8px 16px;
          border-radius: 8px;
        }

        .enq-form-section {
          background: #ffffff;
          border: 1px solid #e5e5da;
          border-radius: 14px;
          padding: 20px;
          box-sizing: border-box;
        }

        .enq-input {
          width: 100%;
          box-sizing: border-box;
          font-family: "Mona Sans", sans-serif;
          font-size: 14px;
          padding: 12px 16px;
          border: 1px solid #e5e5da;
          border-radius: 8px;
          outline: none;
          background: #feff f5;
          color: #1a1a1a;
          transition: border-color 0.2s ease;
        }

        .enq-input:focus {
          border-color: #7b7f5c;
        }

        /* ---------- TABLE ---------- */
        .enq-table-wrap {
          margin-top: 20px;
          overflow-x: auto;
          border: 1px solid #e5e5da;
          border-radius: 10px;
        }

        .enq-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 720px;
          font-family: "Mona Sans", sans-serif;
        }

        .enq-table thead th {
          text-align: left;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          color: #7b7f5c;
          background: #f4f5ec;
          padding: 14px 16px;
          white-space: nowrap;
          border-bottom: 1px solid #e5e5da;
        }

        .enq-table tbody td {
          font-size: 14px;
          color: #1a1a1a;
          padding: 14px 16px;
          border-bottom: 1px solid #f0f0e6;
          vertical-align: middle;
        }

        .enq-table tbody tr:last-child td {
          border-bottom: none;
        }

        .enq-table tbody tr:hover {
          background: #fbfbf4;
        }

        .enq-empty-cell {
          text-align: center;
          padding: 40px;
          font-family: "Mona Sans", sans-serif;
          color: #8a8a7e;
          font-size: 14px;
        }

        /* ---------- BADGES ---------- */
        .enq-badge {
          display: inline-block;
          font-family: "Mona Sans", sans-serif;
          font-size: 12px;
          font-weight: 600;
          text-transform: capitalize;
          padding: 5px 12px;
          border-radius: 20px;
          background: #f1f1e6;
          color: #6b6b5f;
          white-space: nowrap;
        }

        .enq-badge-success {
          background: #e6f4e8;
          color: #3f8f4f;
        }

        .enq-badge-danger {
          background: #fbe9e8;
          color: #c1443f;
        }

        /* ---------- BUTTONS ---------- */
        .enq-btn {
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease, opacity 0.2s ease;
        }

        .enq-btn-primary {
          background: #7b7f5c;
          color: #feff f5;
        }

        .enq-btn-primary:hover {
          background: #686b4c;
        }

        .enq-btn-danger {
          background: #ffffff;
          color: #c1443f;
          border: 1px solid #f0c9c7;
        }

        .enq-btn-danger:hover {
          background: #fbe9e8;
        }

        .enq-btn-block {
          display: none;
        }

        /* ---------- MOBILE CARDS (hidden by default) ---------- */
        .enq-cards {
          display: none;
        }

        /* ---------- PAGINATION ---------- */
        .enq-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 24px;
        }

        .enq-page-btn {
          font-family: "Mona Sans", sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #1a1a1a;
          background: #ffffff;
          border: 1px solid #e5e5da;
          border-radius: 8px;
          padding: 7px 13px;
          min-width: 36px;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .enq-page-btn:hover:not(:disabled) {
          background: #f1f1e6;
        }

        .enq-page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .enq-page-active {
          background: #7b7f5c;
          border-color: #7b7f5c;
          color: #feff f5;
        }

        .enq-page-dots {
          font-family: "Mona Sans", sans-serif;
          color: #8a8a7e;
          padding: 0 4px;
        }

        /* ---------- RESPONSIVE ---------- */
        @media (max-width: 768px) {
          .enq-page-title {
            font-size: 21px;
          }

          .enq-total {
            font-size: 13px;
            padding: 7px 14px;
          }

          .enq-form-section {
            padding: 16px;
            border-radius: 12px;
          }

          .enq-input {
            font-size: 13px;
            padding: 11px 14px;
          }

          /* hide table, show cards */
          .enq-table-wrap {
            display: none;
          }

          .enq-cards {
            display: flex;
            flex-direction: column;
            gap: 14px;
            margin-top: 20px;
          }

          .enq-card {
            border: 1px solid #e5e5da;
            border-radius: 12px;
            padding: 16px;
            background: #ffffff;
            box-sizing: border-box;
          }

          .enq-card-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
          }

          .enq-card-name {
            font-family: "Mona Sans", sans-serif;
            font-size: 15px;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0;
          }

          .enq-card-date {
            font-family: "Mona Sans", sans-serif;
            font-size: 12px;
            color: #8a8a7e;
            margin: 4px 0 0 0;
          }

          .enq-card-grid {
            margin-top: 14px;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .enq-card-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            font-family: "Mona Sans", sans-serif;
            font-size: 13px;
          }

          .enq-card-label {
            color: #8a8a7e;
          }

          .enq-card-value {
            color: #1a1a1a;
            font-weight: 600;
            text-align: right;
            word-break: break-word;
          }

          .enq-card-actions {
            display: flex;
            gap: 8px;
            margin-top: 16px;
          }

          .enq-btn-block {
            display: inline-flex;
            flex: 1;
          }

          .enq-pagination {
            gap: 6px;
            margin-top: 20px;
          }

          .enq-page-btn {
            font-size: 12px;
            padding: 6px 10px;
            min-width: 32px;
          }
        }

        @media (max-width: 400px) {
          .enq-page-nav {
            flex: 1 1 auto;
          }
        }
      `}</style>
    </AdminShell>
  );
}