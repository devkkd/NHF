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

import { apiFetch } from "@/lib/adminApi";
import AdminShell from "@/components/admin/AdminShell";
import ImageUploader from "@/components/admin/ImageUploader";

/* =========================================================
   EMPTY FORM
========================================================= */

const EMPTY_FORM = {
  name: "",
  sku: "",

  /* Legacy field - kept for compatibility */
  price: 0,

  /* Product-level price for products without size pricing */
  actualPrice: 0,
  sellingPrice: 0,

  /* Product-level shipping */
  shippingCost: 0,

  /* Category */
  mainCategory: "",
  category: "",

  /* Images */
  mainImage: "",
  galleryImages: [],

  /* Existing colour system */
  colors: [],

  /* Size-wise pricing */
  sizes: [],

  /* Existing attributes */
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
  countryOfOrigin: "Made In India",
  cotton: "",
  handmade: "",
  design: "",

  /* Content */
  description: "",
  moreInformation: "",

  /* Lists */
  features: [],
  materials: [],
  careInstructions: [],
  specs: [],

  /* Status */
  isActive: true,
  isFeatured: false,
  showInNewArrivals: false,
  isOnSale: false,

  /* Ordering */
  sortOrder: 1,
};

/* =========================================================
   COMMON STYLES
========================================================= */

const PAGE = {
  width: "100%",
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "30px 32px 50px",
  boxSizing: "border-box",
  color: "#000000",
};

const PAGE_HEADER = {
  width: "100%",
  marginBottom: "26px",
};

const BACK_BUTTON = {
  height: "42px",
  padding: "0 14px",
  border: "1px solid #d2d2d2",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#000000",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  fontSize: "16px",
  lineHeight: "1",
  fontWeight: 600,
  cursor: "pointer",
  marginBottom: "14px",
};

const PAGE_TITLE = {
  margin: 0,
  fontSize: "22px",
  lineHeight: "1.3",
  fontWeight: 700,
  color: "#000000",
};

const PAGE_SUBTITLE = {
  margin: "6px 0 0",
  fontSize: "16px",
  lineHeight: "1.5",
  color: "#000000",
  opacity: 0.58,
};

const SECTION = {
  width: "100%",
  marginBottom: "22px",
  padding: "24px",
  border: "1px solid #dddddd",
  borderRadius: "12px",
  background: "#ffffff",
  boxSizing: "border-box",
};

const SECTION_TITLE = {
  margin: "0 0 22px",
  fontSize: "20px",
  lineHeight: "1.35",
  fontWeight: 700,
  color: "#000000",
};

const GROUP = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: "9px",
};

const LABEL = {
  color: "#000000",
  fontSize: "16px",
  lineHeight: "1.4",
  fontWeight: 700,
};

const INPUT = {
  width: "100%",
  height: "50px",
  padding: "0 14px",
  border: "1px solid #cccccc",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#000000",
  fontSize: "16px",
  lineHeight: "1.4",
  outline: "none",
  boxSizing: "border-box",
};

const TEXTAREA = {
  width: "100%",
  minHeight: "135px",
  padding: "12px 14px",
  border: "1px solid #cccccc",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#000000",
  fontSize: "16px",
  lineHeight: "1.55",
  outline: "none",
  resize: "vertical",
  boxSizing: "border-box",
};

const GRID_2 = {
  width: "100%",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
  marginBottom: "20px",
};

const GRID_1 = {
  width: "100%",
  marginBottom: "20px",
};

const HELPER = {
  margin: "2px 0 0",
  color: "#000000",
  opacity: 0.55,
  fontSize: "14px",
  lineHeight: "1.45",
};

const PRIMARY_BUTTON = {
  minHeight: "48px",
  padding: "0 22px",
  border: "1px solid #000000",
  borderRadius: "8px",
  background: "#000000",
  color: "#ffffff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  fontSize: "16px",
  lineHeight: "1",
  fontWeight: 700,
  cursor: "pointer",
};

const SECONDARY_BUTTON = {
  minHeight: "48px",
  padding: "0 22px",
  border: "1px solid #cccccc",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#000000",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  fontSize: "16px",
  lineHeight: "1",
  fontWeight: 600,
  cursor: "pointer",
};

const ICON_BUTTON = {
  width: "42px",
  height: "42px",
  padding: 0,
  border: "1px solid #cccccc",
  borderRadius: "8px",
  background: "#ffffff",
  color: "#000000",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

/* =========================================================
   HELPERS
========================================================= */

function calculateDiscount(
  actual,
  selling
) {
  const a = Number(actual || 0);
  const s = Number(selling || 0);

  if (
    !Number.isFinite(a) ||
    !Number.isFinite(s) ||
    a <= 0 ||
    s < 0 ||
    s >= a
  ) {
    return 0;
  }

  return Math.round(
    ((a - s) / a) * 100
  );
}

/* =========================================================
   LIST EDITOR
========================================================= */

function ListEditor({
  label,
  value,
  onChange,
}) {
  const items = Array.isArray(value)
    ? value
    : [];

  const add = () => {
    onChange([
      ...items,
      "",
    ]);
  };

  const remove = (index) => {
    onChange(
      items.filter(
        (_, i) =>
          i !== index
      )
    );
  };

  const update = (
    index,
    nextValue
  ) => {
    onChange(
      items.map(
        (item, i) =>
          i === index
            ? nextValue
            : item
      )
    );
  };

  return (
    <div
      style={{
        ...GROUP,
        gap: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
        }}
      >
        <label style={LABEL}>
          {label}
        </label>

        <button
          type="button"
          onClick={add}
          style={{
            ...SECONDARY_BUTTON,
            minHeight: "40px",
            padding: "0 13px",
            fontSize: "15px",
          }}
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {items.map(
          (
            item,
            index
          ) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <input
                type="text"
                value={
                  item || ""
                }
                onChange={(e) =>
                  update(
                    index,
                    e.target.value
                  )
                }
                placeholder={`${label} item ${
                  index + 1
                }`}
                style={{
                  ...INPUT,
                  flex: 1,
                }}
              />

              <button
                type="button"
                onClick={() =>
                  remove(index)
                }
                style={{
                  ...ICON_BUTTON,
                  flexShrink: 0,
                }}
              >
                <X size={17} />
              </button>
            </div>
          )
        )}

        {items.length ===
          0 && (
          <div
            style={{
              minHeight: "52px",
              padding: "12px 14px",
              border:
                "1px dashed #cccccc",
              borderRadius: "8px",
              background: "#fafafa",
              display: "flex",
              alignItems: "center",
              color: "#000000",
              opacity: 0.55,
              fontSize: "14px",
            }}
          >
            No items yet. Click
            Add.
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   SPECS EDITOR
========================================================= */

function SpecsEditor({
  value,
  onChange,
}) {
  const specs = Array.isArray(
    value
  )
    ? value
    : [];

  const add = () => {
    onChange([
      ...specs,
      {
        label: "",
        value: "",
      },
    ]);
  };

  const remove = (index) => {
    onChange(
      specs.filter(
        (_, i) =>
          i !== index
      )
    );
  };

  const update = (
    index,
    field,
    nextValue
  ) => {
    onChange(
      specs.map(
        (spec, i) =>
          i === index
            ? {
                ...spec,
                [field]:
                  nextValue,
              }
            : spec
      )
    );
  };

  return (
    <div
      style={{
        ...GROUP,
        gap: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
        }}
      >
        <label style={LABEL}>
          Specs (Key / Value)
        </label>

        <button
          type="button"
          onClick={add}
          style={{
            ...SECONDARY_BUTTON,
            minHeight: "40px",
            padding: "0 13px",
            fontSize: "15px",
          }}
        >
          <Plus size={16} />
          Add Row
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {specs.map(
          (
            spec,
            index
          ) => (
            <div
              key={index}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "1fr 1fr 42px",
                gap: "10px",
                alignItems:
                  "center",
              }}
            >
              <input
                type="text"
                value={
                  spec.label || ""
                }
                onChange={(e) =>
                  update(
                    index,
                    "label",
                    e.target.value
                  )
                }
                placeholder="Label (e.g. Fabric)"
                style={
                  INPUT
                }
              />

              <input
                type="text"
                value={
                  spec.value || ""
                }
                onChange={(e) =>
                  update(
                    index,
                    "value",
                    e.target.value
                  )
                }
                placeholder="Value (e.g. Cotton)"
                style={
                  INPUT
                }
              />

              <button
                type="button"
                onClick={() =>
                  remove(index)
                }
                style={
                  ICON_BUTTON
                }
              >
                <X size={17} />
              </button>
            </div>
          )
        )}

        {specs.length ===
          0 && (
          <div
            style={{
              minHeight: "52px",
              padding: "12px 14px",
              border:
                "1px dashed #cccccc",
              borderRadius: "8px",
              background: "#fafafa",
              color: "#000000",
              opacity: 0.55,
              display: "flex",
              alignItems: "center",
              fontSize: "14px",
            }}
          >
            No specs yet. Click
            Add Row.
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   EXISTING COLOUR EDITOR
   KEEPING COLOUR SYSTEM UNCHANGED
========================================================= */

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
  ] = useState(
    "#7B7F5C"
  );

  const add = () => {
    const normalized =
      newColor.trim();

    if (
      normalized &&
      !colors.includes(
        normalized
      )
    ) {
      onChange([
        ...colors,
        normalized,
      ]);
    }
  };

  const remove = (
    index
  ) => {
    onChange(
      colors.filter(
        (_, i) =>
          i !== index
      )
    );
  };

  return (
    <div
      style={{
        ...GROUP,
        gap: "12px",
      }}
    >
      <label style={LABEL}>
        Colours
      </label>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="color"
          value={newColor}
          onChange={(e) =>
            setNewColor(
              e.target.value
            )
          }
          style={{
            width: "50px",
            height: "46px",
            padding: "3px",
            border:
              "1px solid #cccccc",
            borderRadius: "8px",
            cursor: "pointer",
            background: "#ffffff",
          }}
        />

        <input
          type="text"
          value={newColor}
          onChange={(e) =>
            setNewColor(
              e.target.value
            )
          }
          placeholder="#7B7F5C"
          style={{
            ...INPUT,
            width: "160px",
          }}
        />

        <button
          type="button"
          onClick={add}
          style={{
            ...SECONDARY_BUTTON,
            minHeight: "46px",
          }}
        >
          <Plus size={16} />
          Add Colour
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
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
                minHeight: "42px",
                padding:
                  "5px 10px",
                border:
                  "1px solid #d5d5d5",
                borderRadius: "8px",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius:
                    "50%",
                  background: color,
                  border:
                    "1px solid rgba(0,0,0,0.15)",
                  flexShrink: 0,
                }}
              />

              <span
                style={{
                  fontSize: "14px",
                  color: "#000000",
                  fontFamily:
                    "monospace",
                  fontWeight: 600,
                }}
              >
                {color}
              </span>

              <button
                type="button"
                onClick={() =>
                  remove(index)
                }
                style={{
                  width: "26px",
                  height: "26px",
                  padding: 0,
                  border: "none",
                  borderRadius: "5px",
                  background: "#f0f0f0",
                  color: "#000000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={15} />
              </button>
            </div>
          )
        )}

        {colors.length ===
          0 && (
          <div
            style={{
              minHeight: "48px",
              padding:
                "11px 14px",
              border:
                "1px dashed #cccccc",
              borderRadius: "8px",
              background: "#fafafa",
              color: "#000000",
              opacity: 0.55,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            No colours added
            yet.
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   SIZE VARIATIONS
========================================================= */

const CLOTHING_SIZES = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
];

const BEDDING_SIZES = [
  "Single",
  "Double",
  "Queen",
  "King",
  "California King",
];

function SizeVariationsEditor({
  value,
  onChange,
}) {
  const sizes =
    Array.isArray(value)
      ? value
      : [];

  const [
    customSize,
    setCustomSize,
  ] = useState("");

  const addSize = (
    sizeName
  ) => {
    const name =
      String(
        sizeName || ""
      ).trim();

    if (!name) {
      return;
    }

    const exists =
      sizes.some(
        (size) =>
          String(
            size?.name ||
              ""
          )
            .trim()
            .toLowerCase() ===
          name.toLowerCase()
      );

    if (exists) {
      return;
    }

    onChange([
      ...sizes,
      {
        name,
        actualPrice: "",
        sellingPrice: "",
      },
    ]);
  };

  const removeSize = (
    index
  ) => {
    onChange(
      sizes.filter(
        (_, i) =>
          i !== index
      )
    );
  };

  const updateSize = (
    index,
    field,
    value
  ) => {
    onChange(
      sizes.map(
        (size, i) =>
          i === index
            ? {
                ...size,
                [field]:
                  value,
              }
            : size
      )
    );
  };

  const addCustomSize =
    () => {
      const name =
        customSize.trim();

      if (!name) {
        return;
      }

      addSize(name);
      setCustomSize("");
    };

  return (
    <div
      style={{
        ...GROUP,
        gap: "18px",
      }}
    >
      {/* INTRO */}

      <p
        style={{
          margin: 0,
          color: "#000000",
          opacity: 0.6,
          fontSize: "14px",
          lineHeight: "1.55",
        }}
      >
        Add size variations
        when the same product
        has different prices by
        size. Images and
        colours remain the same
        for the product.
      </p>

      {/* PRESET BOXES */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: "14px",
        }}
      >
        {/* CLOTHING */}

        <div
          style={{
            padding: "16px",
            border:
              "1px solid #dddddd",
            borderRadius: "10px",
            background: "#fafafa",
          }}
        >
          <div
            style={{
              color: "#000000",
              fontSize: "15px",
              fontWeight: 700,
              marginBottom:
                "11px",
            }}
          >
            Clothing Sizes
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {CLOTHING_SIZES.map(
              (size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() =>
                    addSize(size)
                  }
                  style={{
                    minWidth: "48px",
                    minHeight: "38px",
                    padding:
                      "0 12px",
                    border:
                      "1px solid #cccccc",
                    borderRadius: "7px",
                    background:
                      "#ffffff",
                    color:
                      "#000000",
                    fontSize:
                      "14px",
                    fontWeight: 700,
                    cursor:
                      "pointer",
                  }}
                >
                  {size}
                </button>
              )
            )}
          </div>
        </div>

        {/* BEDDING */}

        <div
          style={{
            padding: "16px",
            border:
              "1px solid #dddddd",
            borderRadius: "10px",
            background: "#fafafa",
          }}
        >
          <div
            style={{
              color: "#000000",
              fontSize: "15px",
              fontWeight: 700,
              marginBottom:
                "11px",
            }}
          >
            Bedding Sizes
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
            }}
          >
            {BEDDING_SIZES.map(
              (size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() =>
                    addSize(size)
                  }
                  style={{
                    minHeight: "38px",
                    padding:
                      "0 11px",
                    border:
                      "1px solid #cccccc",
                    borderRadius: "7px",
                    background:
                      "#ffffff",
                    color:
                      "#000000",
                    fontSize:
                      "14px",
                    fontWeight: 700,
                    cursor:
                      "pointer",
                  }}
                >
                  {size}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* CUSTOM */}

      <div
        style={{
          padding: "16px",
          border:
            "1px solid #dddddd",
          borderRadius: "10px",
          background: "#ffffff",
        }}
      >
        <label
          style={{
            ...LABEL,
            display: "block",
            marginBottom:
              "9px",
          }}
        >
          Custom Size
        </label>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            value={customSize}
            onChange={(e) =>
              setCustomSize(
                e.target.value
              )
            }
            onKeyDown={(e) => {
              if (
                e.key === "Enter"
              ) {
                e.preventDefault();
                addCustomSize();
              }
            }}
            placeholder="e.g. 108 × 108 inch"
            style={{
              ...INPUT,
              flex: 1,
            }}
          />

          <button
            type="button"
            onClick={
              addCustomSize
            }
            style={{
              ...SECONDARY_BUTTON,
              minHeight: "50px",
              flexShrink: 0,
            }}
          >
            <Plus size={16} />
            Add Size
          </button>
        </div>

        <p
          style={{
            ...HELPER,
            marginTop: "8px",
          }}
        >
          Enter custom sizes
          such as 108 × 108 inch,
          90 × 100 inch, or any
          other size required.
        </p>
      </div>

      {/* SIZE PRICING */}

      {sizes.length > 0 ? (
        <div
          style={{
            width: "100%",
            border:
              "1px solid #dddddd",
            borderRadius: "10px",
            overflow: "hidden",
            background: "#ffffff",
          }}
        >
          {/* HEADER */}

          <div
            style={{
              padding:
                "15px 16px",
              background:
                "#f7f7f7",
              borderBottom:
                "1px solid #dddddd",
              display: "grid",
              gridTemplateColumns:
                "1.1fr 1fr 1fr 100px 42px",
              gap: "12px",
              alignItems:
                "center",
            }}
          >
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#000000",
              }}
            >
              Size
            </div>

            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#000000",
              }}
            >
              Actual Price
            </div>

            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#000000",
              }}
            >
              Selling Price
            </div>

            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#000000",
              }}
            >
              Discount
            </div>

            <div />
          </div>

          {/* ROWS */}

          {sizes.map(
            (
              size,
              index
            ) => {
              const discount =
                calculateDiscount(
                  size.actualPrice,
                  size.sellingPrice
                );

              return (
                <div
                  key={`${size.name}-${index}`}
                  style={{
                    padding:
                      "14px 16px",
                    borderBottom:
                      index ===
                      sizes.length -
                        1
                        ? "none"
                        : "1px solid #e7e7e7",
                    display: "grid",
                    gridTemplateColumns:
                      "1.1fr 1fr 1fr 100px 42px",
                    gap: "12px",
                    alignItems:
                      "center",
                  }}
                >
                  {/* SIZE */}

                  <div
                    style={{
                      minHeight:
                        "50px",
                      padding:
                        "0 13px",
                      border:
                        "1px solid #cccccc",
                      borderRadius:
                        "8px",
                      background:
                        "#fafafa",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      color:
                        "#000000",
                      fontSize:
                        "16px",
                      fontWeight:
                        700,
                    }}
                  >
                    {size.name}
                  </div>

                  {/* ACTUAL */}

                  <input
                    type="number"
                    min="0"
                    value={
                      size.actualPrice ??
                      ""
                    }
                    onChange={(e) =>
                      updateSize(
                        index,
                        "actualPrice",
                        e.target.value
                      )
                    }
                    placeholder="e.g. 3000"
                    style={
                      INPUT
                    }
                  />

                  {/* SELLING */}

                  <input
                    type="number"
                    min="0"
                    value={
                      size.sellingPrice ??
                      ""
                    }
                    onChange={(e) =>
                      updateSize(
                        index,
                        "sellingPrice",
                        e.target.value
                      )
                    }
                    placeholder="e.g. 2400"
                    style={
                      INPUT
                    }
                  />

                  {/* DISCOUNT */}

                  <div
                    style={{
                      minHeight:
                        "38px",
                      padding:
                        "0 9px",
                      borderRadius:
                        "7px",
                      background:
                        discount > 0
                          ? "#eeeeee"
                          : "#f7f7f7",
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
                      whiteSpace:
                        "nowrap",
                    }}
                  >
                    {discount > 0
                      ? `${discount}% OFF`
                      : "—"}
                  </div>

                  {/* REMOVE */}

                  <button
                    type="button"
                    onClick={() =>
                      removeSize(
                        index
                      )
                    }
                    style={
                      ICON_BUTTON
                    }
                    title="Remove size"
                  >
                    <X size={17} />
                  </button>
                </div>
              );
            }
          )}
        </div>
      ) : (
        <div
          style={{
            minHeight: "65px",
            padding:
              "14px 16px",
            border:
              "1px dashed #cccccc",
            borderRadius: "8px",
            background: "#fafafa",
            color: "#000000",
            opacity: 0.58,
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
            lineHeight: "1.45",
          }}
        >
          No size variations
          added. Add clothing,
          bedding or custom sizes
          above.
        </div>
      )}
    </div>
  );
}

/* =========================================================
   TOGGLE
========================================================= */

function Toggle({
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
        minHeight: "48px",
        padding: "0 13px",
        border:
          "1px solid #dddddd",
        borderRadius: "8px",
        background: "#ffffff",
        color: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent:
          "space-between",
        gap: "14px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: 600,
      }}
    >
      <span>{label}</span>

      <span
        style={{
          position:
            "relative",
          width: "50px",
          height: "28px",
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
            width: "22px",
            height: "22px",
            borderRadius:
              "50%",
            background:
              "#ffffff",
            boxShadow:
              "0 2px 5px rgba(0,0,0,0.18)",
            transition:
              "left 0.2s ease",
          }}
        />
      </span>
    </button>
  );
}

/* =========================================================
   MAIN PRODUCT FORM
========================================================= */

export default function AdminProductForm({
  productId,
}) {
  const router =
    useRouter();

  const isEdit =
    Boolean(productId);

  const [
    form,
    setForm,
  ] = useState(
    EMPTY_FORM
  );

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(
    isEdit
  );

  const [
    submitting,
    setSubmitting,
  ] = useState(
    false
  );

  const [
    error,
    setError,
  ] = useState("");

  const [
    nameError,
    setNameError,
  ] = useState("");

  const [
    categoryError,
    setCategoryError,
  ] = useState("");

  /* =======================================================
     SIMPLE SETTER
  ======================================================= */

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

  /* =======================================================
     LOAD CATEGORIES
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadCategories =
      async () => {
        try {
          const res =
            await apiFetch(
              "/categories/admin/all?limit=200"
            );

          if (!res.ok) {
            if (mounted) {
              setError(
                "Failed to load categories."
              );
            }

            return;
          }

          if (mounted) {
            setCategories(
              res.data?.data
                ?.categories || []
            );
          }
        } catch (err) {
          console.error(
            "Category load error:",
            err
          );

          if (mounted) {
            setError(
              "Failed to load categories."
            );
          }
        }
      };

    loadCategories();

    return () => {
      mounted = false;
    };
  }, []);

  /* =======================================================
     MAIN CATEGORIES
  ======================================================= */

  const mainCategories =
    useMemo(() => {
      return categories
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
      categories,
    ]);

  /* =======================================================
     SUBCATEGORIES
  ======================================================= */

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
                ? category.parent?._id
                : category.parent;

            return (
              parentId ===
              form.mainCategory
            );
          }
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
      categories,
      form.mainCategory,
    ]);

  /* =======================================================
     LOAD PRODUCT FOR EDIT
  ======================================================= */

  useEffect(() => {
    if (!isEdit) {
      setLoading(false);
      return;
    }

    if (
      categories.length ===
      0
    ) {
      return;
    }

    let mounted = true;

    const fetchProduct =
      async () => {
        setLoading(true);

        try {
          const res =
            await apiFetch(
              "/products/admin/all?limit=200"
            );

          if (!res.ok) {
            if (mounted) {
              setError(
                "Failed to load product."
              );
            }

            return;
          }

          const products =
            res.data?.data
              ?.products || [];

          const found =
            products.find(
              (product) =>
                product._id ===
                productId
            );

          if (!found) {
            if (mounted) {
              setError(
                "Product not found."
              );
            }

            return;
          }

          const subcategoryId =
            found.category?._id ??
            found.category ??
            "";

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
                ? subcategory.parent?._id
                : subcategory.parent
              : "";

          if (!mounted) {
            return;
          }

          setForm({
            ...EMPTY_FORM,

            name:
              found.name ??
              "",

            sku:
              found.sku ??
              "",

            price:
              found.price ??
              0,

            actualPrice:
              found.actualPrice ??
              0,

            sellingPrice:
              found.sellingPrice ??
              0,

            shippingCost:
              found.shippingCost ??
              0,

            mainCategory:
              mainCategoryId ||
              "",

            category:
              subcategoryId,

            mainImage:
              found.mainImage ??
              "",

            galleryImages:
              Array.isArray(
                found.galleryImages
              )
                ? found.galleryImages
                : [],

            colors:
              Array.isArray(
                found.colors
              )
                ? found.colors
                : [],

            sizes:
              Array.isArray(
                found.sizes
              )
                ? found.sizes.map(
                    (size) => ({
                      name:
                        size?.name ||
                        "",

                      actualPrice:
                        size?.actualPrice ??
                        "",

                      sellingPrice:
                        size?.sellingPrice ??
                        "",
                    })
                  )
                : [],

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
              Array.isArray(
                found.features
              )
                ? found.features
                : [],

            materials:
              Array.isArray(
                found.materials
              )
                ? found.materials
                : [],

            careInstructions:
              Array.isArray(
                found.careInstructions
              )
                ? found.careInstructions
                : [],

            specs:
              Array.isArray(
                found.specs
              )
                ? found.specs
                : [],

            isActive:
              found.isActive ??
              true,

            isFeatured:
              found.isFeatured ??
              false,

            showInNewArrivals:
              found.showInNewArrivals ??
              false,
              isOnSale:
  found.isOnSale ??
  false,


            sortOrder:
              found.sortOrder ??
              1,
          });
        } catch (err) {
          console.error(
            "Product load error:",
            err
          );

          if (mounted) {
            setError(
              err?.message ||
                "Failed to load product."
            );
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };

    fetchProduct();

    return () => {
      mounted = false;
    };
  }, [
    productId,
    isEdit,
    categories,
  ]);

  /* =======================================================
     CATEGORY
  ======================================================= */

  const handleMainCategoryChange =
    (event) => {
      const value =
        event.target.value;

      setForm(
        (current) => ({
          ...current,

          mainCategory:
            value,

          category:
            "",

          sortOrder: 1,
        })
      );

      setCategoryError("");
    };

  /* =======================================================
     SUBCATEGORY
  ======================================================= */

  const handleSubcategoryChange =
    (event) => {
      const value =
        event.target.value;

      set(
        "category",
        value
      );

      setCategoryError("");

      if (
        value &&
        !isEdit
      ) {
        set(
          "sortOrder",
          1
        );
      }
    };

  /* =======================================================
     SUBMIT
  ======================================================= */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setNameError("");
      setCategoryError("");

      /* ===================================================
         NAME
      =================================================== */

      if (
        !form.name.trim()
      ) {
        setNameError(
          "Product name is required."
        );

        return;
      }

      /* ===================================================
         CATEGORY
      =================================================== */

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
        !selectedSubcategory?.parent
      ) {
        setCategoryError(
          "Product must belong to a subcategory, not a main category."
        );

        return;
      }

      /* ===================================================
         SERIAL
      =================================================== */

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

      /* ===================================================
         SIZE DATA
      =================================================== */

      const cleanedSizes =
        (
          Array.isArray(
            form.sizes
          )
            ? form.sizes
            : []
        )
          .map(
            (size) => ({
              name: String(
                size?.name ||
                  ""
              ).trim(),

              actualPrice:
                Number(
                  size?.actualPrice ||
                    0
                ),

              sellingPrice:
                Number(
                  size?.sellingPrice ||
                    0
                ),
            })
          )
          .filter(
            (size) =>
              size.name
          );

      /* ===================================================
         DUPLICATE SIZE CHECK
      =================================================== */

      const sizeNames =
        new Set();

      for (
        const size of cleanedSizes
      ) {
        const key =
          size.name.toLowerCase();

        if (
          sizeNames.has(
            key
          )
        ) {
          setError(
            `Duplicate size "${size.name}".`
          );

          return;
        }

        sizeNames.add(key);
      }

      /* ===================================================
         SIZE PRICE VALIDATION
      =================================================== */

      for (
        const size of cleanedSizes
      ) {
        if (
          size.actualPrice <
          0
        ) {
          setError(
            `Invalid actual price for size "${size.name}".`
          );

          return;
        }

        if (
          size.sellingPrice <
          0
        ) {
          setError(
            `Invalid selling price for size "${size.name}".`
          );

          return;
        }

        if (
          size.actualPrice >
            0 &&
          size.sellingPrice >
            size.actualPrice
        ) {
          setError(
            `Selling price cannot be greater than actual price for size "${size.name}".`
          );

          return;
        }
      }

      /* ===================================================
         PRODUCT LEVEL PRICE
      =================================================== */

      const actualPrice =
        Number(
          form.actualPrice ||
            0
        );

      const sellingPrice =
        Number(
          form.sellingPrice ||
            0
        );

      const shippingCost =
        Number(
          form.shippingCost ||
            0
        );

      if (
        actualPrice < 0
      ) {
        setError(
          "Actual price cannot be negative."
        );

        return;
      }

      if (
        sellingPrice < 0
      ) {
        setError(
          "Selling price cannot be negative."
        );

        return;
      }

      if (
        shippingCost < 0
      ) {
        setError(
          "Shipping cost cannot be negative."
        );

        return;
      }

      if (
        actualPrice > 0 &&
        sellingPrice >
          actualPrice
      ) {
        setError(
          "Selling price cannot be greater than actual price."
        );

        return;
      }

      /* ===================================================
         SUBMIT
      =================================================== */

      setSubmitting(true);

      try {
        const body = {
          ...form,

          category:
            form.category,

          actualPrice,

          sellingPrice,

          shippingCost,

          sizes:
            cleanedSizes,

          /*
           * Legacy price field.
           *
           * For size products:
           * first size selling price.
           *
           * For non-size products:
           * product selling price.
           */

          price:
            cleanedSizes.length >
            0
              ? Number(
                  cleanedSizes[0]
                    ?.sellingPrice ||
                    0
                )
              : sellingPrice,

          sortOrder:
            serial,

          specs:
            (
              Array.isArray(
                form.specs
              )
                ? form.specs
                : []
            ).filter(
              (spec) =>
                spec.label
                  ?.trim() &&
                spec.value
                  ?.trim()
            ),

          features:
            (
              Array.isArray(
                form.features
              )
                ? form.features
                : []
            ).filter(
              (item) =>
                String(
                  item || ""
                ).trim()
            ),

          materials:
            (
              Array.isArray(
                form.materials
              )
                ? form.materials
                : []
            ).filter(
              (item) =>
                String(
                  item || ""
                ).trim()
            ),

          careInstructions:
            (
              Array.isArray(
                form.careInstructions
              )
                ? form.careInstructions
                : []
            ).filter(
              (item) =>
                String(
                  item || ""
                ).trim()
            ),
        };

        /*
         * mainCategory is UI-only.
         * Backend only needs the selected subcategory.
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
              "Failed to save product."
          );

          return;
        }

        router.push(
          "/admin/products"
        );
      } catch (err) {
        console.error(
          "Product save error:",
          err
        );

        setError(
          err?.message ||
            "Something went wrong while saving the product."
        );
      } finally {
        setSubmitting(false);
      }
    };

  /* =======================================================
     PRODUCT DISCOUNT
  ======================================================= */

  const productDiscount =
    useMemo(() => {
      return calculateDiscount(
        form.actualPrice,
        form.sellingPrice
      );
    }, [
      form.actualPrice,
      form.sellingPrice,
    ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <AdminShell>
        <div
          style={{
            minHeight:
              "420px",
            display:
              "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            color:
              "#000000",
            fontSize:
              "16px",
            fontWeight:
              600,
          }}
        >
          Loading product...
        </div>
      </AdminShell>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <AdminShell
      pageTitle={
        isEdit
          ? "Edit Product"
          : "New Product"
      }
    >
      <div
        style={
          PAGE
        }
      >
        {/* ==================================================
            HEADER
        ================================================== */}

        <div
          style={
            PAGE_HEADER
          }
        >
          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/products"
              )
            }
            style={
              BACK_BUTTON
            }
          >
            <ArrowLeft
              size={18}
            />

            Back to Products
          </button>

          <h1
            style={
              PAGE_TITLE
            }
          >
            {isEdit
              ? "Edit Product"
              : "Add Product"}
          </h1>

          <p
            style={
              PAGE_SUBTITLE
            }
          >
            Manage product
            information, images,
            specifications, pricing
            and visibility.
          </p>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div
            style={{
              width: "100%",
              minHeight: "54px",
              marginBottom:
                "20px",
              padding:
                "12px 15px",
              border:
                "1px solid #d0d0d0",
              borderRadius: "8px",
              background:
                "#fafafa",
              color: "#000000",
              fontSize: "16px",
              lineHeight: "1.45",
              boxSizing:
                "border-box",
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

          <section
            style={
              SECTION
            }
          >
            <h2
              style={
                SECTION_TITLE
              }
            >
              Basic Information
            </h2>

            {/* PRODUCT NAME */}

            <div
              style={
                GRID_1
              }
            >
              <div
                style={
                  GROUP
                }
              >
                <label
                  style={
                    LABEL
                  }
                >
                  Product Name *
                </label>

                <input
                  type="text"
                  value={
                    form.name
                  }
                  onChange={(e) => {
                    set(
                      "name",
                      e.target.value
                    );

                    setNameError(
                      ""
                    );
                  }}
                  placeholder="e.g. Percal Hand Block Cotton Bed Sheet"
                  autoFocus
                  style={{
                    ...INPUT,
                    border:
                      nameError
                        ? "1px solid #000000"
                        : "1px solid #cccccc",
                  }}
                />

                {nameError && (
                  <span
                    style={{
                      color:
                        "#000000",
                      fontSize:
                        "14px",
                      fontWeight:
                        600,
                    }}
                  >
                    {nameError}
                  </span>
                )}
              </div>
            </div>

            {/* SKU + SHIPPING */}

            <div
              style={
                GRID_2
              }
            >
              <div
                style={
                  GROUP
                }
              >
                <label
                  style={
                    LABEL
                  }
                >
                  SKU
                </label>

                <input
                  type="text"
                  value={
                    form.sku
                  }
                  onChange={(e) =>
                    set(
                      "sku",
                      e.target.value
                    )
                  }
                  placeholder="e.g. HBBS-04"
                  style={
                    INPUT
                  }
                />
              </div>

              <div
                style={
                  GROUP
                }
              >
                <label
                  style={
                    LABEL
                  }
                >
                  Shipping Cost
                </label>

                <input
                  type="number"
                  min="0"
                  value={
                    form.shippingCost
                  }
                  onChange={(e) =>
                    set(
                      "shippingCost",
                      e.target.value
                    )
                  }
                  placeholder="e.g. 150"
                  style={
                    INPUT
                  }
                />

                <p
                  style={
                    HELPER
                  }
                >
                  Product-level
                  shipping charge.
                  Enter 0 for free
                  shipping.
                </p>
              </div>
            </div>

            {/* =================================================
                PRODUCT PRICE — ONLY ONE PLACE
            ================================================= */}

            <div
              style={{
                padding:
                  "18px",
                marginBottom:
                  "20px",
                border:
                  "1px solid #dddddd",
                borderRadius:
                  "10px",
                background:
                  "#fafafa",
              }}
            >
              <div
                style={{
                  color:
                    "#000000",
                  fontSize:
                    "16px",
                  fontWeight:
                    700,
                  marginBottom:
                    "6px",
                }}
              >
                Product Price
              </div>

              <p
                style={{
                  margin:
                    "0 0 16px",
                  color:
                    "#000000",
                  opacity:
                    0.58,
                  fontSize:
                    "14px",
                  lineHeight:
                    "1.5",
                }}
              >
                Use these prices
                when the product does
                not have size-specific
                pricing.
              </p>

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "1fr 1fr",
                  gap:
                    "14px",
                }}
              >
                <div
                  style={
                    GROUP
                  }
                >
                  <label
                    style={
                      LABEL
                    }
                  >
                    Actual Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.actualPrice
                    }
                    onChange={(e) =>
                      set(
                        "actualPrice",
                        e.target.value
                      )
                    }
                    placeholder="e.g. 2999"
                    style={
                      INPUT
                    }
                  />
                </div>

                <div
                  style={
                    GROUP
                  }
                >
                  <label
                    style={
                      LABEL
                    }
                  >
                    Selling Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.sellingPrice
                    }
                    onChange={(e) =>
                      set(
                        "sellingPrice",
                        e.target.value
                      )
                    }
                    placeholder="e.g. 2499"
                    style={
                      INPUT
                    }
                  />
                </div>
              </div>

              {productDiscount >
                0 && (
                <div
                  style={{
                    marginTop:
                      "13px",
                    display:
                      "inline-flex",
                    alignItems:
                      "center",
                    minHeight:
                      "34px",
                    padding:
                      "0 12px",
                    borderRadius:
                      "7px",
                    background:
                      "#eeeeee",
                    color:
                      "#000000",
                    fontSize:
                      "14px",
                    fontWeight:
                      700,
                  }}
                >
                  {productDiscount}% OFF
                </div>
              )}
            </div>

            {/* CATEGORY */}

            <div
              style={
                GRID_2
              }
            >
              <div
                style={
                  GROUP
                }
              >
                <label
                  style={
                    LABEL
                  }
                >
                  Category *
                </label>

                <select
                  value={
                    form.mainCategory
                  }
                  onChange={
                    handleMainCategoryChange
                  }
                  style={{
                    ...INPUT,
                    cursor:
                      "pointer",
                  }}
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
                        }{" "}
                        ·{" "}
                        {
                          category.name
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              <div
                style={
                  GROUP
                }
              >
                <label
                  style={
                    LABEL
                  }
                >
                  Subcategory *
                </label>

                <select
                  value={
                    form.category
                  }
                  onChange={
                    handleSubcategoryChange
                  }
                  disabled={
                    !form.mainCategory
                  }
                  style={{
                    ...INPUT,
                    cursor:
                      !form.mainCategory
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      !form.mainCategory
                        ? 0.55
                        : 1,
                  }}
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
                        }{" "}
                        ·{" "}
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
                style={{
                  marginTop:
                    "-8px",
                  marginBottom:
                    "20px",
                  color:
                    "#000000",
                  fontSize:
                    "14px",
                  fontWeight:
                    600,
                }}
              >
                {categoryError}
              </div>
            )}

            {/* SERIAL + FLAGS */}

            <div
              style={{
                ...GRID_2,
                marginBottom: 0,
              }}
            >
              <div
                style={
                  GROUP
                }
              >
                <label
                  style={
                    LABEL
                  }
                >
                  Product Serial Number *
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={
                    form.sortOrder
                  }
                  onChange={(e) =>
                    set(
                      "sortOrder",
                      e.target.value
                    )
                  }
                  style={
                    INPUT
                  }
                />

                <p
                  style={
                    HELPER
                  }
                >
                  Serial is maintained
                  separately inside
                  each subcategory.
                </p>
              </div>

              <div
                style={{
                  display:
                    "grid",
                  gridTemplateColumns:
                    "1fr 1fr 1fr 1fr",
                  gap:
                    "10px",
                  alignItems:
                    "end",
                }}
              >
                <Toggle
                  label="Active"
                  checked={
                    form.isActive
                  }
                  onChange={(value) =>
                    set(
                      "isActive",
                      value
                    )
                  }
                />

                <Toggle
                  label="Featured"
                  checked={
                    form.isFeatured
                  }
                  onChange={(value) =>
                    set(
                      "isFeatured",
                      value
                    )
                  }
                />

                <Toggle
                  label="New Arrivals"
                  checked={
                    form.showInNewArrivals
                  }
                  onChange={(value) =>
                    set(
                      "showInNewArrivals",
                      value
                    )
                  }
                />
                <Toggle
  label="Sale"
  checked={form.isOnSale}
  onChange={(value) =>
    set(
      "isOnSale",
      value
    )
  }
/>
              </div>
            </div>
          </section>

          {/* ==================================================
              IMAGES + COLOURS
          ================================================== */}

          <section
            style={
              SECTION
            }
          >
            <h2
              style={
                SECTION_TITLE
              }
            >
              Images
            </h2>

            <div
              style={{
                ...GRID_2,
                marginBottom:
                  "24px",
              }}
            >
              <div
                style={
                  GROUP
                }
              >
                <label
                  style={
                    LABEL
                  }
                >
                  Main Image
                </label>

                <div
                  style={{
                    padding:
                      "16px",
                    border:
                      "1px solid #dddddd",
                    borderRadius:
                      "10px",
                    background:
                      "#fafafa",
                  }}
                >
                  <ImageUploader
                    value={
                      form.mainImage
                    }
                    onChange={(url) =>
                      set(
                        "mainImage",
                        url
                      )
                    }
                    folder="products"
                  />
                </div>
              </div>

              <div
                style={
                  GROUP
                }
              >
                <label
                  style={
                    LABEL
                  }
                >
                  Gallery Images (up to 4)
                </label>

                <div
                  style={{
                    padding:
                      "16px",
                    border:
                      "1px solid #dddddd",
                    borderRadius:
                      "10px",
                    background:
                      "#fafafa",
                  }}
                >
                  <ImageUploader
                    value={
                      form.galleryImages
                    }
                    onChange={(urls) =>
                      set(
                        "galleryImages",
                        urls
                      )
                    }
                    multiple
                    folder="products"
                  />
                </div>

                <p
                  style={
                    HELPER
                  }
                >
                  Add multiple images.
                  They stay the same
                  when the customer
                  changes size.
                </p>
              </div>
            </div>

            <ColorsEditor
              value={
                form.colors
              }
              onChange={(value) =>
                set(
                  "colors",
                  value
                )
              }
            />
          </section>

          {/* ==================================================
              SIZE VARIATIONS
          ================================================== */}

          <section
            style={
              SECTION
            }
          >
            <h2
              style={
                SECTION_TITLE
              }
            >
              Size Variations & Pricing
            </h2>

            <SizeVariationsEditor
              value={
                form.sizes
              }
              onChange={(value) =>
                set(
                  "sizes",
                  value
                )
              }
            />
          </section>

          {/* ==================================================
              SPECS
          ================================================== */}

          <section
            style={
              SECTION
            }
          >
            <h2
              style={
                SECTION_TITLE
              }
            >
              Specs & Attributes
            </h2>

            <div
              style={
                GRID_2
              }
            >
              <TextField
                label="Item"
                value={
                  form.item
                }
                onChange={(value) =>
                  set(
                    "item",
                    value
                  )
                }
                placeholder="e.g. 100% HAND BLOCK COTTON"
              />

              <TextField
                label="Thread Count"
                value={
                  form.threadCount
                }
                onChange={(value) =>
                  set(
                    "threadCount",
                    value
                  )
                }
                placeholder="e.g. 210 TC"
              />
            </div>

            <div
              style={
                GRID_2
              }
            >
              <TextField
                label="Fabric"
                value={
                  form.fabric
                }
                onChange={(value) =>
                  set(
                    "fabric",
                    value
                  )
                }
                placeholder="e.g. Cotton"
              />

              <TextField
                label="Material"
                value={
                  form.material
                }
                onChange={(value) =>
                  set(
                    "material",
                    value
                  )
                }
                placeholder="e.g. Cotton"
              />
            </div>

            <div
              style={
                GRID_2
              }
            >
              <TextField
                label="Size / Dimension"
                value={
                  form.size
                }
                onChange={(value) =>
                  set(
                    "size",
                    value
                  )
                }
                placeholder="e.g. 93x108"
              />

              <TextField
                label="GSM"
                value={
                  form.gsm
                }
                onChange={(value) =>
                  set(
                    "gsm",
                    value
                  )
                }
                placeholder="e.g. 210"
              />
            </div>

            <div
              style={
                GRID_2
              }
            >
              <TextField
                label="Usage / Application"
                value={
                  form.usageApplication
                }
                onChange={(value) =>
                  set(
                    "usageApplication",
                    value
                  )
                }
                placeholder="e.g. Home"
              />

              <TextField
                label="Bed Size"
                value={
                  form.bedSize
                }
                onChange={(value) =>
                  set(
                    "bedSize",
                    value
                  )
                }
                placeholder="e.g. Double"
              />
            </div>

            <div
              style={
                GRID_2
              }
            >
              <TextField
                label="Wash Type"
                value={
                  form.washType
                }
                onChange={(value) =>
                  set(
                    "washType",
                    value
                  )
                }
                placeholder="e.g. Hand Wash"
              />

              <TextField
                label="Packaging Type"
                value={
                  form.packagingType
                }
                onChange={(value) =>
                  set(
                    "packagingType",
                    value
                  )
                }
                placeholder="e.g. Each Item Packed Separately"
              />
            </div>

            <div
              style={
                GRID_2
              }
            >
              <TextField
                label="Type"
                value={
                  form.type
                }
                onChange={(value) =>
                  set(
                    "type",
                    value
                  )
                }
                placeholder="e.g. BEDSHEET"
              />

              <TextField
                label="Country of Origin"
                value={
                  form.countryOfOrigin
                }
                onChange={(value) =>
                  set(
                    "countryOfOrigin",
                    value
                  )
                }
                placeholder="Made In India"
              />
            </div>

            <div
              style={
                GRID_2
              }
            >
              <TextField
                label="Cotton"
                value={
                  form.cotton
                }
                onChange={(value) =>
                  set(
                    "cotton",
                    value
                  )
                }
                placeholder="e.g. Yes"
              />

              <TextField
                label="Handmade"
                value={
                  form.handmade
                }
                onChange={(value) =>
                  set(
                    "handmade",
                    value
                  )
                }
                placeholder="e.g. Yes"
              />
            </div>

            <div
              style={{
                ...GRID_1,
                marginBottom:
                  "24px",
              }}
            >
              <TextField
                label="Design"
                value={
                  form.design
                }
                onChange={(value) =>
                  set(
                    "design",
                    value
                  )
                }
                placeholder="e.g. Printed"
              />
            </div>

            <SpecsEditor
              value={
                form.specs
              }
              onChange={(value) =>
                set(
                  "specs",
                  value
                )
              }
            />
          </section>

          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <section
            style={
              SECTION
            }
          >
            <h2
              style={
                SECTION_TITLE
              }
            >
              Description & Information
            </h2>

            <div
              style={{
                marginBottom:
                  "20px",
              }}
            >
              <TextareaField
                label="Description"
                value={
                  form.description
                }
                onChange={(value) =>
                  set(
                    "description",
                    value
                  )
                }
                placeholder="Product description..."
              />
            </div>

            <TextareaField
              label="More Information"
              value={
                form.moreInformation
              }
              onChange={(value) =>
                set(
                  "moreInformation",
                  value
                )
              }
              placeholder="Additional information about the product..."
            />
          </section>

          {/* ==================================================
              FEATURES / MATERIALS / CARE
          ================================================== */}

          <section
            style={
              SECTION
            }
          >
            <h2
              style={
                SECTION_TITLE
              }
            >
              Features, Materials & Care
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection:
                  "column",
                gap: "28px",
              }}
            >
              <ListEditor
                label="Features"
                value={
                  form.features
                }
                onChange={(value) =>
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
                onChange={(value) =>
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
                onChange={(value) =>
                  set(
                    "careInstructions",
                    value
                  )
                }
              />
            </div>
          </section>

          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div
            style={{
              width:
                "100%",
              padding:
                "4px 0 15px",
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "flex-end",
              gap: "12px",
            }}
          >
            <button
              type="button"
              onClick={() =>
                router.push(
                  "/admin/products"
                )
              }
              disabled={
                submitting
              }
              style={{
                ...SECONDARY_BUTTON,
                opacity:
                  submitting
                    ? 0.5
                    : 1,
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
                ...PRIMARY_BUTTON,
                minWidth:
                  "170px",
                opacity:
                  submitting
                    ? 0.55
                    : 1,
                cursor:
                  submitting
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {submitting
                ? "Saving..."
                : isEdit
                ? "Save Changes"
                : "Create Product"}
            </button>
          </div>
        </form>
      </div>

      {/* =====================================================
          RESPONSIVE
      ===================================================== */}

      <style jsx>{`
        @media (max-width: 850px) {
          .product-grid-2 {
            grid-template-columns: 1fr !important;
          }

          .size-pricing-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 700px) {
          .size-price-header {
            display: none !important;
          }

          .size-price-row {
            display: grid !important;
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 600px) {
          .product-page {
            padding: 20px 14px 35px !important;
          }

          .product-section {
            padding: 18px !important;
          }

          .product-footer {
            flex-direction:
              column-reverse !important;
            align-items:
              stretch !important;
          }

          .product-footer button {
            width: 100% !important;
          }
        }
      `}</style>
    </AdminShell>
  );
}

/* =========================================================
   TEXT FIELD
========================================================= */

function TextField({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div
      style={
        GROUP
      }
    >
      <label
        style={
          LABEL
        }
      >
        {label}
      </label>

      <input
        type="text"
        value={
          value || ""
        }
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        placeholder={
          placeholder
        }
        style={
          INPUT
        }
      />
    </div>
  );
}

/* =========================================================
   TEXTAREA FIELD
========================================================= */

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <div
      style={
        GROUP
      }
    >
      <label
        style={
          LABEL
        }
      >
        {label}
      </label>

      <textarea
        rows={5}
        value={
          value || ""
        }
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        placeholder={
          placeholder
        }
        style={
          TEXTAREA
        }
      />
    </div>
  );
}