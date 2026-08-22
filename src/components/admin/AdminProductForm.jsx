"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Plus,
  X,
} from "lucide-react";

import {
  apiFetch,
} from "@/lib/adminApi";

import AdminShell from "@/components/admin/AdminShell";
import ImageUploader from "@/components/admin/ImageUploader";

const EMPTY_FORM = {
  name: "",
  sku: "",
  price: 0,

  // IMPORTANT:
  // This stores SUBCATEGORY ID.
  category: "",

  mainImage: "",
  galleryImages: [],

  colors: [],

  item: "",
  threadCount: "",
  fabric: "",
  material: "",
  size: "",
  gsm: "",
  usageApplication: "",
  bedSize: "",
  washType: "",
  packagingType: "",
  type: "",
  countryOfOrigin:
    "Made In India",

  cotton: "",
  handmade: "",
  design: "",

  description: "",
  moreInformation: "",

  features: [],
  materials: [],
  careInstructions: [],
  specs: [],

  isActive: true,
  isFeatured: false,
  showInNewArrivals: false,

  sortOrder: 1,
};


// ======================================================
// STRING LIST EDITOR
// ======================================================

function ListEditor({
  label,
  value,
  onChange,
}) {
  const items =
    Array.isArray(value)
      ? value
      : [];

  const add = () =>
    onChange([
      ...items,
      "",
    ]);

  const remove = (
    index
  ) =>
    onChange(
      items.filter(
        (_, i) =>
          i !== index
      )
    );

  const update = (
    index,
    value
  ) =>
    onChange(
      items.map(
        (item, i) =>
          i === index
            ? value
            : item
      )
    );

  return (
    <div className="nhf-form-group">
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          marginBottom: 6,
        }}
      >
        <label className="nhf-form-label">
          {label}
        </label>

        <button
          type="button"
          className="nhf-btn nhf-btn-ghost nhf-btn-sm"
          onClick={add}
        >
          <Plus size={12} />
          Add
        </button>
      </div>

      <div className="nhf-list-editor">
        {items.map(
          (
            item,
            index
          ) => (
            <div
              key={index}
              className="nhf-list-item"
            >
              <input
                className="nhf-form-input"
                value={item}
                onChange={(
                  event
                ) =>
                  update(
                    index,
                    event.target
                      .value
                  )
                }
                placeholder={`${label} item ${
                  index + 1
                }`}
              />

              <button
                type="button"
                className="nhf-btn nhf-btn-danger nhf-btn-icon"
                onClick={() =>
                  remove(
                    index
                  )
                }
              >
                <X size={12} />
              </button>
            </div>
          )
        )}

        {items.length ===
          0 && (
          <p
            style={{
              fontSize: 11,
              color:
                "var(--nhf-muted)",
            }}
          >
            No items yet.
            Click Add.
          </p>
        )}
      </div>
    </div>
  );
}


// ======================================================
// SPECS EDITOR
// ======================================================

function SpecsEditor({
  value,
  onChange,
}) {
  const specs =
    Array.isArray(value)
      ? value
      : [];

  const add = () =>
    onChange([
      ...specs,
      {
        label: "",
        value: "",
      },
    ]);

  const remove = (
    index
  ) =>
    onChange(
      specs.filter(
        (_, i) =>
          i !== index
      )
    );

  const update = (
    index,
    field,
    value
  ) =>
    onChange(
      specs.map(
        (
          spec,
          i
        ) =>
          i === index
            ? {
                ...spec,
                [field]:
                  value,
              }
            : spec
      )
    );

  return (
    <div className="nhf-form-group">
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
          marginBottom: 6,
        }}
      >
        <label className="nhf-form-label">
          Specs (Key /
          Value)
        </label>

        <button
          type="button"
          className="nhf-btn nhf-btn-ghost nhf-btn-sm"
          onClick={add}
        >
          <Plus size={12} />
          Add Row
        </button>
      </div>

      <div className="nhf-specs-editor">
        {specs.map(
          (
            spec,
            index
          ) => (
            <div
              key={index}
              className="nhf-spec-row"
            >
              <input
                className="nhf-form-input"
                value={
                  spec.label
                }
                onChange={(
                  event
                ) =>
                  update(
                    index,
                    "label",
                    event.target
                      .value
                  )
                }
                placeholder="Label (e.g. Fabric)"
              />

              <input
                className="nhf-form-input"
                value={
                  spec.value
                }
                onChange={(
                  event
                ) =>
                  update(
                    index,
                    "value",
                    event.target
                      .value
                  )
                }
                placeholder="Value (e.g. Cotton)"
              />

              <button
                type="button"
                className="nhf-btn nhf-btn-danger nhf-btn-icon"
                onClick={() =>
                  remove(
                    index
                  )
                }
              >
                <X size={12} />
              </button>
            </div>
          )
        )}

        {specs.length ===
          0 && (
          <p
            style={{
              fontSize: 11,
              color:
                "var(--nhf-muted)",
            }}
          >
            No specs yet.
            Click Add Row.
          </p>
        )}
      </div>
    </div>
  );
}


// ======================================================
// COLORS EDITOR
// ======================================================

function ColorsEditor({
  value,
  onChange,
}) {
  const colors =
    Array.isArray(value)
      ? value
      : [];

  const [
    newColor,
    setNewColor,
  ] =
    useState(
      "#7B7F5C"
    );

  const add = () => {
    if (
      newColor &&
      !colors.includes(
        newColor
      )
    ) {
      onChange([
        ...colors,
        newColor,
      ]);
    }
  };

  const remove = (
    index
  ) =>
    onChange(
      colors.filter(
        (_, i) =>
          i !== index
      )
    );

  return (
    <div className="nhf-form-group">
      <label className="nhf-form-label">
        Colours
      </label>

      <div
        style={{
          display: "flex",
          alignItems:
            "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <input
          type="color"
          value={newColor}
          onChange={(
            event
          ) =>
            setNewColor(
              event.target
                .value
            )
          }
          style={{
            width: 40,
            height: 34,
            padding: 2,
            border:
              "1px solid var(--nhf-border)",
            borderRadius: 6,
            cursor:
              "pointer",
          }}
        />

        <input
          className="nhf-form-input"
          style={{
            maxWidth: 120,
          }}
          value={newColor}
          onChange={(
            event
          ) =>
            setNewColor(
              event.target
                .value
            )
          }
          placeholder="#7B7F5C"
        />

        <button
          type="button"
          className="nhf-btn nhf-btn-ghost nhf-btn-sm"
          onClick={add}
        >
          <Plus size={12} />
          Add
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        {colors.map(
          (
            color,
            index
          ) => (
            <div
              key={index}
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap: 4,
                border:
                  "1px solid var(--nhf-border)",
                borderRadius: 6,
                padding:
                  "3px 8px",
              }}
            >
              <span
                style={{
                  width: 16,
                  height: 16,
                  borderRadius:
                    "50%",
                  background:
                    color,
                  border:
                    "1px solid rgba(0,0,0,0.1)",
                  flexShrink: 0,
                }}
              />

              <span
                style={{
                  fontSize: 11,
                  fontFamily:
                    "monospace",
                }}
              >
                {color}
              </span>

              <button
                type="button"
                onClick={() =>
                  remove(
                    index
                  )
                }
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
                    "var(--nhf-muted)",
                }}
              >
                <X size={11} />
              </button>
            </div>
          )
        )}

        {colors.length ===
          0 && (
          <p
            style={{
              fontSize: 11,
              color:
                "var(--nhf-muted)",
            }}
          >
            No colours yet.
          </p>
        )}
      </div>
    </div>
  );
}


// ======================================================
// MAIN PRODUCT FORM
// ======================================================

export default function AdminProductForm({
  productId,
}) {
  const router =
    useRouter();

  const isEdit =
    Boolean(productId);

  // ====================================================
  // STATE
  // ====================================================

  const [
    form,
    setForm,
  ] =
    useState(
      EMPTY_FORM
    );

  const [
    categories,
    setCategories,
  ] =
    useState([]);

  const [
    loading,
    setLoading,
  ] =
    useState(
      isEdit
    );

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  const [
    nameError,
    setNameError,
  ] =
    useState("");

  const [
    categoryError,
    setCategoryError,
  ] =
    useState("");

  // ====================================================
  // SET FORM
  // ====================================================

  const set = (
    field,
    value
  ) => {
    setForm(
      (current) => ({
        ...current,
        [field]:
          value,
      })
    );
  };

  // ====================================================
  // LOAD CATEGORIES
  // ====================================================

  useEffect(() => {
    const loadCategories =
      async () => {
        try {
          const res =
            await apiFetch(
              "/categories/admin/all?limit=200"
            );

          if (!res.ok) {
            setError(
              "Failed to load categories."
            );

            return;
          }

          setCategories(
            res.data?.data
              ?.categories ||
              []
          );
        } catch (error) {
          console.error(
            "Category load error:",
            error
          );

          setError(
            "Failed to load categories."
          );
        }
      };

    loadCategories();
  }, []);

  // ====================================================
  // MAIN CATEGORIES
  // ====================================================

  const mainCategories =
    useMemo(() => {
      return categories
        .filter(
          (category) =>
            !category.parent
        )
        .sort(
          (
            first,
            second
          ) =>
            Number(
              first.sortOrder ||
                0
            ) -
            Number(
              second.sortOrder ||
                0
            )
        );
    }, [
      categories,
    ]);

  // ====================================================
  // SUBCATEGORIES
  // ====================================================

  const subcategories =
    useMemo(() => {
      if (
        !form.mainCategory
      ) {
        return [];
      }

      return categories
        .filter(
          (category) => {
            const parentId =
              typeof category.parent ===
              "object"
                ? category
                    .parent
                    ?._id
                : category.parent;

            return (
              parentId ===
              form.mainCategory
            );
          }
        )
        .sort(
          (
            first,
            second
          ) =>
            Number(
              first.sortOrder ||
                0
            ) -
            Number(
              second.sortOrder ||
                0
            )
        );
    }, [
      categories,
      form.mainCategory,
    ]);

  // ====================================================
  // LOAD PRODUCT FOR EDIT
  // ====================================================

  useEffect(() => {
    if (!isEdit) {
      setLoading(false);
      return;
    }

    const fetchProduct =
      async () => {
        setLoading(true);

        try {
          const res =
            await apiFetch(
              "/products/admin/all?limit=200"
            );

          if (!res.ok) {
            setError(
              "Failed to load product."
            );

            return;
          }

          const found =
            (
              res.data?.data
                ?.products ||
              []
            ).find(
              (product) =>
                product._id ===
                productId
            );

          if (!found) {
            setError(
              "Product not found."
            );

            return;
          }

          const subcategoryId =
            found.category?._id ??
            found.category ??
            "";

          /*
           * Find parent category
           * of selected subcategory.
           */

          const subcategory =
            categories.find(
              (category) =>
                category._id ===
                subcategoryId
            );

          const mainCategoryId =
            subcategory
              ? typeof subcategory.parent ===
                "object"
                ? subcategory
                    .parent
                    ?._id
                : subcategory.parent
              : "";

          setForm({
            name:
              found.name ??
              "",

            sku:
              found.sku ??
              "",

            price:
              found.price ??
              0,

            category:
              subcategoryId,

            mainCategory:
              mainCategoryId ||
              "",

            mainImage:
              found.mainImage ??
              "",

            galleryImages:
              found.galleryImages ??
              [],

            colors:
              found.colors ??
              [],

            item:
              found.item ??
              "",

            threadCount:
              found.threadCount ??
              "",

            fabric:
              found.fabric ??
              "",

            material:
              found.material ??
              "",

            size:
              found.size ??
              "",

            gsm:
              found.gsm ??
              "",

            usageApplication:
              found.usageApplication ??
              "",

            bedSize:
              found.bedSize ??
              "",

            washType:
              found.washType ??
              "",

            packagingType:
              found.packagingType ??
              "",

            type:
              found.type ??
              "",

            countryOfOrigin:
              found.countryOfOrigin ||
              "Made In India",

            cotton:
              found.cotton ??
              "",

            handmade:
              found.handmade ??
              "",

            design:
              found.design ??
              "",

            description:
              found.description ??
              "",

            moreInformation:
              found.moreInformation ??
              "",

            features:
              found.features ??
              [],

            materials:
              found.materials ??
              [],

            careInstructions:
              found.careInstructions ??
              [],

            specs:
              found.specs ??
              [],

            isActive:
              found.isActive ??
              true,

            isFeatured:
              found.isFeatured ??
              false,

            showInNewArrivals:
              found.showInNewArrivals ??
              false,

            sortOrder:
              found.sortOrder ??
              1,
          });
        } catch (error) {
          console.error(
            "Product load error:",
            error
          );

          setError(
            "Failed to load product."
          );
        } finally {
          setLoading(false);
        }
      };

    /*
     * Category data is needed to determine
     * the parent of the current subcategory.
     */
    if (
      categories.length
    ) {
      fetchProduct();
    }
  }, [
    productId,
    isEdit,
    categories,
  ]);

  // ====================================================
  // MAIN CATEGORY CHANGE
  // ====================================================

  const handleMainCategoryChange =
    (event) => {
      const mainCategoryId =
        event.target.value;

      setForm(
        (current) => ({
          ...current,

          mainCategory:
            mainCategoryId,

          /*
           * Reset product category
           * when parent category changes.
           */
          category:
            "",

          sortOrder:
            1,
        })
      );

      setCategoryError("");
    };

  // ====================================================
  // SUBCATEGORY CHANGE
  // ====================================================

  const handleSubcategoryChange =
    (event) => {
      const subcategoryId =
        event.target.value;

      set(
        "category",
        subcategoryId
      );

      setCategoryError("");

      /*
       * Default product serial
       * starts from 1.
       */
      if (
        subcategoryId &&
        !isEdit
      ) {
        set(
          "sortOrder",
          1
        );
      }
    };

  // ====================================================
  // SUBMIT
  // ====================================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setNameError("");
      setCategoryError("");

      if (
        !form.name.trim()
      ) {
        setNameError(
          "Product name is required."
        );

        return;
      }

      /*
       * MAIN CATEGORY IS NOT ENOUGH.
       *
       * Product must always have
       * a selected SUBCATEGORY.
       */

      if (!form.category) {
        setCategoryError(
          "Please select a subcategory."
        );

        return;
      }

      const selectedSubcategory =
        categories.find(
          (category) =>
            category._id ===
            form.category
        );

      if (
        !selectedSubcategory
          ?.parent
      ) {
        setCategoryError(
          "Product must belong to a subcategory, not a main category."
        );

        return;
      }

      const serial =
        Number(
          form.sortOrder
        );

      if (
        !Number.isInteger(
          serial
        ) ||
        serial < 1
      ) {
        setCategoryError(
          "Product serial number must be 1 or greater."
        );

        return;
      }

      setSubmitting(
        true
      );

      try {
        const body = {
          ...form,

          /*
           * MAIN CATEGORY IS UI ONLY.
           *
           * Backend receives:
           * category = SUBCATEGORY ID
           */

          mainCategory:
            undefined,

          category:
            form.category,

          price:
            Number(
              form.price
            ) || 0,

          sortOrder:
            serial,

          specs:
            form.specs.filter(
              (spec) =>
                spec.label
                  ?.trim() &&
                spec.value
                  ?.trim()
            ),

          features:
            form.features.filter(
              (item) =>
                item.trim()
            ),

          materials:
            form.materials.filter(
              (item) =>
                item.trim()
            ),

          careInstructions:
            form.careInstructions.filter(
              (item) =>
                item.trim()
            ),
        };

        /*
         * Do not send undefined field.
         */

        delete body.mainCategory;

        const res =
          isEdit
            ? await apiFetch(
                `/products/${productId}`,
                {
                  method:
                    "PATCH",
                  body:
                    JSON.stringify(
                      body
                    ),
                }
              )
            : await apiFetch(
                "/products",
                {
                  method:
                    "POST",
                  body:
                    JSON.stringify(
                      body
                    ),
                }
              );

        if (!res.ok) {
          setError(
            res.data?.error ||
              res.data?.message ||
              "Save failed. Please try again."
          );

          return;
        }

        router.push(
          "/admin/products"
        );
      } catch (error) {
        console.error(
          "Product save error:",
          error
        );

        setError(
          "Something went wrong while saving the product."
        );
      } finally {
        setSubmitting(
          false
        );
      }
    };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <AdminShell>
        <div
          style={{
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            minHeight: 300,
            color:
              "var(--nhf-muted)",
            fontSize: 13,
          }}
        >
          <svg
            className="nhf-spinner"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>

          &nbsp; Loading…
        </div>
      </AdminShell>
    );
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <AdminShell
      pageTitle={
        isEdit
          ? "Edit Product"
          : "New Product"
      }
    >
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="nhf-page-header">
        <div>
          <button
            type="button"
            className="nhf-btn nhf-btn-ghost nhf-btn-sm"
            onClick={() =>
              router.push(
                "/admin/products"
              )
            }
            style={{
              marginBottom: 8,
            }}
          >
            <ArrowLeft
              size={13}
            />

            Back to
            Products
          </button>

          <h1 className="nhf-page-title">
            {isEdit
              ? "Edit Product"
              : "Add Product"}
          </h1>
        </div>
      </div>

      {error && (
        <div
          className="nhf-alert nhf-alert-error"
          style={{
            marginBottom: 20,
          }}
        >
          {error}
        </div>
      )}

      <form
        onSubmit={
          handleSubmit
        }
      >
        {/* ==================================================
            BASIC INFORMATION
        ================================================== */}

        <div className="nhf-form-section">
          <div className="nhf-form-section-title">
            Basic Information
          </div>

          {/* PRODUCT NAME */}

          <div
            className="nhf-form-group"
            style={{
              marginBottom: 16,
            }}
          >
            <label className="nhf-form-label">
              Product Name *
            </label>

            <input
              className={`nhf-form-input${
                nameError
                  ? " error"
                  : ""
              }`}
              value={
                form.name
              }
              onChange={(
                event
              ) => {
                set(
                  "name",
                  event.target
                    .value
                );

                setNameError(
                  ""
                );
              }}
              placeholder="e.g. Percal Hand Block Cotton Bed Sheet"
              autoFocus
            />

            {nameError && (
              <div className="nhf-form-error">
                {nameError}
              </div>
            )}
          </div>

          {/* SKU + PRICE */}

          <div
            className="nhf-form-row"
            style={{
              marginBottom: 16,
            }}
          >
            <div className="nhf-form-group">
              <label className="nhf-form-label">
                SKU
              </label>

              <input
                className="nhf-form-input"
                value={
                  form.sku
                }
                onChange={(
                  event
                ) =>
                  set(
                    "sku",
                    event.target
                      .value
                  )
                }
                placeholder="e.g. HBBS-04"
              />
            </div>

            <div className="nhf-form-group">
              <label className="nhf-form-label">
                Price
              </label>

              <input
                type="number"
                min="0"
                className="nhf-form-input"
                value={
                  form.price
                }
                onChange={(
                  event
                ) =>
                  set(
                    "price",
                    event.target
                      .value
                  )
                }
                placeholder="e.g. 2999"
              />
            </div>
          </div>

          {/* ==================================================
              CATEGORY
          ================================================== */}

          <div
            className="nhf-form-row"
            style={{
              marginBottom: 16,
            }}
          >
            {/* MAIN CATEGORY */}

            <div className="nhf-form-group">
              <label className="nhf-form-label">
                Category *
              </label>

              <select
                className="nhf-form-input"
                value={
                  form.mainCategory ||
                  ""
                }
                onChange={
                  handleMainCategoryChange
                }
              >
                <option value="">
                  — Select Category —
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
            </div>

            {/* SUBCATEGORY */}

            <div className="nhf-form-group">
              <label className="nhf-form-label">
                Subcategory *
              </label>

              <select
                className={`nhf-form-input${
                  categoryError
                    ? " error"
                    : ""
                }`}
                value={
                  form.category ||
                  ""
                }
                onChange={
                  handleSubcategoryChange
                }
                disabled={
                  !form.mainCategory
                }
              >
                <option value="">
                  {!form.mainCategory
                    ? "— Select Category First —"
                    : subcategories.length
                    ? "— Select Subcategory —"
                    : "— No Subcategories —"}
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
            </div>
          </div>

          {categoryError && (
            <div
              className="nhf-form-error"
              style={{
                marginBottom: 16,
              }}
            >
              {categoryError}
            </div>
          )}

          {/* ==================================================
              PRODUCT SERIAL
          ================================================== */}

          <div
            className="nhf-form-row"
            style={{
              marginBottom: 16,
            }}
          >
            <div className="nhf-form-group">
              <label className="nhf-form-label">
                Product Serial Number *
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
                  set(
                    "sortOrder",
                    event.target
                      .value
                  )
                }
              />

              <p
                style={{
                  fontSize:
                    11,
                  color:
                    "var(--nhf-muted)",
                  marginTop:
                    5,
                }}
              >
                Serial is maintained
                separately inside
                each subcategory.
              </p>
            </div>

            <div
              className="nhf-form-group"
              style={{
                justifyContent:
                  "flex-end",
                gap: 14,
                flexDirection:
                  "row",
                flexWrap:
                  "wrap",
                paddingTop: 20,
              }}
            >
              <label className="nhf-toggle">
                <input
                  type="checkbox"
                  checked={
                    form.isActive
                  }
                  onChange={(
                    event
                  ) =>
                    set(
                      "isActive",
                      event.target
                        .checked
                    )
                  }
                />

                <span className="nhf-toggle-track" />

                Active
              </label>

              <label className="nhf-toggle">
                <input
                  type="checkbox"
                  checked={
                    form.isFeatured
                  }
                  onChange={(
                    event
                  ) =>
                    set(
                      "isFeatured",
                      event.target
                        .checked
                    )
                  }
                />

                <span className="nhf-toggle-track" />

                Featured
              </label>

              <label className="nhf-toggle">
                <input
                  type="checkbox"
                  checked={
                    form.showInNewArrivals
                  }
                  onChange={(
                    event
                  ) =>
                    set(
                      "showInNewArrivals",
                      event.target
                        .checked
                    )
                  }
                />

                <span className="nhf-toggle-track" />

                New Arrivals
              </label>
            </div>
          </div>
        </div>

        {/* ==================================================
            IMAGES
        ================================================== */}

        <div className="nhf-form-section">
          <div className="nhf-form-section-title">
            Images
          </div>

          <div
            className="nhf-form-row"
            style={{
              marginBottom: 16,
            }}
          >
            <div className="nhf-form-group">
              <label className="nhf-form-label">
                Main Image
              </label>

              <ImageUploader
                value={
                  form.mainImage
                }
                onChange={(
                  url
                ) =>
                  set(
                    "mainImage",
                    url
                  )
                }
                folder="products"
              />
            </div>

            <div className="nhf-form-group">
              <label className="nhf-form-label">
                Gallery Images (up
                to 4)
              </label>

              <ImageUploader
                value={
                  form.galleryImages
                }
                onChange={(
                  urls
                ) =>
                  set(
                    "galleryImages",
                    urls
                  )
                }
                multiple
                folder="products"
              />

              <p
                style={{
                  fontSize:
                    10,
                  color:
                    "var(--nhf-muted)",
                  marginTop:
                    4,
                }}
              >
                Add multiple
                images — shown
                in product detail
                gallery
              </p>
            </div>
          </div>

          <ColorsEditor
            value={
              form.colors
            }
            onChange={(
              value
            ) =>
              set(
                "colors",
                value
              )
            }
          />
        </div>

        {/* ==================================================
            SPECS
        ================================================== */}

        <div className="nhf-form-section">
          <div className="nhf-form-section-title">
            Specs & Attributes
          </div>

          <div
            className="nhf-form-row"
            style={{
              marginBottom: 16,
            }}
          >
            <div className="nhf-form-group">
              <label className="nhf-form-label">
                Item
              </label>

              <input
                className="nhf-form-input"
                value={
                  form.item
                }
                onChange={(
                  event
                ) =>
                  set(
                    "item",
                    event.target
                      .value
                  )
                }
                placeholder="e.g. 100% HAND BLOCK COTTON"
              />
            </div>

            <div className="nhf-form-group">
              <label className="nhf-form-label">
                Thread Count
              </label>

              <input
                className="nhf-form-input"
                value={
                  form.threadCount
                }
                onChange={(
                  event
                ) =>
                  set(
                    "threadCount",
                    event.target
                      .value
                  )
                }
                placeholder="e.g. 210 TC"
              />
            </div>
          </div>

          <div
            className="nhf-form-row"
            style={{
              marginBottom: 16,
            }}
          >
            <div className="nhf-form-group">
              <label className="nhf-form-label">
                Fabric
              </label>

              <input
                className="nhf-form-input"
                value={
                  form.fabric
                }
                onChange={(
                  event
                ) =>
                  set(
                    "fabric",
                    event.target
                      .value
                  )
                }
                placeholder="e.g. Cotton"
              />
            </div>

            <div className="nhf-form-group">
              <label className="nhf-form-label">
                Material
              </label>

              <input
                className="nhf-form-input"
                value={
                  form.material
                }
                onChange={(
                  event
                ) =>
                  set(
                    "material",
                    event.target
                      .value
                  )
                }
                placeholder="e.g. Cotton"
              />
            </div>
          </div>

          <div
            className="nhf-form-row"
            style={{
              marginBottom: 16,
            }}
          >
            <div className="nhf-form-group">
              <label className="nhf-form-label">
                Size
              </label>

              <input
                className="nhf-form-input"
                value={
                  form.size
                }
                onChange={(
                  event
                ) =>
                  set(
                    "size",
                    event.target
                      .value
                  )
                }
                placeholder="e.g. 93x108"
              />
            </div>

            <div className="nhf-form-group">
              <label className="nhf-form-label">
                GSM
              </label>

              <input
                className="nhf-form-input"
                value={
                  form.gsm
                }
                onChange={(
                  event
                ) =>
                  set(
                    "gsm",
                    event.target
                      .value
                  )
                }
                placeholder="e.g. 210"
              />
            </div>
          </div>

          <div
            className="nhf-form-row"
            style={{
              marginBottom: 16,
            }}
          >
            <div className="nhf-form-group">
              <label className="nhf-form-label">
                Usage /
                Application
              </label>

              <input
                className="nhf-form-input"
                value={
                  form.usageApplication
                }
                onChange={(
                  event
                ) =>
                  set(
                    "usageApplication",
                    event.target
                      .value
                  )
                }
                placeholder="e.g. Home"
              />
            </div>

            <div className="nhf-form-group">
              <label className="nhf-form-label">
                Bed Size
              </label>

              <input
                className="nhf-form-input"
                value={
                  form.bedSize
                }
                onChange={(
                  event
                ) =>
                  set(
                    "bedSize",
                    event.target
                      .value
                  )
                }
                placeholder="e.g. Double"
              />
            </div>
          </div>

          <div
            className="nhf-form-row"
            style={{
              marginBottom: 16,
            }}
          >
            <div className="nhf-form-group">
              <label className="nhf-form-label">
                Wash Type
              </label>

              <input
                className="nhf-form-input"
                value={
                  form.washType
                }
                onChange={(
                  event
                ) =>
                  set(
                    "washType",
                    event.target
                      .value
                  )
                }
                placeholder="e.g. Hand Wash"
              />
            </div>

            <div className="nhf-form-group">
              <label className="nhf-form-label">
                Packaging Type
              </label>

              <input
                className="nhf-form-input"
                value={
                  form.packagingType
                }
                onChange={(
                  event
                ) =>
                  set(
                    "packagingType",
                    event.target
                      .value
                  )
                }
                placeholder="e.g. Each Item Packed Separately"
              />
            </div>
          </div>

          <div
            className="nhf-form-row"
            style={{
              marginBottom: 16,
            }}
          >
            <div className="nhf-form-group">
              <label className="nhf-form-label">
                Type
              </label>

              <input
                className="nhf-form-input"
                value={
                  form.type
                }
                onChange={(
                  event
                ) =>
                  set(
                    "type",
                    event.target
                      .value
                  )
                }
                placeholder="e.g. BEDSHEET"
              />
            </div>

            <div className="nhf-form-group">
              <label className="nhf-form-label">
                Country of Origin
              </label>

              <input
                className="nhf-form-input"
                value={
                  form.countryOfOrigin
                }
                onChange={(
                  event
                ) =>
                  set(
                    "countryOfOrigin",
                    event.target
                      .value
                  )
                }
              />
            </div>
          </div>

          <div
            className="nhf-form-row"
            style={{
              marginBottom: 16,
            }}
          >
            <div className="nhf-form-group">
              <label className="nhf-form-label">
                Cotton
              </label>

              <input
                className="nhf-form-input"
                value={
                  form.cotton
                }
                onChange={(
                  event
                ) =>
                  set(
                    "cotton",
                    event.target
                      .value
                  )
                }
                placeholder="e.g. Yes"
              />
            </div>

            <div className="nhf-form-group">
              <label className="nhf-form-label">
                Handmade
              </label>

              <input
                className="nhf-form-input"
                value={
                  form.handmade
                }
                onChange={(
                  event
                ) =>
                  set(
                    "handmade",
                    event.target
                      .value
                  )
                }
                placeholder="e.g. Yes"
              />
            </div>
          </div>

          <div
            className="nhf-form-group"
            style={{
              marginBottom: 16,
            }}
          >
            <label className="nhf-form-label">
              Design
            </label>

            <input
              className="nhf-form-input"
              value={
                form.design
              }
              onChange={(
                event
              ) =>
                set(
                  "design",
                  event.target
                    .value
                )
              }
              placeholder="e.g. Printed"
            />
          </div>

          <SpecsEditor
            value={
              form.specs
            }
            onChange={(
              value
            ) =>
              set(
                "specs",
                value
              )
            }
          />
        </div>

        {/* ==================================================
            DESCRIPTION
        ================================================== */}

        <div className="nhf-form-section">
          <div className="nhf-form-section-title">
            Description &
            Information
          </div>

          <div
            className="nhf-form-group"
            style={{
              marginBottom: 16,
            }}
          >
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
                set(
                  "description",
                  event.target
                    .value
                )
              }
              placeholder="Product description…"
              rows={4}
            />
          </div>

          <div className="nhf-form-group">
            <label className="nhf-form-label">
              More Information
            </label>

            <textarea
              className="nhf-form-textarea"
              value={
                form.moreInformation
              }
              onChange={(
                event
              ) =>
                set(
                  "moreInformation",
                  event.target
                    .value
                )
              }
              placeholder="Additional information about the product…"
              rows={4}
            />
          </div>
        </div>

        {/* ==================================================
            LISTS
        ================================================== */}

        <div className="nhf-form-section">
          <div className="nhf-form-section-title">
            Features, Materials
            & Care
          </div>

          <div
            style={{
              display:
                "flex",
              flexDirection:
                "column",
              gap: 24,
            }}
          >
            <ListEditor
              label="Features"
              value={
                form.features
              }
              onChange={(
                value
              ) =>
                set(
                  "features",
                  value
                )
              }
            />

            <ListEditor
              label="Materials"
              value={
                form.materials
              }
              onChange={(
                value
              ) =>
                set(
                  "materials",
                  value
                )
              }
            />

            <ListEditor
              label="Care Instructions"
              value={
                form.careInstructions
              }
              onChange={(
                value
              ) =>
                set(
                  "careInstructions",
                  value
                )
              }
            />
          </div>
        </div>

        {/* ==================================================
            SUBMIT
        ================================================== */}

        <div
          style={{
            display:
              "flex",
            justifyContent:
              "flex-end",
            gap: 10,
            paddingBottom:
              48,
          }}
        >
          <button
            type="button"
            className="nhf-btn nhf-btn-ghost"
            onClick={() =>
              router.push(
                "/admin/products"
              )
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
            {submitting
              ? "Saving…"
              : isEdit
              ? "Save Changes"
              : "Create Product"}
          </button>
        </div>
      </form>
    </AdminShell>
  );
}