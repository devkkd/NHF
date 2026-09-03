"use client";

import { useState, useEffect, useRef } from "react";
import AdminShell from "./AdminShell";
import {
  Upload,
  X,
  Loader2,
  Save,
  ToggleLeft,
  ToggleRight,
  ImageIcon,
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
   IMAGE UPLOAD
========================================================= */

async function uploadImage(file) {
  if (!file) {
    throw new Error("Please select an image.");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Please select a valid image file.");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Image size must be below 10MB.");
  }

  const response = await apiFetch(
    "/upload/presign",
    {
      method: "POST",

      body: JSON.stringify({
        mimeType: file.type,
        fileSize: file.size,
        folder: "new-arrivals",
      }),
    }
  );

  const uploadUrl = response?.data?.uploadUrl;
  const publicUrl = response?.data?.publicUrl;

  if (!uploadUrl || !publicUrl) {
    throw new Error(
      "Invalid upload response."
    );
  }

  const uploadResponse = await fetch(
    uploadUrl,
    {
      method: "PUT",

      headers: {
        "Content-Type": file.type,
      },

      body: file,
    }
  );

  if (!uploadResponse.ok) {
    throw new Error(
      "Image upload failed."
    );
  }

  return publicUrl;
}

/* =========================================================
   IMAGE FIELD
========================================================= */

function ImageField({
  label,
  value,
  onChange,
  aspect = "16/9",
}) {
  const [uploading, setUploading] =
    useState(false);

  const [dragging, setDragging] =
    useState(false);

  const inputRef = useRef(null);

  const handle = async (file) => {
    if (!file) return;

    setUploading(true);

    try {
      const url =
        await uploadImage(file);

      onChange(url);
    } catch (error) {
      console.error(error);

      alert(
        "Upload failed: " +
          (error?.message ||
            "Unknown error")
      );
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div
      style={{
        width: "100%",
      }}
    >
      {/* LABEL */}

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
        {label}
      </label>

      {/* IMAGE BOX */}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => {
          setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);

          handle(
            e.dataTransfer.files?.[0]
          );
        }}
        onClick={() => {
          if (!value && !uploading) {
            inputRef.current?.click();
          }
        }}
        style={{
          position: "relative",

          width: "100%",

          aspectRatio: aspect,

          minHeight: "190px",

          maxHeight: "280px",

          overflow: "hidden",

          border: dragging
            ? "2px dashed #000000"
            : "2px dashed #d0d0d0",

          borderRadius: "12px",

          background: "#fafafa",

          cursor:
            !value && !uploading
              ? "pointer"
              : "default",

          boxSizing: "border-box",

          transition:
            "border-color 0.2s ease",
        }}
      >
        {/* UPLOADING */}

        {uploading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 20,
              background:
                "rgba(255,255,255,0.92)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            <Loader2
              size={30}
              style={{
                color: "#000000",
                animation:
                  "new-arrivals-spin 0.8s linear infinite",
              }}
            />

            <span
              style={{
                color: "#000000",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              Uploading image...
            </span>
          </div>
        )}

        {/* IMAGE */}

        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}

            <img
              src={value}
              alt={label}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />

            {/* OVERLAY */}

            <div
              className="new-arrivals-image-overlay"
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                background:
                  "rgba(0,0,0,0)",
                opacity: 0,
                transition:
                  "all 0.2s ease",
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                style={{
                  height: "42px",
                  padding:
                    "0 16px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#ffffff",
                  color: "#000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "7px",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow:
                    "0 5px 20px rgba(0,0,0,0.18)",
                }}
              >
                <Upload size={17} />

                Change
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                style={{
                  height: "42px",
                  padding:
                    "0 16px",
                  border: "none",
                  borderRadius: "8px",
                  background: "#ffffff",
                  color: "#000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "7px",
                  fontSize: "16px",
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow:
                    "0 5px 20px rgba(0,0,0,0.18)",
                }}
              >
                <X size={17} />

                Remove
              </button>
            </div>
          </>
        ) : (
          /* EMPTY */

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "9px",
              color: "#000000",
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "12px",
                background: "#eeeeee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Upload size={25} />
            </div>

            <p
              style={{
                margin: 0,
                color: "#000000",
                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              Click or drag to upload
            </p>

            <p
              style={{
                margin: 0,
                color: "#000000",
                opacity: 0.55,
                fontSize: "14px",
              }}
            >
              PNG, JPG or WEBP • Max 10MB
            </p>
          </div>
        )}
      </div>

      {/* URL INPUT */}

      {!value && (
        <input
          type="text"
          placeholder="Or paste image URL"
          onBlur={(e) => {
            const url =
              e.target.value.trim();

            if (url) {
              onChange(url);
            }
          }}
          style={{
            width: "100%",
            height: "46px",
            marginTop: "12px",
            padding: "0 14px",
            border:
              "1px solid #d2d2d2",
            borderRadius: "8px",
            background: "#ffffff",
            color: "#000000",
            fontSize: "16px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      )}

      {/* FILE INPUT */}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{
          display: "none",
        }}
        onChange={(e) =>
          handle(
            e.target.files?.[0]
          )
        }
      />
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function AdminNewArrivalsSection() {
  const [form, setForm] =
    useState({
      heading: "",
      paragraph: "",
      cardImage: "",
      cardTitle: "",
      bigImage: "",
      isActive: true,
    });

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [saved, setSaved] =
    useState(false);

  const [error, setError] =
    useState("");

  const set = (key, value) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  /* =======================================================
     LOAD
  ======================================================= */

  useEffect(() => {
    const loadSection = async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await apiFetch(
            "/new-arrivals-section/admin"
          );

        if (response?.data) {
          setForm(response.data);
        }
      } catch (error) {
        console.error(error);

        setError(
          error?.message ||
            "Failed to load section."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSection();
  }, []);

  /* =======================================================
     SAVE
  ======================================================= */

  const submit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setSaved(false);

    try {
      await apiFetch(
        "/new-arrivals-section/admin",
        {
          method: "POST",
          body: JSON.stringify(form),
        }
      );

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      console.error(error);

      alert(
        error?.message ||
          "Failed to save changes."
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <AdminShell pageTitle="New Arrivals Section">
      <style>{`
        .new-arrivals-scroll {
          scrollbar-width: thin;
          scrollbar-color: #bdbdbd transparent;
        }

        .new-arrivals-scroll::-webkit-scrollbar {
          width: 7px;
        }

        .new-arrivals-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .new-arrivals-scroll::-webkit-scrollbar-thumb {
          background: #bdbdbd;
          border-radius: 20px;
        }

        .new-arrivals-scroll::-webkit-scrollbar-thumb:hover {
          background: #888888;
        }

        .new-arrivals-input:focus,
        .new-arrivals-textarea:focus {
          border-color: #000000 !important;

          box-shadow:
            0 0 0 2px rgba(0,0,0,0.05);

          outline: none;
        }

        .new-arrivals-save:hover {
          opacity: 0.85;
        }

        .new-arrivals-image-overlay:hover {
          opacity: 1 !important;

          background:
            rgba(0,0,0,0.42) !important;
        }

        @keyframes new-arrivals-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 760px) {
          .new-arrivals-page {
            padding:
              22px 18px 35px !important;
          }

          .new-arrivals-form-card {
            padding:
              22px !important;
          }

          .new-arrivals-images {
            grid-template-columns:
              1fr !important;
          }
        }

        @media (max-width: 480px) {
          .new-arrivals-page {
            padding:
              18px 12px 28px !important;
          }

          .new-arrivals-form-card {
            padding:
              18px !important;
            border-radius:
              12px !important;
          }

          .new-arrivals-title {
            font-size:
              25px !important;
          }
        }
      `}</style>

      {/* =====================================================
          PAGE CONTAINER
      ===================================================== */}

      <div
        className="new-arrivals-page"
        style={{
          width: "100%",

          maxWidth: "1100px",

          height:
            "calc(100vh - 70px)",

          minHeight: "500px",

          margin: "0 auto",

          padding:
            "30px 30px 40px",

          boxSizing:
            "border-box",

          display: "flex",

          flexDirection:
            "column",
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          style={{
            width: "100%",

            marginBottom: "24px",

            flexShrink: 0,
          }}
        >
          <h1
            className="new-arrivals-title"
            style={{
              margin: 0,

              color: "#000000",

              fontSize: "20px",

              lineHeight: "1.35",

              fontWeight: 700,
            }}
          >
            New Arrivals Section
          </h1>

          <p
            style={{
              margin:
                "8px 0 0",

              color: "#000000",

              opacity: 0.62,

              fontSize: "16px",

              lineHeight: "1.5",

              fontWeight: 400,
            }}
          >
            Edit the "A Home Is A
            Feeling" section on the
            homepage.
          </p>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            style={{
              width: "100%",

              minHeight: "56px",

              marginBottom: "18px",

              padding:
                "12px 16px",

              border:
                "1px solid #d5d5d5",

              borderRadius: "9px",

              background: "#fafafa",

              color: "#000000",

              fontSize: "16px",

              display: "flex",

              alignItems: "center",

              justifyContent:
                "space-between",

              gap: "15px",

              flexShrink: 0,
            }}
          >
            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() => {
                window.location.reload();
              }}
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
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div
            style={{
              flex: 1,

              minHeight: 0,

              background: "#ffffff",

              border:
                "1px solid #dddddd",

              borderRadius: "14px",

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
                  "new-arrivals-spin 0.8s linear infinite",
              }}
            />

            <span
              style={{
                color: "#000000",

                fontSize: "16px",

                fontWeight: 600,
              }}
            >
              Loading section...
            </span>
          </div>
        ) : (
          /* =================================================
             FORM SCROLL AREA
          ================================================= */

          <div
            className="new-arrivals-scroll"
            style={{
              flex: 1,

              minHeight: 0,

              overflowY: "auto",

              overflowX: "hidden",

              paddingRight: "8px",

              boxSizing:
                "border-box",
            }}
          >
            <form
              onSubmit={submit}
              style={{
                width: "100%",

                background: "#ffffff",

                border:
                  "1px solid #dddddd",

                borderRadius: "14px",

                padding:
                  "28px",

                boxSizing:
                  "border-box",

                display: "flex",

                flexDirection:
                  "column",

                gap: "25px",
              }}
            >
              {/* =========================================
                  HEADING
              ========================================= */}

              <div>
                <label
                  style={{
                    display: "block",

                    marginBottom: "10px",

                    color: "#000000",

                    fontSize: "16px",

                    fontWeight: 700,

                    lineHeight: "1.4",
                  }}
                >
                  Section Heading
                </label>

                <textarea
                  rows={3}
                  className="new-arrivals-textarea"
                  placeholder={
                    "A HOME IS A FEELING,\nWE HELP YOU BUILD IT."
                  }
                  value={
                    form.heading
                  }
                  onChange={(e) =>
                    set(
                      "heading",
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",

                    minHeight: "105px",

                    padding:
                      "13px 14px",

                    border:
                      "1px solid #d2d2d2",

                    borderRadius: "9px",

                    background:
                      "#ffffff",

                    color:
                      "#000000",

                    fontSize: "16px",

                    lineHeight:
                      "1.55",

                    outline: "none",

                    resize: "vertical",

                    boxSizing:
                      "border-box",
                  }}
                />

                <p
                  style={{
                    margin:
                      "7px 0 0",

                    color:
                      "#000000",

                    opacity: 0.55,

                    fontSize:
                      "14px",

                    lineHeight:
                      "1.4",
                  }}
                >
                  Use a new line for
                  line breaks.
                </p>
              </div>

              {/* =========================================
                  PARAGRAPH
              ========================================= */}

              <div>
                <label
                  style={{
                    display: "block",

                    marginBottom: "10px",

                    color: "#000000",

                    fontSize: "16px",

                    fontWeight: 700,

                    lineHeight: "1.4",
                  }}
                >
                  Paragraph Text
                </label>

                <textarea
                  rows={6}
                  className="new-arrivals-textarea"
                  placeholder="The morning light through a window..."
                  value={
                    form.paragraph
                  }
                  onChange={(e) =>
                    set(
                      "paragraph",
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",

                    minHeight:
                      "150px",

                    padding:
                      "13px 14px",

                    border:
                      "1px solid #d2d2d2",

                    borderRadius: "9px",

                    background:
                      "#ffffff",

                    color:
                      "#000000",

                    fontSize: "16px",

                    lineHeight:
                      "1.55",

                    outline: "none",

                    resize: "vertical",

                    boxSizing:
                      "border-box",
                  }}
                />
              </div>

              {/* =========================================
                  IMAGES + CARD TITLE
              ========================================= */}

              <div
                className="new-arrivals-images"
                style={{
                  width: "100%",

                  display: "grid",

                  gridTemplateColumns:
                    "1fr 1fr",

                  gap: "24px",
                }}
              >
                {/* CARD IMAGE */}

                <ImageField
                  label="Product Card Image"
                  value={
                    form.cardImage
                  }
                  onChange={(value) =>
                    set(
                      "cardImage",
                      value
                    )
                  }
                  aspect="3/4"
                />

                {/* CARD TITLE */}

                <div
                  style={{
                    width: "100%",

                    display: "flex",

                    flexDirection:
                      "column",

                    justifyContent:
                      "flex-end",
                  }}
                >
                  <label
                    style={{
                      display: "block",

                      marginBottom:
                        "10px",

                      color:
                        "#000000",

                      fontSize:
                        "16px",

                      fontWeight:
                        700,

                      lineHeight:
                        "1.4",
                    }}
                  >
                    Product Card Title
                  </label>

                  <input
                    type="text"
                    className="new-arrivals-input"
                    placeholder="Hand Block Percale Printed Bedsheet"
                    value={
                      form.cardTitle
                    }
                    onChange={(e) =>
                      set(
                        "cardTitle",
                        e.target.value
                      )
                    }
                    style={{
                      width: "100%",

                      height: "48px",

                      padding:
                        "0 14px",

                      border:
                        "1px solid #d2d2d2",

                      borderRadius:
                        "8px",

                      background:
                        "#ffffff",

                      color:
                        "#000000",

                      fontSize:
                        "16px",

                      outline:
                        "none",

                      boxSizing:
                        "border-box",
                    }}
                  />

                  <p
                    style={{
                      margin:
                        "8px 0 0",

                      color:
                        "#000000",

                      opacity: 0.55,

                      fontSize:
                        "14px",

                      lineHeight:
                        "1.4",
                    }}
                  >
                    This title will
                    appear on the
                    product card.
                  </p>
                </div>
              </div>

              {/* =========================================
                  BIG IMAGE
              ========================================= */}

              <ImageField
                label="Large Right Image"
                value={
                  form.bigImage
                }
                onChange={(value) =>
                  set(
                    "bigImage",
                    value
                  )
                }
                aspect="16/10"
              />

              {/* =========================================
                  ACTIVE STATUS
              ========================================= */}

              <div
                style={{
                  width: "100%",

                  padding:
                    "16px 17px",

                  border:
                    "1px solid #dddddd",

                  borderRadius:
                    "10px",

                  background:
                    "#fafafa",

                  display: "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "space-between",

                  gap: "20px",

                  boxSizing:
                    "border-box",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,

                      color:
                        "#000000",

                      fontSize:
                        "16px",

                      fontWeight:
                        700,

                      lineHeight:
                        "1.4",
                    }}
                  >
                    Section Status
                  </p>

                  <p
                    style={{
                      margin:
                        "5px 0 0",

                      color:
                        "#000000",

                      opacity: 0.58,

                      fontSize:
                        "14px",

                      lineHeight:
                        "1.4",
                    }}
                  >
                    Control whether
                    this section appears
                    on the homepage.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    set(
                      "isActive",
                      !form.isActive
                    )
                  }
                  style={{
                    minWidth: "125px",

                    height: "46px",

                    padding:
                      "0 14px",

                    border:
                      "1px solid #cccccc",

                    borderRadius:
                      "8px",

                    background:
                      "#ffffff",

                    color:
                      "#000000",

                    display: "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",

                    gap: "8px",

                    cursor:
                      "pointer",

                    fontSize:
                      "16px",

                    fontWeight:
                      700,

                    flexShrink: 0,
                  }}
                >
                  {form.isActive ? (
                    <>
                      <ToggleRight
                        size={27}
                      />

                      Active
                    </>
                  ) : (
                    <>
                      <ToggleLeft
                        size={27}
                      />

                      Inactive
                    </>
                  )}
                </button>
              </div>

              {/* =========================================
                  SAVE FOOTER
              ========================================= */}

              <div
                style={{
                  width: "100%",

                  paddingTop:
                    "22px",

                  borderTop:
                    "1px solid #e3e3e3",

                  display: "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "space-between",

                  gap: "15px",

                  flexWrap: "wrap",
                }}
              >
                {/* SAVED MESSAGE */}

                <div
                  style={{
                    minHeight:
                      "24px",

                    display: "flex",

                    alignItems:
                      "center",
                  }}
                >
                  {saved && (
                    <span
                      style={{
                        color:
                          "#000000",

                        fontSize:
                          "16px",

                        fontWeight:
                          600,
                      }}
                    >
                      ✓ Saved successfully
                    </span>
                  )}
                </div>

                {/* SAVE BUTTON */}

                <button
                  type="submit"
                  disabled={saving}
                  className="new-arrivals-save"
                  style={{
                    height: "48px",

                    minWidth: "170px",

                    padding:
                      "0 22px",

                    border: "none",

                    borderRadius:
                      "8px",

                    background:
                      "#000000",

                    color:
                      "#ffffff",

                    display: "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",

                    gap: "9px",

                    fontSize:
                      "16px",

                    fontWeight:
                      700,

                    cursor: saving
                      ? "not-allowed"
                      : "pointer",

                    opacity: saving
                      ? 0.55
                      : 1,
                  }}
                >
                  {saving ? (
                    <Loader2
                      size={19}
                      style={{
                        animation:
                          "new-arrivals-spin 0.8s linear infinite",
                      }}
                    />
                  ) : (
                    <Save size={19} />
                  )}

                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminShell>
  );
}