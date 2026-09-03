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
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import { apiFetch } from "@/lib/adminApi";
import AdminShell from "@/components/admin/AdminShell";
import ImageUploader from "@/components/admin/ImageUploader";

const LIMIT = 20;

const EMPTY_FORM = {
  name: "",
  description: "",
  image: "",
  heroImage: "",
  mobileHeroImage: "",
  parent: "",
  showInHome: false,
  showInWardrobe: false,
  showInFooter: true,
  isActive: true,
  sortOrder: 1,
};

export default function AdminCategories() {
  const [categories, setCategories] =
    useState([]);

  const [total, setTotal] =
    useState(0);

  const [page, setPage] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const debounceRef =
    useRef(null);

  /* ========================================================
     MODAL
  ======================================================== */

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

  const [formSubmitting, setFormSubmitting] =
    useState(false);

  /* ========================================================
     DELETE
  ======================================================== */

  const [deleteConfirmId, setDeleteConfirmId] =
    useState(null);

  /* ========================================================
     EXPANDED
  ======================================================== */

  const [expanded, setExpanded] =
    useState({});

  /* ========================================================
     PARENT OPTIONS
  ======================================================== */

  const [parentOptions, setParentOptions] =
    useState([]);

  /* ========================================================
     LOAD PARENT OPTIONS
  ======================================================== */

  const loadParentOptions =
    useCallback(async () => {
      try {
        const res =
          await apiFetch(
            "/categories?limit=100"
          );

        if (!res.ok) return;

        const list =
          res.data?.data
            ?.categories || [];

        setParentOptions(
          list.filter(
            (item) =>
              !item.parent
          )
        );
      } catch (err) {
        console.error(
          "Parent categories error:",
          err
        );
      }
    }, []);

  useEffect(() => {
    loadParentOptions();
  }, [
    loadParentOptions,
  ]);

  /* ========================================================
     LOAD CATEGORIES
  ======================================================== */

  const loadCategories =
    useCallback(
      async (
        currentPage,
        currentSearch
      ) => {
        setLoading(true);
        setError("");

        try {
          const params =
            new URLSearchParams();

          params.set(
            "page",
            String(currentPage)
          );

          params.set(
            "limit",
            String(LIMIT)
          );

          if (
            currentSearch?.trim()
          ) {
            params.set(
              "search",
              currentSearch.trim()
            );
          }

          const res =
            await apiFetch(
              `/categories/admin/all?${params.toString()}`
            );

          if (!res.ok) {
            setCategories([]);
            setTotal(0);

            setError(
              res.data?.error ||
                res.data?.message ||
                "Failed to load categories."
            );

            return;
          }

          const list =
            res.data?.data
              ?.categories || [];

          setCategories(
            Array.isArray(list)
              ? list
              : []
          );

          setTotal(
            Number(
              res.data?.data
                ?.total || 0
            )
          );
        } catch (err) {
          console.error(
            "Categories load error:",
            err
          );

          setCategories([]);
          setTotal(0);

          setError(
            "Failed to load categories."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    loadCategories(
      page,
      search
    );
  }, [
    page,
    search,
    loadCategories,
  ]);

  /* ========================================================
     MAIN CATEGORIES
  ======================================================== */

  const mainCategories =
    useMemo(() => {
      return categories
        .filter(
          (item) =>
            !item.parent
        )
        .sort(
          (a, b) =>
            Number(
              a.sortOrder || 0
            ) -
            Number(
              b.sortOrder || 0
            )
        );
    }, [categories]);

  /* ========================================================
     CHILDREN
  ======================================================== */

  const getChildren =
    useCallback(
      (parentId) => {
        return categories
          .filter((item) => {
            const parentIdValue =
              typeof item.parent ===
              "object"
                ? item.parent?._id
                : item.parent;

            return (
              parentIdValue ===
              parentId
            );
          })
          .sort(
            (a, b) =>
              Number(
                a.sortOrder || 0
              ) -
              Number(
                b.sortOrder || 0
              )
          );
      },
      [categories]
    );

  /* ========================================================
     SEARCH
  ======================================================== */

  const handleSearch = (
    event
  ) => {
    const value =
      event.target.value;

    setSearch(value);

    clearTimeout(
      debounceRef.current
    );

    debounceRef.current =
      setTimeout(() => {
        setPage(1);

        loadCategories(
          1,
          value
        );
      }, 400);
  };

  const clearSearch = () => {
    clearTimeout(
      debounceRef.current
    );

    setSearch("");

    setPage(1);

    loadCategories(
      1,
      ""
    );
  };

  /* ========================================================
     CREATE CATEGORY
  ======================================================== */

  const openCreateCategory =
    () => {
      setEditingId(null);

      setModalMode(
        "create"
      );

      setForm({
        ...EMPTY_FORM,
        parent: "",
        sortOrder: 1,
      });

      setFormError("");
      setModalOpen(true);
    };

  /* ========================================================
     CREATE SUBCATEGORY
  ======================================================== */

  const openCreateSubcategory =
    (
      parentId,
      parentName
    ) => {
      setEditingId(null);

      setModalMode(
        "create"
      );

      setForm({
        ...EMPTY_FORM,
        parent: parentId,
        sortOrder: 1,
      });

      setFormError("");
      setModalOpen(true);

      console.log(
        `Creating subcategory inside ${parentName}`
      );
    };

  /* ========================================================
     EDIT
  ======================================================== */

  const openEdit = (
    category
  ) => {
    const parentId =
      typeof category.parent ===
      "object"
        ? category.parent?._id
        : category.parent;

    setEditingId(
      category._id
    );

    setModalMode(
      "edit"
    );

    setForm({
      name:
        category.name || "",

      description:
        category.description ||
        "",

      image:
        category.image || "",

      heroImage:
        category.heroImage || "",

      mobileHeroImage:
        category.mobileHeroImage || "",

      parent:
        parentId || "",

      showInHome:
        Boolean(
          category.showInHome
        ),

      showInWardrobe:
        Boolean(
          category.showInWardrobe
        ),

      showInFooter:
        category.showInFooter ??
        true,

      isActive:
        category.isActive ??
        true,

      sortOrder:
        Number(
          category.sortOrder
        ) || 1,
    });

    setFormError("");
    setModalOpen(true);
  };

  /* ========================================================
     CLOSE MODAL
  ======================================================== */

  const closeModal = () => {
    if (
      formSubmitting
    ) {
      return;
    }

    setModalOpen(false);
    setEditingId(null);

    setModalMode(
      "create"
    );

    setForm(
      EMPTY_FORM
    );

    setFormError("");
  };

  /* ========================================================
     FORM UPDATE
  ======================================================== */

  const updateForm = (
    key,
    value
  ) => {
    setForm(
      (current) => ({
        ...current,
        [key]: value,
      })
    );
  };

  /* ========================================================
     SUBMIT
  ======================================================== */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setFormError("");

      const name =
        form.name.trim();

      if (!name) {
        setFormError(
          "Name is required."
        );

        return;
      }

      const sortOrder =
        Number(
          form.sortOrder
        );

      if (
        !Number.isInteger(
          sortOrder
        ) ||
        sortOrder < 1
      ) {
        setFormError(
          "Serial number must be 1 or greater."
        );

        return;
      }

      if (
        editingId &&
        form.parent ===
          editingId
      ) {
        setFormError(
          "A category cannot be its own parent."
        );

        return;
      }

      setFormSubmitting(true);

      try {
        const body = {
          name,

          description:
            form.description.trim(),

          image:
            form.image || "",

          heroImage:
            form.heroImage || "",

          mobileHeroImage:
            form.mobileHeroImage || "",

          parent:
            form.parent || null,

          ...(form.parent
            ? {}
            : {
                showInHome:
                  Boolean(
                    form.showInHome
                  ),

                showInWardrobe:
                  Boolean(
                    form.showInWardrobe
                  ),
              }),

          showInFooter:
            Boolean(
              form.showInFooter
            ),

          isActive:
            Boolean(
              form.isActive
            ),

          sortOrder,
        };

        const res =
          modalMode ===
          "create"
            ? await apiFetch(
                "/categories",
                {
                  method: "POST",
                  body:
                    JSON.stringify(
                      body
                    ),
                }
              )
            : await apiFetch(
                `/categories/${editingId}`,
                {
                  method: "PATCH",
                  body:
                    JSON.stringify(
                      body
                    ),
                }
              );

        if (!res.ok) {
          setFormError(
            res.data?.error ||
              res.data?.message ||
              "Unable to save category."
          );

          return;
        }

        closeModal();

        await loadCategories(
          page,
          search
        );

        await loadParentOptions();
      } catch (err) {
        console.error(
          "Category save error:",
          err
        );

        setFormError(
          err?.message ||
            "Something went wrong while saving."
        );
      } finally {
        setFormSubmitting(false);
      }
    };

  /* ========================================================
     DELETE
  ======================================================== */

  const handleDelete =
    async (categoryId) => {
      if (!categoryId) {
        return;
      }

      try {
        const res =
          await apiFetch(
            `/categories/permanent/${categoryId}`,
            {
              method: "DELETE",
            }
          );

        if (!res.ok) {
          setError(
            res.data?.error ||
              res.data?.message ||
              "Unable to delete category."
          );

          return;
        }

        setDeleteConfirmId(
          null
        );

        await loadCategories(
          page,
          search
        );

        await loadParentOptions();
      } catch (err) {
        console.error(
          "Category delete error:",
          err
        );

        setError(
          "Unable to delete category."
        );
      }
    };

  /* ========================================================
     EXPAND
  ======================================================== */

  const toggleExpanded = (
    categoryId
  ) => {
    setExpanded(
      (current) => ({
        ...current,

        [categoryId]:
          !current[
            categoryId
          ],
      })
    );
  };

  /* ========================================================
     PAGINATION
  ======================================================== */

  const pages =
    Math.max(
      1,
      Math.ceil(
        total / LIMIT
      )
    );

  /* ========================================================
     ESCAPE
  ======================================================== */

  useEffect(() => {
    if (!modalOpen) {
      return;
    }

    const handler = (
      event
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        closeModal();
      }
    };

    document.addEventListener(
      "keydown",
      handler
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handler
      );
    };
  }, [
    modalOpen,
    formSubmitting,
  ]);

  /* ========================================================
     UI
  ======================================================== */

  return (
    <AdminShell>
      <div className="category-page">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="nhf-page-header">
          <div>
            <h1 className="nhf-page-title">
              Categories
            </h1>

            <p className="nhf-page-sub">
              {total} total
              categories
            </p>
          </div>

          <button
            type="button"
            className="nhf-btn nhf-btn-primary"
            onClick={
              openCreateCategory
            }
          >
            <Plus size={18} />

            Add Category
          </button>
        </div>

        {/* ==================================================
            SEARCH
        ================================================== */}

        <div className="nhf-toolbar">
          <div className="nhf-toolbar-left">
            <div className="nhf-search-box">
              <Search
                size={18}
              />

              <input
                value={search}
                placeholder="Search categories..."
                onChange={
                  handleSearch
                }
              />

              {search && (
                <button
                  type="button"
                  onClick={
                    clearSearch
                  }
                  style={{
                    border:
                      "none",
                    background:
                      "transparent",
                    cursor:
                      "pointer",
                    color:
                      "#000000",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                >
                  <X size={17} />
                </button>
              )}
            </div>
          </div>

          <div
            style={{
              color:
                "#000000",
              fontSize:
                "15px",
              fontWeight:
                600,
            }}
          >
            {total}{" "}
            {total === 1
              ? "result"
              : "results"}
          </div>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="nhf-alert nhf-alert-error">
            {error}
          </div>
        )}

        {/* ==================================================
            TABLE
        ================================================== */}

        <div className="nhf-table-wrap">
          <table className="nhf-table">
            <thead>
              <tr>
                <th>
                  Serial
                </th>

                <th>
                  Image
                </th>

                <th>
                  Name
                </th>

                <th>
                  Type
                </th>

                <th>
                  Parent
                </th>

                <th>
                  Home
                </th>

                <th>
                  Wardrobe
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
              {/* LOADING */}

              {loading ? (
                Array.from({
                  length: 6,
                }).map(
                  (_, index) => (
                    <tr
                      key={
                        `loading-${index}`
                      }
                    >
                      {Array.from({
                        length: 9,
                      }).map(
                        (
                          _,
                          cell
                        ) => (
                          <td
                            key={
                              cell
                            }
                          >
                            <div
                              className="nhf-skeleton nhf-skeleton-text"
                              style={{
                                width:
                                  cell ===
                                  1
                                    ? "46px"
                                    : "70%",
                                height:
                                  cell ===
                                  1
                                    ? "46px"
                                    : "18px",
                              }}
                            />
                          </td>
                        )
                      )}
                    </tr>
                  )
                )
              ) : mainCategories.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={9}
                  >
                    <div
                      className="nhf-empty"
                    >
                      <div
                        className="nhf-empty-icon"
                      >
                        <Search
                          size={26}
                        />
                      </div>

                      No categories
                      found.
                    </div>
                  </td>
                </tr>
              ) : (
                mainCategories.map(
                  (
                    category
                  ) => {
                    const children =
                      getChildren(
                        category._id
                      );

                    const isOpen =
                      Boolean(
                        expanded[
                          category._id
                        ]
                      );

                    return (
                      <CategoryBlock
                        key={
                          category._id
                        }
                        category={
                          category
                        }
                        children={
                          children
                        }
                        isOpen={
                          isOpen
                        }
                        onToggle={() =>
                          toggleExpanded(
                            category._id
                          )
                        }
                        onEdit={
                          openEdit
                        }
                        onDelete={
                          setDeleteConfirmId
                        }
                        onConfirmDelete={
                          handleDelete
                        }
                        deleteConfirmId={
                          deleteConfirmId
                        }
                        onAddSubcategory={
                          openCreateSubcategory
                        }
                      />
                    );
                  }
                )
              )}
            </tbody>
          </table>

          {/* ==================================================
              PAGINATION
          ================================================== */}

          {pages > 1 && (
            <div className="nhf-pagination">
              <button
                type="button"
                className="nhf-btn nhf-btn-ghost nhf-btn-icon"
                disabled={
                  page === 1
                }
                onClick={() =>
                  setPage(
                    (
                      current
                    ) =>
                      Math.max(
                        1,
                        current -
                          1
                      )
                  )
                }
              >
                <ChevronLeft
                  size={18}
                />
              </button>

              <span>
                Page {page} of{" "}
                {pages}
              </span>

              <button
                type="button"
                className="nhf-btn nhf-btn-ghost nhf-btn-icon"
                disabled={
                  page ===
                  pages
                }
                onClick={() =>
                  setPage(
                    (
                      current
                    ) =>
                      Math.min(
                        pages,
                        current +
                          1
                      )
                  )
                }
              >
                <ChevronRight
                  size={18}
                />
              </button>
            </div>
          )}
        </div>

        {/* ==================================================
            MODAL
        ================================================== */}

        {modalOpen && (
          <div
            className="nhf-modal-overlay"
            onClick={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                closeModal();
              }
            }}
          >
            <div
              className="nhf-modal"
              role="dialog"
              aria-modal="true"
            >
              {/* MODAL HEADER */}

              <div className="nhf-modal-head">
                <div>
                  <h2 className="nhf-modal-title">
                    {modalMode ===
                    "edit"
                      ? "Edit Category"
                      : form.parent
                      ? "Add Subcategory"
                      : "Add Category"}
                  </h2>

                  <p
                    style={{
                      margin:
                        "6px 0 0",
                      fontSize:
                        "14px",
                      lineHeight:
                        "1.45",
                      color:
                        "#000000",
                      opacity:
                        0.58,
                    }}
                  >
                    {form.parent
                      ? "This subcategory belongs to the selected category."
                      : "This will create a main category."}
                  </p>
                </div>

                <button
                  type="button"
                  className="nhf-modal-close"
                  onClick={
                    closeModal
                  }
                  disabled={
                    formSubmitting
                  }
                >
                  <X size={19} />
                </button>
              </div>

              {/* MODAL BODY */}

              <form
                className="nhf-modal-body"
                onSubmit={
                  handleSubmit
                }
              >
                {formError && (
                  <div className="nhf-alert nhf-alert-error">
                    {formError}
                  </div>
                )}

                {/* TYPE */}

                <div className="nhf-form-group">
                  <label className="nhf-form-label">
                    Type
                  </label>

                  <div
                    style={{
                      display:
                        "grid",
                      gridTemplateColumns:
                        "1fr 1fr",
                      gap: "10px",
                    }}
                  >
                    <button
                      type="button"
                      className="nhf-btn"
                      onClick={() =>
                        updateForm(
                          "parent",
                          ""
                        )
                      }
                      style={{
                        height:
                          "48px",
                        border:
                          !form.parent
                            ? "1px solid #000000"
                            : "1px solid #dddddd",
                        background:
                          !form.parent
                            ? "#000000"
                            : "#ffffff",
                        color:
                          !form.parent
                            ? "#ffffff"
                            : "#000000",
                        borderRadius:
                          "8px",
                        fontSize:
                          "16px",
                        fontWeight:
                          600,
                        cursor:
                          "pointer",
                      }}
                    >
                      Main Category
                    </button>

                    <button
                      type="button"
                      className="nhf-btn"
                      onClick={() => {
                        if (
                          !form.parent &&
                          parentOptions.length >
                            0
                        ) {
                          updateForm(
                            "parent",
                            parentOptions[0]
                              ?._id ||
                              ""
                          );
                        }
                      }}
                      style={{
                        height:
                          "48px",
                        border:
                          form.parent
                            ? "1px solid #000000"
                            : "1px solid #dddddd",
                        background:
                          form.parent
                            ? "#000000"
                            : "#ffffff",
                        color:
                          form.parent
                            ? "#ffffff"
                            : "#000000",
                        borderRadius:
                          "8px",
                        fontSize:
                          "16px",
                        fontWeight:
                          600,
                        cursor:
                          "pointer",
                      }}
                    >
                      Subcategory
                    </button>
                  </div>
                </div>

                {/* PARENT */}

                <div className="nhf-form-group">
                  <label className="nhf-form-label">
                    Parent Category
                    {form.parent
                      ? " *"
                      : ""}
                  </label>

                  <select
                    className="nhf-form-input"
                    value={
                      form.parent
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "parent",
                        event.target
                          .value
                      )
                    }
                    style={{
                      fontSize:
                        "16px",
                      color:
                        "#000000",
                    }}
                  >
                    <option value="">
                      — None (Main
                      Category) —
                    </option>

                    {parentOptions
                      .filter(
                        (
                          parent
                        ) =>
                          parent._id !==
                          editingId
                      )
                      .map(
                        (
                          parent
                        ) => (
                          <option
                            key={
                              parent._id
                            }
                            value={
                              parent._id
                            }
                          >
                            {
                              parent.name
                            }
                          </option>
                        )
                      )}
                  </select>

                  <p
                    style={{
                      margin:
                        "4px 0 0",
                      fontSize:
                        "14px",
                      lineHeight:
                        "1.45",
                      color:
                        "#000000",
                      opacity:
                        0.55,
                    }}
                  >
                    Empty = main
                    category. Selecting
                    a parent creates a
                    subcategory.
                  </p>
                </div>

                {/* NAME */}

                <div className="nhf-form-group">
                  <label className="nhf-form-label">
                    Name *
                  </label>

                  <input
                    autoFocus
                    required
                    className="nhf-form-input"
                    value={
                      form.name
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "name",
                        event.target
                          .value
                      )
                    }
                    placeholder={
                      form.parent
                        ? "e.g. Cotton Bedsheets"
                        : "e.g. Bedsheets"
                    }
                    style={{
                      fontSize:
                        "16px",
                      color:
                        "#000000",
                    }}
                  />
                </div>

                {/* DESCRIPTION */}

                <div className="nhf-form-group">
                  <label className="nhf-form-label">
                    Description
                  </label>

                  <textarea
                    rows={4}
                    className="nhf-form-textarea"
                    value={
                      form.description
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "description",
                        event.target
                          .value
                      )
                    }
                    placeholder="Short description..."
                    style={{
                      fontSize:
                        "16px",
                      lineHeight:
                        "1.5",
                      color:
                        "#000000",
                    }}
                  />
                </div>

                {/* NORMAL IMAGE */}

                <div className="nhf-form-group">
                  <label className="nhf-form-label">
                    Category Image
                  </label>

                  <p className="category-image-note">
                    Used for category and subcategory cards / thumbnails.
                  </p>

                  <div className="category-image-box">
                    <ImageUploader
                      value={form.image}
                      onChange={(url) =>
                        updateForm(
                          "image",
                          url
                        )
                      }
                      folder="categories"
                    />
                  </div>
                </div>

                {/* DESKTOP HERO IMAGE */}

                <div className="nhf-form-group">
                  <label className="nhf-form-label">
                    Desktop Hero Image
                  </label>

                  <p className="hero-size-note">
                    Desktop banner size:
                    <strong> 1920 × 540 px</strong>
                    {" "}— recommended aspect ratio:
                    <strong> 32:9</strong>.
                    This image is used as the main hero banner on desktop.
                  </p>

                  <div className="category-image-box">
                    <ImageUploader
                      value={form.heroImage}
                      onChange={(url) =>
                        updateForm(
                          "heroImage",
                          url
                        )
                      }
                      folder="category-hero"
                    />
                  </div>
                </div>

                {/* MOBILE HERO IMAGE */}

                <div className="nhf-form-group">
                  <label className="nhf-form-label">
                    Mobile Hero Image{" "}
                    <span
                      style={{
                        fontWeight: 500,
                        opacity: 0.55,
                      }}
                    >
                      (Optional)
                    </span>
                  </label>

                  <p className="hero-size-note">
                    Mobile portrait banner:
                    <strong> 1080 × 1350 px</strong>
                    {" "}— recommended aspect ratio:
                    <strong> 4:5</strong>.
                    This is optional. If you leave it empty, the desktop hero image will be used on mobile.
                  </p>

                  <div className="category-image-box">
                    <ImageUploader
                      value={
                        form.mobileHeroImage
                      }
                      onChange={(url) =>
                        updateForm(
                          "mobileHeroImage",
                          url
                        )
                      }
                      folder="category-hero-mobile"
                    />

                    <div className="mobile-hero-preview-hint">
                      <strong>Recommended:</strong>{" "}
                      portrait mobile artwork at 1080 × 1350 px (4:5).
                      Keep the important subject in the center so it remains visible on smaller screens.
                    </div>
                  </div>
                </div>

                {/* SERIAL */}

                <div className="nhf-form-group">
                  <label className="nhf-form-label">
                    Serial Number *
                  </label>

                  <input
                    type="number"
                    min="1"
                    step="1"
                    className="nhf-form-input"
                    value={
                      form.sortOrder
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "sortOrder",
                        event.target
                          .value
                      )
                    }
                    style={{
                      fontSize:
                        "16px",
                      color:
                        "#000000",
                    }}
                  />

                  <p
                    style={{
                      margin:
                        "4px 0 0",
                      fontSize:
                        "14px",
                      lineHeight:
                        "1.45",
                      color:
                        "#000000",
                      opacity:
                        0.55,
                    }}
                  >
                    1 means top
                    position. Lower
                    numbers appear
                    first.
                  </p>
                </div>

                {/* VISIBILITY */}

                <div
                  className="nhf-form-group"
                  style={{
                    gap: "10px",
                  }}
                >
                  <label className="nhf-form-label">
                    Visibility
                  </label>

                  {!form.parent && (
                    <>
                      <ToggleRow
                        label="Show on Home"
                        checked={
                          form.showInHome
                        }
                        onChange={(
                          value
                        ) =>
                          updateForm(
                            "showInHome",
                            value
                          )
                        }
                      />

                      <ToggleRow
                        label="Show in Wardrobe"
                        checked={
                          form.showInWardrobe
                        }
                        onChange={(
                          value
                        ) =>
                          updateForm(
                            "showInWardrobe",
                            value
                          )
                        }
                      />
                    </>
                  )}

                  <ToggleRow
                    label="Show in Footer"
                    checked={
                      form.showInFooter
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "showInFooter",
                        value
                      )
                    }
                  />

                  <ToggleRow
                    label="Active"
                    checked={
                      form.isActive
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "isActive",
                        value
                      )
                    }
                  />
                </div>

                {/* ACTIONS */}

                <div className="nhf-form-footer">
                  <button
                    type="button"
                    className="nhf-btn nhf-btn-ghost"
                    onClick={
                      closeModal
                    }
                    disabled={
                      formSubmitting
                    }
                    style={{
                      fontSize:
                        "16px",
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="nhf-btn nhf-btn-primary"
                    disabled={
                      formSubmitting
                    }
                    style={{
                      fontSize:
                        "16px",
                    }}
                  >
                    {formSubmitting
                      ? "Saving..."
                      : modalMode ===
                        "edit"
                      ? "Save Changes"
                      : form.parent
                      ? "Create Subcategory"
                      : "Create Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================
            TYPOGRAPHY ONLY
            WIDTH / LAYOUT LEFT UNCHANGED
        ================================================== */}

        <style jsx global>{`
          .category-page {
            width: 100%;
            max-width: 100%;
            min-width: 0;
            overflow-x: hidden;
          }

          .nhf-page-title {
            font-size: 22px !important;
            line-height: 1.3 !important;
            font-weight: 700 !important;
            color: #000000 !important;
          }

          .nhf-page-sub {
            font-size: 16px !important;
            line-height: 1.5 !important;
            color: #000000 !important;
          }

          .nhf-search-box input {
            font-size: 16px !important;
            line-height: 1.4 !important;
            color: #000000 !important;
          }

          .nhf-search-box input::placeholder {
            color: #000000 !important;
            opacity: 0.4 !important;
          }

          .nhf-btn {
            font-size: 16px !important;
            line-height: 1.25 !important;
          }

          .nhf-btn-sm {
            font-size: 15px !important;
          }

          .nhf-btn-primary {
            font-size: 16px !important;
            font-weight: 700 !important;
            color: #ffffff !important;
          }

          .nhf-table th {
            font-size: 15px !important;
            line-height: 1.35 !important;
            font-weight: 700 !important;
            color: #000000 !important;
          }

          .nhf-table td {
            font-size: 16px !important;
            line-height: 1.45 !important;
            color: #000000 !important;
          }

          .nhf-table td strong {
            font-size: 16px !important;
            line-height: 1.4 !important;
            color: #000000 !important;
            font-weight: 700 !important;
          }

          .nhf-badge {
            font-size: 14px !important;
            line-height: 1.25 !important;
            font-weight: 700 !important;
            color: #000000 !important;
          }

          .nhf-alert {
            font-size: 16px !important;
            line-height: 1.45 !important;
            color: #000000 !important;
          }

          .nhf-empty {
            font-size: 16px !important;
            line-height: 1.45 !important;
            color: #000000 !important;
          }

          .nhf-pagination {
            font-size: 15px !important;
            color: #000000 !important;
          }

          .nhf-pagination span {
            font-size: 15px !important;
            line-height: 1.4 !important;
            font-weight: 600 !important;
            color: #000000 !important;
          }

          .nhf-modal-title {
            font-size: 24px !important;
            line-height: 1.3 !important;
            font-weight: 700 !important;
            color: #000000 !important;
          }

          .nhf-modal-head p {
            font-size: 15px !important;
            line-height: 1.45 !important;
            color: #000000 !important;
          }

          .nhf-form-label {
            font-size: 17px !important;
            line-height: 1.4 !important;
            font-weight: 700 !important;
            color: #000000 !important;
          }

          .nhf-form-input,
          .nhf-form-textarea,
          .nhf-modal-body input,
          .nhf-modal-body textarea,
          .nhf-modal-body select {
            font-size: 17px !important;
            line-height: 1.45 !important;
            color: #000000 !important;
          }

          .nhf-form-input::placeholder,
          .nhf-form-textarea::placeholder {
            color: #000000 !important;
            opacity: 0.4 !important;
          }

          .nhf-toggle {
            font-size: 16px !important;
            line-height: 1.45 !important;
            color: #000000 !important;
          }

          .nhf-confirm-actions {
            font-size: 16px !important;
            line-height: 1.45 !important;
            color: #000000 !important;
          }

          .nhf-modal {
            max-width: 760px !important;
          }

          .nhf-modal-head {
            padding: 22px 24px !important;
          }

          .nhf-modal-body {
            gap: 22px !important;
            padding: 24px !important;
          }

          .nhf-form-group {
            gap: 9px !important;
          }

          .category-image-box {
            width: 100%;
            padding: 18px !important;
            border: 1px solid #dddddd;
            border-radius: 10px;
            background: #fafafa;
            box-sizing: border-box;
          }

          .category-image-note {
            margin: 6px 0 11px;
            color: #000000;
            font-size: 14px;
            line-height: 1.55;
          }

          .category-image-note strong {
            color: #000000;
            font-weight: 700;
          }

          .hero-size-note {
            margin: 6px 0 11px;
            color: #000000;
            font-size: 15px;
            line-height: 1.55;
          }

          .hero-size-note strong {
            color: #000000;
            font-weight: 700;
          }

          .mobile-hero-preview-hint {
            margin-top: 9px;
            padding: 10px 12px;
            border: 1px dashed #bdbdbd;
            border-radius: 8px;
            background: #ffffff;
            color: #000000;
            font-size: 14px;
            line-height: 1.5;
          }

          .mobile-hero-preview-hint strong {
            font-weight: 700;
          }

          .nhf-modal-body button {
            font-size: 16px;
          }

          .nhf-modal-body .nhf-form-footer .nhf-btn {
            min-height: 46px !important;
            padding: 0 18px !important;
            font-size: 16px !important;
          }

          .nhf-table {
            color: #000000 !important;
          }
        `}</style>
      </div>
    </AdminShell>
  );
}

/* =========================================================
   TOGGLE ROW
========================================================= */

function ToggleRow({
  label,
  checked,
  onChange,
}) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(!checked)
      }
      style={{
        width: "100%",
        minHeight: "54px",
        padding:
          "8px 14px",
        border:
          "1px solid #dddddd",
        borderRadius:
          "9px",
        background:
          "#ffffff",
        color:
          "#000000",
        display:
          "flex",
        alignItems:
          "center",
        justifyContent:
          "space-between",
        gap: "15px",
        cursor:
          "pointer",
        boxSizing:
          "border-box",
      }}
    >
      <span
        style={{
          color:
            "#000000",
          fontSize:
            "16px",
          lineHeight:
            "1.4",
          fontWeight:
            600,
        }}
      >
        {label}
      </span>

      <span
        style={{
          position:
            "relative",
          width:
            "50px",
          height:
            "28px",
          borderRadius:
            "999px",
          background:
            checked
              ? "#000000"
              : "#cccccc",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            position:
              "absolute",
            top: "3px",
            left: checked
              ? "25px"
              : "3px",
            width:
              "22px",
            height:
              "22px",
            borderRadius:
              "50%",
            background:
              "#ffffff",
            boxShadow:
              "0 2px 5px rgba(0,0,0,0.15)",
          }}
        />
      </span>
    </button>
  );
}

/* =========================================================
   CATEGORY BLOCK
========================================================= */

function CategoryBlock({
  category,
  children,
  isOpen,
  onToggle,
  onEdit,
  onDelete,
  onConfirmDelete,
  deleteConfirmId,
  onAddSubcategory,
}) {
  return (
    <>
      <tr
        style={{
          background:
            "#fffdf9",
        }}
      >
        {/* SERIAL */}

        <td>
          <strong>
            {category.sortOrder ||
              "—"}
          </strong>
        </td>

        {/* IMAGE */}

        <td>
          {category.image ? (
            <Image
              src={
                category.image
              }
              alt={
                category.name
              }
              width={46}
              height={46}
              sizes="46px"
              className="nhf-table-thumb"
              style={{
                width:
                  "46px",
                height:
                  "46px",
                objectFit:
                  "cover",
                borderRadius:
                  "8px",
              }}
            />
          ) : (
            <div
              className="nhf-table-thumb-placeholder"
            >
              —
            </div>
          )}
        </td>

        {/* NAME */}

        <td>
          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: "8px",
              minWidth: 0,
            }}
          >
            {children.length >
            0 ? (
              <button
                type="button"
                onClick={
                  onToggle
                }
                style={{
                  width:
                    "32px",
                  height:
                    "32px",
                  padding: 0,
                  border:
                    "1px solid #d4d4d4",
                  borderRadius:
                    "7px",
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
                  flexShrink: 0,
                }}
              >
                {isOpen ? (
                  <ChevronDown
                    size={
                      18
                    }
                  />
                ) : (
                  <ChevronRight
                    size={
                      18
                    }
                  />
                )}
              </button>
            ) : (
              <span
                style={{
                  width:
                    "32px",
                }}
              />
            )}

            <div
              style={{
                minWidth: 0,
              }}
            >
              <strong>
                {category.name}
              </strong>

              {children.length >
                0 && (
                <span
                  style={{
                    display:
                      "block",
                    marginTop:
                      "4px",
                    fontSize:
                      "14px",
                    color:
                      "#000000",
                    opacity:
                      0.55,
                  }}
                >
                  {children.length}{" "}
                  {children.length ===
                  1
                    ? "subcategory"
                    : "subcategories"}
                </span>
              )}
            </div>
          </div>
        </td>

        {/* TYPE */}

        <td>
          <span className="nhf-badge nhf-badge-olive">
            Category
          </span>
        </td>

        {/* PARENT */}

        <td>
          —
        </td>

        {/* HOME */}

        <td>
          {category.showInHome ? (
            <span className="nhf-badge nhf-badge-green">
              Yes
            </span>
          ) : (
            "—"
          )}
        </td>

        {/* WARDROBE */}

        <td>
          {category.showInWardrobe ? (
            <span className="nhf-badge nhf-badge-olive">
              Yes
            </span>
          ) : (
            "—"
          )}
        </td>

        {/* STATUS */}

        <td>
          <span
            className={
              `nhf-badge ${
                category.isActive
                  ? "nhf-badge-green"
                  : "nhf-badge-red"
              }`
            }
          >
            {category.isActive
              ? "Active"
              : "Inactive"}
          </span>
        </td>

        {/* ACTIONS */}

        <td>
          <div
            style={{
              display:
                "flex",
              gap: "7px",
              alignItems:
                "center",
              flexWrap:
                "wrap",
            }}
          >
            <button
              className="nhf-btn nhf-btn-ghost nhf-btn-sm"
              onClick={() =>
                onAddSubcategory(
                  category._id,
                  category.name
                )
              }
              title="Add Subcategory"
            >
              <Plus
                size={
                  15
                }
              />

              Subcategory
            </button>

            <button
              className="nhf-btn nhf-btn-ghost nhf-btn-icon"
              onClick={() =>
                onEdit(
                  category
                )
              }
              title="Edit"
            >
              <Pencil
                size={
                  17
                }
              />
            </button>

            <button
              className="nhf-btn nhf-btn-danger nhf-btn-icon"
              onClick={() =>
                onDelete(
                  category._id
                )
              }
              title="Delete permanently"
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

      {/* DELETE CONFIRM */}

      {deleteConfirmId ===
        category._id && (
        <tr className="nhf-confirm-row">
          <td
            colSpan={9}
          >
            <div className="nhf-confirm-actions">
              <span
                style={{
                  fontSize:
                    "16px",
                  color:
                    "#000000",
                }}
              >
                Delete permanently{" "}
                <strong>
                  {
                    category.name
                  }
                </strong>
                ?
              </span>

              <button
                className="nhf-btn nhf-btn-danger nhf-btn-sm"
                onClick={() =>
                  onConfirmDelete(
                    category._id
                  )
                }
              >
                Confirm
              </button>

              <button
                className="nhf-btn nhf-btn-ghost nhf-btn-sm"
                onClick={() =>
                  onDelete(
                    null
                  )
                }
              >
                Cancel
              </button>
            </div>
          </td>
        </tr>
      )}

      {/* SUBCATEGORIES */}

      {isOpen &&
        children.map(
          (
            child
          ) => (
            <SubcategoryRow
              key={
                child._id
              }
              category={
                child
              }
              onEdit={
                onEdit
              }
              onDelete={
                onDelete
              }
              onConfirmDelete={
                onConfirmDelete
              }
              deleteConfirmId={
                deleteConfirmId
              }
              onDeleteCancel={() =>
                onDelete(
                  null
                )
              }
            />
          )
        )}
    </>
  );
}

/* =========================================================
   SUBCATEGORY ROW
========================================================= */

function SubcategoryRow({
  category,
  onEdit,
  onDelete,
  onConfirmDelete,
  deleteConfirmId,
  onDeleteCancel,
}) {
  return (
    <>
      <tr
        style={{
          background:
            "#faf7f1",
        }}
      >
        {/* SERIAL */}

        <td>
          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: "7px",
              paddingLeft:
                "18px",
            }}
          >
            <span
              style={{
                color:
                  "#000000",
                opacity:
                  0.4,
              }}
            >
              ↳
            </span>

            <strong>
              {category.sortOrder ||
                "—"}
            </strong>
          </div>
        </td>

        {/* IMAGE */}

        <td>
          {category.image ? (
            <Image
              src={
                category.image
              }
              alt={
                category.name
              }
              width={46}
              height={46}
              sizes="46px"
              className="nhf-table-thumb"
              style={{
                width:
                  "46px",
                height:
                  "46px",
                objectFit:
                  "cover",
                borderRadius:
                  "8px",
              }}
            />
          ) : (
            <div className="nhf-table-thumb-placeholder">
              —
            </div>
          )}
        </td>

        {/* NAME */}

        <td>
          <span
            style={{
              paddingLeft:
                "8px",
              fontSize:
                "16px",
              lineHeight:
                "1.4",
              fontWeight:
                600,
              color:
                "#000000",
            }}
          >
            {category.name}
          </span>
        </td>

        {/* TYPE */}

        <td>
          <span className="nhf-badge nhf-badge-olive">
            Subcategory
          </span>
        </td>

        {/* PARENT */}

        <td
          style={{
            color:
              "#000000",
            fontSize:
              "16px",
          }}
        >
          {typeof category.parent ===
          "object"
            ? category
                .parent
                ?.name ||
              "—"
            : "—"}
        </td>

        {/* HOME */}

        <td>
          —
        </td>

        {/* WARDROBE */}

        <td>
          —
        </td>

        {/* STATUS */}

        <td>
          <span
            className={
              `nhf-badge ${
                category.isActive
                  ? "nhf-badge-green"
                  : "nhf-badge-red"
              }`
            }
          >
            {category.isActive
              ? "Active"
              : "Inactive"}
          </span>
        </td>

        {/* ACTIONS */}

        <td>
          <div
            style={{
              display:
                "flex",
              gap: "7px",
              alignItems:
                "center",
              flexWrap:
                "wrap",
            }}
          >
            <button
              className="nhf-btn nhf-btn-ghost nhf-btn-sm"
              onClick={() => {
                console.log(
                  "Add product to subcategory:",
                  category._id
                );
              }}
              title="Add Product"
            >
              <Plus
                size={
                  15
                }
              />

              Product
            </button>

            <button
              className="nhf-btn nhf-btn-ghost nhf-btn-icon"
              onClick={() =>
                onEdit(
                  category
                )
              }
              title="Edit"
            >
              <Pencil
                size={
                  17
                }
              />
            </button>

            <button
              className="nhf-btn nhf-btn-danger nhf-btn-icon"
              onClick={() =>
                onDelete(
                  category._id
                )
              }
              title="Delete permanently"
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

      {/* DELETE CONFIRM */}

      {deleteConfirmId ===
        category._id && (
        <tr className="nhf-confirm-row">
          <td
            colSpan={9}
          >
            <div className="nhf-confirm-actions">
              <span
                style={{
                  fontSize:
                    "16px",
                  color:
                    "#000000",
                }}
              >
                Delete permanently{" "}
                <strong>
                  {
                    category.name
                  }
                </strong>
                ?
              </span>

              <button
                className="nhf-btn nhf-btn-danger nhf-btn-sm"
                onClick={() =>
                  onConfirmDelete(
                    category._id
                  )
                }
              >
                Confirm
              </button>

              <button
                className="nhf-btn nhf-btn-ghost nhf-btn-sm"
                onClick={
                  onDeleteCancel
                }
              >
                Cancel
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}