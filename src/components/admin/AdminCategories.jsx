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
  parent: "",
  showInHome: false,
  showInWardrobe: false,
  showInFooter: true,
  isActive: true,
  sortOrder: 1,
};

export default function AdminCategories() {
  // ======================================================
  // LIST
  // ======================================================

  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const debounceRef = useRef(null);

  // ======================================================
  // MODAL
  // ======================================================

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  // create | edit

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [formError, setFormError] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // ======================================================
  // DELETE
  // ======================================================

  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // ======================================================
  // EXPANDED CATEGORY
  // ======================================================

  const [expanded, setExpanded] = useState({});

  // ======================================================
  // PARENT OPTIONS
  // ======================================================

  const [parentOptions, setParentOptions] = useState([]);

  // ======================================================
  // LOAD MAIN CATEGORIES FOR PARENT DROPDOWN
  // ======================================================

  const loadParentOptions = useCallback(async () => {
    try {
      const res = await apiFetch(
        "/categories?limit=100"
      );

      if (!res.ok) {
        return;
      }

      const list =
        res.data?.data?.categories || [];

      setParentOptions(
        list.filter(
          (item) => !item.parent
        )
      );
    } catch (error) {
      console.error(
        "Parent categories error:",
        error
      );
    }
  }, []);

  useEffect(() => {
    loadParentOptions();
  }, [loadParentOptions]);

  // ======================================================
  // LOAD ADMIN CATEGORIES
  // ======================================================

  const loadCategories = useCallback(
    async (currentPage, currentSearch) => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        params.set(
          "page",
          String(currentPage)
        );

        params.set(
          "limit",
          String(LIMIT)
        );

        if (currentSearch?.trim()) {
          params.set(
            "search",
            currentSearch.trim()
          );
        }

        const res = await apiFetch(
          `/categories/admin/all?${params.toString()}`
        );

        if (!res.ok) {
          setError(
            res.data?.error ||
              "Failed to load categories."
          );

          setCategories([]);
          setTotal(0);

          return;
        }

        setCategories(
          res.data?.data?.categories || []
        );

        setTotal(
          res.data?.data?.total || 0
        );
      } catch (error) {
        console.error(
          "Categories load error:",
          error
        );

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

  // ======================================================
  // MAIN CATEGORIES
  // ======================================================

  const mainCategories = useMemo(() => {
    return categories
      .filter(
        (item) => !item.parent
      )
      .sort(
        (a, b) =>
          Number(a.sortOrder || 0) -
          Number(b.sortOrder || 0)
      );
  }, [categories]);

  // ======================================================
  // GET CHILDREN
  // ======================================================

  const getChildren = useCallback(
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
            Number(a.sortOrder || 0) -
            Number(b.sortOrder || 0)
        );
    },
    [categories]
  );

  // ======================================================
  // SEARCH
  // ======================================================

  const handleSearch = (event) => {
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

  // ======================================================
  // OPEN CREATE CATEGORY
  // ======================================================

  const openCreateCategory = () => {
    setEditingId(null);
    setModalMode("create");

    setForm({
      ...EMPTY_FORM,
      parent: "",
      sortOrder: 1,
    });

    setFormError("");
    setModalOpen(true);
  };

  // ======================================================
  // OPEN CREATE SUBCATEGORY
  // ======================================================

  const openCreateSubcategory = (
    parentId,
    parentName
  ) => {
    setEditingId(null);
    setModalMode("create");

    setForm({
      ...EMPTY_FORM,
      parent: parentId,
      sortOrder: 1,
    });

    setFormError("");

    setModalOpen(true);

    // Small visual hint
    console.log(
      `Creating subcategory inside ${parentName}`
    );
  };

  // ======================================================
  // OPEN EDIT
  // ======================================================

  const openEdit = (category) => {
    const parentId =
      typeof category.parent ===
      "object"
        ? category.parent?._id
        : category.parent;

    setEditingId(
      category._id
    );

    setModalMode("edit");

    setForm({
      name:
        category.name || "",

      description:
        category.description || "",

      image:
        category.image || "",

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

  // ======================================================
  // CLOSE MODAL
  // ======================================================

  const closeModal = () => {
    if (formSubmitting) {
      return;
    }

    setModalOpen(false);
    setEditingId(null);
    setModalMode("create");

    setForm(
      EMPTY_FORM
    );

    setFormError("");
  };

  // ======================================================
  // FORM UPDATE
  // ======================================================

  const updateForm = (
    key,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (
    event
  ) => {
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

    const sortOrder = Number(
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

        parent:
          form.parent || null,

        /*
         * Home / Wardrobe visibility is available
         * ONLY for main categories.
         *
         * Subcategories must not receive these
         * fields from the frontend.
         */
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
        modalMode === "create"
          ? await apiFetch(
              "/categories",
              {
                method: "POST",
                body: JSON.stringify(
                  body
                ),
              }
            )
          : await apiFetch(
              `/categories/${editingId}`,
              {
                method: "PATCH",
                body: JSON.stringify(
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
    } catch (error) {
      console.error(
        "Category save error:",
        error
      );

      setFormError(
        "Something went wrong while saving."
      );
    } finally {
      setFormSubmitting(false);
    }
  };

  // ======================================================
  // DELETE / DEACTIVATE
  // ======================================================

  // ======================================================
// DELETE / PERMANENT DELETE
// ======================================================

const handleDelete = async (
  categoryId
) => {
  try {
    const res =
      await apiFetch(
        `/categories/permanent/${categoryId}`,
        {
          method:
            "DELETE",
        }
      );

    if (!res.ok) {
      setError(
        res.data?.error ||
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
  } catch (error) {
    console.error(
      "Category delete error:",
      error
    );

    setError(
      "Unable to delete category."
    );
  }
};

  // ======================================================
  // TOGGLE CATEGORY
  // ======================================================

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

  // ======================================================
  // ESC KEY
  // ======================================================

  useEffect(() => {
    if (!modalOpen) {
      return;
    }

    const handler = (
      event
    ) => {
      if (
        event.key === "Escape"
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

  // ======================================================
  // PAGINATION
  // ======================================================

  const pages = Math.ceil(
    total / LIMIT
  );

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <AdminShell>
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
          </p>
        </div>

        <button
          className="nhf-btn nhf-btn-primary"
          onClick={
            openCreateCategory
          }
        >
          <Plus
            size={14}
          />

          Add Category
        </button>
      </div>

      {/* ==================================================
          TOOLBAR
      ================================================== */}

      <div className="nhf-toolbar">
        <div className="nhf-toolbar-left">
          <div className="nhf-search-box">
            <Search
              size={13}
              color="#C0BAB0"
            />

            <input
              placeholder="Search categories…"
              value={search}
              onChange={
                handleSearch
              }
            />

            {search && (
              <button
                type="button"
                style={{
                  background:
                    "none",
                  border:
                    "none",
                  cursor:
                    "pointer",
                  padding: 0,
                  lineHeight:
                    0,
                  color:
                    "#C0BAB0",
                }}
                onClick={
                  clearSearch
                }
              >
                <X
                  size={13}
                />
              </button>
            )}
          </div>
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
            {loading ? (
              Array.from(
                {
                  length: 6,
                }
              ).map(
                (
                  _,
                  index
                ) => (
                  <tr
                    key={
                      index
                    }
                  >
                    {Array.from(
                      {
                        length: 9,
                      }
                    ).map(
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
                                  ? 36
                                  : "75%",
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
                  colSpan={
                    9
                  }
                >
                  <div className="nhf-empty">
                    <div className="nhf-empty-icon">
                      <Search
                        size={
                          22
                        }
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
              className="nhf-btn nhf-btn-ghost nhf-btn-icon"
              onClick={() =>
                setPage(
                  (
                    current
                  ) =>
                    Math.max(
                      1,
                      current - 1
                    )
                )
              }
              disabled={
                page === 1
              }
            >
              <ChevronLeft
                size={14}
              />
            </button>

            <span>
              Page {page} of{" "}
              {pages}
            </span>

            <button
              className="nhf-btn nhf-btn-ghost nhf-btn-icon"
              onClick={() =>
                setPage(
                  (
                    current
                  ) =>
                    Math.min(
                      pages,
                      current + 1
                    )
                )
              }
              disabled={
                page === pages
              }
            >
              <ChevronRight
                size={14}
              />
            </button>
          </div>
        )}
      </div>

      {/* ==================================================
          CATEGORY / SUBCATEGORY MODAL
      ================================================== */}

      {modalOpen && (
        <div
          className="nhf-modal-overlay"
          onClick={(
            event
          ) => {
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
            {/* HEADER */}

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
                      "4px 0 0",
                    fontSize:
                      11,
                    color:
                      "#9ca3af",
                  }}
                >
                  {form.parent
                    ? "This subcategory will belong to the selected category."
                    : "This will create a main category."}
                </p>
              </div>

              <button
                type="button"
                className="nhf-modal-close"
                onClick={
                  closeModal
                }
                aria-label="Close"
              >
                <X
                  size={16}
                />
              </button>
            </div>

            {/* BODY */}

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

              {/* ==================================================
                  TYPE
              ================================================== */}

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
                    gap: 8,
                  }}
                >
                  <button
                    type="button"
                    className="nhf-btn"
                    style={{
                      border:
                        !form.parent
                          ? "1px solid var(--nhf-primary)"
                          : "1px solid #e7e0d5",
                      background:
                        !form.parent
                          ? "#f5ede1"
                          : "#fff",
                    }}
                    onClick={() =>
                      updateForm(
                        "parent",
                        ""
                      )
                    }
                  >
                    Main Category
                  </button>

                  <button
                    type="button"
                    className="nhf-btn"
                    style={{
                      border:
                        form.parent
                          ? "1px solid var(--nhf-primary)"
                          : "1px solid #e7e0d5",
                      background:
                        form.parent
                          ? "#f5ede1"
                          : "#fff",
                    }}
                    onClick={() => {
                      if (
                        !form.parent &&
                        parentOptions.length
                      ) {
                        updateForm(
                          "parent",
                          parentOptions[0]
                            ?._id || ""
                        );
                      }
                    }}
                  >
                    Subcategory
                  </button>
                </div>
              </div>

              {/* ==================================================
                  PARENT
              ================================================== */}

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
                      "5px 0 0",
                    fontSize:
                      11,
                    color:
                      "#9ca3af",
                  }}
                >
                  Empty = main
                  category.
                  Selecting a
                  category = its
                  subcategory.
                </p>
              </div>

              {/* ==================================================
                  NAME
              ================================================== */}

              <div className="nhf-form-group">
                <label className="nhf-form-label">
                  Name *
                </label>

                <input
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
                  autoFocus
                />
              </div>

              {/* ==================================================
                  DESCRIPTION
              ================================================== */}

              <div className="nhf-form-group">
                <label className="nhf-form-label">
                  Description
                </label>

                <textarea
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
                  placeholder="Short description…"
                  rows={3}
                />
              </div>

              {/* ==================================================
                  IMAGE
              ================================================== */}

              <div className="nhf-form-group">
                <label className="nhf-form-label">
                  Image
                </label>

                <ImageUploader
                  value={
                    form.image
                  }
                  onChange={(
                    url
                  ) =>
                    updateForm(
                      "image",
                      url
                    )
                  }
                  folder="categories"
                />
              </div>

              {/* ==================================================
                  SERIAL
              ================================================== */}

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
                />

                <p
                  style={{
                    margin:
                      "5px 0 0",
                    fontSize:
                      11,
                    color:
                      "#9ca3af",
                  }}
                >
                  1 means top
                  position. If
                  another item already
                  has this number,
                  the backend will
                  shift the other
                  items automatically.
                </p>
              </div>

              {/* ==================================================
                  VISIBILITY
              ================================================== */}

              <div
                className="nhf-form-group"
                style={{
                  gap: 10,
                }}
              >
                <label className="nhf-form-label">
                  Visibility
                </label>

                {/* 
                 * Home / Wardrobe options are ONLY
                 * for main categories.
                 * Subcategories never see these controls.
                 */}
                {!form.parent && (
                  <>
                    <label className="nhf-toggle">
                      <input
                        type="checkbox"
                        checked={
                          form.showInHome
                        }
                        onChange={(
                          event
                        ) =>
                          updateForm(
                            "showInHome",
                            event.target
                              .checked
                          )
                        }
                      />

                      <span className="nhf-toggle-track" />

                      Show on Home
                    </label>

                    <label className="nhf-toggle">
                      <input
                        type="checkbox"
                        checked={
                          form.showInWardrobe
                        }
                        onChange={(
                          event
                        ) =>
                          updateForm(
                            "showInWardrobe",
                            event.target
                              .checked
                          )
                        }
                      />

                      <span className="nhf-toggle-track" />

                      Show in Wardrobe
                    </label>
                  </>
                )}

                <label className="nhf-toggle">
                  <input
                    type="checkbox"
                    checked={
                      form.showInFooter
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "showInFooter",
                        event.target
                          .checked
                      )
                    }
                  />

                  <span className="nhf-toggle-track" />

                  Show in Footer
                </label>

                <label className="nhf-toggle">
                  <input
                    type="checkbox"
                    checked={
                      form.isActive
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "isActive",
                        event.target
                          .checked
                      )
                    }
                  />

                  <span className="nhf-toggle-track" />

                  Active
                </label>
              </div>

              {/* ==================================================
                  ACTIONS
              ================================================== */}

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
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="nhf-btn nhf-btn-primary"
                  disabled={
                    formSubmitting
                  }
                >
                  {formSubmitting
                    ? "Saving…"
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
    </AdminShell>
  );
}

/*
|--------------------------------------------------------------------------
| CATEGORY BLOCK
|--------------------------------------------------------------------------
|
| Main category
|   -> Subcategories
|--------------------------------------------------------------------------
*/

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
      {/* ==================================================
          MAIN CATEGORY
      ================================================== */}

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
              width={36}
              height={36}
              className="nhf-table-thumb"
              sizes="36px"
            />
          ) : (
            <div className="nhf-table-thumb-placeholder">
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
              gap: 6,
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
                  border:
                    "none",
                  background:
                    "transparent",
                  padding: 0,
                  cursor:
                    "pointer",
                  display:
                    "flex",
                }}
              >
                {isOpen ? (
                  <ChevronDown
                    size={15}
                  />
                ) : (
                  <ChevronRight
                    size={15}
                  />
                )}
              </button>
            ) : (
              <span
                style={{
                  width: 15,
                }}
              />
            )}

            <strong>
              {category.name}
            </strong>

            {children.length >
              0 && (
              <span
                style={{
                  color:
                    "var(--nhf-muted)",
                  fontSize:
                    10,
                }}
              >
                ({children.length}{" "}
                subcategories)
              </span>
            )}
          </div>
        </td>

        {/* TYPE */}

        <td>
          <span className="nhf-badge nhf-badge-olive">
            Category
          </span>
        </td>

        {/* PARENT */}

        <td>—</td>

        {/* HOME */}

        <td>
          {category.showInHome ? (
            <span className="nhf-badge nhf-badge-green">
              Home
            </span>
          ) : (
            "—"
          )}
        </td>

        {/* WARDROBE */}

        <td>
          {category.showInWardrobe ? (
            <span className="nhf-badge nhf-badge-olive">
              Wardrobe
            </span>
          ) : (
            "—"
          )}
        </td>

        {/* STATUS */}

        <td>
          <span
            className={`nhf-badge ${
              category.isActive
                ? "nhf-badge-green"
                : "nhf-badge-red"
            }`}
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
              gap: 4,
              alignItems:
                "center",
              flexWrap:
                "wrap",
            }}
          >
            {/* ADD SUBCATEGORY */}

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
                size={12}
              />
              Subcategory
            </button>

            {/* EDIT */}

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
                size={13}
              />
            </button>

            {/* DELETE */}

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
                size={13}
              />
            </button>
          </div>
        </td>
      </tr>

      {/* ==================================================
          DELETE CONFIRM
      ================================================== */}

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
                    12,
                  color:
                    "var(--nhf-text)",
                }}
              >
               Delete permanently{" "}
<strong>
  {category.name}
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

      {/* ==================================================
          SUBCATEGORIES
      ================================================== */}

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

/*
|--------------------------------------------------------------------------
| SUBCATEGORY ROW
|--------------------------------------------------------------------------
*/

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
              gap: 6,
              paddingLeft:
                18,
            }}
          >
            <span
              style={{
                color:
                  "#aaa298",
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
              width={36}
              height={36}
              className="nhf-table-thumb"
              sizes="36px"
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
                8,
              fontWeight:
                600,
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
            fontSize:
              11,
            color:
              "var(--nhf-muted)",
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

        <td>—</td>

        {/* WARDROBE */}

        <td>—</td>

        {/* STATUS */}

        <td>
          <span
            className={`nhf-badge ${
              category.isActive
                ? "nhf-badge-green"
                : "nhf-badge-red"
            }`}
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
              gap: 4,
              alignItems:
                "center",
              flexWrap:
                "wrap",
            }}
          >
            {/* ADD PRODUCT
                This will be connected
                with product page next.
            */}

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
                size={12}
              />
              Product
            </button>

            {/* EDIT */}

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
                size={13}
              />
            </button>

            {/* DELETE */}

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
                size={13}
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
                    12,
                  color:
                    "var(--nhf-text)",
                }}
              >
               Delete permanently{" "}
<strong>
  {category.name}
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