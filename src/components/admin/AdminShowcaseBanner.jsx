
"use client";

import { useEffect, useRef, useState } from "react";
import AdminShell from "./AdminShell";

import {
  Plus,
  Trash2,
  Edit2,
  ToggleLeft,
  ToggleRight,
  X,
  Upload,
  Loader2,
  ImageIcon,
} from "lucide-react";

/* =========================================================
   API
========================================================= */

const API = process.env.NEXT_PUBLIC_API_URL;

/* =========================================================
   TOKEN
========================================================= */

function getToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    localStorage.getItem("adminAccessToken") ||
    localStorage.getItem("accessToken")
  );
}

/* =========================================================
   API FETCH
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
    throw new Error(
      "Please select an image."
    );
  }

  const response = await apiFetch(
    "/upload/presign",
    {
      method: "POST",

      body: JSON.stringify({
        mimeType: file.type,
        fileSize: file.size,
        folder: "showcase",
      }),
    }
  );

  const uploadUrl =
    response?.data?.uploadUrl;

  const publicUrl =
    response?.data?.publicUrl;

  if (!uploadUrl || !publicUrl) {
    throw new Error(
      "Invalid upload response."
    );
  }

  const uploadResponse =
    await fetch(uploadUrl, {
      method: "PUT",

      headers: {
        "Content-Type": file.type,
      },

      body: file,
    });

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
}) {
  const [uploading, setUploading] =
    useState(false);

  const [dragging, setDragging] =
    useState(false);

  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert(
        "Please select a valid image file."
      );

      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert(
        "Image size must be below 10MB."
      );

      return;
    }

    setUploading(true);

    try {
      const url =
        await uploadImage(file);

      onChange(url);
    } catch (error) {
      console.error(error);

      alert(
        `Upload failed: ${
          error?.message ||
          "Unknown error"
        }`
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
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => {
          setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();

          setDragging(false);

          handleFile(
            event.dataTransfer.files?.[0]
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

          height: "190px",

          minHeight: "190px",

          maxHeight: "190px",

          overflow: "hidden",

          border: dragging
            ? "2px dashed #000000"
            : "2px dashed #d0d0d0",

          borderRadius: "12px",

          background: dragging
            ? "#f5f5f5"
            : "#fafafa",

          cursor:
            !value && !uploading
              ? "pointer"
              : "default",

          boxSizing: "border-box",

          transition:
            "all 0.2s ease",
        }}
      >
        {/* LOADING */}

        {uploading && (
          <div
            style={{
              position: "absolute",

              inset: 0,

              zIndex: 20,

              background:
                "rgba(255,255,255,0.94)",

              display: "flex",

              flexDirection:
                "column",

              alignItems: "center",

              justifyContent:
                "center",

              gap: "10px",
            }}
          >
            <Loader2
              size={30}
              style={{
                color: "#000000",

                animation:
                  "showcase-spin 0.8s linear infinite",
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

            {/* IMAGE ACTIONS */}

            <div
              className="showcase-image-overlay"
              style={{
                position: "absolute",

                inset: 0,

                display: "flex",

                alignItems: "center",

                justifyContent:
                  "center",

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
                onClick={(event) => {
                  event.stopPropagation();

                  inputRef.current?.click();
                }}
                style={{
                  height: "44px",

                  padding:
                    "0 17px",

                  border: "none",

                  borderRadius: "8px",

                  background:
                    "#ffffff",

                  color: "#000000",

                  display: "flex",

                  alignItems: "center",

                  justifyContent:
                    "center",

                  gap: "8px",

                  fontSize: "16px",

                  fontWeight: 700,

                  cursor: "pointer",

                  boxShadow:
                    "0 5px 20px rgba(0,0,0,0.2)",
                }}
              >
                <Upload size={17} />

                Change
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();

                  onChange("");
                }}
                style={{
                  height: "44px",

                  padding:
                    "0 17px",

                  border: "none",

                  borderRadius: "8px",

                  background:
                    "#ffffff",

                  color: "#000000",

                  display: "flex",

                  alignItems: "center",

                  justifyContent:
                    "center",

                  gap: "8px",

                  fontSize: "16px",

                  fontWeight: 700,

                  cursor: "pointer",

                  boxShadow:
                    "0 5px 20px rgba(0,0,0,0.2)",
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

              flexDirection:
                "column",

              alignItems: "center",

              justifyContent:
                "center",

              gap: "9px",

              color: "#000000",
            }}
          >
            <div
              style={{
                width: "54px",

                height: "54px",

                borderRadius: "12px",

                background: "#eeeeee",

                display: "flex",

                alignItems: "center",

                justifyContent:
                  "center",
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

                fontWeight: 400,
              }}
            >
              PNG, JPG or WEBP • Max 10MB
            </p>
          </div>
        )}
      </div>

      {/* URL */}

      {!value && (
        <input
          type="text"
          placeholder="Or paste image URL directly"
          onBlur={(event) => {
            const url =
              event.target.value.trim();

            if (url) {
              onChange(url);
            }
          }}
          style={{
            width: "100%",

            height: "46px",

            marginTop: "12px",

            padding:
              "0 14px",

            border:
              "1px solid #d4d4d4",

            borderRadius: "8px",

            background: "#ffffff",

            color: "#000000",

            fontSize: "16px",

            outline: "none",

            boxSizing:
              "border-box",
          }}
        />
      )}

      {/* FILE */}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{
          display: "none",
        }}
        onChange={(event) =>
          handleFile(
            event.target.files?.[0]
          )
        }
      />
    </div>
  );
}

/* =========================================================
   MODAL
========================================================= */

function ShowcaseModal({
  item,
  onClose,
  onSave,
}) {
  const empty = {
    title: "",

    productName: "",

    bgImage: "",

    cardImage: "",

    isActive: true,
  };

  const [form, setForm] =
    useState(item || empty);

  const [saving, setSaving] =
    useState(false);

  const updateField = (
    key,
    value
  ) => {
    setForm((current) => ({
      ...current,

      [key]: value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      alert(
        "Please enter internal title."
      );

      return;
    }

    if (!form.productName.trim()) {
      alert(
        "Please enter product name."
      );

      return;
    }

    if (!form.bgImage) {
      alert(
        "Please upload background image."
      );

      return;
    }

    if (!form.cardImage) {
      alert(
        "Please upload card image."
      );

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
          "Failed to save banner."
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

        padding: "20px",

        background:
          "rgba(0,0,0,0.60)",

        display: "flex",

        alignItems: "center",

        justifyContent:
          "center",

        boxSizing:
          "border-box",
      }}
    >
      {/* MODAL */}

      <div
        style={{
          width: "100%",

          maxWidth: "780px",

          height:
            "min(850px, 94vh)",

          background: "#ffffff",

          borderRadius: "16px",

          overflow: "hidden",

          boxShadow:
            "0 25px 70px rgba(0,0,0,0.30)",

          display: "flex",

          flexDirection:
            "column",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            height: "84px",

            minHeight: "84px",

            padding:
              "0 28px",

            borderBottom:
              "1px solid #e3e3e3",

            display: "flex",

            alignItems: "center",

            justifyContent:
              "space-between",

            gap: "20px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,

                color: "#000000",

                fontSize: "23px",

                lineHeight: "1.3",

                fontWeight: 750,
              }}
            >
              {item?._id
                ? "Edit Showcase Banner"
                : "New Showcase Banner"}
            </h2>

            <p
              style={{
                margin:
                  "6px 0 0",

                color: "#000000",

                opacity: 0.55,

                fontSize: "15px",

                lineHeight: "1.4",
              }}
            >
              Manage product spotlight
              content
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: "42px",

              height: "42px",

              flexShrink: 0,

              border:
                "1px solid #d2d2d2",

              borderRadius: "8px",

              background: "#ffffff",

              color: "#000000",

              display: "flex",

              alignItems: "center",

              justifyContent:
                "center",

              cursor: "pointer",
            }}
          >
            <X size={21} />
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={submit}
          style={{
            flex: 1,

            minHeight: 0,

            overflowY: "auto",

            padding:
              "28px 30px 30px",

            display: "flex",

            flexDirection:
              "column",

            gap: "24px",

            boxSizing:
              "border-box",
          }}
        >
          {/* TITLE */}

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
              Internal Title *
            </label>

            <input
              required
              type="text"
              value={form.title}
              placeholder="e.g. Bedsheet Showcase"
              onChange={(event) =>
                updateField(
                  "title",
                  event.target.value
                )
              }
              style={{
                width: "100%",

                height: "48px",

                padding:
                  "0 14px",

                border:
                  "1px solid #d2d2d2",

                borderRadius: "8px",

                background: "#ffffff",

                color: "#000000",

                fontSize: "16px",

                outline: "none",

                boxSizing:
                  "border-box",
              }}
            />
          </div>

          {/* PRODUCT */}

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
              Product Name (shown on card) *
            </label>

            <input
              required
              type="text"
              value={
                form.productName
              }
              placeholder="Hand Block Percale Printed Bedsheet"
              onChange={(event) =>
                updateField(
                  "productName",
                  event.target.value
                )
              }
              style={{
                width: "100%",

                height: "48px",

                padding:
                  "0 14px",

                border:
                  "1px solid #d2d2d2",

                borderRadius: "8px",

                background: "#ffffff",

                color: "#000000",

                fontSize: "16px",

                outline: "none",

                boxSizing:
                  "border-box",
              }}
            />
          </div>

          {/* BACKGROUND */}

          <ImageField
            label="Background Image *"
            value={form.bgImage}
            onChange={(value) =>
              updateField(
                "bgImage",
                value
              )
            }
          />

          {/* CARD */}

          <ImageField
            label="Card Image *"
            value={form.cardImage}
            onChange={(value) =>
              updateField(
                "cardImage",
                value
              )
            }
          />

          {/* ACTIVE */}

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
              Banner Status
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

                height: "50px",

                padding:
                  "0 15px",

                border:
                  "1px solid #d2d2d2",

                borderRadius: "8px",

                background: "#ffffff",

                color: "#000000",

                display: "flex",

                alignItems: "center",

                justifyContent:
                  "space-between",

                cursor: "pointer",
              }}
            >
              <span
                style={{
                  color: "#000000",

                  fontSize: "16px",

                  fontWeight: 600,
                }}
              >
                {form.isActive
                  ? "Active"
                  : "Inactive"}
              </span>

              {form.isActive ? (
                <ToggleRight
                  size={30}
                />
              ) : (
                <ToggleLeft
                  size={30}
                />
              )}
            </button>
          </div>

          {/* FOOTER */}

          <div
            style={{
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

                padding:
                  "0 22px",

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

                minWidth: "130px",

                padding:
                  "0 22px",

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

                cursor: saving
                  ? "not-allowed"
                  : "pointer",

                opacity: saving
                  ? 0.55
                  : 1,
              }}
            >
              {saving && (
                <Loader2
                  size={18}
                  style={{
                    animation:
                      "showcase-spin 0.8s linear infinite",
                  }}
                />
              )}

              {saving
                ? "Saving..."
                : "Save Banner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function AdminShowcaseBanner() {
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
          "/showcase-banner/admin"
        );

      const banners =
        Array.isArray(response?.data)
          ? response.data
          : [];

      setItems(banners);
    } catch (error) {
      console.error(
        "Showcase load error:",
        error
      );

      setError(
        error?.message ||
          "Failed to load showcase banners."
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
        `/showcase-banner/admin/${form._id}`,
        {
          method: "PUT",

          body: JSON.stringify(
            form
          ),
        }
      );
    } else {
      await apiFetch(
        "/showcase-banner/admin",
        {
          method: "POST",

          body: JSON.stringify(
            form
          ),
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
        "Delete this showcase banner?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await apiFetch(
        `/showcase-banner/admin/${id}`,
        {
          method: "DELETE",
        }
      );

      await load();
    } catch (error) {
      console.error(error);

      alert(
        error?.message ||
          "Failed to delete banner."
      );
    }
  };

  /* =======================================================
     TOGGLE
  ======================================================= */

  const toggle = async (id) => {
    try {
      await apiFetch(
        `/showcase-banner/admin/${id}/toggle`,
        {
          method: "PATCH",
        }
      );

      await load();
    } catch (error) {
      console.error(error);

      alert(
        error?.message ||
          "Failed to update banner."
      );
    }
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <AdminShell pageTitle="Showcase Banner">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .showcase-scroll {
          scrollbar-width: thin;
          scrollbar-color: #bcbcbc transparent;
        }

        .showcase-scroll::-webkit-scrollbar {
          width: 7px;
        }

        .showcase-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .showcase-scroll::-webkit-scrollbar-thumb {
          background: #bcbcbc;
          border-radius: 20px;
        }

        .showcase-scroll::-webkit-scrollbar-thumb:hover {
          background: #888888;
        }

        .showcase-image-overlay:hover {
          opacity: 1 !important;
          background: rgba(0,0,0,0.45) !important;
        }

        .showcase-card:hover {
          box-shadow:
            0 7px 24px rgba(0,0,0,0.08) !important;
        }

        .showcase-input:focus {
          border-color: #000000 !important;
          box-shadow:
            0 0 0 2px rgba(0,0,0,0.06);
        }

        .showcase-action:hover {
          background: #f5f5f5 !important;
          border-color: #aaaaaa !important;
        }

        .showcase-primary:hover {
          opacity: 0.86;
        }

        @keyframes showcase-spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 900px) {
          .showcase-page {
            padding: 22px 20px 35px !important;
          }

          .showcase-header {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .showcase-add {
            width: 100% !important;
          }

          .showcase-card {
            height: 128px !important;
            min-height: 128px !important;
          }

          .showcase-bg {
            width: 140px !important;
            min-width: 140px !important;
          }
        }

        @media (max-width: 680px) {
          .showcase-page {
            padding: 18px 14px 30px !important;
          }

          .showcase-header h1 {
            font-size: 27px !important;
          }

          .showcase-card {
            height: 112px !important;
            min-height: 112px !important;
            padding: 10px !important;
            gap: 10px !important;
          }

          .showcase-bg {
            width: 100px !important;
            min-width: 100px !important;
            height: 72px !important;
          }

          .showcase-card-image {
            width: 44px !important;
            min-width: 44px !important;
            height: 60px !important;
          }

          .showcase-status {
            display: none !important;
          }

          .showcase-title {
            font-size: 16px !important;
          }

          .showcase-product {
            font-size: 14px !important;
          }
        }

        @media (max-width: 480px) {
          .showcase-bg {
            width: 78px !important;
            min-width: 78px !important;
          }

          .showcase-card-image {
            display: none !important;
          }

          .showcase-action {
            width: 34px !important;
            height: 34px !important;
          }

          .showcase-action svg {
            width: 16px !important;
            height: 16px !important;
          }

          .showcase-card {
            gap: 8px !important;
          }
        }
      `}</style>

      {/* =====================================================
          PAGE CONTAINER
      ===================================================== */}

      <div
        className="showcase-page"
        style={{
          width: "100%",

          maxWidth: "1180px",

          margin: "0 auto",

          padding:
            "30px 30px 40px",

          boxSizing:
            "border-box",
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="showcase-header"
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
              Showcase Banner
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
              Manage the product
              spotlight section on
              your homepage
            </p>
          </div>

          {/* ADD BUTTON */}

          <button
            type="button"
            className="showcase-primary showcase-add"
            onClick={() =>
              setModal("new")
            }
            style={{
              height: "48px",

              minWidth: "155px",

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

            Add Banner
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
            <span>
              {error}
            </span>

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
                  "showcase-spin 0.8s linear infinite",
              }}
            />

            <span
              style={{
                color: "#000000",

                fontSize: "16px",

                fontWeight: 600,
              }}
            >
              Loading showcase banners...
            </span>
          </div>
        )}

        {/* =================================================
            EMPTY STATE
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
                <ImageIcon
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
                No showcase banner yet
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
                Create a banner to
                showcase a product on
                your homepage.
              </p>

              <button
                type="button"
                onClick={() =>
                  setModal("new")
                }
                style={{
                  height: "46px",

                  marginTop: "6px",

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

                Create Banner
              </button>
            </div>
          )}

        {/* =================================================
            BANNER LIST
        ================================================= */}

        {!loading &&
          !error &&
          items.length > 0 && (
            <div
              className="showcase-scroll"
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

                  paddingBottom:
                    "8px",
                }}
              >
                {items.map(
                  (item) => (
                    <div
                      key={item._id}
                      className="showcase-card"
                      style={{
                        width: "100%",

                        height: "138px",

                        minHeight: "138px",

                        maxHeight: "138px",

                        padding:
                          "16px 18px",

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
                          "center",

                        gap: "16px",

                        overflow:
                          "hidden",

                        boxSizing:
                          "border-box",

                        opacity:
                          item.isActive
                            ? 1
                            : 0.55,

                        transition:
                          "box-shadow 0.2s ease",
                      }}
                    >
                      {/* BACKGROUND IMAGE */}

                      <div
                        className="showcase-bg"
                        style={{
                          width: "175px",

                          minWidth:
                            "175px",

                          height: "96px",

                          borderRadius:
                            "10px",

                          overflow:
                            "hidden",

                          background:
                            "#eeeeee",

                          border:
                            "1px solid #e0e0e0",

                          flexShrink: 0,
                        }}
                      >
                        {item.bgImage ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}

                            <img
                              src={
                                item.bgImage
                              }
                              alt=""
                              style={{
                                width:
                                  "100%",

                                height:
                                  "100%",

                                objectFit:
                                  "cover",

                                display:
                                  "block",
                              }}
                            />
                          </>
                        ) : (
                          <div
                            style={{
                              width:
                                "100%",

                              height:
                                "100%",

                              display:
                                "flex",

                              alignItems:
                                "center",

                              justifyContent:
                                "center",

                              color:
                                "#000000",

                              opacity: 0.35,
                            }}
                          >
                            <ImageIcon
                              size={28}
                            />
                          </div>
                        )}
                      </div>

                      {/* CARD IMAGE */}

                      <div
                        className="showcase-card-image"
                        style={{
                          width: "58px",

                          minWidth:
                            "58px",

                          height: "76px",

                          borderRadius:
                            "8px",

                          overflow:
                            "hidden",

                          background:
                            "#eeeeee",

                          border:
                            "1px solid #dddddd",

                          flexShrink: 0,
                        }}
                      >
                        {item.cardImage ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}

                            <img
                              src={
                                item.cardImage
                              }
                              alt=""
                              style={{
                                width:
                                  "100%",

                                height:
                                  "100%",

                                objectFit:
                                  "cover",

                                display:
                                  "block",
                              }}
                            />
                          </>
                        ) : (
                          <div
                            style={{
                              width:
                                "100%",

                              height:
                                "100%",

                              display:
                                "flex",

                              alignItems:
                                "center",

                              justifyContent:
                                "center",

                              color:
                                "#000000",

                              opacity: 0.35,
                            }}
                          >
                            <ImageIcon
                              size={20}
                            />
                          </div>
                        )}
                      </div>

                      {/* INFORMATION */}

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
                            "center",

                          overflow:
                            "hidden",
                        }}
                      >
                        <p
                          className="showcase-title"
                          title={
                            item.title ||
                            ""
                          }
                          style={{
                            margin: 0,

                            color:
                              "#000000",

                            fontSize:
                              "18px",

                            lineHeight:
                              "1.35",

                            fontWeight:
                              700,

                            overflow:
                              "hidden",

                            textOverflow:
                              "ellipsis",

                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {item.title ||
                            "Untitled Banner"}
                        </p>

                        <p
                          className="showcase-product"
                          title={
                            item.productName ||
                            ""
                          }
                          style={{
                            margin:
                              "7px 0 0",

                            color:
                              "#000000",

                            opacity: 0.62,

                            fontSize:
                              "16px",

                            lineHeight:
                              "1.35",

                            fontWeight:
                              400,

                            overflow:
                              "hidden",

                            textOverflow:
                              "ellipsis",

                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {item.productName ||
                            "No product name"}
                        </p>
                      </div>

                      {/* STATUS */}

                      <div
                        className="showcase-status"
                        style={{
                          width: "90px",

                          minWidth: "90px",

                          display:
                            "flex",

                          alignItems:
                            "center",

                          justifyContent:
                            "center",

                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            width: "78px",

                            height: "34px",

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
                          className="showcase-action"
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
                          className="showcase-action"
                          title="Edit banner"
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
                          className="showcase-action"
                          title="Delete banner"
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

        {/* =================================================
            NOTE
        ================================================= */}

        {!loading &&
          !error &&
          items.length > 0 && (
            <div
              style={{
                width: "100%",

                marginTop: "15px",

                padding:
                  "14px 17px",

                border:
                  "1px solid #dedede",

                borderRadius: "10px",

                background: "#fafafa",

                color: "#000000",

                fontSize: "15px",

                lineHeight: "1.5",

                boxSizing:
                  "border-box",
              }}
            >
              <strong>
                Note:
              </strong>{" "}
              Only the latest active
              showcase banner is shown
              on the homepage.
            </div>
          )}
      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {modal && (
        <ShowcaseModal
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

