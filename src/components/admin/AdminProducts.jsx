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

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // SEARCH
  // ======================================================

  const [search, setSearch] = useState("");
  const debounceRef = useRef(null);

  // ======================================================
  // CATEGORY / SUBCATEGORY
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
          Number(a.sortOrder || 0) -
          Number(b.sortOrder || 0)
      );
  }, [allCategories]);

  // ======================================================
  // SUBCATEGORIES
  // ======================================================

  const subcategories = useMemo(() => {
    if (!categoryFilter) {
      return [];
    }

    return allCategories
      .filter((category) => {
        const parentId =
          typeof category.parent === "object"
            ? category.parent?._id
            : category.parent;

        return (
          parentId ===
          categoryFilter
        );
      })
      .sort(
        (a, b) =>
          Number(a.sortOrder || 0) -
          Number(b.sortOrder || 0)
      );
  }, [
    allCategories,
    categoryFilter,
  ]);

  // ======================================================
  // LOAD CATEGORIES
  // ======================================================

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await apiFetch(
          "/categories/admin/all?limit=200"
        );

        if (!res.ok) {
          return;
        }

        setAllCategories(
          res.data?.data?.categories || []
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

  const loadProducts = useCallback(
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
          res.data?.data?.products ||
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
  // PAGE LOAD
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

  const handleSearchChange = (
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
  // CATEGORY
  // ======================================================

  const handleCategoryChange = (
    event
  ) => {
    const value =
      event.target.value;

    setCategoryFilter(value);
    setSubcategoryFilter("");
    setPage(1);
  };

  // ======================================================
  // SUBCATEGORY
  // ======================================================

  const handleSubcategoryChange = (
    event
  ) => {
    const value =
      event.target.value;

    setSubcategoryFilter(value);
    setPage(1);
  };

  // ======================================================
  // ACTIVE
  // ======================================================

  const handleActiveChange = (
    event
  ) => {
    const value =
      event.target.value;

    setActiveFilter(value);
    setPage(1);
  };

  // ======================================================
  // DELETE
  // ======================================================

  const handleDelete = async (
    id
  ) => {
    try {
      const res =
        await apiFetch(
          `/products/permanent/${id}`,
          {
            method: "DELETE",
          }
        );

      if (!res.ok) {
        setError(
          res.data?.error ||
            "Failed to delete product."
        );

        return;
      }

      setDeleteConfirmId(null);

      await loadProducts(
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
  // SUBCATEGORY NAME
  // ======================================================

  const getSubcategory = (
    product
  ) => {
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

  // ======================================================
  // PARENT CATEGORY
  // ======================================================

  const getParentCategory = (
    product
  ) => {
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
        ? subcategory.parent?._id
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

  const pages = Math.max(
    1,
    Math.ceil(
      total / LIMIT
    )
  );

  const pageNumbers = useMemo(() => {
    if (pages <= 1) {
      return [1];
    }

    const result = [];

    let start =
      Math.max(
        1,
        page - 2
      );

    let end =
      Math.min(
        pages,
        page + 2
      );

    if (page <= 2) {
      start = 1;
      end = Math.min(
        pages,
        5
      );
    }

    if (
      page >=
      pages - 1
    ) {
      start =
        Math.max(
          1,
          pages - 4
        );

      end = pages;
    }

    for (
      let i = start;
      i <= end;
      i++
    ) {
      result.push(i);
    }

    return result;
  }, [
    page,
    pages,
  ]);

  // ======================================================
  // RESET FILTERS
  // ======================================================

  const resetFilters = () => {
    clearTimeout(
      debounceRef.current
    );

    setSearch("");
    setCategoryFilter("");
    setSubcategoryFilter("");
    setActiveFilter("");
    setPage(1);
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <AdminShell>
      <style jsx global>{`
        /* ===============================================
           TYPOGRAPHY ONLY
           PAGE WIDTH / EXISTING LAYOUT UNCHANGED
        =============================================== */

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
          opacity: 0.65 !important;
        }

        .nhf-search-box input {
          font-size: 16px !important;
          color: #000000 !important;
          line-height: 1.4 !important;
        }

        .nhf-search-box input::placeholder {
          font-size: 16px !important;
          color: #000000 !important;
          opacity: 0.45 !important;
        }

        .nhf-filter-select {
          font-size: 16px !important;
          color: #000000 !important;
        }

        .nhf-btn {
          font-size: 16px !important;
          line-height: 1.3 !important;
        }

        .nhf-btn-primary {
          font-size: 16px !important;
          font-weight: 700 !important;
          color: #ffffff !important;
        }

        .nhf-btn-sm {
          font-size: 15px !important;
          font-weight: 600 !important;
        }

        .nhf-table th {
          font-size: 15px !important;
          line-height: 1.4 !important;
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
          font-weight: 700 !important;
          color: #000000 !important;
        }

        .nhf-table td > div {
          color: #000000;
        }

        .nhf-badge {
          font-size: 14px !important;
          line-height: 1.2 !important;
          font-weight: 700 !important;
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

        .nhf-confirm-actions {
          font-size: 16px !important;
          color: #000000 !important;
        }

        .nhf-confirm-actions span {
          font-size: 16px !important;
          color: #000000 !important;
          line-height: 1.45 !important;
        }
      `}</style>

      {/* ==================================================
          HEADER
      ================================================== */}

      <div
        className="nhf-page-header"
        style={{
          marginBottom:
            "24px",
        }}
      >
        <div>
          <h1
            className="nhf-page-title"
            style={{
              color:
                "#000000",
            }}
          >
            Products
          </h1>

          <p
            className="nhf-page-sub"
            style={{
              color:
                "#000000",
              fontSize:
                "16px",
            }}
          >
            {total} total
            products
          </p>
        </div>

        <button
          type="button"
          className="nhf-btn nhf-btn-primary"
          onClick={() =>
            router.push(
              "/admin/products/new"
            )
          }
          style={{
            minHeight:
              "46px",
            fontSize:
              "16px",
            fontWeight:
              700,
            color:
              "#ffffff",
          }}
        >
          <Plus
            size={18}
          />

          Add Product
        </button>
      </div>

      {/* ==================================================
          TOOLBAR
      ================================================== */}

      <div
        className="nhf-toolbar"
        style={{
          marginBottom:
            "18px",
        }}
      >
        <div
          className="nhf-toolbar-left"
          style={{
            gap:
              "10px",
            flexWrap:
              "wrap",
          }}
        >
          {/* SEARCH */}

          <div
            className="nhf-search-box"
            style={{
              minHeight:
                "46px",
            }}
          >
            <Search
              size={18}
              color="#000000"
              style={{
                opacity:
                  0.55,
              }}
            />

            <input
              placeholder="Search products..."
              value={search}
              onChange={
                handleSearchChange
              }
              style={{
                fontSize:
                  "16px",
                color:
                  "#000000",
              }}
            />

            {search && (
              <button
                type="button"
                onClick={
                  clearSearch
                }
                style={{
                  background:
                    "transparent",
                  border:
                    "none",
                  padding: 0,
                  cursor:
                    "pointer",
                  color:
                    "#000000",
                }}
              >
                <X size={17} />
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
            style={{
              fontSize:
                "16px",
              color:
                "#000000",
            }}
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
                  {
                    category.sortOrder
                  }
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
            style={{
              fontSize:
                "16px",
              color:
                "#000000",
              opacity:
                !categoryFilter
                  ? 0.5
                  : 1,
            }}
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
            style={{
              fontSize:
                "16px",
              color:
                "#000000",
            }}
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

          {/* RESET */}

          {(search ||
            categoryFilter ||
            subcategoryFilter ||
            activeFilter) && (
            <button
              type="button"
              onClick={
                resetFilters
              }
              className="nhf-btn nhf-btn-ghost"
              style={{
                minHeight:
                  "44px",
                padding:
                  "0 14px",
                fontSize:
                  "15px",
                color:
                  "#000000",
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div
          className="nhf-alert nhf-alert-error"
          style={{
            fontSize:
              "16px",
            color:
              "#000000",
            marginBottom:
              "18px",
          }}
        >
          {error}
        </div>
      )}

      {/* ==================================================
          TABLE
      ================================================== */}

      <div
        className="nhf-table-wrap"
        style={{
          overflowX:
            "auto",
          overflowY:
            "hidden",
        }}
      >
        <table
          className="nhf-table"
          style={{
            minWidth:
              "1100px",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  fontSize:
                    "15px",
                  color:
                    "#000000",
                }}
              >
                #
              </th>

              <th
                style={{
                  fontSize:
                    "15px",
                  color:
                    "#000000",
                }}
              >
                Image
              </th>

              <th
                style={{
                  fontSize:
                    "15px",
                  color:
                    "#000000",
                }}
              >
                Name
              </th>

              <th
                style={{
                  fontSize:
                    "15px",
                  color:
                    "#000000",
                }}
              >
                SKU
              </th>

              <th
                style={{
                  fontSize:
                    "15px",
                  color:
                    "#000000",
                }}
              >
                Category
              </th>

              <th
                style={{
                  fontSize:
                    "15px",
                  color:
                    "#000000",
                }}
              >
                Subcategory
              </th>

              <th
                style={{
                  fontSize:
                    "15px",
                  color:
                    "#000000",
                }}
              >
                Status
              </th>

              <th
                style={{
                  fontSize:
                    "15px",
                  color:
                    "#000000",
                }}
              >
                Featured
              </th>

              <th
                style={{
                  fontSize:
                    "15px",
                  color:
                    "#000000",
                }}
              >
                New Arrivals
              </th>

              <th
                style={{
                  fontSize:
                    "15px",
                  color:
                    "#000000",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {/* =================================================
                LOADING
            ================================================= */}

            {loading ? (
              Array.from({
                length: 6,
              }).map(
                (_, row) => (
                  <tr
                    key={
                      row
                    }
                  >
                    {Array.from({
                      length: 10,
                    }).map(
                      (
                        _,
                        column
                      ) => (
                        <td
                          key={
                            column
                          }
                          style={{
                            height:
                              "84px",
                          }}
                        >
                          <div
                            className="nhf-skeleton nhf-skeleton-text"
                            style={{
                              width:
                                column ===
                                1
                                  ? "48px"
                                  : "78%",
                              height:
                                column ===
                                1
                                  ? "48px"
                                  : "18px",
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
              /* =================================================
                  EMPTY
              ================================================= */

              <tr>
                <td
                  colSpan={
                    10
                  }
                >
                  <div
                    className="nhf-empty"
                    style={{
                      minHeight:
                        "260px",
                      fontSize:
                        "16px",
                      color:
                        "#000000",
                    }}
                  >
                    <div
                      className="nhf-empty-icon"
                      style={{
                        width:
                          "58px",
                        height:
                          "58px",
                      }}
                    >
                      <Search
                        size={28}
                      />
                    </div>

                    <span
                      style={{
                        fontSize:
                          "16px",
                        fontWeight:
                          600,
                        color:
                          "#000000",
                      }}
                    >
                      No products
                      found.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              /* =================================================
                  PRODUCTS
              ================================================= */

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
          <div
            className="nhf-pagination"
            style={{
              minHeight:
                "72px",
            }}
          >
            <button
              type="button"
              className="nhf-btn nhf-btn-ghost nhf-btn-icon"
              onClick={() =>
                setPage(
                  (current) =>
                    Math.max(
                      1,
                      current -
                        1
                    )
                )
              }
              disabled={
                page === 1
              }
              style={{
                width:
                  "40px",
                height:
                  "40px",
                color:
                  "#000000",
              }}
            >
              <ChevronLeft
                size={18}
              />
            </button>

            <span
              style={{
                fontSize:
                  "15px",
                fontWeight:
                  600,
                color:
                  "#000000",
              }}
            >
              Page{" "}
              {page} of{" "}
              {pages}
            </span>

            <button
              type="button"
              className="nhf-btn nhf-btn-ghost nhf-btn-icon"
              onClick={() =>
                setPage(
                  (current) =>
                    Math.min(
                      pages,
                      current +
                        1
                    )
                )
              }
              disabled={
                page ===
                pages
              }
              style={{
                width:
                  "40px",
                height:
                  "40px",
                color:
                  "#000000",
              }}
            >
              <ChevronRight
                size={18}
              />
            </button>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

/* =========================================================
   PRODUCT ROW
========================================================= */

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
        {/* =================================================
            SERIAL
        ================================================= */}

        <td
          style={{
            fontSize:
              "16px",
            lineHeight:
              "1.45",
            color:
              "#000000",
            fontWeight:
              700,
            height:
              "82px",
            padding:
              "12px 14px",
          }}
        >
          {product.sortOrder ||
            "—"}
        </td>

        {/* =================================================
            IMAGE
        ================================================= */}

        <td
          style={{
            height:
              "82px",
            padding:
              "11px 14px",
          }}
        >
          {product.mainImage ? (
            <Image
              src={
                product.mainImage
              }
              alt={
                product.name ||
                "Product"
              }
              width={52}
              height={52}
              sizes="52px"
              className="nhf-table-thumb"
              style={{
                width:
                  "52px",
                height:
                  "52px",
                objectFit:
                  "cover",
                borderRadius:
                  "8px",
                border:
                  "1px solid #dddddd",
              }}
            />
          ) : (
            <div
              className="nhf-table-thumb-placeholder"
              style={{
                width:
                  "52px",
                height:
                  "52px",
              }}
            >
              <span
                style={{
                  fontSize:
                    "15px",
                  color:
                    "#000000",
                }}
              >
                —
              </span>
            </div>
          )}
        </td>

        {/* =================================================
            NAME
        ================================================= */}

        <td
          style={{
            maxWidth:
              "240px",
            padding:
              "12px 14px",
            fontSize:
              "16px",
            lineHeight:
              "1.45",
            fontWeight:
              700,
            color:
              "#000000",
            height:
              "82px",
          }}
        >
          <div
            title={
              product.name ||
              ""
            }
            style={{
              overflow:
                "hidden",
              textOverflow:
                "ellipsis",
              whiteSpace:
                "nowrap",
              fontSize:
                "16px",
              lineHeight:
                "1.45",
              fontWeight:
                700,
              color:
                "#000000",
            }}
          >
            {product.name ||
              "Untitled Product"}
          </div>
        </td>

        {/* =================================================
            SKU
        ================================================= */}

        <td
          style={{
            padding:
              "12px 14px",
            height:
              "82px",
            color:
              "#000000",
            fontFamily:
              "monospace",
            fontSize:
              "15px",
            lineHeight:
              "1.4",
            fontWeight:
              500,
          }}
        >
          {product.sku ||
            "—"}
        </td>

        {/* =================================================
            CATEGORY
        ================================================= */}

        <td
          style={{
            padding:
              "12px 14px",
            height:
              "82px",
            color:
              "#000000",
            fontSize:
              "16px",
            lineHeight:
              "1.45",
            fontWeight:
              600,
          }}
        >
          {category?.name ||
            "—"}
        </td>

        {/* =================================================
            SUBCATEGORY
        ================================================= */}

        <td
          style={{
            padding:
              "12px 14px",
            height:
              "82px",
            color:
              "#000000",
            fontSize:
              "16px",
            lineHeight:
              "1.4",
          }}
        >
          {subcategory ? (
            <div
              style={{
                display:
                  "flex",
                flexDirection:
                  "column",
                gap:
                  "4px",
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
                {
                  subcategory.name
                }
              </div>

              <div
                style={{
                  marginTop:
                    "2px",
                  fontSize:
                    "14px",
                  lineHeight:
                    "1.35",
                  color:
                    "#000000",
                  opacity:
                    0.55,
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
                  "#000000",
                opacity:
                  0.4,
                fontSize:
                  "16px",
              }}
            >
              —
            </span>
          )}
        </td>

        {/* =================================================
            STATUS
        ================================================= */}

        <td
          style={{
            padding:
              "12px 14px",
            height:
              "82px",
          }}
        >
          <span
            className={`nhf-badge ${
              product.isActive
                ? "nhf-badge-green"
                : "nhf-badge-red"
            }`}
            style={{
              fontSize:
                "14px",
              color:
                "#000000",
              fontWeight:
                700,
              minHeight:
                "30px",
              padding:
                "0 10px",
              display:
                "inline-flex",
              alignItems:
                "center",
              justifyContent:
                "center",
            }}
          >
            {product.isActive
              ? "Active"
              : "Inactive"}
          </span>
        </td>

        {/* =================================================
            FEATURED
        ================================================= */}

        <td
          style={{
            padding:
              "12px 14px",
            height:
              "82px",
          }}
        >
          {product.isFeatured ? (
            <span
              className="nhf-badge nhf-badge-olive"
              style={{
                fontSize:
                  "14px",
                color:
                  "#000000",
                fontWeight:
                  700,
                minHeight:
                  "30px",
                padding:
                  "0 10px",
                display:
                  "inline-flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
              }}
            >
              Yes
            </span>
          ) : (
            <span
              style={{
                color:
                  "#000000",
                opacity:
                  0.5,
                fontSize:
                  "16px",
              }}
            >
              No
            </span>
          )}
        </td>

        {/* =================================================
            NEW ARRIVALS
        ================================================= */}

        <td
          style={{
            padding:
              "12px 14px",
            height:
              "82px",
          }}
        >
          {product.showInNewArrivals ? (
            <span
              className="nhf-badge nhf-badge-olive"
              style={{
                fontSize:
                  "14px",
                color:
                  "#000000",
                fontWeight:
                  700,
                minHeight:
                  "30px",
                padding:
                  "0 10px",
                display:
                  "inline-flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
              }}
            >
              Yes
            </span>
          ) : (
            <span
              style={{
                color:
                  "#000000",
                opacity:
                  0.5,
                fontSize:
                  "16px",
              }}
            >
              No
            </span>
          )}
        </td>

        {/* =================================================
            ACTIONS
        ================================================= */}

        <td
          style={{
            height:
              "82px",
            padding:
              "12px 14px",
          }}
        >
          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap:
                "8px",
            }}
          >
            <button
              type="button"
              className="nhf-btn nhf-btn-ghost nhf-btn-icon"
              onClick={
                onEdit
              }
              title="Edit"
              style={{
                width:
                  "42px",
                height:
                  "42px",
                color:
                  "#000000",
              }}
            >
              <Pencil
                size={18}
              />
            </button>

            <button
              type="button"
              className="nhf-btn nhf-btn-danger nhf-btn-icon"
              onClick={
                onDelete
              }
              title="Delete permanently"
              style={{
                width:
                  "42px",
                height:
                  "42px",
                color:
                  "#000000",
              }}
            >
              <Trash2
                size={18}
              />
            </button>
          </div>
        </td>
      </tr>

      {/* =================================================
          DELETE CONFIRM
      ================================================= */}

      {deleteConfirmId ===
        product._id && (
        <tr className="nhf-confirm-row">
          <td
            colSpan={
              10
            }
            style={{
              padding:
                "14px 18px",
            }}
          >
            <div
              className="nhf-confirm-actions"
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "12px",
                flexWrap:
                  "wrap",
              }}
            >
              <span
                style={{
                  marginRight:
                    "auto",
                  fontSize:
                    "16px",
                  lineHeight:
                    "1.45",
                  color:
                    "#000000",
                }}
              >
                Delete permanently{" "}
                <strong
                  style={{
                    fontSize:
                      "16px",
                    color:
                      "#000000",
                  }}
                >
                  {
                    product.name
                  }
                </strong>
                ?
              </span>

              <button
                type="button"
                className="nhf-btn nhf-btn-danger nhf-btn-sm"
                onClick={
                  onConfirmDelete
                }
                style={{
                  minHeight:
                    "40px",
                  padding:
                    "0 16px",
                  fontSize:
                    "15px",
                  color:
                    "#000000",
                }}
              >
                Confirm
              </button>

              <button
                type="button"
                className="nhf-btn nhf-btn-ghost nhf-btn-sm"
                onClick={
                  onCancelDelete
                }
                style={{
                  minHeight:
                    "40px",
                  padding:
                    "0 16px",
                  fontSize:
                    "15px",
                  color:
                    "#000000",
                }}
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