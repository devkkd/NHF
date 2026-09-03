"use client";

import { useEffect, useState } from "react";
import AdminShell from "./AdminShell";
import {
  Plus,
  Trash2,
  Edit2,
  ToggleLeft,
  ToggleRight,
  X,
  Loader2,
  MessageSquare,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

/* =========================================================
   AUTH
========================================================= */

function getToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("adminAccessToken") ||
    localStorage.getItem("accessToken")
  );
}

/* =========================================================
   API
========================================================= */

async function apiFetch(path, opts = {}) {
  const token = getToken();

  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...(opts.headers || {}),
    },
  });

  let data = {};

  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        "Request failed"
    );
  }

  return data;
}

/* =========================================================
   MODAL
========================================================= */

function Modal({
  item,
  onClose,
  onSave,
}) {
  const empty = {
    quote: "",
    name: "",
    location: "",
    isActive: true,
    order: 0,
  };

  const [form, setForm] = useState(
    item || empty
  );

  const [saving, setSaving] = useState(false);

  const updateField = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.quote.trim()) {
      alert("Please enter customer review.");
      return;
    }

    if (!form.name.trim()) {
      alert("Please enter customer name.");
      return;
    }

    setSaving(true);

    try {
      await onSave(form);
      onClose();
    } catch (error) {
      console.error(error);

      alert(
        error?.message ||
          "Failed to save testimonial."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.60)",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      {/* MODAL */}

      <div
        style={{
          width: "100%",
          maxWidth: "720px",
          height: "min(720px, 92vh)",
          background: "#ffffff",
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow:
            "0 25px 70px rgba(0,0,0,0.30)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            minHeight: "86px",
            padding: "0 28px",
            borderBottom: "1px solid #e5e5e5",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "#000000",
                fontSize: "24px",
                lineHeight: "1.25",
                fontWeight: 700,
              }}
            >
              {item?._id
                ? "Edit Testimonial"
                : "New Testimonial"}
            </h2>

            <p
              style={{
                margin: "7px 0 0",
                color: "#000000",
                opacity: 0.58,
                fontSize: "16px",
                lineHeight: "1.4",
              }}
            >
              Manage customer review
              displayed on homepage
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: "42px",
              height: "42px",
              flexShrink: 0,
              border: "1px solid #d2d2d2",
              borderRadius: "8px",
              background: "#ffffff",
              color: "#000000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <X size={21} />
          </button>
        </div>

        {/* FORM BODY */}

        <form
          onSubmit={submit}
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: "28px 30px 30px",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            boxSizing: "border-box",
          }}
        >
          {/* QUOTE */}

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "10px",
                color: "#000000",
                fontSize: "16px",
                lineHeight: "1.4",
                fontWeight: 700,
              }}
            >
              Customer Review *
            </label>

            <textarea
              required
              rows={6}
              value={form.quote}
              placeholder="The kantha bedcover arrived and..."
              onChange={(e) =>
                updateField(
                  "quote",
                  e.target.value
                )
              }
              style={{
                width: "100%",
                minHeight: "155px",
                padding: "13px 14px",
                border: "1px solid #d3d3d3",
                borderRadius: "9px",
                background: "#ffffff",
                color: "#000000",
                fontSize: "16px",
                lineHeight: "1.55",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* NAME */}

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "10px",
                color: "#000000",
                fontSize: "16px",
                lineHeight: "1.4",
                fontWeight: 700,
              }}
            >
              Customer Name *
            </label>

            <input
              required
              type="text"
              value={form.name}
              placeholder="Sophie R."
              onChange={(e) =>
                updateField(
                  "name",
                  e.target.value
                )
              }
              style={{
                width: "100%",
                height: "48px",
                padding: "0 14px",
                border: "1px solid #d3d3d3",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#000000",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* LOCATION */}

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "10px",
                color: "#000000",
                fontSize: "16px",
                lineHeight: "1.4",
                fontWeight: 700,
              }}
            >
              Location
            </label>

            <input
              type="text"
              value={form.location}
              placeholder="London, UK"
              onChange={(e) =>
                updateField(
                  "location",
                  e.target.value
                )
              }
              style={{
                width: "100%",
                height: "48px",
                padding: "0 14px",
                border: "1px solid #d3d3d3",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#000000",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* ORDER + STATUS */}

          <div
            className="testimonial-settings"
            style={{
              width: "100%",
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "20px",
            }}
          >
            {/* ORDER */}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "10px",
                  color: "#000000",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                Display Order
              </label>

              <input
                type="number"
                min={0}
                value={form.order}
                onChange={(e) =>
                  updateField(
                    "order",
                    Number(
                      e.target.value
                    )
                  )
                }
                style={{
                  width: "100%",
                  height: "48px",
                  padding: "0 14px",
                  border:
                    "1px solid #d3d3d3",
                  borderRadius: "8px",
                  background: "#ffffff",
                  color: "#000000",
                  fontSize: "16px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* STATUS */}

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "10px",
                  color: "#000000",
                  fontSize: "16px",
                  fontWeight: 700,
                }}
              >
                Status
              </label>

              <button
                type="button"
                onClick={() =>
                  updateField(
                    "isActive",
                    !form.isActive
                  )
                }
                style={{
                  width: "100%",
                  height: "48px",
                  padding: "0 14px",
                  border:
                    "1px solid #d3d3d3",
                  borderRadius: "8px",
                  background: "#ffffff",
                  color: "#000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "space-between",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: 600,
                }}
              >
                <span>
                  {form.isActive
                    ? "Active"
                    : "Inactive"}
                </span>

                {form.isActive ? (
                  <ToggleRight size={30} />
                ) : (
                  <ToggleLeft size={30} />
                )}
              </button>
            </div>
          </div>

          {/* FOOTER */}

          <div
            style={{
              marginTop: "4px",
              paddingTop: "20px",
              borderTop:
                "1px solid #e3e3e3",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "flex-end",
              gap: "12px",
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                height: "46px",
                padding: "0 22px",
                border:
                  "1px solid #cccccc",
                borderRadius: "8px",
                background: "#ffffff",
                color: "#000000",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              style={{
                height: "46px",
                minWidth: "145px",
                padding: "0 22px",
                border: "none",
                borderRadius: "8px",
                background: "#000000",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                fontSize: "16px",
                fontWeight: 700,
                cursor: saving
                  ? "not-allowed"
                  : "pointer",
                opacity: saving ? 0.55 : 1,
              }}
            >
              {saving && (
                <Loader2
                  size={18}
                  style={{
                    animation:
                      "testimonial-spin 0.8s linear infinite",
                  }}
                />
              )}

              {saving
                ? "Saving..."
                : "Save Testimonial"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AdminTestimonials() {
  const [items, setItems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [modal, setModal] =
    useState(null);

  /* =======================================================
     LOAD
  ======================================================= */

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await apiFetch(
          "/testimonials/admin"
        );

      const testimonials =
        Array.isArray(response?.data)
          ? response.data
          : [];

      setItems(testimonials);
    } catch (error) {
      console.error(
        "Testimonials error:",
        error
      );

      setError(
        error?.message ||
          "Failed to load testimonials."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* =======================================================
     SAVE
  ======================================================= */

  const save = async (form) => {
    if (form._id) {
      await apiFetch(
        `/testimonials/admin/${form._id}`,
        {
          method: "PUT",
          body: JSON.stringify(form),
        }
      );
    } else {
      await apiFetch(
        "/testimonials/admin",
        {
          method: "POST",
          body: JSON.stringify(form),
        }
      );
    }

    await load();
  };

  /* =======================================================
     DELETE
  ======================================================= */

  const remove = async (id) => {
    const confirmed =
      window.confirm(
        "Delete this testimonial?"
      );

    if (!confirmed) return;

    try {
      await apiFetch(
        `/testimonials/admin/${id}`,
        {
          method: "DELETE",
        }
      );

      await load();
    } catch (error) {
      console.error(error);

      alert(
        error?.message ||
          "Failed to delete testimonial."
      );
    }
  };

  /* =======================================================
     TOGGLE
  ======================================================= */

  const toggle = async (id) => {
    try {
      await apiFetch(
        `/testimonials/admin/${id}/toggle`,
        {
          method: "PATCH",
        }
      );

      await load();
    } catch (error) {
      console.error(error);

      alert(
        error?.message ||
          "Failed to update testimonial."
      );
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <AdminShell pageTitle="Testimonials">
      <style>{`
        .testimonial-scroll {
          scrollbar-width: thin;
          scrollbar-color: #bdbdbd transparent;
        }

        .testimonial-scroll::-webkit-scrollbar {
          width: 7px;
        }

        .testimonial-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .testimonial-scroll::-webkit-scrollbar-thumb {
          background: #bdbdbd;
          border-radius: 20px;
        }

        .testimonial-scroll::-webkit-scrollbar-thumb:hover {
          background: #888888;
        }

        .testimonial-card {
          transition:
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .testimonial-card:hover {
          box-shadow:
            0 8px 24px rgba(0,0,0,0.07) !important;

          border-color: #c8c8c8 !important;
        }

        .testimonial-input:focus,
        .testimonial-textarea:focus {
          border-color: #000000 !important;

          box-shadow:
            0 0 0 2px rgba(0,0,0,0.05);
        }

        .testimonial-action:hover {
          background: #f4f4f4 !important;
          border-color: #aaaaaa !important;
        }

        .testimonial-primary:hover {
          opacity: 0.85;
        }

        @keyframes testimonial-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 900px) {
          .testimonial-page {
            padding:
              24px 20px 35px !important;
          }

          .testimonial-header {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .testimonial-add {
            width: 100% !important;
          }
        }

        @media (max-width: 650px) {
          .testimonial-page {
            padding:
              20px 15px 30px !important;
          }

          .testimonial-settings {
            grid-template-columns:
              1fr !important;
          }

          .testimonial-card {
            height: 165px !important;
            min-height: 165px !important;
          }

          .testimonial-status {
            display: none !important;
          }
        }

        @media (max-width: 480px) {
          .testimonial-page {
            padding:
              18px 12px 25px !important;
          }

          .testimonial-order {
            display: none !important;
          }

          .testimonial-card {
            height: 180px !important;
            min-height: 180px !important;
            padding: 14px !important;
            gap: 10px !important;
          }

          .testimonial-action {
            width: 34px !important;
            height: 34px !important;
          }

          .testimonial-action svg {
            width: 16px !important;
            height: 16px !important;
          }
        }
      `}</style>

      {/* =====================================================
          PAGE CONTAINER
      ===================================================== */}

      <div
        className="testimonial-page"
        style={{
          width: "100%",
          maxWidth: "1180px",
          margin: "0 auto",
          padding:
            "30px 30px 40px",
          boxSizing: "border-box",
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="testimonial-header"
          style={{
            width: "100%",
            minHeight: "72px",
            marginBottom: "26px",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: "20px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: "#000000",
                fontSize: "30px",
                lineHeight: "1.2",
                fontWeight: 750,
                letterSpacing:
                  "-0.5px",
              }}
            >
              Testimonials
            </h1>

            <p
              style={{
                margin:
                  "9px 0 0",
                color: "#000000",
                opacity: 0.62,
                fontSize: "16px",
                lineHeight: "1.5",
                fontWeight: 400,
              }}
            >
              Customer reviews shown
              on your homepage
            </p>
          </div>

          {/* ADD */}

          <button
            type="button"
            className="testimonial-primary testimonial-add"
            onClick={() =>
              setModal("new")
            }
            style={{
              height: "48px",
              minWidth: "185px",
              padding:
                "0 20px",
              border: "none",
              borderRadius: "8px",
              background: "#000000",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              gap: "8px",
              fontSize: "16px",
              fontWeight: 700,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <Plus size={19} />

            Add Testimonial
          </button>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            style={{
              width: "100%",
              minHeight: "58px",
              marginBottom: "18px",
              padding:
                "12px 16px",
              border:
                "1px solid #d8d8d8",
              borderRadius: "10px",
              background: "#fafafa",
              color: "#000000",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "space-between",
              gap: "15px",
              fontSize: "16px",
            }}
          >
            <span>{error}</span>

            <button
              type="button"
              onClick={load}
              style={{
                height: "36px",
                padding:
                  "0 14px",
                border:
                  "1px solid #cccccc",
                borderRadius: "7px",
                background: "#ffffff",
                color: "#000000",
                fontSize: "14px",
                fontWeight: 700,
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div
            style={{
              width: "100%",
              height: "500px",
              border:
                "1px solid #dddddd",
              borderRadius: "14px",
              background: "#ffffff",
              display: "flex",
              flexDirection:
                "column",
              alignItems: "center",
              justifyContent:
                "center",
              gap: "14px",
            }}
          >
            <Loader2
              size={34}
              style={{
                color: "#000000",
                animation:
                  "testimonial-spin 0.8s linear infinite",
              }}
            />

            <span
              style={{
                color: "#000000",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              Loading testimonials...
            </span>
          </div>
        )}

        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          !error &&
          items.length === 0 && (
            <div
              style={{
                width: "100%",
                height: "500px",
                border:
                  "2px dashed #d7d7d7",
                borderRadius: "16px",
                background: "#ffffff",
                display: "flex",
                flexDirection:
                  "column",
                alignItems: "center",
                justifyContent:
                  "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "14px",
                  background: "#eeeeee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                }}
              >
                <MessageSquare
                  size={34}
                  color="#000000"
                />
              </div>

              <h2
                style={{
                  margin: 0,
                  color: "#000000",
                  fontSize: "21px",
                  lineHeight: "1.3",
                  fontWeight: 700,
                }}
              >
                No testimonials yet
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#000000",
                  opacity: 0.6,
                  fontSize: "16px",
                  lineHeight: "1.5",
                  textAlign: "center",
                }}
              >
                Add your first customer
                review to display it on
                the homepage.
              </p>

              <button
                type="button"
                onClick={() =>
                  setModal("new")
                }
                style={{
                  height: "46px",
                  marginTop: "5px",
                  padding:
                    "0 20px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#000000",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  gap: "8px",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                <Plus size={18} />

                Add First Testimonial
              </button>
            </div>
          )}

        {/* =================================================
            TESTIMONIAL LIST
        ================================================= */}

        {!loading &&
          !error &&
          items.length > 0 && (
            <div
              className="testimonial-scroll"
              style={{
                width: "100%",

                height:
                  "calc(100vh - 245px)",

                minHeight: "420px",

                maxHeight: "760px",

                overflowY: "auto",

                overflowX: "hidden",

                paddingRight: "8px",

                boxSizing:
                  "border-box",
              }}
            >
              <div
                style={{
                  width: "100%",

                  display: "flex",

                  flexDirection:
                    "column",

                  gap: "15px",

                  paddingBottom: "8px",
                }}
              >
                {items.map(
                  (item) => (
                    <div
                      key={item._id}
                      className="testimonial-card"
                      style={{
                        width: "100%",

                        height: "142px",

                        minHeight: "142px",

                        maxHeight: "142px",

                        padding:
                          "17px 18px",

                        background:
                          "#ffffff",

                        border:
                          "1px solid #dddddd",

                        borderRadius:
                          "14px",

                        boxShadow:
                          "0 2px 10px rgba(0,0,0,0.04)",

                        display: "flex",

                        alignItems:
                          "flex-start",

                        gap: "16px",

                        overflow:
                          "hidden",

                        boxSizing:
                          "border-box",

                        opacity:
                          item.isActive
                            ? 1
                            : 0.55,
                      }}
                    >
                      {/* ORDER */}

                      <div
                        className="testimonial-order"
                        style={{
                          width: "48px",

                          minWidth: "48px",

                          height: "34px",

                          borderRadius: "7px",

                          background:
                            "#f1f1f1",

                          color: "#000000",

                          display: "flex",

                          alignItems:
                            "center",

                          justifyContent:
                            "center",

                          fontSize: "14px",

                          fontWeight: 700,

                          flexShrink: 0,
                        }}
                      >
                        #{item.order ?? 0}
                      </div>

                      {/* CONTENT */}

                      <div
                        style={{
                          flex: 1,

                          minWidth: 0,

                          height: "100%",

                          display:
                            "flex",

                          flexDirection:
                            "column",

                          justifyContent:
                            "space-between",

                          overflow:
                            "hidden",
                        }}
                      >
                        {/* QUOTE */}

                        <p
                          className="testimonial-quote"
                          title={
                            item.quote ||
                            ""
                          }
                          style={{
                            margin: 0,

                            color:
                              "#000000",

                            fontSize:
                              "16px",

                            lineHeight:
                              "1.5",

                            fontWeight:
                              400,

                            fontStyle:
                              "italic",

                            display:
                              "-webkit-box",

                            WebkitLineClamp:
                              3,

                            WebkitBoxOrient:
                              "vertical",

                            overflow:
                              "hidden",
                          }}
                        >
                          &quot;
                          {item.quote ||
                            "No review text"}
                          &quot;
                        </p>

                        {/* CUSTOMER */}

                        <div
                          style={{
                            display:
                              "flex",

                            alignItems:
                              "center",

                            gap: "8px",

                            minWidth: 0,

                            marginTop:
                              "10px",
                          }}
                        >
                          <span
                            style={{
                              color:
                                "#000000",

                              fontSize:
                                "16px",

                              lineHeight:
                                "1.3",

                              fontWeight:
                                700,

                              whiteSpace:
                                "nowrap",

                              overflow:
                                "hidden",

                              textOverflow:
                                "ellipsis",

                              maxWidth:
                                "230px",
                            }}
                          >
                            {item.name ||
                              "Unknown Customer"}
                          </span>

                          {item.location && (
                            <>
                              <span
                                style={{
                                  color:
                                    "#000000",

                                  opacity:
                                    0.35,

                                  fontSize:
                                    "16px",
                                }}
                              >
                                ·
                              </span>

                              <span
                                style={{
                                  color:
                                    "#000000",

                                  opacity:
                                    0.58,

                                  fontSize:
                                    "15px",

                                  whiteSpace:
                                    "nowrap",

                                  overflow:
                                    "hidden",

                                  textOverflow:
                                    "ellipsis",
                                }}
                              >
                                {
                                  item.location
                                }
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* STATUS */}

                      <div
                        className="testimonial-status"
                        style={{
                          width: "85px",

                          minWidth: "85px",

                          display:
                            "flex",

                          alignItems:
                            "flex-start",

                          justifyContent:
                            "center",

                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            width: "76px",

                            height: "33px",

                            border:
                              "1px solid #cccccc",

                            borderRadius:
                              "999px",

                            background:
                              item.isActive
                                ? "#eeeeee"
                                : "#ffffff",

                            color:
                              "#000000",

                            display:
                              "flex",

                            alignItems:
                              "center",

                            justifyContent:
                              "center",

                            fontSize:
                              "14px",

                            fontWeight:
                              700,
                          }}
                        >
                          {item.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>

                      {/* ACTIONS */}

                      <div
                        style={{
                          display:
                            "flex",

                          alignItems:
                            "center",

                          gap: "7px",

                          flexShrink: 0,
                        }}
                      >
                        {/* TOGGLE */}

                        <button
                          type="button"
                          className="testimonial-action"
                          title={
                            item.isActive
                              ? "Deactivate"
                              : "Activate"
                          }
                          onClick={() =>
                            toggle(
                              item._id
                            )
                          }
                          style={{
                            width: "40px",

                            height: "40px",

                            border:
                              "1px solid #d4d4d4",

                            borderRadius:
                              "8px",

                            background:
                              "#ffffff",

                            color:
                              "#000000",

                            display:
                              "flex",

                            alignItems:
                              "center",

                            justifyContent:
                              "center",

                            cursor:
                              "pointer",
                          }}
                        >
                          {item.isActive ? (
                            <ToggleRight
                              size={21}
                            />
                          ) : (
                            <ToggleLeft
                              size={21}
                            />
                          )}
                        </button>

                        {/* EDIT */}

                        <button
                          type="button"
                          className="testimonial-action"
                          title="Edit testimonial"
                          onClick={() =>
                            setModal(
                              item
                            )
                          }
                          style={{
                            width: "40px",

                            height: "40px",

                            border:
                              "1px solid #d4d4d4",

                            borderRadius:
                              "8px",

                            background:
                              "#ffffff",

                            color:
                              "#000000",

                            display:
                              "flex",

                            alignItems:
                              "center",

                            justifyContent:
                              "center",

                            cursor:
                              "pointer",
                          }}
                        >
                          <Edit2
                            size={18}
                          />
                        </button>

                        {/* DELETE */}

                        <button
                          type="button"
                          className="testimonial-action"
                          title="Delete testimonial"
                          onClick={() =>
                            remove(
                              item._id
                            )
                          }
                          style={{
                            width: "40px",

                            height: "40px",

                            border:
                              "1px solid #d4d4d4",

                            borderRadius:
                              "8px",

                            background:
                              "#ffffff",

                            color:
                              "#000000",

                            display:
                              "flex",

                            alignItems:
                              "center",

                            justifyContent:
                              "center",

                            cursor:
                              "pointer",
                          }}
                        >
                          <Trash2
                            size={18}
                          />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {modal && (
        <Modal
          item={
            modal === "new"
              ? null
              : modal
          }
          onClose={() =>
            setModal(null)
          }
          onSave={save}
        />
      )}
    </AdminShell>
  );
}