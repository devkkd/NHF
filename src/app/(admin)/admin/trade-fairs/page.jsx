"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Image from "next/image";

import {
  CalendarDays,
  Clock3,
  ImagePlus,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { apiFetch } from "@/lib/adminApi";
import AdminShell from "@/components/admin/AdminShell";

/* =========================================================
   EMPTY FORM
========================================================= */

const EMPTY_FORM = {
  type: "past",
  title: "",
  description: "",
  date: "",
  dateText: "",
  venue: "",
  timing: "",
  location: "",
  sortOrder: 0,
  active: true,
};

/* =========================================================
   HELPERS
========================================================= */

function getFairImage(fair) {
  return fair?.images?.[0]?.url || "";
}

function formatDate(value) {
  if (!value) return "—";

  try {
    return new Date(value).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  } catch {
    return "—";
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function AdminTradeFairsPage() {
  const [fairs, setFairs] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  /* =======================================================
     MODAL
  ======================================================= */

  const [modalOpen, setModalOpen] =
    useState(false);

  const [modalMode, setModalMode] =
    useState("create");

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] =
    useState(EMPTY_FORM);

  const [formError, setFormError] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  /* =======================================================
     FILES
  ======================================================= */

  const [selectedFiles, setSelectedFiles] =
    useState([]);

  const fileInputRef =
    useRef(null);

  /* =======================================================
     DELETE
  ======================================================= */

  const [deleteId, setDeleteId] =
    useState(null);

  const [deleting, setDeleting] =
    useState(false);

  /* =======================================================
     IMAGE DELETE
  ======================================================= */

  const [
    deletingImageId,
    setDeletingImageId,
  ] = useState(null);

  /* =======================================================
     LOAD
  ======================================================= */

  const loadFairs = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const res =
          await apiFetch(
            "/trade-fairs/admin"
          );

        if (!res.ok) {
          setFairs([]);

          setError(
            res.data?.message ||
              res.data?.error ||
              "Failed to load trade fairs."
          );

          return;
        }

        const list =
          res.data?.data?.fairs ||
          [];

        setFairs(
          Array.isArray(list)
            ? list
            : []
        );
      } catch (err) {
        console.error(
          "TRADE FAIR LOAD ERROR:",
          err
        );

        setFairs([]);

        setError(
          err?.message ||
            "Failed to load trade fairs."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadFairs();
  }, [loadFairs]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const pastFairs = useMemo(() => {
    return fairs.filter(
      (fair) =>
        fair.type === "past"
    );
  }, [fairs]);

  const upcomingFairs =
    useMemo(() => {
      return fairs.filter(
        (fair) =>
          fair.type === "upcoming"
      );
    }, [fairs]);

  const totalImages =
    useMemo(() => {
      return fairs.reduce(
        (sum, fair) =>
          sum +
          (Array.isArray(
            fair.images
          )
            ? fair.images.length
            : 0),
        0
      );
    }, [fairs]);

  /* =======================================================
     RESET
  ======================================================= */

  const resetForm = () => {
    setForm({
      ...EMPTY_FORM,
    });

    setSelectedFiles([]);

    setEditingId(null);

    setModalMode("create");

    setFormError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* =======================================================
     CREATE
  ======================================================= */

  const openCreate = (
    type = "past"
  ) => {
    resetForm();

    setForm({
      ...EMPTY_FORM,
      type,
    });

    setModalMode("create");

    setModalOpen(true);
  };

  /* =======================================================
     EDIT
  ======================================================= */

  const openEdit = (fair) => {
    const isoDate = fair.date
      ? new Date(fair.date)
          .toISOString()
          .split("T")[0]
      : "";

    setEditingId(
      fair._id
    );

    setModalMode("edit");

    setForm({
      type:
        fair.type ||
        "past",

      title:
        fair.title ||
        "",

      description:
        fair.description ||
        "",

      date: isoDate,

      dateText:
        fair.dateText ||
        "",

      venue:
        fair.venue ||
        "",

      timing:
        fair.timing ||
        "",

      location:
        fair.location ||
        "",

      sortOrder:
        fair.sortOrder ?? 0,

      active:
        fair.active !== false,
    });

    setSelectedFiles([]);

    setFormError("");

    setModalOpen(true);
  };

  /* =======================================================
     CLOSE
  ======================================================= */

  const closeModal = () => {
    if (submitting) return;

    setModalOpen(false);

    resetForm();
  };

  /* =======================================================
     SET FIELD
  ======================================================= */

  const setField = (
    field,
    value
  ) => {
    setForm(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  };

  /* =======================================================
     FILE SELECT
  ======================================================= */

  const handleFiles = (
    event
  ) => {
    const files = Array.from(
      event.target.files || []
    );

    if (
      form.type ===
      "upcoming"
    ) {
      setSelectedFiles(
        files.slice(0, 1)
      );
    } else {
      setSelectedFiles(
        files.slice(0, 8)
      );
    }

    setFormError("");
  };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setFormError("");
      setSuccess("");

      if (
        !form.title.trim()
      ) {
        setFormError(
          "Trade fair title is required."
        );

        return;
      }

      if (
        form.type ===
          "upcoming" &&
        modalMode ===
          "create" &&
        selectedFiles.length ===
          0
      ) {
        setFormError(
          "Please upload an image for the upcoming trade fair."
        );

        return;
      }

      if (
        form.type ===
          "upcoming" &&
        selectedFiles.length >
          1
      ) {
        setFormError(
          "Upcoming trade fair can have only one image."
        );

        return;
      }

      const formData =
        new FormData();

      formData.append(
        "type",
        form.type
      );

      formData.append(
        "title",
        form.title.trim()
      );

      formData.append(
        "description",
        form.description.trim()
      );

      if (form.date) {
        formData.append(
          "date",
          form.date
        );
      }

      formData.append(
        "dateText",
        form.dateText.trim()
      );

      formData.append(
        "venue",
        form.venue.trim()
      );

      formData.append(
        "timing",
        form.timing.trim()
      );

      formData.append(
        "location",
        form.location.trim()
      );

      formData.append(
        "sortOrder",
        String(
          Number(
            form.sortOrder
          ) || 0
        )
      );

      formData.append(
        "active",
        String(
          Boolean(
            form.active
          )
        )
      );

      selectedFiles.forEach(
        (file) => {
          formData.append(
            "images",
            file
          );
        }
      );

      setSubmitting(true);

      try {
        const res =
          modalMode ===
          "edit"
            ? await apiFetch(
                `/trade-fairs/admin/${editingId}`,
                {
                  method: "PUT",
                  body: formData,
                }
              )
            : await apiFetch(
                "/trade-fairs/admin",
                {
                  method: "POST",
                  body: formData,
                }
              );

        if (!res.ok) {
          setFormError(
            res.data?.message ||
              res.data?.error ||
              "Unable to save trade fair."
          );

          return;
        }

        setModalOpen(false);

        resetForm();

        setSuccess(
          modalMode ===
          "edit"
            ? "Trade fair updated successfully."
            : "Trade fair created successfully."
        );

        await loadFairs();
      } catch (err) {
        console.error(
          "TRADE FAIR SAVE ERROR:",
          err
        );

        setFormError(
          err?.message ||
            "Something went wrong while saving the trade fair."
        );
      } finally {
        setSubmitting(false);
      }
    };

  /* =======================================================
     DELETE FAIR
  ======================================================= */

  const handleDelete =
    async (id) => {
      if (!id) return;

      setDeleting(true);
      setError("");

      try {
        const res =
          await apiFetch(
            `/trade-fairs/admin/${id}`,
            {
              method: "DELETE",
            }
          );

        if (!res.ok) {
          setError(
            res.data?.message ||
              "Failed to delete trade fair."
          );

          return;
        }

        setDeleteId(null);

        setSuccess(
          "Trade fair deleted successfully."
        );

        await loadFairs();
      } catch (err) {
        console.error(
          "TRADE FAIR DELETE ERROR:",
          err
        );

        setError(
          err?.message ||
            "Failed to delete trade fair."
        );
      } finally {
        setDeleting(false);
      }
    };

  /* =======================================================
     DELETE IMAGE
  ======================================================= */

  const handleDeleteImage =
    async (
      fairId,
      imageId
    ) => {
      if (
        !fairId ||
        !imageId
      ) {
        return;
      }

      setDeletingImageId(
        imageId
      );

      try {
        const res =
          await apiFetch(
            `/trade-fairs/admin/${fairId}/images/${imageId}`,
            {
              method: "DELETE",
            }
          );

        if (!res.ok) {
          setError(
            res.data?.message ||
              "Failed to delete image."
          );

          return;
        }

        setSuccess(
          "Image deleted successfully."
        );

        await loadFairs();
      } catch (err) {
        console.error(
          "TRADE FAIR IMAGE DELETE ERROR:",
          err
        );

        setError(
          err?.message ||
            "Failed to delete image."
        );
      } finally {
        setDeletingImageId(
          null
        );
      }
    };

  /* =======================================================
     TABLE COMPONENT
  ======================================================= */

  const renderTable = (
    title,
    data
  ) => {
    const isPast =
      title.startsWith(
        "Past"
      );

    return (
      <section
        style={{
          width: "100%",

          background:
            "#ffffff",

          border:
            "1px solid #dddddd",

          borderRadius: "12px",

          padding: "24px",

          marginBottom:
            "28px",

          boxSizing:
            "border-box",

          color: "#000000",
        }}
      >
        {/* SECTION HEADER */}

        <div
          style={{
            display: "flex",

            alignItems:
              "center",

            justifyContent:
              "space-between",

            gap: "20px",

            marginBottom:
              "20px",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,

                color: "#000000",

                fontSize: "20px",

                lineHeight:
                  "1.35",

                fontWeight: 700,
              }}
            >
              {title}
            </h2>

            <p
              style={{
                margin:
                  "7px 0 0",

                color: "#000000",

                opacity: 0.6,

                fontSize: "16px",

                lineHeight:
                  "1.4",

                fontWeight: 400,
              }}
            >
              {data.length}{" "}
              {data.length ===
              1
                ? "trade fair"
                : "trade fairs"}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              openCreate(
                isPast
                  ? "past"
                  : "upcoming"
              )
            }
            style={{
              height: "44px",

              minWidth: "90px",

              padding:
                "0 16px",

              border:
                "1px solid #000000",

              borderRadius: "8px",

              background:
                "#000000",

              color: "#ffffff",

              display: "flex",

              alignItems:
                "center",

              justifyContent:
                "center",

              gap: "7px",

              fontSize: "16px",

              fontWeight: 700,

              cursor: "pointer",
            }}
          >
            <Plus size={17} />

            Add
          </button>
        </div>

        {/* EMPTY */}

        {data.length ===
        0 ? (
          <div
            style={{
              minHeight:
                "250px",

              border:
                "1px dashed #cccccc",

              borderRadius:
                "10px",

              background:
                "#fafafa",

              display: "flex",

              flexDirection:
                "column",

              alignItems:
                "center",

              justifyContent:
                "center",

              gap: "12px",

              color:
                "#000000",
            }}
          >
            <div
              style={{
                width: "58px",

                height: "58px",

                borderRadius:
                  "12px",

                background:
                  "#eeeeee",

                display: "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",
              }}
            >
              <ImagePlus
                size={27}
              />
            </div>

            <p
              style={{
                margin: 0,

                color:
                  "#000000",

                fontSize:
                  "16px",

                fontWeight:
                  600,
              }}
            >
              No{" "}
              {title.toLowerCase()}{" "}
              added yet.
            </p>

            <button
              type="button"
              onClick={() =>
                openCreate(
                  isPast
                    ? "past"
                    : "upcoming"
                )
              }
              style={{
                border:
                  "none",

                background:
                  "transparent",

                color:
                  "#000000",

                display:
                  "flex",

                alignItems:
                  "center",

                gap: "6px",

                fontSize:
                  "15px",

                fontWeight:
                  700,

                cursor:
                  "pointer",
              }}
            >
              <Plus size={16} />

              Add first fair
            </button>
          </div>
        ) : (
          /* TABLE */

          <div
            style={{
              width: "100%",

              overflowX: "auto",

              overflowY:
                "hidden",

              border:
                "1px solid #dddddd",

              borderRadius:
                "10px",

              boxSizing:
                "border-box",
            }}
          >
            <table
              style={{
                width: "100%",

                minWidth:
                  "1100px",

                borderCollapse:
                  "collapse",

                tableLayout:
                  "fixed",

                background:
                  "#ffffff",
              }}
            >
              <thead>
                <tr>
                  {[
                    {
                      text:
                        "Image",
                      width:
                        "90px",
                    },
                    {
                      text:
                        "Title",
                      width:
                        "210px",
                    },
                    {
                      text:
                        "Description",
                      width:
                        "260px",
                    },
                    {
                      text:
                        "Date",
                      width:
                        "150px",
                    },
                    {
                      text:
                        "Venue",
                      width:
                        "200px",
                    },
                    {
                      text:
                        "Images",
                      width:
                        "90px",
                    },
                    {
                      text:
                        "Status",
                      width:
                        "120px",
                    },
                    {
                      text:
                        "Actions",
                      width:
                        "120px",
                    },
                  ].map(
                    (header) => (
                      <th
                        key={
                          header.text
                        }
                        style={{
                          width:
                            header.width,

                          height:
                            "54px",

                          padding:
                            "0 15px",

                          background:
                            "#f5f5f5",

                          borderBottom:
                            "1px solid #dddddd",

                          color:
                            "#000000",

                          fontSize:
                            "14px",

                          lineHeight:
                            "1.3",

                          fontWeight:
                            700,

                          textAlign:
                            "left",

                          whiteSpace:
                            "nowrap",

                          boxSizing:
                            "border-box",
                        }}
                      >
                        {
                          header.text
                        }
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {data.map(
                  (fair) => (
                    <tr
                      key={
                        fair._id
                      }
                    >
                      {/* IMAGE */}

                      <td
                        style={{
                          height:
                            "96px",

                          padding:
                            "14px 15px",

                          borderBottom:
                            "1px solid #e8e8e8",

                          verticalAlign:
                            "middle",
                        }}
                      >
                        {getFairImage(
                          fair
                        ) ? (
                          <Image
                            src={getFairImage(
                              fair
                            )}
                            alt={
                              fair.title ||
                              "Trade fair"
                            }
                            width={
                              64
                            }
                            height={
                              64
                            }
                            sizes="64px"
                            style={{
                              width:
                                "64px",

                              height:
                                "64px",

                              objectFit:
                                "cover",

                              borderRadius:
                                "8px",

                              border:
                                "1px solid #dddddd",

                              display:
                                "block",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width:
                                "64px",

                              height:
                                "64px",

                              border:
                                "1px solid #dddddd",

                              borderRadius:
                                "8px",

                              background:
                                "#f3f3f3",

                              color:
                                "#000000",

                              opacity:
                                0.4,

                              display:
                                "flex",

                              alignItems:
                                "center",

                              justifyContent:
                                "center",
                            }}
                          >
                            <ImagePlus
                              size={
                                22
                              }
                            />
                          </div>
                        )}
                      </td>

                      {/* TITLE */}

                      <td
                        style={{
                          padding:
                            "14px 15px",

                          borderBottom:
                            "1px solid #e8e8e8",

                          verticalAlign:
                            "middle",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",

                            flexDirection:
                              "column",

                            gap: "5px",

                            minWidth: 0,
                          }}
                        >
                          <strong
                            title={
                              fair.title ||
                              ""
                            }
                            style={{
                              color:
                                "#000000",

                              fontSize:
                                "16px",

                              lineHeight:
                                "1.4",

                              fontWeight:
                                700,

                              overflow:
                                "hidden",

                              textOverflow:
                                "ellipsis",

                              display:
                                "-webkit-box",

                              WebkitBoxOrient:
                                "vertical",

                              WebkitLineClamp:
                                2,
                            }}
                          >
                            {fair.title ||
                              "Untitled"}
                          </strong>

                          {fair.location && (
                            <span
                              title={
                                fair.location
                              }
                              style={{
                                color:
                                  "#000000",

                                opacity:
                                  0.6,

                                fontSize:
                                  "14px",

                                lineHeight:
                                  "1.35",

                                overflow:
                                  "hidden",

                                textOverflow:
                                  "ellipsis",

                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {
                                fair.location
                              }
                            </span>
                          )}
                        </div>
                      </td>

                      {/* DESCRIPTION */}

                      <td
                        style={{
                          padding:
                            "14px 15px",

                          borderBottom:
                            "1px solid #e8e8e8",

                          verticalAlign:
                            "middle",
                        }}
                      >
                        <div
                          title={
                            fair.description ||
                            ""
                          }
                          style={{
                            color:
                              "#000000",

                            opacity:
                              0.65,

                            fontSize:
                              "16px",

                            lineHeight:
                              "1.45",

                            display:
                              "-webkit-box",

                            WebkitBoxOrient:
                              "vertical",

                            WebkitLineClamp:
                              3,

                            overflow:
                              "hidden",
                          }}
                        >
                          {fair.description ||
                            "—"}
                        </div>
                      </td>

                      {/* DATE */}

                      <td
                        style={{
                          padding:
                            "14px 15px",

                          borderBottom:
                            "1px solid #e8e8e8",

                          verticalAlign:
                            "middle",

                          color:
                            "#000000",

                          fontSize:
                            "16px",

                          lineHeight:
                            "1.4",
                        }}
                      >
                        {fair.dateText ||
                          formatDate(
                            fair.date
                          )}
                      </td>

                      {/* VENUE */}

                      <td
                        style={{
                          padding:
                            "14px 15px",

                          borderBottom:
                            "1px solid #e8e8e8",

                          verticalAlign:
                            "middle",

                          color:
                            "#000000",

                          fontSize:
                            "16px",

                          lineHeight:
                            "1.4",
                        }}
                      >
                        <span
                          title={
                            fair.venue ||
                            fair.location ||
                            ""
                          }
                          style={{
                            display:
                              "block",

                            overflow:
                              "hidden",

                            textOverflow:
                              "ellipsis",

                            whiteSpace:
                              "nowrap",
                          }}
                        >
                          {fair.venue ||
                            fair.location ||
                            "—"}
                        </span>
                      </td>

                      {/* IMAGE COUNT */}

                      <td
                        style={{
                          padding:
                            "14px 15px",

                          borderBottom:
                            "1px solid #e8e8e8",

                          verticalAlign:
                            "middle",
                        }}
                      >
                        <span
                          style={{
                            minWidth:
                              "38px",

                            height:
                              "32px",

                            padding:
                              "0 9px",

                            border:
                              "1px solid #cccccc",

                            borderRadius:
                              "7px",

                            background:
                              "#f5f5f5",

                            color:
                              "#000000",

                            display:
                              "inline-flex",

                            alignItems:
                              "center",

                            justifyContent:
                              "center",

                            fontSize:
                              "15px",

                            fontWeight:
                              700,
                          }}
                        >
                          {Array.isArray(
                            fair.images
                          )
                            ? fair
                                .images
                                .length
                            : 0}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td
                        style={{
                          padding:
                            "14px 15px",

                          borderBottom:
                            "1px solid #e8e8e8",

                          verticalAlign:
                            "middle",
                        }}
                      >
                        <span
                          style={{
                            minWidth:
                              "80px",

                            height:
                              "32px",

                            padding:
                              "0 11px",

                            border:
                              "1px solid #cccccc",

                            borderRadius:
                              "999px",

                            background:
                              fair.active
                                ? "#eeeeee"
                                : "#f7f7f7",

                            color:
                              "#000000",

                            opacity:
                              fair.active
                                ? 1
                                : 0.55,

                            display:
                              "inline-flex",

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
                          {fair.active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td
                        style={{
                          padding:
                            "14px 15px",

                          borderBottom:
                            "1px solid #e8e8e8",

                          verticalAlign:
                            "middle",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",

                            alignItems:
                              "center",

                            gap: "7px",
                          }}
                        >
                          <button
                            type="button"
                            title="Edit"
                            onClick={() =>
                              openEdit(
                                fair
                              )
                            }
                            style={{
                              width:
                                "40px",

                              height:
                                "40px",

                              border:
                                "1px solid #d2d2d2",

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
                            <Pencil
                              size={
                                17
                              }
                            />
                          </button>

                          <button
                            type="button"
                            title="Delete"
                            onClick={() =>
                              setDeleteId(
                                fair._id
                              )
                            }
                            style={{
                              width:
                                "40px",

                              height:
                                "40px",

                              border:
                                "1px solid #d2d2d2",

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
                              size={
                                17
                              }
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    );
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <AdminShell pageTitle="Trade Fairs">
        <div
          style={{
            width: "100%",

            minHeight: "500px",

            display: "flex",

            flexDirection:
              "column",

            alignItems:
              "center",

            justifyContent:
              "center",

            gap: "14px",

            color:
              "#000000",

            fontSize:
              "16px",

            fontWeight:
              600,
          }}
        >
          <RefreshCw
            size={30}
            style={{
              animation:
                "tradeFairSpin 0.8s linear infinite",
            }}
          />

          Loading trade fairs...
        </div>

        <style jsx>{`
          @keyframes tradeFairSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </AdminShell>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <AdminShell pageTitle="Trade Fairs">
      <div
        style={{
          width: "100%",

          maxWidth: "1500px",

          margin: "0 auto",

          padding:
            "30px 32px 50px",

          boxSizing:
            "border-box",

          color: "#000000",
        }}
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          style={{
            width: "100%",

            minHeight: "72px",

            marginBottom:
              "28px",

            display: "flex",

            alignItems:
              "center",

            justifyContent:
              "space-between",

            gap: "24px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,

                color:
                  "#000000",

                fontSize:
                  "20px",

                lineHeight:
                  "1.35",

                fontWeight:
                  700,
              }}
            >
              Trade Fairs
            </h1>

            <p
              style={{
                margin:
                  "8px 0 0",

                color:
                  "#000000",

                opacity: 0.62,

                fontSize:
                  "16px",

                lineHeight:
                  "1.5",

                fontWeight:
                  400,
              }}
            >
              Manage past exhibitions
              and upcoming trade
              fairs.
            </p>
          </div>

          <div
            style={{
              display:
                "flex",

              alignItems:
                "center",

              gap: "10px",

              flexWrap:
                "wrap",
            }}
          >
            {/* REFRESH */}

            <button
              type="button"
              onClick={
                loadFairs
              }
              style={{
                height:
                  "44px",

                padding:
                  "0 16px",

                border:
                  "1px solid #cccccc",

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

                gap: "8px",

                fontSize:
                  "16px",

                fontWeight:
                  600,

                cursor:
                  "pointer",
              }}
            >
              <RefreshCw
                size={17}
              />

              Refresh
            </button>

            {/* ADD UPCOMING */}

            <button
              type="button"
              onClick={() =>
                openCreate(
                  "upcoming"
                )
              }
              style={{
                height:
                  "44px",

                padding:
                  "0 17px",

                border:
                  "1px solid #000000",

                borderRadius:
                  "8px",

                background:
                  "#000000",

                color:
                  "#ffffff",

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                gap: "8px",

                fontSize:
                  "16px",

                fontWeight:
                  700,

                cursor:
                  "pointer",
              }}
            >
              <Plus size={18} />

              Upcoming Fair
            </button>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div
            style={{
              width: "100%",

              minHeight:
                "54px",

              marginBottom:
                "18px",

              padding:
                "10px 15px",

              border:
                "1px solid #d5d5d5",

              borderRadius:
                "9px",

              background:
                "#fafafa",

              color:
                "#000000",

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "space-between",

              gap: "12px",

              boxSizing:
                "border-box",

              fontSize:
                "16px",
            }}
          >
            <span>
              {error}
            </span>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              style={{
                width:
                  "32px",

                height:
                  "32px",

                border:
                  "none",

                borderRadius:
                  "6px",

                background:
                  "#eeeeee",

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
              <X size={17} />
            </button>
          </div>
        )}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div
            style={{
              width: "100%",

              minHeight:
                "54px",

              marginBottom:
                "18px",

              padding:
                "10px 15px",

              border:
                "1px solid #cccccc",

              borderRadius:
                "9px",

              background:
                "#f7f7f7",

              color:
                "#000000",

              display:
                "flex",

              alignItems:
                "center",

              justifyContent:
                "space-between",

              gap: "12px",

              fontSize:
                "16px",
            }}
          >
            <span>
              {success}
            </span>

            <button
              type="button"
              onClick={() =>
                setSuccess("")
              }
              style={{
                width:
                  "32px",

                height:
                  "32px",

                border:
                  "none",

                borderRadius:
                  "6px",

                background:
                  "#eeeeee",

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
              <X size={17} />
            </button>
          </div>
        )}

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div
          style={{
            width: "100%",

            display: "grid",

            gridTemplateColumns:
              "repeat(3, minmax(0, 1fr))",

            gap: "18px",

            marginBottom:
              "30px",
          }}
        >
          {/* PAST */}

          <div
            style={{
              height:
                "116px",

              padding:
                "20px 22px",

              border:
                "1px solid #dddddd",

              borderRadius:
                "10px",

              background:
                "#ffffff",

              display:
                "flex",

              flexDirection:
                "column",

              justifyContent:
                "center",

              gap: "8px",

              boxSizing:
                "border-box",
            }}
          >
            <span
              style={{
                color:
                  "#000000",

                opacity: 0.62,

                fontSize:
                  "15px",

                fontWeight:
                  600,
              }}
            >
              Past Fairs
            </span>

            <strong
              style={{
                color:
                  "#000000",

                fontSize:
                  "28px",

                lineHeight:
                  "1",

                fontWeight:
                  700,
              }}
            >
              {
                pastFairs.length
              }
            </strong>
          </div>

          {/* UPCOMING */}

          <div
            style={{
              height:
                "116px",

              padding:
                "20px 22px",

              border:
                "1px solid #dddddd",

              borderRadius:
                "10px",

              background:
                "#ffffff",

              display:
                "flex",

              flexDirection:
                "column",

              justifyContent:
                "center",

              gap: "8px",

              boxSizing:
                "border-box",
            }}
          >
            <span
              style={{
                color:
                  "#000000",

                opacity: 0.62,

                fontSize:
                  "15px",

                fontWeight:
                  600,
              }}
            >
              Upcoming Fairs
            </span>

            <strong
              style={{
                color:
                  "#000000",

                fontSize:
                  "28px",

                lineHeight:
                  "1",

                fontWeight:
                  700,
              }}
            >
              {
                upcomingFairs.length
              }
            </strong>
          </div>

          {/* IMAGES */}

          <div
            style={{
              height:
                "116px",

              padding:
                "20px 22px",

              border:
                "1px solid #dddddd",

              borderRadius:
                "10px",

              background:
                "#ffffff",

              display:
                "flex",

              flexDirection:
                "column",

              justifyContent:
                "center",

              gap: "8px",

              boxSizing:
                "border-box",
            }}
          >
            <span
              style={{
                color:
                  "#000000",

                opacity: 0.62,

                fontSize:
                  "15px",

                fontWeight:
                  600,
              }}
            >
              Total Images
            </span>

            <strong
              style={{
                color:
                  "#000000",

                fontSize:
                  "28px",

                lineHeight:
                  "1",

                fontWeight:
                  700,
              }}
            >
              {totalImages}
            </strong>
          </div>
        </div>

        {/* =================================================
            TABLES
        ================================================= */}

        {renderTable(
          "Past Trade Fairs",
          pastFairs
        )}

        {renderTable(
          "Upcoming Trade Fairs",
          upcomingFairs
        )}
      </div>

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deleteId && (
        <div
          style={{
            position:
              "fixed",

            inset: 0,

            zIndex: 9999,

            padding:
              "20px",

            background:
              "rgba(0,0,0,0.60)",

            display: "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            boxSizing:
              "border-box",
          }}
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
                event.currentTarget &&
              !deleting
            ) {
              setDeleteId(
                null
              );
            }
          }}
        >
          <div
            style={{
              width: "100%",

              maxWidth:
                "520px",

              background:
                "#ffffff",

              borderRadius:
                "14px",

              overflow:
                "hidden",

              boxShadow:
                "0 25px 70px rgba(0,0,0,0.25)",
            }}
          >
            {/* HEADER */}

            <div
              style={{
                minHeight:
                  "82px",

                padding:
                  "0 24px",

                borderBottom:
                  "1px solid #dddddd",

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "space-between",

                gap: "15px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,

                    color:
                      "#000000",

                    fontSize:
                      "20px",

                    lineHeight:
                      "1.35",

                    fontWeight:
                      700,
                  }}
                >
                  Delete Trade Fair
                </h2>

                <p
                  style={{
                    margin:
                      "5px 0 0",

                    color:
                      "#000000",

                    opacity: 0.55,

                    fontSize:
                      "16px",
                  }}
                >
                  This action cannot
                  be undone.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setDeleteId(
                    null
                  )
                }
                disabled={
                  deleting
                }
                style={{
                  width:
                    "40px",

                  height:
                    "40px",

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
                    deleting
                      ? "not-allowed"
                      : "pointer",

                  flexShrink: 0,
                }}
              >
                <X size={19} />
              </button>
            </div>

            {/* BODY */}

            <div
              style={{
                padding:
                  "24px",
              }}
            >
              <div
                style={{
                  padding:
                    "16px",

                  border:
                    "1px solid #dddddd",

                  borderRadius:
                    "9px",

                  background:
                    "#f7f7f7",

                  color:
                    "#000000",

                  fontSize:
                    "16px",

                  lineHeight:
                    "1.55",
                }}
              >
                This will delete the
                trade fair and its
                uploaded images from
                Cloudflare R2.
              </div>

              <div
                style={{
                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "flex-end",

                  gap: "12px",

                  marginTop:
                    "22px",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setDeleteId(
                      null
                    )
                  }
                  disabled={
                    deleting
                  }
                  style={{
                    height:
                      "46px",

                    padding:
                      "0 20px",

                    border:
                      "1px solid #cccccc",

                    borderRadius:
                      "8px",

                    background:
                      "#ffffff",

                    color:
                      "#000000",

                    fontSize:
                      "16px",

                    fontWeight:
                      600,

                    cursor:
                      deleting
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(
                      deleteId
                    )
                  }
                  disabled={
                    deleting
                  }
                  style={{
                    height:
                      "46px",

                    padding:
                      "0 20px",

                    border:
                      "none",

                    borderRadius:
                      "8px",

                    background:
                      "#000000",

                    color:
                      "#ffffff",

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",

                    gap: "8px",

                    fontSize:
                      "16px",

                    fontWeight:
                      700,

                    cursor:
                      deleting
                        ? "not-allowed"
                        : "pointer",

                    opacity:
                      deleting
                        ? 0.55
                        : 1,
                  }}
                >
                  {deleting ? (
                    <>
                      <RefreshCw
                        size={17}
                        style={{
                          animation:
                            "tradeFairSpin 0.8s linear infinite",
                        }}
                      />

                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2
                        size={17}
                      />

                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CREATE / EDIT MODAL
      ===================================================== */}

      {modalOpen && (
        <div
          style={{
            position:
              "fixed",

            inset: 0,

            zIndex: 9999,

            padding:
              "20px",

            background:
              "rgba(0,0,0,0.60)",

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            boxSizing:
              "border-box",
          }}
          onMouseDown={(
            event
          ) => {
            if (
              event.target ===
                event.currentTarget &&
              !submitting
            ) {
              closeModal();
            }
          }}
        >
          <div
            style={{
              width: "100%",

              maxWidth:
                "820px",

              height:
                "min(880px, 94vh)",

              background:
                "#ffffff",

              borderRadius:
                "15px",

              overflow:
                "hidden",

              boxShadow:
                "0 25px 70px rgba(0,0,0,0.30)",

              display:
                "flex",

              flexDirection:
                "column",
            }}
          >
            {/* =================================================
                HEADER
            ================================================= */}

            <div
              style={{
                height:
                  "82px",

                minHeight:
                  "82px",

                padding:
                  "0 26px",

                borderBottom:
                  "1px solid #dddddd",

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "space-between",

                gap: "20px",

                flexShrink: 0,
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,

                    color:
                      "#000000",

                    fontSize:
                      "20px",

                    lineHeight:
                      "1.35",

                    fontWeight:
                      700,
                  }}
                >
                  {modalMode ===
                  "edit"
                    ? "Edit Trade Fair"
                    : "Add Trade Fair"}
                </h2>

                <p
                  style={{
                    margin:
                      "5px 0 0",

                    color:
                      "#000000",

                    opacity: 0.58,

                    fontSize:
                      "16px",

                    lineHeight:
                      "1.4",
                  }}
                >
                  {form.type ===
                  "past"
                    ? "Past Trade Fair"
                    : "Upcoming Trade Fair"}
                </p>
              </div>

              <button
                type="button"
                onClick={
                  closeModal
                }
                disabled={
                  submitting
                }
                style={{
                  width:
                    "40px",

                  height:
                    "40px",

                  border:
                    "1px solid #d2d2d2",

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
                    submitting
                      ? "not-allowed"
                      : "pointer",

                  flexShrink: 0,
                }}
              >
                <X size={19} />
              </button>
            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={
                handleSubmit
              }
              style={{
                flex: 1,

                minHeight: 0,

                overflowY:
                  "auto",

                padding:
                  "26px",

                display:
                  "flex",

                flexDirection:
                  "column",

                gap: "23px",

                boxSizing:
                  "border-box",
              }}
            >
              {/* ERROR */}

              {formError && (
                <div
                  style={{
                    width:
                      "100%",

                    minHeight:
                      "52px",

                    padding:
                      "11px 14px",

                    border:
                      "1px solid #d4d4d4",

                    borderRadius:
                      "8px",

                    background:
                      "#fafafa",

                    color:
                      "#000000",

                    fontSize:
                      "16px",

                    lineHeight:
                      "1.45",

                    boxSizing:
                      "border-box",
                  }}
                >
                  {formError}
                </div>
              )}

              {/* TYPE */}

              <div
                style={{
                  width:
                    "100%",
                }}
              >
                <label
                  style={{
                    display:
                      "block",

                    marginBottom:
                      "10px",

                    color:
                      "#000000",

                    fontSize:
                      "16px",

                    fontWeight:
                      700,
                  }}
                >
                  Trade Fair Type *
                </label>

                <div
                  style={{
                    width:
                      "100%",

                    padding:
                      "4px",

                    border:
                      "1px solid #cccccc",

                    borderRadius:
                      "9px",

                    background:
                      "#f5f5f5",

                    display:
                      "grid",

                    gridTemplateColumns:
                      "1fr 1fr",

                    gap: "4px",

                    boxSizing:
                      "border-box",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      modalMode ===
                        "create" &&
                      setField(
                        "type",
                        "past"
                      )
                    }
                    disabled={
                      modalMode ===
                      "edit"
                    }
                    style={{
                      height:
                        "46px",

                      border:
                        "none",

                      borderRadius:
                        "7px",

                      background:
                        form.type ===
                        "past"
                          ? "#000000"
                          : "transparent",

                      color:
                        form.type ===
                        "past"
                          ? "#ffffff"
                          : "#000000",

                      fontSize:
                        "16px",

                      fontWeight:
                        600,

                      cursor:
                        modalMode ===
                        "edit"
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    Past Trade Fair
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      modalMode ===
                        "create" &&
                      setField(
                        "type",
                        "upcoming"
                      )
                    }
                    disabled={
                      modalMode ===
                      "edit"
                    }
                    style={{
                      height:
                        "46px",

                      border:
                        "none",

                      borderRadius:
                        "7px",

                      background:
                        form.type ===
                        "upcoming"
                          ? "#000000"
                          : "transparent",

                      color:
                        form.type ===
                        "upcoming"
                          ? "#ffffff"
                          : "#000000",

                      fontSize:
                        "16px",

                      fontWeight:
                        600,

                      cursor:
                        modalMode ===
                        "edit"
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    Upcoming Trade Fair
                  </button>
                </div>
              </div>

              {/* TITLE */}

              <div>
                <label
                  style={{
                    display:
                      "block",

                    marginBottom:
                      "10px",

                    color:
                      "#000000",

                    fontSize:
                      "16px",

                    fontWeight:
                      700,
                  }}
                >
                  Title *
                </label>

                <input
                  required
                  type="text"
                  value={
                    form.title
                  }
                  onChange={(event) =>
                    setField(
                      "title",
                      event.target
                        .value
                    )
                  }
                  placeholder="e.g. IHGF Delhi Fair Autumn 2026"
                  style={{
                    width:
                      "100%",

                    height:
                      "48px",

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

                    fontSize:
                      "16px",

                    outline:
                      "none",

                    boxSizing:
                      "border-box",
                  }}
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label
                  style={{
                    display:
                      "block",

                    marginBottom:
                      "10px",

                    color:
                      "#000000",

                    fontSize:
                      "16px",

                    fontWeight:
                      700,
                  }}
                >
                  Short Description
                </label>

                <textarea
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    setField(
                      "description",
                      event.target
                        .value
                    )
                  }
                  placeholder="Write a short description for this trade fair..."
                  rows={5}
                  style={{
                    width:
                      "100%",

                    minHeight:
                      "135px",

                    padding:
                      "12px 14px",

                    border:
                      "1px solid #cccccc",

                    borderRadius:
                      "8px",

                    background:
                      "#ffffff",

                    color:
                      "#000000",

                    fontSize:
                      "16px",

                    lineHeight:
                      "1.5",

                    outline:
                      "none",

                    resize:
                      "vertical",

                    boxSizing:
                      "border-box",
                  }}
                />
              </div>

              {/* DATE */}

              <div
                style={{
                  display:
                    "grid",

                  gridTemplateColumns:
                    "1fr 1fr",

                  gap: "20px",
                }}
              >
                <div>
                  <label
                    style={{
                      display:
                        "block",

                      marginBottom:
                        "10px",

                      color:
                        "#000000",

                      fontSize:
                        "16px",

                      fontWeight:
                        700,
                    }}
                  >
                    Event Date
                  </label>

                  <div
                    style={{
                      position:
                        "relative",
                    }}
                  >
                    <CalendarDays
                      size={19}
                      style={{
                        position:
                          "absolute",

                        left:
                          "14px",

                        top:
                          "50%",

                        transform:
                          "translateY(-50%)",

                        color:
                          "#000000",

                        opacity:
                          0.55,

                        pointerEvents:
                          "none",
                      }}
                    />

                    <input
                      type="date"
                      value={
                        form.date
                      }
                      onChange={(event) =>
                        setField(
                          "date",
                          event.target
                            .value
                        )
                      }
                      style={{
                        width:
                          "100%",

                        height:
                          "48px",

                        padding:
                          "0 14px 0 46px",

                        border:
                          "1px solid #cccccc",

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
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display:
                        "block",

                      marginBottom:
                        "10px",

                      color:
                        "#000000",

                      fontSize:
                        "16px",

                      fontWeight:
                        700,
                    }}
                  >
                    Date Text
                  </label>

                  <input
                    type="text"
                    value={
                      form.dateText
                    }
                    onChange={(event) =>
                      setField(
                        "dateText",
                        event.target
                          .value
                      )
                    }
                    placeholder="14th – 20th October 2026"
                    style={{
                      width:
                        "100%",

                      height:
                        "48px",

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

                      fontSize:
                        "16px",

                      outline:
                        "none",

                      boxSizing:
                        "border-box",
                    }}
                  />
                </div>
              </div>

              {/* VENUE */}

              <div
                style={{
                  display:
                    "grid",

                  gridTemplateColumns:
                    "1fr 1fr",

                  gap: "20px",
                }}
              >
                <div>
                  <label
                    style={{
                      display:
                        "block",

                      marginBottom:
                        "10px",

                      color:
                        "#000000",

                      fontSize:
                        "16px",

                      fontWeight:
                        700,
                    }}
                  >
                    Venue
                  </label>

                  <div
                    style={{
                      position:
                        "relative",
                    }}
                  >
                    <MapPin
                      size={19}
                      style={{
                        position:
                          "absolute",

                        left:
                          "14px",

                        top:
                          "50%",

                        transform:
                          "translateY(-50%)",

                        color:
                          "#000000",

                        opacity:
                          0.55,

                        pointerEvents:
                          "none",
                      }}
                    />

                    <input
                      type="text"
                      value={
                        form.venue
                      }
                      onChange={(event) =>
                        setField(
                          "venue",
                          event.target
                            .value
                        )
                      }
                      placeholder="India Expo Centre & Mart"
                      style={{
                        width:
                          "100%",

                        height:
                          "48px",

                        padding:
                          "0 14px 0 46px",

                        border:
                          "1px solid #cccccc",

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
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display:
                        "block",

                      marginBottom:
                        "10px",

                      color:
                        "#000000",

                      fontSize:
                        "16px",

                      fontWeight:
                        700,
                    }}
                  >
                    Location
                  </label>

                  <input
                    type="text"
                    value={
                      form.location
                    }
                    onChange={(event) =>
                      setField(
                        "location",
                        event.target
                          .value
                      )
                    }
                    placeholder="Greater Noida, Delhi NCR"
                    style={{
                      width:
                        "100%",

                      height:
                        "48px",

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

                      fontSize:
                        "16px",

                      outline:
                        "none",

                      boxSizing:
                        "border-box",
                    }}
                  />
                </div>
              </div>

              {/* TIMING */}

              <div
                style={{
                  display:
                    "grid",

                  gridTemplateColumns:
                    "1fr 1fr",

                  gap: "20px",
                }}
              >
                <div>
                  <label
                    style={{
                      display:
                        "block",

                      marginBottom:
                        "10px",

                      color:
                        "#000000",

                      fontSize:
                        "16px",

                      fontWeight:
                        700,
                    }}
                  >
                    Timing
                  </label>

                  <div
                    style={{
                      position:
                        "relative",
                    }}
                  >
                    <Clock3
                      size={19}
                      style={{
                        position:
                          "absolute",

                        left:
                          "14px",

                        top:
                          "50%",

                        transform:
                          "translateY(-50%)",

                        color:
                          "#000000",

                        opacity:
                          0.55,

                        pointerEvents:
                          "none",
                      }}
                    />

                    <input
                      type="text"
                      value={
                        form.timing
                      }
                      onChange={(event) =>
                        setField(
                          "timing",
                          event.target
                            .value
                        )
                      }
                      placeholder="10:00 AM – 6:00 PM"
                      style={{
                        width:
                          "100%",

                        height:
                          "48px",

                        padding:
                          "0 14px 0 46px",

                        border:
                          "1px solid #cccccc",

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
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display:
                        "block",

                      marginBottom:
                        "10px",

                      color:
                        "#000000",

                      fontSize:
                        "16px",

                      fontWeight:
                        700,
                    }}
                  >
                    Sort Order
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.sortOrder
                    }
                    onChange={(event) =>
                      setField(
                        "sortOrder",
                        event.target
                          .value
                      )
                    }
                    style={{
                      width:
                        "100%",

                      height:
                        "48px",

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

                      fontSize:
                        "16px",

                      outline:
                        "none",

                      boxSizing:
                        "border-box",
                    }}
                  />
                </div>
              </div>

              {/* ACTIVE */}

              <div
                style={{
                  width:
                    "100%",

                  minHeight:
                    "84px",

                  padding:
                    "16px 18px",

                  border:
                    "1px solid #dddddd",

                  borderRadius:
                    "9px",

                  background:
                    "#f8f8f8",

                  display:
                    "flex",

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

                      lineHeight:
                        "1.4",

                      fontWeight:
                        700,
                    }}
                  >
                    Show on website
                  </p>

                  <p
                    style={{
                      margin:
                        "5px 0 0",

                      color:
                        "#000000",

                      opacity: 0.55,

                      fontSize:
                        "14px",

                      lineHeight:
                        "1.4",
                    }}
                  >
                    Enable this trade
                    fair on the public
                    website.
                  </p>
                </div>

                <label
                  style={{
                    position:
                      "relative",

                    width:
                      "54px",

                    height:
                      "30px",

                    flexShrink: 0,

                    cursor:
                      "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(
                      form.active
                    )}
                    onChange={(event) =>
                      setField(
                        "active",
                        event.target
                          .checked
                      )
                    }
                    style={{
                      position:
                        "absolute",

                      width: 0,

                      height: 0,

                      opacity: 0,
                    }}
                  />

                  <span
                    style={{
                      position:
                        "absolute",

                      inset: 0,

                      borderRadius:
                        "30px",

                      background:
                        form.active
                          ? "#000000"
                          : "#cccccc",

                      transition:
                        "0.2s ease",
                    }}
                  />

                  <span
                    style={{
                      position:
                        "absolute",

                      width:
                        "22px",

                      height:
                        "22px",

                      left:
                        form.active
                          ? "28px"
                          : "4px",

                      top:
                        "4px",

                      borderRadius:
                        "50%",

                      background:
                        "#ffffff",

                      boxShadow:
                        "0 2px 5px rgba(0,0,0,0.15)",

                      transition:
                        "0.2s ease",
                    }}
                  />
                </label>
              </div>

              {/* EXISTING IMAGES */}

              {modalMode ===
                "edit" && (
                <div>
                  <label
                    style={{
                      display:
                        "block",

                      marginBottom:
                        "10px",

                      color:
                        "#000000",

                      fontSize:
                        "16px",

                      fontWeight:
                        700,
                    }}
                  >
                    Existing Images
                  </label>

                  {(() => {
                    const currentFair =
                      fairs.find(
                        (item) =>
                          item._id ===
                          editingId
                      );

                    const images =
                      currentFair?.images ||
                      [];

                    if (
                      images.length ===
                      0
                    ) {
                      return (
                        <div
                          style={{
                            minHeight:
                              "58px",

                            padding:
                              "12px 14px",

                            border:
                              "1px dashed #cccccc",

                            borderRadius:
                              "8px",

                            background:
                              "#fafafa",

                            color:
                              "#000000",

                            opacity:
                              0.6,

                            fontSize:
                              "16px",

                            display:
                              "flex",

                            alignItems:
                              "center",
                          }}
                        >
                          No images
                          uploaded.
                        </div>
                      );
                    }

                    return (
                      <div
                        style={{
                          width:
                            "100%",

                          display:
                            "grid",

                          gridTemplateColumns:
                            "repeat(4, minmax(0, 1fr))",

                          gap: "12px",
                        }}
                      >
                        {images.map(
                          (image) => (
                            <div
                              key={
                                image._id
                              }
                              style={{
                                position:
                                  "relative",

                                width:
                                  "100%",

                                aspectRatio:
                                  "1 / 1",

                                border:
                                  "1px solid #dddddd",

                                borderRadius:
                                  "9px",

                                overflow:
                                  "hidden",

                                background:
                                  "#f3f3f3",
                              }}
                            >
                              <Image
                                src={
                                  image.url
                                }
                                alt={
                                  image.alt ||
                                  form.title ||
                                  "Trade fair image"
                                }
                                fill
                                sizes="150px"
                                style={{
                                  objectFit:
                                    "cover",
                                }}
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteImage(
                                    editingId,
                                    image._id
                                  )
                                }
                                disabled={
                                  deletingImageId ===
                                  image._id
                                }
                                style={{
                                  position:
                                    "absolute",

                                  top:
                                    "8px",

                                  right:
                                    "8px",

                                  width:
                                    "34px",

                                  height:
                                    "34px",

                                  border:
                                    "1px solid #dddddd",

                                  borderRadius:
                                    "50%",

                                  background:
                                    "rgba(255,255,255,0.95)",

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

                                  zIndex:
                                    2,
                                }}
                              >
                                {deletingImageId ===
                                image._id ? (
                                  <RefreshCw
                                    size={
                                      17
                                    }
                                    style={{
                                      animation:
                                        "tradeFairSpin 0.8s linear infinite",
                                    }}
                                  />
                                ) : (
                                  <Trash2
                                    size={
                                      17
                                    }
                                  />
                                )}
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* NEW IMAGES */}

              <div>
                <label
                  style={{
                    display:
                      "block",

                    marginBottom:
                      "10px",

                    color:
                      "#000000",

                    fontSize:
                      "16px",

                    fontWeight:
                      700,
                  }}
                >
                  {form.type ===
                  "upcoming"
                    ? modalMode ===
                      "edit"
                      ? "Replace Image"
                      : "Upload Image"
                    : "Upload Images"}
                </label>

                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                  multiple={
                    form.type ===
                    "past"
                  }
                  onChange={
                    handleFiles
                  }
                  style={{
                    width:
                      "100%",

                    minHeight:
                      "50px",

                    padding:
                      "10px 12px",

                    border:
                      "1px dashed #bdbdbd",

                    borderRadius:
                      "8px",

                    background:
                      "#fafafa",

                    color:
                      "#000000",

                    fontSize:
                      "16px",

                    cursor:
                      "pointer",

                    boxSizing:
                      "border-box",
                  }}
                />

                {/* UPLOAD HELP */}

                <div
                  style={{
                    width:
                      "100%",

                    minHeight:
                      "70px",

                    marginTop:
                      "10px",

                    padding:
                      "12px 14px",

                    border:
                      "1px solid #dddddd",

                    borderRadius:
                      "9px",

                    background:
                      "#f7f7f7",

                    display:
                      "flex",

                    alignItems:
                      "center",

                    gap: "12px",

                    boxSizing:
                      "border-box",
                  }}
                >
                  <div
                    style={{
                      width:
                        "42px",

                      height:
                        "42px",

                      borderRadius:
                        "8px",

                      background:
                        "#ffffff",

                      border:
                        "1px solid #dddddd",

                      display:
                        "flex",

                      alignItems:
                        "center",

                      justifyContent:
                        "center",

                      color:
                        "#000000",

                      flexShrink: 0,
                    }}
                  >
                    <Upload
                      size={
                        20
                      }
                    />
                  </div>

                  <div>
                    <strong
                      style={{
                        display:
                          "block",

                        color:
                          "#000000",

                        fontSize:
                          "16px",

                        fontWeight:
                          700,

                        lineHeight:
                          "1.35",
                      }}
                    >
                      {form.type ===
                      "upcoming"
                        ? "One image"
                        : "Multiple images"}
                    </strong>

                    <span
                      style={{
                        display:
                          "block",

                        marginTop:
                          "4px",

                        color:
                          "#000000",

                        opacity:
                          0.55,

                        fontSize:
                          "14px",

                        lineHeight:
                          "1.35",
                      }}
                    >
                      JPG, PNG, WEBP
                      or AVIF
                    </span>
                  </div>
                </div>

                {/* SELECTED FILES */}

                {selectedFiles.length >
                  0 && (
                  <div
                    style={{
                      width:
                        "100%",

                      marginTop:
                        "10px",

                      display:
                        "flex",

                      flexDirection:
                        "column",

                      gap: "8px",
                    }}
                  >
                    {selectedFiles.map(
                      (
                        file,
                        index
                      ) => (
                        <div
                          key={`${file.name}-${index}`}
                          style={{
                            minHeight:
                              "48px",

                            padding:
                              "7px 10px",

                            border:
                              "1px solid #dddddd",

                            borderRadius:
                              "8px",

                            background:
                              "#ffffff",

                            display:
                              "flex",

                            alignItems:
                              "center",

                            justifyContent:
                              "space-between",

                            gap: "10px",
                          }}
                        >
                          <span
                            title={
                              file.name
                            }
                            style={{
                              color:
                                "#000000",

                              fontSize:
                                "16px",

                              lineHeight:
                                "1.4",

                              overflow:
                                "hidden",

                              textOverflow:
                                "ellipsis",

                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {
                              file.name
                            }
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedFiles(
                                (
                                  current
                                ) =>
                                  current.filter(
                                    (
                                      _,
                                      i
                                    ) =>
                                      i !==
                                      index
                                  )
                              )
                            }
                            style={{
                              width:
                                "32px",

                              height:
                                "32px",

                              border:
                                "none",

                              borderRadius:
                                "6px",

                              background:
                                "#eeeeee",

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

                              flexShrink:
                                0,
                            }}
                          >
                            <X
                              size={
                                17
                              }
                            />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* FOOTER */}

              <div
                style={{
                  width:
                    "100%",

                  paddingTop:
                    "20px",

                  borderTop:
                    "1px solid #dddddd",

                  display:
                    "flex",

                  alignItems:
                    "center",

                  justifyContent:
                    "flex-end",

                  gap: "12px",

                  marginTop:
                    "2px",
                }}
              >
                <button
                  type="button"
                  onClick={
                    closeModal
                  }
                  disabled={
                    submitting
                  }
                  style={{
                    height:
                      "46px",

                    padding:
                      "0 21px",

                    border:
                      "1px solid #cccccc",

                    borderRadius:
                      "8px",

                    background:
                      "#ffffff",

                    color:
                      "#000000",

                    fontSize:
                      "16px",

                    fontWeight:
                      600,

                    cursor:
                      submitting
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting
                  }
                  style={{
                    height:
                      "46px",

                    minWidth:
                      "175px",

                    padding:
                      "0 21px",

                    border:
                      "1px solid #000000",

                    borderRadius:
                      "8px",

                    background:
                      "#000000",

                    color:
                      "#ffffff",

                    display:
                      "flex",

                    alignItems:
                      "center",

                    justifyContent:
                      "center",

                    gap: "8px",

                    fontSize:
                      "16px",

                    fontWeight:
                      700,

                    cursor:
                      submitting
                        ? "not-allowed"
                        : "pointer",

                    opacity:
                      submitting
                        ? 0.55
                        : 1,
                  }}
                >
                  {submitting ? (
                    <>
                      <RefreshCw
                        size={18}
                        style={{
                          animation:
                            "tradeFairSpin 0.8s linear infinite",
                        }}
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <Upload
                        size={18}
                      />

                      {modalMode ===
                      "edit"
                        ? "Update Trade Fair"
                        : "Save Trade Fair"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ONLY animation */}
      <style jsx>{`
        @keyframes tradeFairSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </AdminShell>
  );
}