"use client";

import { useState, useEffect, useRef } from "react";
import AdminShell from "./AdminShell";

import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  ToggleLeft,
  ToggleRight,
  GripVertical,
  X,
  Upload,
  Loader2,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

/* =========================================================
   API
========================================================= */

function getToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("adminAccessToken") ||
    localStorage.getItem("accessToken")
  );
}

async function apiFetch(path, opts = {}) {
  const token = getToken();

  const res = await fetch(`${API}${path}`, {
    ...opts,

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts.headers || {}),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error ||
        data.message ||
        "Request failed"
    );
  }

  return data;
}

/* =========================================================
   IMAGE UPLOAD
========================================================= */

async function uploadImage(file) {
  const { data } = await apiFetch(
    "/upload/presign",
    {
      method: "POST",

      body: JSON.stringify({
        mimeType: file.type,
        fileSize: file.size,
        folder: "banners",
      }),
    }
  );

  await fetch(data.uploadUrl, {
    method: "PUT",

    headers: {
      "Content-Type": file.type,
    },

    body: file,
  });

  return data.publicUrl;
}

/* =========================================================
   EMPTY BANNER
========================================================= */

const emptyBanner = () => ({
  title: "",
  headline: "",
  subtext: "",
  image: "",

  isActive: true,

  order: 0,

  buttons: [
    {
      label: "Explore The Collection",
      href: "/collection",
      style: "primary",
    },

    {
      label: "Our Story",
      href: "/our-story",
      style: "secondary",
    },
  ],
});

/* =========================================================
   BUTTON EDITOR
========================================================= */

function ButtonEditor({
  buttons,
  onChange,
}) {
  const update = (
    index,
    key,
    value
  ) => {
    const next = buttons.map(
      (button, i) =>
        i === index
          ? {
              ...button,
              [key]: value,
            }
          : button
    );

    onChange(next);
  };

  const add = () => {
    onChange([
      ...buttons,

      {
        label: "",
        href: "/",
        style: "primary",
      },
    ]);
  };

  const remove = (index) => {
    onChange(
      buttons.filter(
        (_, i) => i !== index
      )
    );
  };

  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* LABEL */}

      <label
        style={{
          display: "block",

          marginBottom: "12px",

          color: "#000000",

          fontSize: "16px",
          fontWeight: 700,

          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Buttons
      </label>

      {/* BUTTON LIST */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",

          gap: "12px",
        }}
      >
        {buttons.map(
          (btn, i) => (
            <div
              key={i}
              style={{
                width: "100%",

                display: "flex",
                alignItems: "center",

                gap: "10px",
              }}
            >
              <input
                className="nhf-input"
                placeholder="Button label"
                value={btn.label}
                onChange={(e) =>
                  update(
                    i,
                    "label",
                    e.target.value
                  )
                }
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              />

              <input
                className="nhf-input"
                placeholder="/collection"
                value={btn.href}
                onChange={(e) =>
                  update(
                    i,
                    "href",
                    e.target.value
                  )
                }
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              />

              <select
                className="nhf-input"
                value={btn.style}
                onChange={(e) =>
                  update(
                    i,
                    "style",
                    e.target.value
                  )
                }
                style={{
                  width: "140px",
                  flexShrink: 0,
                }}
              >
                <option value="primary">
                  Primary
                </option>

                <option value="secondary">
                  Secondary
                </option>
              </select>

              <button
                type="button"
                onClick={() =>
                  remove(i)
                }
                title="Remove button"
                style={{
                  width: "40px",
                  height: "42px",

                  border: "1px solid #dddddd",
                  borderRadius: "8px",

                  background: "#ffffff",
                  color: "#000000",

                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",

                  cursor: "pointer",

                  flexShrink: 0,
                }}
              >
                <X size={18} />
              </button>
            </div>
          )
        )}
      </div>

      {/* ADD BUTTON */}

      {buttons.length < 4 && (
        <button
          type="button"
          onClick={add}
          style={{
            marginTop: "14px",

            height: "40px",

            padding: "0 14px",

            border: "1px solid #dddddd",
            borderRadius: "8px",

            background: "#ffffff",
            color: "#000000",

            display: "inline-flex",
            alignItems: "center",

            gap: "7px",

            fontSize: "15px",
            fontWeight: 600,

            cursor: "pointer",
          }}
        >
          <Plus size={16} />

          Add Button
        </button>
      )}
    </div>
  );
}

/* =========================================================
   IMAGE UPLOADER
========================================================= */

function ImageUploader({
  value,
  onChange,
}) {
  const [uploading, setUploading] =
    useState(false);

  const [drag, setDrag] =
    useState(false);

  const inputRef = useRef();

  const handle = async (file) => {
    if (!file) return;

    setUploading(true);

    try {
      const url =
        await uploadImage(file);

      onChange(url);
    } catch (e) {
      alert(
        "Upload failed: " +
          e.message
      );
    } finally {
      setUploading(false);
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

          marginBottom: "12px",

          color: "#000000",

          fontSize: "16px",
          fontWeight: 700,

          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Banner Image
      </label>

      {/* DROP AREA */}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() =>
          setDrag(false)
        }
        onDrop={(e) => {
          e.preventDefault();

          setDrag(false);

          handle(
            e.dataTransfer
              .files?.[0]
          );
        }}
        onClick={() =>
          !value &&
          inputRef.current?.click()
        }
        style={{
          position: "relative",

          width: "100%",

          aspectRatio: "16 / 6",

          minHeight: "180px",

          border: drag
            ? "2px dashed #000000"
            : "2px dashed #d8d8d8",

          borderRadius: "12px",

          background: drag
            ? "#f7f7f7"
            : "#fafafa",

          overflow: "hidden",

          cursor: value
            ? "default"
            : "pointer",

          boxSizing: "border-box",

          transition:
            "all 0.2s ease",
        }}
      >
        {/* UPLOADING */}

        {uploading && (
          <div
            style={{
              position: "absolute",

              inset: 0,

              zIndex: 10,

              background:
                "rgba(255,255,255,0.88)",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              flexDirection: "column",

              gap: "10px",
            }}
          >
            <Loader2
              size={30}
              style={{
                animation:
                  "nhfSpin 0.8s linear infinite",
                color: "#000000",
              }}
            />

            <span
              style={{
                color: "#000000",

                fontSize: "15px",
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
              alt="Banner preview"
              style={{
                position: "absolute",

                inset: 0,

                width: "100%",
                height: "100%",

                objectFit: "cover",
              }}
            />

            {/* OVERLAY */}

            <div
              style={{
                position: "absolute",

                inset: 0,

                background:
                  "rgba(0,0,0,0)",

                display: "flex",

                alignItems: "center",
                justifyContent:
                  "center",

                gap: "10px",

                opacity: 0,

                transition:
                  "all 0.2s ease",
              }}
              className="nhf-image-overlay"
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();

                  inputRef.current?.click();
                }}
                style={{
                  height: "42px",

                  padding: "0 16px",

                  border: "none",
                  borderRadius: "8px",

                  background: "#ffffff",
                  color: "#000000",

                  display: "inline-flex",
                  alignItems: "center",

                  gap: "7px",

                  fontSize: "15px",
                  fontWeight: 600,

                  cursor: "pointer",

                  boxShadow:
                    "0 4px 15px rgba(0,0,0,0.15)",
                }}
              >
                <Upload size={16} />

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

                  padding: "0 16px",

                  border: "none",
                  borderRadius: "8px",

                  background: "#ffffff",
                  color: "#000000",

                  display: "inline-flex",
                  alignItems: "center",

                  gap: "7px",

                  fontSize: "15px",
                  fontWeight: 600,

                  cursor: "pointer",

                  boxShadow:
                    "0 4px 15px rgba(0,0,0,0.15)",
                }}
              >
                <X size={16} />

                Remove
              </button>
            </div>
          </>
        ) : (
          <div
            style={{
              position: "absolute",

              inset: 0,

              display: "flex",
              flexDirection: "column",

              alignItems: "center",
              justifyContent: "center",

              gap: "8px",

              color: "#000000",
            }}
          >
            <div
              style={{
                width: "52px",
                height: "52px",

                borderRadius: "12px",

                background: "#eeeeee",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Upload size={24} />
            </div>

            <p
              style={{
                margin: 0,

                color: "#000000",

                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              Click or drag image here
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
              PNG, JPG, WEBP up to 10MB
            </p>
          </div>
        )}
      </div>

      {/* URL */}

      {!value && (
        <input
          className="nhf-input"
          placeholder="Or paste image URL directly"
          onBlur={(e) => {
            const value =
              e.target.value.trim();

            if (value) {
              onChange(value);
            }
          }}
          style={{
            width: "100%",
            marginTop: "12px",
          }}
        />
      )}

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
   BANNER MODAL
========================================================= */

function BannerModal({
  banner,
  onClose,
  onSave,
}) {
  const [form, setForm] =
    useState(
      banner || emptyBanner()
    );

  const [saving, setSaving] =
    useState(false);

  const set = (
    key,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form.image) {
      return alert(
        "Please upload or provide a banner image."
      );
    }

    setSaving(true);

    try {
      await onSave(form);

      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",

        inset: 0,

        zIndex: 100,

        padding: "24px",

        background:
          "rgba(0,0,0,0.55)",

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

          maxWidth: "760px",

          height: "min(900px, 92vh)",

          background: "#ffffff",

          borderRadius: "16px",

          boxShadow:
            "0 20px 60px rgba(0,0,0,0.25)",

          display: "flex",
          flexDirection: "column",

          overflow: "hidden",
        }}
      >
        {/* MODAL HEADER */}

        <div
          style={{
            height: "78px",
            minHeight: "78px",

            padding: "0 26px",

            borderBottom:
              "1px solid #e5e5e5",

            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",

            boxSizing: "border-box",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,

                color: "#000000",

                fontSize: "23px",
                lineHeight: "1.25",
                fontWeight: 700,
              }}
            >
              {banner?._id
                ? "Edit Banner"
                : "New Banner"}
            </h2>

            <p
              style={{
                margin: "4px 0 0",

                color: "#000000",
                opacity: 0.55,

                fontSize: "14px",
              }}
            >
              Configure your homepage
              hero banner
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: "40px",
              height: "40px",

              border: "1px solid #dddddd",
              borderRadius: "8px",

              background: "#ffffff",
              color: "#000000",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY */}

        <form
          onSubmit={submit}
          style={{
            flex: 1,

            minHeight: 0,

            overflowY: "auto",

            padding: "26px",

            boxSizing: "border-box",

            display: "flex",
            flexDirection: "column",

            gap: "24px",
          }}
        >
          {/* TITLE */}

          <div>
            <label
              style={{
                display: "block",

                marginBottom: "9px",

                color: "#000000",

                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              Internal Title *
            </label>

            <input
              required
              className="nhf-input"
              placeholder="e.g. Summer Sale Banner"
              value={form.title}
              onChange={(e) =>
                set(
                  "title",
                  e.target.value
                )
              }
              style={{
                width: "100%",
              }}
            />
          </div>

          {/* IMAGE */}

          <ImageUploader
            value={form.image}
            onChange={(value) =>
              set("image", value)
            }
          />

          {/* HEADLINE */}

          <div>
            <label
              style={{
                display: "block",

                marginBottom: "9px",

                color: "#000000",

                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              Headline *
            </label>

            <input
              required
              className="nhf-input"
              placeholder="Every Thread Carries A Story..."
              value={form.headline}
              onChange={(e) =>
                set(
                  "headline",
                  e.target.value
                )
              }
              style={{
                width: "100%",
              }}
            />
          </div>

          {/* SUBTEXT */}

          <div>
            <label
              style={{
                display: "block",

                marginBottom: "9px",

                color: "#000000",

                fontSize: "16px",
                fontWeight: 700,
              }}
            >
              Subtext
            </label>

            <textarea
              rows={3}
              className="nhf-input"
              placeholder="Short description below the headline..."
              value={form.subtext}
              onChange={(e) =>
                set(
                  "subtext",
                  e.target.value
                )
              }
              style={{
                width: "100%",

                resize: "vertical",

                minHeight: "90px",
              }}
            />
          </div>

          {/* BUTTONS */}

          <ButtonEditor
            buttons={form.buttons}
            onChange={(value) =>
              set(
                "buttons",
                value
              )
            }
          />

          {/* ORDER + ACTIVE */}

          <div
            style={{
              display: "grid",

              gridTemplateColumns:
                "1fr 1fr",

              gap: "18px",

              paddingTop: "4px",
            }}
          >
            {/* ORDER */}

            <div>
              <label
                style={{
                  display: "block",

                  marginBottom: "9px",

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
                className="nhf-input"
                value={form.order}
                onChange={(e) =>
                  set(
                    "order",
                    Number(
                      e.target.value
                    )
                  )
                }
                style={{
                  width: "100%",
                }}
              />
            </div>

            {/* ACTIVE */}

            <div>
              <label
                style={{
                  display: "block",

                  marginBottom: "9px",

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
                  set(
                    "isActive",
                    !form.isActive
                  )
                }
                style={{
                  width: "100%",
                  height: "44px",

                  padding: "0 14px",

                  border: "1px solid #dddddd",
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
                    fontSize: "15px",
                    fontWeight: 600,
                  }}
                >
                  {form.isActive
                    ? "Active"
                    : "Inactive"}
                </span>

                {form.isActive ? (
                  <ToggleRight
                    size={28}
                  />
                ) : (
                  <ToggleLeft
                    size={28}
                  />
                )}
              </button>
            </div>
          </div>

          {/* FOOTER */}

          <div
            style={{
              minHeight: "70px",

              marginTop: "4px",

              paddingTop: "18px",

              borderTop:
                "1px solid #e5e5e5",

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
              className="nhf-btn-outline"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="nhf-btn-primary"
            >
              {saving && (
                <Loader2
                  size={17}
                  style={{
                    animation:
                      "nhfSpin 0.8s linear infinite",
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
   MAIN COMPONENT
========================================================= */

export default function AdminBannerManager() {
  const [banners, setBanners] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [modal, setModal] =
    useState(null);

  /* =======================================================
     LOAD
  ======================================================= */

  const load = async () => {
    try {
      const { data } =
        await apiFetch(
          "/banners/admin"
        );

      setBanners(data);
    } catch (e) {
      console.error(e);
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
        `/banners/admin/${form._id}`,
        {
          method: "PUT",

          body: JSON.stringify(
            form
          ),
        }
      );
    } else {
      await apiFetch(
        "/banners/admin",
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
    if (
      !confirm(
        "Delete this banner?"
      )
    ) {
      return;
    }

    try {
      await apiFetch(
        `/banners/admin/${id}`,
        {
          method: "DELETE",
        }
      );

      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  /* =======================================================
     TOGGLE
  ======================================================= */

  const toggle = async (id) => {
    try {
      await apiFetch(
        `/banners/admin/${id}/toggle`,
        {
          method: "PATCH",
        }
      );

      await load();
    } catch (e) {
      alert(e.message);
    }
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <AdminShell pageTitle="Banners">
      <style>{`
        /* =================================================
           INPUTS
        ================================================= */

        .nhf-input {
          width: 100%;

          min-height: 46px;

          box-sizing: border-box;

          border: 1px solid #d8d8d8;

          border-radius: 8px;

          padding: 0 14px;

          background: #ffffff;

          color: #000000;

          font-size: 16px;

          font-weight: 500;

          outline: none;

          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease;
        }

        .nhf-input::placeholder {
          color: #000000;
          opacity: 0.4;
        }

        .nhf-input:focus {
          border-color: #000000;

          box-shadow:
            0 0 0 2px
            rgba(0,0,0,0.08);
        }

        textarea.nhf-input {
          padding-top: 12px;
          padding-bottom: 12px;

          line-height: 1.5;
        }

        select.nhf-input {
          cursor: pointer;
        }

        /* =================================================
           PRIMARY BUTTON
        ================================================= */

        .nhf-btn-primary {
          height: 46px;

          padding: 0 20px;

          border: none;

          border-radius: 8px;

          background: #000000;

          color: #ffffff;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 8px;

          font-size: 16px;

          font-weight: 700;

          cursor: pointer;

          transition:
            opacity 0.15s ease,
            transform 0.15s ease;
        }

        .nhf-btn-primary:hover {
          opacity: 0.85;
        }

        .nhf-btn-primary:active {
          transform: translateY(1px);
        }

        .nhf-btn-primary:disabled {
          opacity: 0.5;

          cursor: not-allowed;
        }

        /* =================================================
           OUTLINE BUTTON
        ================================================= */

        .nhf-btn-outline {
          height: 46px;

          padding: 0 20px;

          border: 1px solid #cccccc;

          border-radius: 8px;

          background: #ffffff;

          color: #000000;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          font-size: 16px;

          font-weight: 600;

          cursor: pointer;

          transition:
            border-color 0.15s ease,
            background 0.15s ease;
        }

        .nhf-btn-outline:hover {
          border-color: #000000;

          background: #f8f8f8;
        }

        /* =================================================
           IMAGE HOVER
        ================================================= */

        .nhf-image-overlay:hover {
          opacity: 1 !important;

          background:
            rgba(0,0,0,0.42) !important;
        }

        /* =================================================
           BANNER SCROLLBAR
        ================================================= */

        .nhf-banner-scroll {
          scrollbar-width: thin;

          scrollbar-color:
            #bdbdbd transparent;
        }

        .nhf-banner-scroll::-webkit-scrollbar {
          width: 7px;
        }

        .nhf-banner-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .nhf-banner-scroll::-webkit-scrollbar-thumb {
          background: #c7c7c7;

          border-radius: 10px;
        }

        .nhf-banner-scroll::-webkit-scrollbar-thumb:hover {
          background: #999999;
        }

        /* =================================================
           SPIN
        ================================================= */

        @keyframes nhfSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        /* =================================================
           RESPONSIVE
        ================================================= */

        @media (max-width: 900px) {
          .nhf-banner-container {
            padding: 20px !important;
          }

          .nhf-banner-header {
            height: auto !important;

            flex-direction: column !important;

            align-items: stretch !important;

            gap: 18px !important;
          }

          .nhf-add-button {
            width: 100% !important;
          }

          .nhf-banner-card {
            height: auto !important;

            min-height: 120px !important;
          }

          .nhf-button-editor-row {
            flex-direction: column !important;

            align-items: stretch !important;
          }

          .nhf-button-editor-row > * {
            width: 100% !important;
          }
        }

        @media (max-width: 600px) {
          .nhf-banner-container {
            padding: 14px !important;
          }

          .nhf-modal-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* =====================================================
          PAGE
      ===================================================== */}

      <div
        className="nhf-banner-container"
        style={{
          width: "100%",

          maxWidth: "1180px",

          margin: "0 auto",

          padding:
            "28px 30px 40px",

          boxSizing: "border-box",
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="nhf-banner-header"
          style={{
            minHeight: "72px",

            marginBottom: "24px",

            display: "flex",
            alignItems: "center",

            justifyContent:
              "space-between",

            gap: "20px",
          }}
        >
          <div
            style={{
              minWidth: 0,
            }}
          >
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
              Hero Banners
            </h1>

            <p
              style={{
                margin:
                  "8px 0 0",

                color: "#000000",

                opacity: 0.65,

                fontSize: "17px",

                lineHeight: "1.5",

                fontWeight: 400,
              }}
            >
              Manage homepage hero
              slides and banner content
            </p>
          </div>

          {/* ADD */}

          <button
            onClick={() =>
              setModal("new")
            }
            className="nhf-btn-primary nhf-add-button"
            style={{
              minWidth: "145px",
            }}
          >
            <Plus size={18} />

            Add Banner
          </button>
        </div>

        {/* =================================================
            BANNER LIST
        ================================================= */}

        {loading ? (
          <div
            style={{
              width: "100%",

              height: "400px",

              border:
                "1px solid #dddddd",

              borderRadius: "14px",

              background: "#ffffff",

              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",

              flexDirection: "column",

              gap: "12px",
            }}
          >
            <Loader2
              size={32}
              style={{
                color: "#000000",

                animation:
                  "nhfSpin 0.8s linear infinite",
              }}
            />

            <span
              style={{
                color: "#000000",

                fontSize: "16px",
                fontWeight: 600,
              }}
            >
              Loading banners...
            </span>
          </div>
        ) : banners.length === 0 ? (
          /* EMPTY */

          <div
            style={{
              width: "100%",

              height: "420px",

              border:
                "2px dashed #dddddd",

              borderRadius: "16px",

              background: "#ffffff",

              display: "flex",
              flexDirection: "column",

              alignItems: "center",
              justifyContent:
                "center",

              gap: "12px",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",

                borderRadius: "14px",

                background: "#f0f0f0",

                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ImageIcon
                size={32}
                color="#000000"
              />
            </div>

            <h3
              style={{
                margin: 0,

                color: "#000000",

                fontSize: "21px",
                fontWeight: 700,
              }}
            >
              No banners yet
            </h3>

            <p
              style={{
                margin: 0,

                color: "#000000",

                opacity: 0.6,

                fontSize: "16px",
              }}
            >
              Create your first
              homepage banner
            </p>

            <button
              onClick={() =>
                setModal("new")
              }
              className="nhf-btn-primary"
              style={{
                marginTop: "8px",
              }}
            >
              <Plus size={18} />

              Create Banner
            </button>
          </div>
        ) : (
          /* LIST */

          <div
            className="nhf-banner-scroll"
            style={{
              width: "100%",

              height:
                "calc(100vh - 210px)",

              minHeight: "420px",

              maxHeight: "760px",

              overflowY: "auto",

              overflowX: "hidden",

              paddingRight: "8px",

              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",

                gap: "14px",

                paddingBottom: "10px",
              }}
            >
              {banners.map(
                (b) => (
                  <div
                    key={b._id}
                    className="nhf-banner-card"
                    style={{
                      width: "100%",

                      height: "138px",
                      minHeight: "138px",
                      maxHeight: "138px",

                      boxSizing:
                        "border-box",

                      display: "flex",
                      alignItems: "center",

                      gap: "18px",

                      padding:
                        "16px 18px",

                      background:
                        "#ffffff",

                      border:
                        "1px solid #dddddd",

                      borderRadius: "14px",

                      boxShadow:
                        "0 2px 10px rgba(0,0,0,0.04)",

                      opacity:
                        b.isActive
                          ? 1
                          : 0.55,

                      overflow: "hidden",

                      transition:
                        "box-shadow 0.2s ease",
                    }}
                  >
                    {/* DRAG */}

                    <div
                      style={{
                        width: "30px",

                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",

                        flexShrink: 0,

                        color: "#000000",

                        opacity: 0.4,
                      }}
                    >
                      <GripVertical
                        size={20}
                      />
                    </div>

                    {/* THUMBNAIL */}

                    <div
                      style={{
                        width: "170px",
                        height: "96px",

                        minWidth: "170px",

                        borderRadius:
                          "10px",

                        overflow:
                          "hidden",

                        background:
                          "#eeeeee",

                        flexShrink: 0,

                        border:
                          "1px solid #e5e5e5",
                      }}
                    >
                      {b.image ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}

                          <img
                            src={b.image}
                            alt={
                              b.title ||
                              "Banner"
                            }
                            style={{
                              width: "100%",
                              height: "100%",

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
                            width: "100%",
                            height: "100%",

                            display: "flex",
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

                    {/* INFO */}

                    <div
                      style={{
                        flex: 1,

                        minWidth: 0,

                        height: "100%",

                        display: "flex",
                        flexDirection:
                          "column",

                        justifyContent:
                          "center",

                        overflow:
                          "hidden",
                      }}
                    >
                      {/* TITLE */}

                      <p
                        title={b.title}
                        style={{
                          margin: 0,

                          color:
                            "#000000",

                          fontSize:
                            "18px",

                          fontWeight: 700,

                          lineHeight:
                            "1.3",

                          overflow:
                            "hidden",

                          textOverflow:
                            "ellipsis",

                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {b.title ||
                          "Untitled Banner"}
                      </p>

                      {/* HEADLINE */}

                      <p
                        title={
                          b.headline
                        }
                        style={{
                          margin:
                            "5px 0 0",

                          color:
                            "#000000",

                          opacity: 0.65,

                          fontSize:
                            "15px",

                          fontWeight: 500,

                          lineHeight:
                            "1.3",

                          overflow:
                            "hidden",

                          textOverflow:
                            "ellipsis",

                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {b.headline ||
                          "No headline"}
                      </p>

                      {/* BUTTON TAGS */}

                      <div
                        style={{
                          display:
                            "flex",

                          alignItems:
                            "center",

                          gap: "7px",

                          marginTop:
                            "9px",

                          overflow:
                            "hidden",
                        }}
                      >
                        {b.buttons
                          ?.slice(
                            0,
                            3
                          )
                          .map(
                            (
                              btn,
                              i
                            ) => (
                              <span
                                key={i}
                                style={{
                                  height:
                                    "27px",

                                  padding:
                                    "0 9px",

                                  border:
                                    "1px solid #d5d5d5",

                                  borderRadius:
                                    "999px",

                                  background:
                                    "#f7f7f7",

                                  color:
                                    "#000000",

                                  display:
                                    "inline-flex",

                                  alignItems:
                                    "center",

                                  justifyContent:
                                    "center",

                                  fontSize:
                                    "12px",

                                  fontWeight:
                                    600,

                                  whiteSpace:
                                    "nowrap",

                                  flexShrink: 0,
                                }}
                              >
                                {
                                  btn.label
                                }
                              </span>
                            )
                          )}
                      </div>
                    </div>

                    {/* ORDER */}

                    <div
                      style={{
                        width: "60px",

                        flexShrink: 0,

                        display: "flex",
                        flexDirection:
                          "column",

                        alignItems:
                          "center",

                        justifyContent:
                          "center",

                        gap: "5px",
                      }}
                    >
                      <span
                        style={{
                          color:
                            "#000000",

                          opacity: 0.5,

                          fontSize:
                            "12px",

                          fontWeight: 600,

                          textTransform:
                            "uppercase",
                        }}
                      >
                        Order
                      </span>

                      <span
                        style={{
                          width: "40px",
                          height: "34px",

                          border:
                            "1px solid #dddddd",

                          borderRadius:
                            "7px",

                          background:
                            "#f8f8f8",

                          color:
                            "#000000",

                          display:
                            "flex",

                          alignItems:
                            "center",

                          justifyContent:
                            "center",

                          fontSize:
                            "15px",

                          fontWeight: 700,

                          fontFamily:
                            "monospace",
                        }}
                      >
                        #
                        {b.order}
                      </span>
                    </div>

                    {/* STATUS */}

                    <div
                      style={{
                        width: "85px",

                        flexShrink: 0,

                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                      }}
                    >
                      <span
                        style={{
                          height:
                            "30px",

                          padding:
                            "0 11px",

                          border:
                            "1px solid #cccccc",

                          borderRadius:
                            "999px",

                          background:
                            b.isActive
                              ? "#eeeeee"
                              : "#ffffff",

                          color:
                            "#000000",

                          display:
                            "inline-flex",

                          alignItems:
                            "center",

                          justifyContent:
                            "center",

                          fontSize:
                            "13px",

                          fontWeight: 700,

                          whiteSpace:
                            "nowrap",
                        }}
                      >
                        {b.isActive
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

                        gap: "6px",

                        flexShrink: 0,
                      }}
                    >
                      {/* TOGGLE */}

                      <button
                        type="button"
                        onClick={() =>
                          toggle(
                            b._id
                          )
                        }
                        title={
                          b.isActive
                            ? "Deactivate"
                            : "Activate"
                        }
                        style={{
                          width: "40px",
                          height: "40px",

                          border:
                            "1px solid #dddddd",

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
                        {b.isActive ? (
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
                        onClick={() =>
                          setModal(b)
                        }
                        title="Edit banner"
                        style={{
                          width: "40px",
                          height: "40px",

                          border:
                            "1px solid #dddddd",

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
                        onClick={() =>
                          remove(
                            b._id
                          )
                        }
                        title="Delete banner"
                        style={{
                          width: "40px",
                          height: "40px",

                          border:
                            "1px solid #dddddd",

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
        <BannerModal
          banner={
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