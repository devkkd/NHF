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


// ======================================================
// EMPTY FORM
// ======================================================

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


// ======================================================
// HELPERS
// ======================================================

function getFairImage(
  fair
) {
  return (
    fair?.images?.[0]
      ?.url || ""
  );
}


function formatDate(
  value
) {
  if (!value) {
    return "—";
  }

  try {
    return new Date(
      value
    ).toLocaleDateString(
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


// ======================================================
// PAGE
// ======================================================

export default function AdminTradeFairsPage() {
  const [
    fairs,
    setFairs,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  // ====================================================
  // MODAL
  // ====================================================

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    modalMode,
    setModalMode,
  ] = useState("create");

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const [
    form,
    setForm,
  ] = useState(
    EMPTY_FORM
  );

  const [
    formError,
    setFormError,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  // ====================================================
  // FILES
  // ====================================================

  const [
    selectedFiles,
    setSelectedFiles,
  ] = useState([]);

  const fileInputRef =
    useRef(null);

  // ====================================================
  // DELETE
  // ====================================================

  const [
    deleteId,
    setDeleteId,
  ] = useState(null);

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  // ====================================================
  // IMAGE DELETE
  // ====================================================

  const [
    deletingImageId,
    setDeletingImageId,
  ] = useState(null);


  // ====================================================
  // LOAD FAIRS
  // ====================================================

  const loadFairs =
    useCallback(
      async () => {
        setLoading(true);
        setError("");

        try {
          const res =
            await apiFetch(
              "/trade-fairs/admin"
            );

          if (
            !res.ok
          ) {
            setFairs([]);

            setError(
              res.data
                ?.message ||
                res.data
                  ?.error ||
                "Failed to load trade fairs."
            );

            return;
          }

          const list =
            res.data
              ?.data
              ?.fairs ||
            [];

          setFairs(
            Array.isArray(
              list
            )
              ? list
              : []
          );
        } catch (err) {
          console.error(
            "TRADE FAIR LOAD ERROR:",
            err
          );

          setError(
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
  }, [
    loadFairs,
  ]);


  // ====================================================
  // COUNTS
  // ====================================================

  const pastFairs =
    useMemo(
      () =>
        fairs.filter(
          (fair) =>
            fair.type ===
            "past"
        ),
      [fairs]
    );

  const upcomingFairs =
    useMemo(
      () =>
        fairs.filter(
          (fair) =>
            fair.type ===
            "upcoming"
        ),
      [fairs]
    );


  // ====================================================
  // RESET FORM
  // ====================================================

  const resetForm =
    () => {
      setForm(
        EMPTY_FORM
      );

      setSelectedFiles(
        []
      );

      setEditingId(
        null
      );

      setModalMode(
        "create"
      );

      setFormError(
        ""
      );

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    };


  // ====================================================
  // OPEN CREATE
  // ====================================================

  const openCreate =
    (
      type = "past"
    ) => {
      resetForm();

      setForm(
        {
          ...EMPTY_FORM,
          type,
        }
      );

      setModalMode(
        "create"
      );

      setModalOpen(
        true
      );
    };


  // ====================================================
  // OPEN EDIT
  // ====================================================

  const openEdit =
    (
      fair
    ) => {
      const isoDate =
        fair.date
          ? new Date(
              fair.date
            )
              .toISOString()
              .split(
                "T"
              )[0]
          : "";

      setEditingId(
        fair._id
      );

      setModalMode(
        "edit"
      );

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

        date:
          isoDate,

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
          fair.sortOrder ??
          0,

        active:
          fair.active !==
          false,
      });

      setSelectedFiles(
        []
      );

      setFormError(
        ""
      );

      setModalOpen(
        true
      );
    };


  // ====================================================
  // CLOSE MODAL
  // ====================================================

  const closeModal =
    () => {
      if (
        submitting
      ) {
        return;
      }

      setModalOpen(
        false
      );

      resetForm();
    };


  // ====================================================
  // SET FORM
  // ====================================================

  const setField = (
    field,
    value
  ) => {
    setForm(
      (
        current
      ) => ({
        ...current,
        [field]:
          value,
      })
    );
  };


  // ====================================================
  // FILE SELECT
  // ====================================================

  const handleFiles =
    (
      event
    ) => {
      const files =
        Array.from(
          event.target
            .files || []
        );

      if (
        form.type ===
        "upcoming"
      ) {
        setSelectedFiles(
          files.slice(
            0,
            1
          )
        );
      } else {
        setSelectedFiles(
          files.slice(
            0,
            8
          )
        );
      }

      setFormError(
        ""
      );
    };


  // ====================================================
  // SUBMIT
  // ====================================================

  const handleSubmit =
    async (
      event
    ) => {
      event.preventDefault();

      setFormError("");
      setSuccess("");

      // ----------------------------------------------
      // VALIDATION
      // ----------------------------------------------

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

      // ----------------------------------------------
      // FORM DATA
      // ----------------------------------------------

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

      if (
        form.date
      ) {
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
        (
          file
        ) => {
          formData.append(
            "images",
            file
          );
        }
      );

      setSubmitting(
        true
      );

      try {
        const res =
          modalMode ===
          "edit"
            ? await apiFetch(
                `/trade-fairs/admin/${editingId}`,
                {
                  method:
                    "PUT",
                  body:
                    formData,
                }
              )
            : await apiFetch(
                "/trade-fairs/admin",
                {
                  method:
                    "POST",
                  body:
                    formData,
                }
              );

        if (
          !res.ok
        ) {
          setFormError(
            res.data
              ?.message ||
              res.data
                ?.error ||
              "Unable to save trade fair."
          );

          return;
        }

        setModalOpen(
          false
        );

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
          "Something went wrong while saving the trade fair."
        );
      } finally {
        setSubmitting(
          false
        );
      }
    };


  // ====================================================
  // DELETE FAIR
  // ====================================================

  const handleDelete =
    async (
      id
    ) => {
      if (!id) {
        return;
      }

      setDeleting(
        true
      );

      setError("");

      try {
        const res =
          await apiFetch(
            `/trade-fairs/admin/${id}`,
            {
              method:
                "DELETE",
            }
          );

        if (
          !res.ok
        ) {
          setError(
            res.data
              ?.message ||
              "Failed to delete trade fair."
          );

          return;
        }

        setDeleteId(
          null
        );

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
          "Failed to delete trade fair."
        );
      } finally {
        setDeleting(
          false
        );
      }
    };


  // ====================================================
  // DELETE SINGLE IMAGE
  // ====================================================

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
              method:
                "DELETE",
            }
          );

        if (
          !res.ok
        ) {
          setError(
            res.data
              ?.message ||
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
          "Failed to delete image."
        );
      } finally {
        setDeletingImageId(
          null
        );
      }
    };


  // ====================================================
  // TABLE SECTION
  // ====================================================

  const renderTable =
    (
      title,
      data
    ) => (
      <section className="nhf-form-section trade-fair-list-section">

        <div className="trade-fair-section-head">

          <div>
            <div className="nhf-form-section-title">
              {title}
            </div>

            <p className="nhf-page-sub">
              {data.length}{" "}
              {data.length ===
              1
                ? "trade fair"
                : "trade fairs"}
            </p>
          </div>

          <button
            type="button"
            className="nhf-btn nhf-btn-primary nhf-btn-sm"
            onClick={() =>
              openCreate(
                title.startsWith(
                  "Past"
                )
                  ? "past"
                  : "upcoming"
              )
            }
          >
            <Plus
              size={13}
            />
            Add
          </button>

        </div>


        {data.length ===
        0 ? (
          <div className="nhf-empty">
            <div className="nhf-empty-icon">
              <ImagePlus
                size={22}
              />
            </div>

            No{" "}
            {title.toLowerCase()}{" "}
            added yet.
          </div>
        ) : (
          <div className="nhf-table-wrap">
            <table className="nhf-table">
              <thead>
                <tr>
                  <th>
                    Image
                  </th>

                  <th>
                    Title
                  </th>

                  <th>
                    Description
                  </th>

                  <th>
                    Date
                  </th>

                  <th>
                    Venue
                  </th>

                  <th>
                    Images
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {data.map(
                  (
                    fair
                  ) => (
                    <tr
                      key={
                        fair._id
                      }
                    >
                      <td>
                        {getFairImage(
                          fair
                        ) ? (
                          <Image
                            src={getFairImage(
                              fair
                            )}
                            alt={
                              fair.title
                            }
                            width={
                              48
                            }
                            height={
                              48
                            }
                            className="nhf-table-thumb trade-fair-thumb"
                            sizes="48px"
                          />
                        ) : (
                          <div className="nhf-table-thumb-placeholder">
                            —
                          </div>
                        )}
                      </td>

                      <td>
                        <div className="trade-fair-title-cell">
                          <strong>
                            {
                              fair.title
                            }
                          </strong>

                          {fair.location && (
                            <span>
                              {
                                fair.location
                              }
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className="trade-fair-description-cell">
                          {fair.description ||
                            "—"}
                        </div>
                      </td>

                      <td>
                        {fair.dateText ||
                          formatDate(
                            fair.date
                          )}
                      </td>

                      <td>
                        {fair.venue ||
                          fair.location ||
                          "—"}
                      </td>

                      <td>
                        <span className="nhf-badge nhf-badge-olive">
                          {Array.isArray(
                            fair.images
                          )
                            ? fair.images
                                .length
                            : 0}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`nhf-badge ${
                            fair.active
                              ? "nhf-badge-green"
                              : "nhf-badge-red"
                          }`}
                        >
                          {fair.active
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <div
                          style={{
                            display:
                              "flex",
                            gap: 4,
                          }}
                        >
                          <button
                            type="button"
                            className="nhf-btn nhf-btn-ghost nhf-btn-icon"
                            title="Edit"
                            onClick={() =>
                              openEdit(
                                fair
                              )
                            }
                          >
                            <Pencil
                              size={
                                13
                              }
                            />
                          </button>

                          <button
                            type="button"
                            className="nhf-btn nhf-btn-danger nhf-btn-icon"
                            title="Delete"
                            onClick={() =>
                              setDeleteId(
                                fair._id
                              )
                            }
                          >
                            <Trash2
                              size={
                                13
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


  // ====================================================
  // LOADING
  // ====================================================

  if (
    loading
  ) {
    return (
      <AdminShell pageTitle="Trade Fairs">
        <div
          style={{
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            minHeight:
              320,
            color:
              "var(--nhf-muted)",
            fontSize:
              13,
            gap:
              8,
          }}
        >
          <RefreshCw
            size={18}
            className="nhf-spinner"
          />
          Loading trade fairs…
        </div>
      </AdminShell>
    );
  }


  // ====================================================
  // RENDER
  // ====================================================

  return (
    <AdminShell pageTitle="Trade Fairs">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="nhf-page-header">

        <div>
          <h1 className="nhf-page-title">
            Trade Fairs
          </h1>

          <p className="nhf-page-sub">
            Manage past exhibitions and upcoming trade fairs.
          </p>
        </div>

        <div
          style={{
            display:
              "flex",
            gap:
              8,
            flexWrap:
              "wrap",
          }}
        >
          <button
            type="button"
            className="nhf-btn nhf-btn-ghost"
            onClick={() =>
              loadFairs()
            }
          >
            <RefreshCw
              size={13}
            />
            Refresh
          </button>

          <button
            type="button"
            className="nhf-btn nhf-btn-primary"
            onClick={() =>
              openCreate(
                "upcoming"
              )
            }
          >
            <Plus
              size={14}
            />
            Upcoming Fair
          </button>
        </div>

      </div>


      {/* ==================================================
          ALERTS
      ================================================== */}

      {error && (
        <div
          className="nhf-alert nhf-alert-error"
          style={{
            marginBottom:
              16,
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="nhf-alert nhf-alert-success"
          style={{
            marginBottom:
              16,
          }}
        >
          {success}
        </div>
      )}


      {/* ==================================================
          SUMMARY
      ================================================== */}

      <div className="trade-fair-summary">

        <div className="trade-fair-stat">
          <span>
            Past Fairs
          </span>

          <strong>
            {
              pastFairs.length
            }
          </strong>
        </div>

        <div className="trade-fair-stat">
          <span>
            Upcoming
          </span>

          <strong>
            {
              upcomingFairs.length
            }
          </strong>
        </div>

        <div className="trade-fair-stat">
          <span>
            Total Images
          </span>

          <strong>
            {fairs.reduce(
              (
                sum,
                fair
              ) =>
                sum +
                (Array.isArray(
                  fair.images
                )
                  ? fair
                      .images
                      .length
                  : 0),
              0
            )}
          </strong>
        </div>

      </div>


      {/* ==================================================
          PAST
      ================================================== */}

      {renderTable(
        "Past Trade Fairs",
        pastFairs
      )}


      {/* ==================================================
          UPCOMING
      ================================================== */}

      {renderTable(
        "Upcoming Trade Fairs",
        upcomingFairs
      )}


      {/* ==================================================
          DELETE CONFIRM
      ================================================== */}

      {deleteId && (
        <div
          className="nhf-modal-overlay"
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
            className="nhf-modal"
            role="dialog"
            aria-modal="true"
          >
            <div className="nhf-modal-head">

              <h2 className="nhf-modal-title">
                Delete Trade Fair
              </h2>

              <button
                type="button"
                className="nhf-modal-close"
                onClick={() =>
                  setDeleteId(
                    null
                  )
                }
                disabled={
                  deleting
                }
              >
                <X
                  size={16}
                />
              </button>

            </div>

            <div className="nhf-modal-body">

              <div className="nhf-alert nhf-alert-error">
                This will delete the trade fair and its uploaded images from Cloudflare R2.
              </div>

              <div
                style={{
                  marginTop:
                    18,
                  display:
                    "flex",
                  justifyContent:
                    "flex-end",
                  gap:
                    8,
                }}
              >
                <button
                  type="button"
                  className="nhf-btn nhf-btn-ghost"
                  onClick={() =>
                    setDeleteId(
                      null
                    )
                  }
                  disabled={
                    deleting
                  }
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="nhf-btn nhf-btn-danger"
                  onClick={() =>
                    handleDelete(
                      deleteId
                    )
                  }
                  disabled={
                    deleting
                  }
                >
                  {deleting
                    ? "Deleting…"
                    : "Delete"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}


      {/* ==================================================
          CREATE / EDIT MODAL
      ================================================== */}

      {modalOpen && (
        <div
          className="nhf-modal-overlay"
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
            className="nhf-modal trade-fair-modal"
            role="dialog"
            aria-modal="true"
          >

            {/* MODAL HEADER */}

            <div className="nhf-modal-head">

              <div>
                <h2 className="nhf-modal-title">
                  {modalMode ===
                  "edit"
                    ? "Edit Trade Fair"
                    : "Add Trade Fair"}
                </h2>

                <p
                  style={{
                    margin:
                      "4px 0 0",
                    fontSize:
                      11,
                    color:
                      "var(--nhf-muted)",
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
                className="nhf-modal-close"
                onClick={
                  closeModal
                }
                disabled={
                  submitting
                }
              >
                <X
                  size={16}
                />
              </button>

            </div>


            {/* FORM */}

            <form
              className="nhf-modal-body"
              onSubmit={
                handleSubmit
              }
            >

              {formError && (
                <div className="nhf-alert nhf-alert-error">
                  {
                    formError
                  }
                </div>
              )}


              {/* TYPE */}

              <div className="nhf-form-group">

                <label className="nhf-form-label">
                  Trade Fair Type *
                </label>

                <div className="trade-fair-type-switch">

                  <button
                    type="button"
                    className={
                      form.type ===
                      "past"
                        ? "active"
                        : ""
                    }
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
                  >
                    Past Trade Fair
                  </button>

                  <button
                    type="button"
                    className={
                      form.type ===
                      "upcoming"
                        ? "active"
                        : ""
                    }
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
                  >
                    Upcoming Trade Fair
                  </button>

                </div>

              </div>


              {/* TITLE */}

              <div className="nhf-form-group">

                <label className="nhf-form-label">
                  Title *
                </label>

                <input
                  className="nhf-form-input"
                  value={
                    form.title
                  }
                  onChange={(
                    event
                  ) =>
                    setField(
                      "title",
                      event.target
                        .value
                    )
                  }
                  placeholder="e.g. IHGF Delhi Fair Autumn 2026"
                />

              </div>


              {/* DESCRIPTION */}

              <div className="nhf-form-group">

                <label className="nhf-form-label">
                  Short Description
                </label>

                <textarea
                  className="nhf-form-input"
                  value={
                    form.description
                  }
                  onChange={(
                    event
                  ) =>
                    setField(
                      "description",
                      event.target
                        .value
                    )
                  }
                  placeholder="Write a short description for this trade fair…"
                  rows={4}
                  style={{
                    resize:
                      "vertical",
                    minHeight:
                      100,
                  }}
                />

              </div>


              {/* DATE + DATE TEXT */}

              <div className="nhf-form-row">

                <div className="nhf-form-group">

                  <label className="nhf-form-label">
                    Event Date
                  </label>

                  <div className="trade-fair-input-icon">

                    <CalendarDays
                      size={
                        14
                      }
                    />

                    <input
                      className="nhf-form-input"
                      type="date"
                      value={
                        form.date
                      }
                      onChange={(
                        event
                      ) =>
                        setField(
                          "date",
                          event
                            .target
                            .value
                        )
                      }
                    />

                  </div>

                </div>


                <div className="nhf-form-group">

                  <label className="nhf-form-label">
                    Date Text
                  </label>

                  <input
                    className="nhf-form-input"
                    value={
                      form.dateText
                    }
                    onChange={(
                      event
                    ) =>
                      setField(
                        "dateText",
                        event.target
                          .value
                      )
                    }
                    placeholder="14th – 20th October 2026"
                  />

                </div>

              </div>


              {/* VENUE + LOCATION */}

              <div className="nhf-form-row">

                <div className="nhf-form-group">

                  <label className="nhf-form-label">
                    Venue
                  </label>

                  <div className="trade-fair-input-icon">

                    <MapPin
                      size={
                        14
                      }
                    />

                    <input
                      className="nhf-form-input"
                      value={
                        form.venue
                      }
                      onChange={(
                        event
                      ) =>
                        setField(
                          "venue",
                          event.target
                            .value
                        )
                      }
                      placeholder="India Expo Centre & Mart"
                    />

                  </div>

                </div>


                <div className="nhf-form-group">

                  <label className="nhf-form-label">
                    Location
                  </label>

                  <input
                    className="nhf-form-input"
                    value={
                      form.location
                    }
                    onChange={(
                      event
                    ) =>
                      setField(
                        "location",
                        event.target
                          .value
                      )
                    }
                    placeholder="Greater Noida, Delhi NCR"
                  />

                </div>

              </div>


              {/* TIMING + SORT */}

              <div className="nhf-form-row">

                <div className="nhf-form-group">

                  <label className="nhf-form-label">
                    Timing
                  </label>

                  <div className="trade-fair-input-icon">

                    <Clock3
                      size={
                        14
                      }
                    />

                    <input
                      className="nhf-form-input"
                      value={
                        form.timing
                      }
                      onChange={(
                        event
                      ) =>
                        setField(
                          "timing",
                          event.target
                            .value
                        )
                      }
                      placeholder="10:00 AM – 6:00 PM"
                    />

                  </div>

                </div>


                <div className="nhf-form-group">

                  <label className="nhf-form-label">
                    Sort Order
                  </label>

                  <input
                    className="nhf-form-input"
                    type="number"
                    min="0"
                    value={
                      form.sortOrder
                    }
                    onChange={(
                      event
                    ) =>
                      setField(
                        "sortOrder",
                        event.target
                          .value
                      )
                    }
                  />

                </div>

              </div>


              {/* ACTIVE */}

              <div
                className="nhf-form-group"
                style={{
                  marginTop:
                    4,
                }}
              >
                <label className="trade-fair-checkbox">

                  <input
                    type="checkbox"
                    checked={
                      Boolean(
                        form.active
                      )
                    }
                    onChange={(
                      event
                    ) =>
                      setField(
                        "active",
                        event.target
                          .checked
                      )
                    }
                  />

                  <span>
                    Show on website
                  </span>

                </label>
              </div>


              {/* EXISTING IMAGES */}

              {modalMode ===
                "edit" && (
                <div className="nhf-form-group">

                  <label className="nhf-form-label">
                    Existing Images
                  </label>

                  {(() => {
                    const currentFair =
                      fairs.find(
                        (
                          item
                        ) =>
                          item._id ===
                          editingId
                      );

                    const images =
                      currentFair
                        ?.images ||
                      [];

                    if (
                      images.length ===
                      0
                    ) {
                      return (
                        <div className="trade-fair-no-images">
                          No images uploaded.
                        </div>
                      );
                    }

                    return (
                      <div className="trade-fair-image-grid">

                        {images.map(
                          (
                            image
                          ) => (
                            <div
                              key={
                                image._id
                              }
                              className="trade-fair-existing-image"
                            >

                              <Image
                                src={
                                  image.url
                                }
                                alt={
                                  image.alt ||
                                  form.title
                                }
                                fill
                                sizes="120px"
                                style={{
                                  objectFit:
                                    "cover",
                                }}
                              />

                              <button
                                type="button"
                                className="trade-fair-image-delete"
                                title="Delete image"
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
                              >
                                {deletingImageId ===
                                image._id ? (
                                  <RefreshCw
                                    size={
                                      13
                                    }
                                    className="nhf-spinner"
                                  />
                                ) : (
                                  <Trash2
                                    size={
                                      13
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

              <div className="nhf-form-group">

                <label className="nhf-form-label">
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
                  className="trade-fair-file-input"
                />

                <div className="trade-fair-upload-help">
                  <Upload
                    size={
                      16
                    }
                  />

                  <div>
                    <strong>
                      {form.type ===
                      "upcoming"
                        ? "One image"
                        : "Multiple images"}
                    </strong>

                    <span>
                      JPG, PNG, WEBP or AVIF
                    </span>
                  </div>
                </div>

                {selectedFiles.length >
                  0 && (
                  <div className="trade-fair-selected-files">
                    {selectedFiles.map(
                      (
                        file,
                        index
                      ) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="trade-fair-selected-file"
                        >
                          <span>
                            {
                              file.name
                            }
                          </span>

                          <button
                            type="button"
                            onClick={() => {
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
                              );
                            }}
                          >
                            <X
                              size={
                                12
                              }
                            />
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}

              </div>


              {/* ACTIONS */}

              <div
                className="nhf-modal-actions"
                style={{
                  display:
                    "flex",
                  justifyContent:
                    "flex-end",
                  gap:
                    8,
                  marginTop:
                    8,
                }}
              >

                <button
                  type="button"
                  className="nhf-btn nhf-btn-ghost"
                  onClick={
                    closeModal
                  }
                  disabled={
                    submitting
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="nhf-btn nhf-btn-primary"
                  disabled={
                    submitting
                  }
                >
                  {submitting ? (
                    <>
                      <RefreshCw
                        size={
                          13
                        }
                        className="nhf-spinner"
                      />

                      Saving…
                    </>
                  ) : (
                    <>
                      <Upload
                        size={
                          13
                        }
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


      {/* ==================================================
          PAGE STYLES
      ================================================== */}

      <style jsx>{`

        .trade-fair-summary {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .trade-fair-stat {
          background: #fff;
          border: 1px solid #e9e4da;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .trade-fair-stat span {
          font-size: 11px;
          color: var(--nhf-muted);
          text-transform: uppercase;
          letter-spacing: 0.07em;
        }

        .trade-fair-stat strong {
          font-size: 24px;
          color: var(--nhf-text);
          font-weight: 600;
        }

        .trade-fair-list-section {
          margin-bottom: 20px;
        }

        .trade-fair-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
        }

        .trade-fair-title-cell {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 150px;
        }

        .trade-fair-title-cell strong {
          color: var(--nhf-text);
          font-size: 12px;
        }

        .trade-fair-title-cell span {
          color: var(--nhf-muted);
          font-size: 10px;
        }

        .trade-fair-description-cell {
          max-width: 230px;
          color: var(--nhf-muted);
          font-size: 11px;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
          overflow: hidden;
        }

        .trade-fair-thumb {
          object-fit: cover;
          border-radius: 4px;
        }

        .trade-fair-modal {
          max-width: 760px;
        }

        .trade-fair-type-switch {
          display: flex;
          gap: 6px;
          padding: 4px;
          border: 1px solid #ddd6ca;
          background: #f8f6f1;
          width: fit-content;
        }

        .trade-fair-type-switch button {
          border: 0;
          background: transparent;
          padding: 8px 13px;
          font-size: 11px;
          cursor: pointer;
          color: var(--nhf-muted);
        }

        .trade-fair-type-switch button.active {
          background: #2d5c43;
          color: #fff;
        }

        .trade-fair-type-switch button:disabled {
          cursor: not-allowed;
          opacity: 0.95;
        }

        .trade-fair-input-icon {
          position: relative;
        }

        .trade-fair-input-icon svg {
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          color: #a69e90;
          pointer-events: none;
          z-index: 1;
        }

        .trade-fair-input-icon .nhf-form-input {
          padding-left: 32px;
        }

        .trade-fair-checkbox {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--nhf-text);
          cursor: pointer;
        }

        .trade-fair-checkbox input {
          accent-color: #2d5c43;
          width: 15px;
          height: 15px;
        }

        .trade-fair-file-input {
          width: 100%;
          padding: 10px;
          border: 1px dashed #cfc7b8;
          background: #faf9f6;
          font-size: 11px;
          cursor: pointer;
          box-sizing: border-box;
        }

        .trade-fair-upload-help {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 8px;
          padding: 10px 12px;
          background: #f6f7ef;
          border: 1px solid #e1e4d3;
          color: #68705b;
        }

        .trade-fair-upload-help div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .trade-fair-upload-help strong {
          font-size: 11px;
          color: #394331;
        }

        .trade-fair-upload-help span {
          font-size: 10px;
          color: var(--nhf-muted);
        }

        .trade-fair-selected-files {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 10px;
        }

        .trade-fair-selected-file {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          border: 1px solid #e4dfd5;
          padding: 8px 10px;
          background: #fff;
          font-size: 11px;
        }

        .trade-fair-selected-file span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .trade-fair-selected-file button {
          border: 0;
          background: transparent;
          cursor: pointer;
          color: #a14d4d;
          padding: 2px;
          flex-shrink: 0;
        }

        .trade-fair-image-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 8px;
          margin-top: 8px;
        }

        .trade-fair-existing-image {
          position: relative;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          border: 1px solid #ddd8cf;
          background: #f3f1ec;
        }

        .trade-fair-image-delete {
          position: absolute;
          right: 6px;
          top: 6px;
          width: 28px;
          height: 28px;
          border: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.94);
          color: #a34848;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
        }

        .trade-fair-image-delete:disabled {
          cursor: wait;
          opacity: 0.7;
        }

        .trade-fair-no-images {
          padding: 14px;
          background: #faf9f6;
          border: 1px solid #e6e1d8;
          color: var(--nhf-muted);
          font-size: 11px;
        }

        @media (max-width: 900px) {
          .trade-fair-summary {
            grid-template-columns: 1fr;
          }

          .trade-fair-section-head {
            align-items: flex-start;
          }

          .trade-fair-table-wrap {
            overflow-x: auto;
          }

          .trade-fair-modal {
            max-width: calc(100vw - 30px);
          }

          .trade-fair-image-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 640px) {
          .trade-fair-type-switch {
            width: 100%;
          }

          .trade-fair-type-switch button {
            flex: 1;
          }

          .trade-fair-image-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

      `}</style>

    </AdminShell>
  );
}