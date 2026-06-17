"use client";

import { useState } from "react";

const PRODUCT_CATEGORIES = [
  "Bed Sheets",
  "Quilts / Razai",
  "Cushion Covers",
  "Table Linen",
  "Hand Towels",
  "Wall Hangings",
];

const SUB_CATEGORIES = {
  "Bed Sheets": ["King Size", "Double Size", "Single Size", "Queen Size"],
  "Quilts / Razai": ["King Size", "Double Size", "Single Size"],
  "Cushion Covers": ["16x16 inch", "18x18 inch", "20x20 inch"],
  "Table Linen": ["Table Runner", "Table Cover", "Placemats"],
  "Hand Towels": ["Small", "Medium", "Large"],
  "Wall Hangings": ["Small", "Medium", "Large"],
};

const COUNTRIES = [
  "Australia", "Canada", "France", "Germany", "India",
  "Italy", "Japan", "Netherlands", "New Zealand", "Singapore",
  "Spain", "United Arab Emirates", "United Kingdom", "United States",
];

const BUSINESS_TYPES = [
  "Wholesale distributor",
  "Retail boutique / store",
  "Department store",
  "Interior designer / decorator",
  "Online retailer / eCommerce",
  "Hotel / hospitality group",
  "Export agent / buying house",
];

export default function EnquiryForm({ slug, product }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    country: "",
    businessTypes: [],
    productCategory: "",
    productSubCategory: "",
    companyName: "",
    mobile: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const productName = product?.name || "Percal Hand Block Cotton Double Bed Sheets with 2 pillow KING SIZE";
  const productSku = product?.sku || "HBBS-04";
  const productItem = product?.item || "100% HAND BLOCK COTTON PERCAL BEDSHEET WITH 2 PILLOW";
  const productThread = product?.threadCount || "210 TC";
  const productImage = product?.image || "/images/new-arrivals-hero.jpg";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "productCategory" ? { productSubCategory: "" } : {}),
    }));
  };

  const toggleBusinessType = (type) => {
    setForm((prev) => ({
      ...prev,
      businessTypes: prev.businessTypes.includes(type)
        ? prev.businessTypes.filter((t) => t !== type)
        : [...prev.businessTypes, type],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section style={styles.page}>
        <div style={styles.container}>
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.successTitle}>Enquiry Submitted!</h2>
            <p style={styles.successText}>
              Our export team will respond within 24 hours with pricing,
              samples, and a personalised catalogue.
            </p>
            <p style={styles.successContact}>
              +91 9460387858 &nbsp;|&nbsp; nikitahomefurnishings@yahoo.com
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <h1 style={styles.pageTitle}>
          Bulk Order Enquiry - Nikita Home Furnishings
        </h1>
        <p style={styles.subtitle}>
          Fill in this form and our export team will respond within 24 hours
          with pricing, samples, and a personalised catalogue. All fields
          marked * are required.
          <br />
          <span style={styles.contactLine}>
            +91 9460387858 &nbsp;|&nbsp; nikitahomefurnishings@yahoo.com
            &nbsp;|&nbsp; Jaipur, Rajasthan, India
          </span>
        </p>

        {/* Product Card */}
        <div style={styles.productCard}>
          <img
            src={productImage}
            alt={productName}
            style={styles.productImage}
            onError={(e) => { e.target.style.background = "#e8e4da"; e.target.src = ""; }}
          />
          <div style={styles.productInfo}>
            <h2 style={styles.productName}>{productName}</h2>
            <p style={styles.productMeta}>SKU: {productSku}</p>
            <p style={styles.productMeta}>
              <strong>ITEM :</strong> {productItem}
            </p>
            <p style={styles.productMeta}>
              <strong>THREAD COUNT :</strong> {productThread}
            </p>
          </div>
        </div>

        {/* Form */}
        <div style={styles.formCard}>
          <h3 style={styles.formTitle}>Your Contact Details</h3>

          <form onSubmit={handleSubmit} noValidate>
            <div style={styles.grid}>
              {/* Full Name */}
              <div style={styles.field}>
                <label style={styles.label}>Full name*</label>
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  style={styles.input}
                />
              </div>

              {/* Product Category */}
              <div style={styles.field}>
                <label style={styles.label}>Product Category *</label>
                <div style={styles.selectWrapper}>
                  <select
                    name="productCategory"
                    value={form.productCategory}
                    onChange={handleChange}
                    required
                    style={styles.select}
                  >
                    <option value="">Select Product Category</option>
                    {PRODUCT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <span style={styles.chevron}>▾</span>
                </div>
              </div>

              {/* Business Email */}
              <div style={styles.field}>
                <label style={styles.label}>Business email address</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your business email address"
                  style={styles.input}
                />
              </div>

              {/* Product Sub Category */}
              <div style={styles.field}>
                <label style={styles.label}>Product Sub Category *</label>
                <div style={styles.selectWrapper}>
                  <select
                    name="productSubCategory"
                    value={form.productSubCategory}
                    onChange={handleChange}
                    required
                    style={styles.select}
                  >
                    <option value="">Select Product Sub Category</option>
                    {(SUB_CATEGORIES[form.productCategory] || []).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <span style={styles.chevron}>▾</span>
                </div>
              </div>

              {/* Country */}
              <div style={styles.field}>
                <label style={styles.label}>Country</label>
                <div style={styles.selectWrapper}>
                  <select
                    name="country"
                    value={form.country}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    <option value="">Select Your Country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <span style={styles.chevron}>▾</span>
                </div>
              </div>

              {/* Company Name */}
              <div style={styles.field}>
                <label style={styles.label}>Company / business name*</label>
                <input
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  placeholder="Enter your Company / business name*"
                  required
                  style={styles.input}
                />
              </div>
            </div>

            {/* Business Type + Mobile/Message row */}
            <div style={styles.grid}>
              {/* Business Type checkboxes */}
              <div style={styles.field}>
                <label style={styles.label}>
                  Business Type* <span style={styles.multipleChoice}>Multiple choice</span>
                </label>
                <div style={styles.checkboxGroup}>
                  {BUSINESS_TYPES.map((type) => (
                    <label key={type} style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={form.businessTypes.includes(type)}
                        onChange={() => toggleBusinessType(type)}
                        style={styles.checkbox}
                      />
                      <span style={styles.checkboxText}>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mobile + Message */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={styles.field}>
                  <label style={styles.label}>Mobile/WhatsApp number</label>
                  <input
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    placeholder="Enter your Mobile/WhatsApp number"
                    style={styles.input}
                  />
                </div>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Enter your message what you want ..."
                    rows={6}
                    style={styles.textarea}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div style={styles.submitRow}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.submitBtn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "SUBMITTING..." : "SUBMIT →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

const styles = {
  page: {
    background: "#FDFFF1",
    minHeight: "100vh",
    fontFamily: "'Mona Sans', 'Inter', sans-serif",
    padding: "100px 16px 80px",
  },
  container: {
    maxWidth: "960px",
    margin: "0 auto",
  },
  pageTitle: {
    fontFamily: "'Tobias TRIAL', 'Georgia', serif",
    fontSize: "clamp(22px, 4vw, 30px)",
    fontWeight: 700,
    color: "#7B7F5C",
    textAlign: "center",
    lineHeight: 1.6,
    letterSpacing: "-0.02em",
    marginBottom: "12px",
  },
  subtitle: {
    fontSize: "16px",
    fontWeight: 400,
    color: "#0E0E0E",
    textAlign: "center",
    lineHeight: 1.6,
    marginBottom: "28px",
  },
  contactLine: {
    display: "inline-block",
    marginTop: "4px",
    fontSize: "15px",
    color: "#444",
  },

  /* Product card */
  productCard: {
    background: "#FDFFF1",
    border: "1px solid #E0DDCE",
    borderRadius: "4px",
    display: "flex",
    gap: "24px",
    padding: "24px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  productImage: {
    width: "160px",
    height: "160px",
    objectFit: "cover",
    borderRadius: "4px",
    flexShrink: 0,
    background: "#e8e4da",
  },
  productInfo: {
    flex: 1,
    minWidth: "200px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  productName: {
    fontSize: "20px",
    fontWeight: 700,
    color: "#0E0E0E",
    lineHeight: 1.3,
    margin: 0,
  },
  productMeta: {
    fontSize: "15px",
    color: "#0E0E0E",
    margin: 0,
    lineHeight: 1.6,
  },

  /* Form card */
  formCard: {
    background: "#FDFFF1",
    border: "1px solid #E0DDCE",
    borderRadius: "4px",
    padding: "36px 40px",
  },
  formTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "#0E0E0E",
    textAlign: "center",
    margin: "0 0 28px",
  },

  /* Grid */
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px 32px",
    marginBottom: "20px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    color: "#0E0E0E",
    fontWeight: 400,
  },
  multipleChoice: {
    fontSize: "12px",
    color: "#888",
    marginLeft: "6px",
  },
  input: {
    border: "none",
    borderBottom: "1px solid #BFBCAE",
    borderRadius: 0,
    padding: "6px 0",
    fontSize: "15px",
    color: "#0E0E0E",
    background: "transparent",
    outline: "none",
    width: "100%",
  },
  selectWrapper: {
    position: "relative",
  },
  select: {
    border: "none",
    borderBottom: "1px solid #BFBCAE",
    borderRadius: 0,
    padding: "6px 24px 6px 0",
    fontSize: "15px",
    color: "#666",
    background: "transparent",
    outline: "none",
    width: "100%",
    appearance: "none",
    cursor: "pointer",
  },
  chevron: {
    position: "absolute",
    right: "4px",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    fontSize: "14px",
    color: "#888",
  },

  /* Checkboxes */
  checkboxGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "4px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
  },
  checkbox: {
    width: "16px",
    height: "16px",
    accentColor: "#7B7F5C",
    cursor: "pointer",
    flexShrink: 0,
  },
  checkboxText: {
    fontSize: "15px",
    color: "#0E0E0E",
  },

  /* Textarea */
  textarea: {
    border: "none",
    borderBottom: "1px solid #BFBCAE",
    borderRadius: 0,
    padding: "6px 0",
    fontSize: "15px",
    color: "#0E0E0E",
    background: "transparent",
    outline: "none",
    resize: "vertical",
    width: "100%",
    fontFamily: "inherit",
  },

  /* Submit */
  submitRow: {
    display: "flex",
    justifyContent: "center",
    marginTop: "32px",
  },
  submitBtn: {
    background: "#7B7F5C",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "14px 52px",
    fontSize: "15px",
    fontWeight: 600,
    letterSpacing: "0.05em",
    cursor: "pointer",
    transition: "background 0.2s",
  },

  /* Success */
  successBox: {
    background: "#fff",
    border: "1px solid #E0DDCE",
    borderRadius: "4px",
    padding: "60px 40px",
    textAlign: "center",
    marginTop: "40px",
  },
  successIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "#7B7F5C",
    color: "#fff",
    fontSize: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px",
  },
  successTitle: {
    fontSize: "24px",
    fontWeight: 700,
    color: "#0E0E0E",
    marginBottom: "12px",
  },
  successText: {
    fontSize: "16px",
    color: "#444",
    lineHeight: 1.6,
    maxWidth: "400px",
    margin: "0 auto 16px",
  },
  successContact: {
    fontSize: "14px",
    color: "#888",
  },
};