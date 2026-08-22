"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  Pencil,
  Trash2,
  Plus,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { apiFetch } from "@/lib/adminApi";
import AdminShell from "@/components/admin/AdminShell";

const LIMIT = 20;

export default function AdminProducts() {
  const router = useRouter();

  // ======================================================
  // PRODUCTS
  // ======================================================

  const [products, setProducts] =
    useState([]);

  const [total, setTotal] =
    useState(0);

  const [page, setPage] =
    useState(1);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ======================================================
  // SEARCH
  // ======================================================

  const [search, setSearch] =
    useState("");

  const debounceRef =
    useRef(null);

  // ======================================================
  // CATEGORY / SUBCATEGORY FILTER
  // ======================================================

  const [categoryFilter, setCategoryFilter] =
    useState("");

  const [subcategoryFilter, setSubcategoryFilter] =
    useState("");

  const [activeFilter, setActiveFilter] =
    useState("");

  const [allCategories, setAllCategories] =
    useState([]);

  // ======================================================
  // DELETE
  // ======================================================

  const [deleteConfirmId, setDeleteConfirmId] =
    useState(null);

  // ======================================================
  // MAIN CATEGORIES
  // ======================================================

  const mainCategories = useMemo(() => {
    return allCategories
      .filter(
        (category) =>
          !category.parent
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
  }, [
    allCategories,
  ]);

  // ======================================================
  // SUBCATEGORIES OF SELECTED CATEGORY
  // ======================================================

  const subcategories = useMemo(() => {
    if (!categoryFilter) {
      return [];
    }

    return allCategories
      .filter((category) => {
        const parentId =
          typeof category.parent ===
          "object"
            ? category.parent?._id
            : category.parent;

        return (
          parentId ===
          categoryFilter
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
  }, [
    allCategories,
    categoryFilter,
  ]);

  // ======================================================
  // LOAD CATEGORIES
  // ======================================================

  useEffect(() => {
    const loadCategories =
      async () => {
        try {
          const res =
            await apiFetch(
              "/categories/admin/all?limit=200"
            );

          if (!res.ok) {
            return;
          }

          setAllCategories(
            res.data?.data
              ?.categories ||
              []
          );
        } catch (error) {
          console.error(
            "Category filter error:",
            error
          );
        }
      };

    loadCategories();
  }, []);

  // ======================================================
  // LOAD PRODUCTS
  // ======================================================

  const loadProducts =
    useCallback(
      async (
        currentPage,
        currentSearch,
        currentCategory,
        currentSubcategory,
        currentActive
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
            currentSearch
          ) {
            params.set(
              "search",
              currentSearch
            );
          }

          /*
           * Product backend uses category
           * as the SUBCATEGORY id.
           *
           * Therefore:
           *
           * categoryFilter is only useful
           * to determine subcategories.
           *
           * Actual API filter is the
           * selected subcategory.
           */

          if (
            currentSubcategory
          ) {
            params.set(
              "category",
              currentSubcategory
            );
          }

          if (
            currentActive !== ""
          ) {
            params.set(
              "active",
              currentActive
            );
          }

          const res =
            await apiFetch(
              `/products/admin/all?${params.toString()}`
            );

          if (!res.ok) {
            setError(
              res.data?.error ||
                "Failed to load products."
            );

            return;
          }

          setProducts(
            res.data?.data
              ?.products ||
              []
          );

          setTotal(
            res.data?.data?.total ||
              0
          );
        } catch (error) {
          console.error(
            "Products load error:",
            error
          );

          setError(
            "Failed to load products."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  // ======================================================
  // INITIAL / PAGE LOAD
  // ======================================================

  useEffect(() => {
    loadProducts(
      page,
      search,
      categoryFilter,
      subcategoryFilter,
      activeFilter
    );
  }, [
    page,
    search,
    categoryFilter,
    subcategoryFilter,
    activeFilter,
    loadProducts,
  ]);

  // ======================================================
  // SEARCH
  // ======================================================

  const handleSearchChange =
    (event) => {
      const value =
        event.target.value;

      setSearch(value);

      clearTimeout(
        debounceRef.current
      );

      debounceRef.current =
        setTimeout(() => {
          setPage(1);
        }, 400);
    };

  const clearSearch = () => {
    clearTimeout(
      debounceRef.current
    );

    setSearch("");

    setPage(1);
  };

  // ======================================================
  // CATEGORY FILTER
  // ======================================================

  const handleCategoryChange =
    (event) => {
      const value =
        event.target.value;

      setCategoryFilter(
        value
      );

      /*
       * Reset subcategory whenever
       * parent category changes.
       */

      setSubcategoryFilter(
        ""
      );

      setPage(1);
    };

  // ======================================================
  // SUBCATEGORY FILTER
  // ======================================================

  const handleSubcategoryChange =
    (event) => {
      const value =
        event.target.value;

      setSubcategoryFilter(
        value
      );

      setPage(1);
    };

  // ======================================================
  // ACTIVE FILTER
  // ======================================================

  const handleActiveChange =
    (event) => {
      const value =
        event.target.value;

      setActiveFilter(
        value
      );

      setPage(1);
    };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete =
    async (
      id
    ) => {
      try {
        const res =
  await apiFetch(
    `/products/permanent/${id}`,
    {
      method:
        "DELETE",
    }
  );

        if (!res.ok) {
          setError(
            res.data?.error ||
             "Failed to delete product."
          );

          return;
        }

        setDeleteConfirmId(
          null
        );

        /*
         * Re-fetch current list.
         */
        loadProducts(
          page,
          search,
          categoryFilter,
          subcategoryFilter,
          activeFilter
        );
      } catch (error) {
        console.error(
          "Delete product error:",
          error
        );

        setError(
          "Failed to delete product."
        );
      }
    };

  // ======================================================
  // CATEGORY / SUBCATEGORY NAME
  // ======================================================

  const getSubcategory =
    (product) => {
      const subcategoryId =
        typeof product.category ===
        "object"
          ? product.category?._id
          : product.category;

      if (
        !subcategoryId
      ) {
        return null;
      }

      return (
        allCategories.find(
          (category) =>
            category._id ===
            subcategoryId
        ) ||
        (
          typeof product.category ===
          "object"
            ? product.category
            : null
        )
      );
    };

  const getParentCategory =
    (product) => {
      const subcategory =
        getSubcategory(
          product
        );

      if (
        !subcategory
      ) {
        return null;
      }

      const parentId =
        typeof subcategory.parent ===
        "object"
          ? subcategory
              .parent?._id
          : subcategory.parent;

      if (
        !parentId
      ) {
        return null;
      }

      return (
        allCategories.find(
          (category) =>
            category._id ===
            parentId
        ) ||
        (
          typeof subcategory.parent ===
          "object"
            ? subcategory.parent
            : null
        )
      );
    };

  // ======================================================
  // PAGINATION
  // ======================================================

  const pages =
    Math.ceil(
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
            Products
          </h1>

          <p className="nhf-page-sub">
            {total} total
          </p>
        </div>

        <button
          className="nhf-btn nhf-btn-primary"
          onClick={() =>
            router.push(
              "/admin/products/new"
            )
          }
        >
          <Plus
            size={14}
          />

          Add Product
        </button>
      </div>

      {/* ==================================================
          TOOLBAR
      ================================================== */}

      <div className="nhf-toolbar">
        <div
          className="nhf-toolbar-left"
          style={{
            flexWrap:
              "wrap",
          }}
        >
          {/* SEARCH */}

          <div className="nhf-search-box">
            <Search
              size={13}
              color="#C0BAB0"
            />

            <input
              placeholder="Search products…"
              value={
                search
              }
              onChange={
                handleSearchChange
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

          {/* CATEGORY */}

          <select
            className="nhf-filter-select"
            value={
              categoryFilter
            }
            onChange={
              handleCategoryChange
            }
          >
            <option value="">
              All Categories
            </option>

            {mainCategories.map(
              (
                category
              ) => (
                <option
                  key={
                    category._id
                  }
                  value={
                    category._id
                  }
                >
                  {category.sortOrder}
                  {" · "}
                  {
                    category.name
                  }
                </option>
              )
            )}
          </select>

          {/* SUBCATEGORY */}

          <select
            className="nhf-filter-select"
            value={
              subcategoryFilter
            }
            onChange={
              handleSubcategoryChange
            }
            disabled={
              !categoryFilter
            }
          >
            <option value="">
              {!categoryFilter
                ? "Select Category First"
                : subcategories.length
                ? "All Subcategories"
                : "No Subcategories"}
            </option>

            {subcategories.map(
              (
                subcategory
              ) => (
                <option
                  key={
                    subcategory._id
                  }
                  value={
                    subcategory._id
                  }
                >
                  {
                    subcategory.sortOrder
                  }
                  {" · "}
                  {
                    subcategory.name
                  }
                </option>
              )
            )}
          </select>

          {/* STATUS */}

          <select
            className="nhf-filter-select"
            value={
              activeFilter
            }
            onChange={
              handleActiveChange
            }
          >
            <option value="">
              All Status
            </option>

            <option value="true">
              Active
            </option>

            <option value="false">
              Inactive
            </option>
          </select>
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
                #
              </th>

              <th>
                Image
              </th>

              <th>
                Name
              </th>

              <th>
                SKU
              </th>

              <th>
                Category
              </th>

              <th>
                Subcategory
              </th>

              <th>
                Status
              </th>

              <th>
                Featured
              </th>

              <th>
                New Arrivals
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
                  row
                ) => (
                  <tr
                    key={
                      row
                    }
                  >
                    {Array.from(
                      {
                        length: 10,
                      }
                    ).map(
                      (
                        _,
                        column
                      ) => (
                        <td
                          key={
                            column
                          }
                        >
                          <div
                            className="nhf-skeleton nhf-skeleton-text"
                            style={{
                              width:
                                column ===
                                1
                                  ? 36
                                  : "80%",
                            }}
                          />
                        </td>
                      )
                    )}
                  </tr>
                )
              )
            ) : products.length ===
              0 ? (
              <tr>
                <td
                  colSpan={
                    10
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

                    No products
                    found.
                  </div>
                </td>
              </tr>
            ) : (
              products.map(
                (
                  product
                ) => {
                  const subcategory =
                    getSubcategory(
                      product
                    );

                  const parentCategory =
                    getParentCategory(
                      product
                    );

                  return (
                    <ProductRow
                      key={
                        product._id
                      }
                      product={
                        product
                      }
                      category={
                        parentCategory
                      }
                      subcategory={
                        subcategory
                      }
                      deleteConfirmId={
                        deleteConfirmId
                      }
                      onEdit={() =>
                        router.push(
                          `/admin/products/${product._id}/edit`
                        )
                      }
                      onDelete={() =>
                        setDeleteConfirmId(
                          product._id
                        )
                      }
                      onConfirmDelete={() =>
                        handleDelete(
                          product._id
                        )
                      }
                      onCancelDelete={() =>
                        setDeleteConfirmId(
                          null
                        )
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
              Page{" "}
              {page} of{" "}
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
                page ===
                pages
              }
            >
              <ChevronRight
                size={14}
              />
            </button>
          </div>
        )}
      </div>
    </AdminShell>
  );
}


// ======================================================
// PRODUCT ROW
// ======================================================

function ProductRow({
  product,
  category,
  subcategory,
  deleteConfirmId,
  onEdit,
  onDelete,
  onConfirmDelete,
  onCancelDelete,
}) {
  return (
    <>
      <tr>
        {/* SERIAL */}

        <td>
          <strong>
            {product.sortOrder ||
              "—"}
          </strong>
        </td>

        {/* IMAGE */}

        <td>
          {product.mainImage ? (
            <Image
              src={
                product.mainImage
              }
              alt={
                product.name
              }
              width={36}
              height={36}
              className="nhf-table-thumb"
              sizes="36px"
            />
          ) : (
            <div className="nhf-table-thumb-placeholder">
              <span
                style={{
                  fontSize:
                    10,
                }}
              >
                —
              </span>
            </div>
          )}
        </td>

        {/* NAME */}

        <td
          style={{
            fontWeight:
              600,
            maxWidth:
              240,
          }}
        >
          <div
            style={{
              overflow:
                "hidden",
              textOverflow:
                "ellipsis",
              whiteSpace:
                "nowrap",
            }}
            title={
              product.name
            }
          >
            {
              product.name
            }
          </div>
        </td>

        {/* SKU */}

        <td
          style={{
            color:
              "var(--nhf-muted)",
            fontFamily:
              "monospace",
            fontSize:
              11,
          }}
        >
          {product.sku ||
            "—"}
        </td>

        {/* CATEGORY */}

        <td>
          {category?.name ||
            "—"}
        </td>

        {/* SUBCATEGORY */}

        <td>
          {subcategory ? (
            <div>
              <div
                style={{
                  fontWeight:
                    600,
                  fontSize:
                    12,
                }}
              >
                {
                  subcategory.name
                }
              </div>

              <div
                style={{
                  color:
                    "var(--nhf-muted)",
                  fontSize:
                    10,
                  marginTop:
                    2,
                }}
              >
                Serial #
                {
                  subcategory.sortOrder
                }
              </div>
            </div>
          ) : (
            <span
              style={{
                color:
                  "var(--nhf-muted)",
              }}
            >
              —
            </span>
          )}
        </td>

        {/* STATUS */}

        <td>
          <span
            className={`nhf-badge ${
              product.isActive
                ? "nhf-badge-green"
                : "nhf-badge-red"
            }`}
          >
            {product.isActive
              ? "Active"
              : "Inactive"}
          </span>
        </td>

        {/* FEATURED */}

        <td>
          {product.isFeatured ? (
            <span className="nhf-badge nhf-badge-olive">
              Yes
            </span>
          ) : (
            <span
              style={{
                color:
                  "var(--nhf-muted)",
                fontSize:
                  11,
              }}
            >
              No
            </span>
          )}
        </td>

        {/* NEW ARRIVAL */}

        <td>
          {product.showInNewArrivals ? (
            <span className="nhf-badge nhf-badge-olive">
              Yes
            </span>
          ) : (
            <span
              style={{
                color:
                  "var(--nhf-muted)",
                fontSize:
                  11,
              }}
            >
              No
            </span>
          )}
        </td>

        {/* ACTIONS */}

        <td>
          <div
            style={{
              display:
                "flex",
              gap: 4,
            }}
          >
            <button
              className="nhf-btn nhf-btn-ghost nhf-btn-icon"
              onClick={
                onEdit
              }
              title="Edit"
            >
              <Pencil
                size={13}
              />
            </button>

           <button
  className="nhf-btn nhf-btn-danger nhf-btn-icon"
  onClick={
    onDelete
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
        product._id && (
        <tr className="nhf-confirm-row">
          <td
            colSpan={
              10
            }
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
  {product.name}
</strong>
?
              </span>

              <button
                className="nhf-btn nhf-btn-danger nhf-btn-sm"
                onClick={
                  onConfirmDelete
                }
              >
                Confirm
              </button>

              <button
                className="nhf-btn nhf-btn-ghost nhf-btn-sm"
                onClick={
                  onCancelDelete
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