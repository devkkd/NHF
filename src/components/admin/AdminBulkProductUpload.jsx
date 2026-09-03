"use client";

import { useRef, useState } from "react";

import {
  FileSpreadsheet,
  Image as ImageIcon,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  X,
  FileImage,
  RefreshCw,
  FolderOpen,
} from "lucide-react";

import {
  bulkUploadProducts,
  downloadBulkProductTemplate,
} from "@/lib/adminApi";

import AdminShell from "@/components/admin/AdminShell";

export default function AdminBulkProductUpload() {
  const excelInputRef = useRef(null);

  const imageInputRef = useRef(null);

  const folderInputRef = useRef(null);

  /* =========================================================
     STATE
  ========================================================= */

  const [excelFile, setExcelFile] = useState(null);

  const [imageFiles, setImageFiles] = useState([]);

  const [uploading, setUploading] = useState(false);

  const [downloadingTemplate, setDownloadingTemplate] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const [result, setResult] = useState(null);

  const [draggingExcel, setDraggingExcel] = useState(false);

  /* =========================================================
     RESET MESSAGES
  ========================================================= */

  const clearMessages = () => {
    setMessage("");
    setError("");
  };

  /* =========================================================
     EXCEL VALIDATION
  ========================================================= */

  const validateExcel = (file) => {
    if (!file) {
      return false;
    }

    const validExtensions = [".xlsx", ".xls", ".csv"];

    const extension =
      "." +
      file.name.split(".").pop().toLowerCase();

    if (!validExtensions.includes(extension)) {
      setError(
        "Please select a valid Excel file (.xlsx, .xls or .csv)."
      );

      return false;
    }

    return true;
  };

  /* =========================================================
     EXCEL SELECT
  ========================================================= */

  const handleExcelFile = (file) => {
    clearMessages();
    setResult(null);

    if (!file) {
      return;
    }

    if (!validateExcel(file)) {
      setExcelFile(null);
      return;
    }

    setExcelFile(file);
  };

  const handleExcelChange = (event) => {
    const file = event.target.files?.[0];

    handleExcelFile(file);
  };

  /* =========================================================
     EXCEL DRAG & DROP
  ========================================================= */

  const handleDragOver = (event) => {
    event.preventDefault();
    setDraggingExcel(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDraggingExcel(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setDraggingExcel(false);

    const file = event.dataTransfer.files?.[0];

    handleExcelFile(file);
  };

  /* =========================================================
     IMAGE VALIDATION
  ========================================================= */

  const allowedImageTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  const filterImages = (files) => {
    return files.filter((file) => {
      const type = file.type?.toLowerCase();

      const extension =
        "." +
        file.name.split(".").pop().toLowerCase();

      return (
        allowedImageTypes.includes(type) ||
        [".jpg", ".jpeg", ".png", ".webp"].includes(
          extension
        )
      );
    });
  };

  /* =========================================================
     IMAGE SELECT
  ========================================================= */

  const handleImagesChange = (event) => {
    clearMessages();
    setResult(null);

    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) {
      return;
    }

    const validImages = filterImages(files);

    if (validImages.length !== files.length) {
      setError(
        "Only JPG, JPEG, PNG and WEBP images are allowed. Invalid files were removed."
      );
    }

    setImageFiles(validImages);
  };

  /* =========================================================
     IMAGE FOLDER SELECT
  ========================================================= */

  const handleFolderChange = (event) => {
    clearMessages();
    setResult(null);

    const files = Array.from(
      event.target.files || []
    );

    if (!files.length) {
      return;
    }

    const validImages = filterImages(files);

    if (!validImages.length) {
      setImageFiles([]);

      setError(
        "No valid images found in the selected folder."
      );

      return;
    }

    if (validImages.length !== files.length) {
      setError(
        "Some non-image files were ignored. Only JPG, JPEG, PNG and WEBP images were added."
      );
    }

    setImageFiles(validImages);
  };

  /* =========================================================
     REMOVE IMAGE
  ========================================================= */

  const removeImage = (index) => {
    setImageFiles((current) =>
      current.filter((_, i) => i !== index)
    );
  };

  /* =========================================================
     CLEAR ALL
  ========================================================= */

  const clearAll = () => {
    setExcelFile(null);
    setImageFiles([]);

    setMessage("");
    setError("");
    setResult(null);

    if (excelInputRef.current) {
      excelInputRef.current.value = "";
    }

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    if (folderInputRef.current) {
      folderInputRef.current.value = "";
    }
  };

  /* =========================================================
     DOWNLOAD TEMPLATE
  ========================================================= */

  const handleDownloadTemplate = async () => {
    clearMessages();

    setDownloadingTemplate(true);

    try {
      const response =
        await downloadBulkProductTemplate();

      if (!response.ok) {
        setError(
          response.data?.message ||
            response.data?.error ||
            "Unable to download template."
        );

        return;
      }

      const url = window.URL.createObjectURL(
        response.blob
      );

      const anchor = document.createElement("a");

      anchor.href = url;

      anchor.download =
        "NHF-Bulk-Product-Template.xlsx";

      document.body.appendChild(anchor);

      anchor.click();

      anchor.remove();

      window.URL.revokeObjectURL(url);

      setMessage(
        "Sample Excel template downloaded successfully."
      );
    } catch (err) {
      console.error(err);

      setError(
        "Unable to download sample Excel."
      );
    } finally {
      setDownloadingTemplate(false);
    }
  };

  /* =========================================================
     UPLOAD
  ========================================================= */

  const handleUpload = async () => {
    clearMessages();
    setResult(null);

    if (!excelFile) {
      setError(
        "Please select the Excel file first."
      );

      return;
    }

    const formData = new FormData();

    /*
     * Backend expects:
     * excel
     * images
     */

    formData.append("excel", excelFile);

    imageFiles.forEach((image) => {
      formData.append("images", image);
    });

    setUploading(true);

    try {
      const response =
        await bulkUploadProducts(formData);

      if (!response.ok) {
        setError(
          response.data?.message ||
            response.data?.error ||
            "Bulk upload failed."
        );

        return;
      }

      const uploadResult =
        response.data?.data;

      setResult(uploadResult || null);

      setMessage(
        response.data?.message ||
          "Bulk product upload completed successfully."
      );

      setExcelFile(null);
      setImageFiles([]);

      if (excelInputRef.current) {
        excelInputRef.current.value = "";
      }

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }

      if (folderInputRef.current) {
        folderInputRef.current.value = "";
      }
    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong while uploading products."
      );
    } finally {
      setUploading(false);
    }
  };

  /* =========================================================
     IMAGE COUNT
  ========================================================= */

  const imageCount = imageFiles.length;

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <AdminShell pageTitle="Bulk Upload">
      <div className="bulk-page">
        <div className="bulk-container">

          {/* =================================================
              HEADER
          ================================================= */}

          <section className="bulk-header">
            <div>
              <div className="eyebrow">
                NHF ADMIN / CATALOGUE
              </div>

              <h1>
                Bulk Product Upload
              </h1>

              <p>
                Add or update multiple
                products using one Excel
                sheet with main category,
                subcategory, pricing,
                shipping, size-wise pricing
                and SKU-based product images.
              </p>
            </div>

            <button
              type="button"
              className="template-button"
              onClick={
                handleDownloadTemplate
              }
              disabled={
                downloadingTemplate
              }
            >
              {downloadingTemplate ? (
                <>
                  <RefreshCw
                    size={17}
                    className="spin"
                  />

                  Preparing...
                </>
              ) : (
                <>
                  <Download
                    size={17}
                  />

                  Download Sample Excel
                </>
              )}
            </button>
          </section>

          {/* =================================================
              IMPORTANT NOTE
          ================================================= */}

          <section className="guide-card">
            <div className="guide-icon">
              <FileSpreadsheet
                size={23}
                strokeWidth={1.7}
              />
            </div>

            <div className="guide-content">
              <h2>
                Before you upload
              </h2>

              <div className="guide-grid">

                <div>
                  <span>01</span>

                  <p>
                    Download the sample
                    Excel and check the
                    Instructions sheet
                    before entering
                    products.
                  </p>
                </div>

                <div>
                  <span>02</span>

                  <p>
                    Enter both
                    <strong>
                      {" "}mainCategory
                    </strong>
                    {" "}and
                    <strong>
                      {" "}subcategory
                    </strong>
                    . The selected
                    subcategory must
                    belong to the selected
                    main category.
                  </p>
                </div>

                <div>
                  <span>03</span>

                  <p>
                    Enter the product serial
                    number in{" "}
                    <strong>
                      sortOrder
                    </strong>{" "}
                    starting from 1.
                  </p>
                </div>

                <div>
                  <span>04</span>

                  <p>
                    Enter product-level
                    <strong>
                      {" "}actualPrice
                    </strong>
                    ,
                    <strong>
                      {" "}sellingPrice
                    </strong>
                    {" "}and
                    <strong>
                      {" "}shippingCost
                    </strong>
                    .
                  </p>
                </div>

                <div>
                  <span>05</span>

                  <p>
                    Add size variants using
                    <strong>
                      {" "}size_1
                    </strong>{" "}
                    through
                    <strong>
                      {" "}size_20
                    </strong>
                    . Use the corresponding
                    size actual-price and
                    selling-price columns for
                    each variant.
                  </p>
                </div>

                <div>
                  <span>06</span>

                  <p>
                    Keep SKU unique.
                    Existing SKU records
                    will be updated
                    automatically.
                  </p>
                </div>

                <div>
                  <span>07</span>

                  <p>
                    Keep selling price less
                    than or equal to actual
                    price. This applies to
                    both product and size
                    pricing.
                  </p>
                </div>

                <div>
                  <span>08</span>

                  <p>
                    Images are optional.
                    Exact SKU filename becomes
                    the main image, while
                    SKU-1, SKU-2, SKU-3 become
                    gallery images.
                  </p>
                </div>

                <div>
                  <span>09</span>

                  <p>
                    Supported images:
                    JPG, JPEG, PNG and WEBP.
                  </p>
                </div>
                <div>
  <span>10</span>

  <p>
    Use <strong>isOnSale</strong> as{" "}
    <strong>TRUE</strong> for Sale products and{" "}
    <strong>FALSE</strong> for regular products.
    Sale products will appear in the Sale section.
  </p>
</div>

              </div>
            </div>
          </section>

          {/* =================================================
              UPLOAD GRID
          ================================================= */}

          <section className="upload-grid">

            {/* =================================================
                EXCEL CARD
            ================================================= */}

            <div className="upload-card">

              <div className="card-top">
                <div className="upload-icon excel">
                  <FileSpreadsheet
                    size={27}
                    strokeWidth={1.6}
                  />
                </div>

                <div className="required">
                  REQUIRED
                </div>
              </div>

              <h2>
                Product Excel
              </h2>

              <p className="card-description">
                Upload the spreadsheet
                containing all product
                information.
              </p>

              <div
                className={`drop-zone ${
                  draggingExcel
                    ? "dragging"
                    : ""
                } ${
                  excelFile
                    ? "has-file"
                    : ""
                }`}
                onDragOver={
                  handleDragOver
                }
                onDragLeave={
                  handleDragLeave
                }
                onDrop={
                  handleDrop
                }
                onClick={() =>
                  excelInputRef.current?.click()
                }
              >
                <input
                  ref={excelInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={
                    handleExcelChange
                  }
                  hidden
                />

                {excelFile ? (
                  <>
                    <div className="selected-icon">
                      <CheckCircle2
                        size={31}
                        strokeWidth={1.7}
                      />
                    </div>

                    <div className="selected-title">
                      {excelFile.name}
                    </div>

                    <div className="selected-meta">
                      {(
                        excelFile.size /
                        1024 /
                        1024
                      ).toFixed(2)}{" "}
                      MB
                    </div>

                    <button
                      type="button"
                      className="change-file"
                      onClick={(event) => {
                        event.stopPropagation();

                        excelInputRef.current?.click();
                      }}
                    >
                      Change file
                    </button>
                  </>
                ) : (
                  <>
                    <div className="drop-icon">
                      <UploadCloud
                        size={33}
                        strokeWidth={1.5}
                      />
                    </div>

                    <div className="drop-title">
                      Drop Excel here
                    </div>

                    <div className="drop-subtitle">
                      or click to browse
                    </div>

                    <div className="file-types">
                      XLSX · XLS · CSV
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* =================================================
                IMAGE CARD
            ================================================= */}

            <div className="upload-card">

              <div className="card-top">
                <div className="upload-icon images">
                  <ImageIcon
                    size={27}
                    strokeWidth={1.6}
                  />
                </div>

                <div className="optional">
                  OPTIONAL
                </div>
              </div>

              <h2>
                Product Images
              </h2>

              <p className="card-description">
                Select product images.
                Images are optional and
                filenames must match the
                product SKU.
              </p>

              {/* NORMAL IMAGE INPUT */}

              <input
                ref={imageInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                multiple
                onChange={
                  handleImagesChange
                }
                hidden
              />

              {/* FOLDER INPUT */}

              <input
                ref={folderInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                multiple
                webkitdirectory="true"
                directory="true"
                onChange={
                  handleFolderChange
                }
                hidden
              />

              {/* IMAGE SELECT */}

              <div className="image-select-zone">

                <div
                  className="image-select-main"
                  onClick={() =>
                    imageInputRef.current?.click()
                  }
                >
                  <div className="image-select-icon">
                    <FileImage
                      size={31}
                      strokeWidth={1.5}
                    />
                  </div>

                  <div className="drop-title">
                    Select product images
                  </div>

                  <div className="drop-subtitle">
                    JPG · JPEG · PNG · WEBP
                  </div>
                </div>

                {/* FOLDER BUTTON */}

                <button
                  type="button"
                  className="folder-upload-button"
                  onClick={(event) => {
                    event.stopPropagation();

                    folderInputRef.current?.click();
                  }}
                >
                  <FolderOpen
                    size={17}
                    strokeWidth={1.8}
                  />

                  Select Image Folder
                </button>

                <div className="folder-help">
                  Select one folder to
                  add all product images
                  at once
                </div>

                {imageCount > 0 && (
                  <div className="image-count">
                    <CheckCircle2
                      size={16}
                    />

                    {imageCount}{" "}
                    image
                    {imageCount > 1
                      ? "s"
                      : ""}{" "}
                    selected
                  </div>
                )}
              </div>

              {/* IMAGE LIST */}

              {imageFiles.length > 0 && (
                <div className="image-list">
                  {imageFiles
                    .slice(0, 5)
                    .map(
                      (
                        file,
                        index
                      ) => (
                        <div
                          className="image-item"
                          key={`${file.name}-${index}`}
                        >
                          <FileImage
                            size={17}
                          />

                          <span>
                            {file.name}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              removeImage(
                                index
                              )
                            }
                            aria-label={`Remove ${file.name}`}
                          >
                            <X
                              size={15}
                            />
                          </button>
                        </div>
                      )
                    )}

                  {imageFiles.length > 5 && (
                    <div className="more-images">
                      +
                      {imageFiles.length - 5}{" "}
                      more images
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* =================================================
              IMAGE NAMING
          ================================================= */}

          <section className="naming-card">

            <div className="naming-heading">
              <div>
                <div className="eyebrow">
                  IMAGE MAPPING
                </div>

                <h2>
                  Match images using SKU
                </h2>
              </div>

              <div className="naming-note">
                Exact SKU = Main Image
              </div>
            </div>

            <div className="naming-table">

              <div className="naming-row header">
                <span>
                  SKU
                </span>

                <span>
                  Main image
                </span>

                <span>
                  Gallery images
                </span>
              </div>

              <div className="naming-row">
                <strong>
                  NHF001
                </strong>

                <span>
                  NHF001.jpg
                </span>

                <span>
                  NHF001-1.jpg
                  <br />
                  NHF001-2.jpg
                </span>
              </div>

              <div className="naming-row">
                <strong>
                  NHF002
                </strong>

                <span>
                  NHF002.png
                </span>

                <span>
                  NHF002-1.png
                  <br />
                  NHF002-2.png
                </span>
              </div>

              <div className="naming-row">
                <strong>
                  NHF003
                </strong>

                <span>
                  NHF003.webp
                </span>

                <span>
                  NHF003-1.webp
                  <br />
                  NHF003-2.webp
                </span>
              </div>

            </div>

            <p className="naming-footer">
              The exact SKU filename
              becomes the main image.
              Files ending in{" "}
              <strong>
                -1, -2, -3
              </strong>{" "}
              become gallery images.
            </p>
          </section>

          {/* =================================================
              SUCCESS / ERROR
          ================================================= */}

          {message && (
            <div className="status success">
              <CheckCircle2
                size={21}
                strokeWidth={1.8}
              />

              <div>
                {message}
              </div>
            </div>
          )}

          {error && (
            <div className="status error">
              <AlertCircle
                size={21}
                strokeWidth={1.8}
              />

              <div>
                {error}
              </div>
            </div>
          )}

          {/* =================================================
              RESULT
          ================================================= */}

          {result && (
            <section className="result-card">

              <div className="result-heading">
                <div>
                  <div className="eyebrow">
                    UPLOAD RESULT
                  </div>

                  <h2>
                    Bulk upload completed
                  </h2>
                </div>
              </div>

              <div className="result-stats">

                <div className="stat">
                  <span>
                    Total
                  </span>

                  <strong>
                    {result.total ?? 0}
                  </strong>
                </div>

                <div className="stat">
                  <span>
                    Created
                  </span>

                  <strong className="created">
                    {result.created ?? 0}
                  </strong>
                </div>

                <div className="stat">
                  <span>
                    Updated
                  </span>

                  <strong className="updated">
                    {result.updated ?? 0}
                  </strong>
                </div>

                <div className="stat">
                  <span>
                    Failed
                  </span>

                  <strong className="failed">
                    {result.failed ?? 0}
                  </strong>
                </div>

              </div>

              {/* FAILED */}

              {result.errors?.length > 0 && (
                <div className="errors-section">

                  <h3>
                    Failed rows
                  </h3>

                  <div className="errors-list">
                    {result.errors.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          className="error-row"
                          key={`${item.row}-${index}`}
                        >
                          <div className="error-row-top">
                            <strong>
                              Row{" "}
                              {item.row}
                            </strong>

                            {item.sku && (
                              <span>
                                SKU:{" "}
                                {item.sku}
                              </span>
                            )}
                          </div>

                          {item.name && (
                            <div className="error-product">
                              {item.name}
                            </div>
                          )}

                          <div className="error-reason">
                            {item.error}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* PROCESSED */}

              {result.products?.length > 0 && (
                <div className="processed-section">

                  <div className="processed-top">
                    <h3>
                      Processed products
                    </h3>

                    <span>
                      {
                        result
                          .products
                          .length
                      }{" "}
                      products
                    </span>
                  </div>

                  <div className="processed-list">
                    {result.products
                      .slice(0, 20)
                      .map(
                        (
                          product,
                          index
                        ) => (
                          <div
                            className="processed-row"
                            key={`${product.sku}-${index}`}
                          >
                            <span>
                              {
                                product.sku
                              }
                            </span>

                            <strong>
                              {
                                product.name
                              }
                            </strong>

                            <em
                              className={
                                product.action ===
                                "created"
                                  ? "created"
                                  : "updated"
                              }
                            >
                              {
                                product.action
                              }
                            </em>
                          </div>
                        )
                      )}
                  </div>

                  {result.products.length > 20 && (
                    <p className="processed-more">
                      Showing first 20
                      processed products.
                    </p>
                  )}
                </div>
              )}
            </section>
          )}

          {/* =================================================
              ACTION BAR
          ================================================= */}

          <section className="action-bar">

            <div>
              <div className="action-title">
                Ready to upload?
              </div>

              <div className="action-subtitle">
                {excelFile
                  ? `${excelFile.name} ${
                      imageCount > 0
                        ? `· ${imageCount} images`
                        : "· No images"
                    }`
                  : "Select an Excel file to continue."}
              </div>
            </div>

            <div className="action-buttons">

              {(excelFile ||
                imageFiles.length > 0 ||
                result) && (
                <button
                  type="button"
                  className="clear-button"
                  onClick={
                    clearAll
                  }
                  disabled={
                    uploading
                  }
                >
                  Clear
                </button>
              )}

              <button
                type="button"
                className="upload-button"
                onClick={
                  handleUpload
                }
                disabled={
                  uploading ||
                  !excelFile
                }
              >
                {uploading ? (
                  <>
                    <RefreshCw
                      size={18}
                      className="spin"
                    />

                    Uploading Products...
                  </>
                ) : (
                  <>
                    <UploadCloud
                      size={19}
                    />

                    Upload Products
                  </>
                )}
              </button>
            </div>
          </section>

        </div>

        {/* =====================================================
            STYLES
        ===================================================== */}

        <style jsx>{`

          /* =================================================
             BASE
          ================================================= */

          .bulk-page {
            width: 100%;
            min-width: 0;
            color: #000000;
            font-family: Arial, Helvetica, sans-serif;
          }

          .bulk-container {
            width: 100%;
            max-width: 1500px;
            margin: 0 auto;
            padding: 42px 42px 70px;
            box-sizing: border-box;
          }

          /* =================================================
             HEADER
          ================================================= */

          .bulk-header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 30px;
            margin-bottom: 34px;
          }

          .eyebrow {
            margin-bottom: 9px;
            color: #000000;
            font-size: 14px;
            line-height: 1.3;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }

          .bulk-header h1 {
            margin: 0;
            color: #000000;
            font-family: Georgia, "Times New Roman", serif;
            font-size: clamp(36px, 4vw, 48px);
            font-weight: 700;
            line-height: 1.08;
            letter-spacing: -0.02em;
          }

          .bulk-header p {
            max-width: 700px;
            margin: 13px 0 0;
            color: #000000;
            font-size: 16px;
            line-height: 1.7;
            font-weight: 400;
          }

          .template-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 9px;
            min-height: 48px;
            padding: 0 19px;
            border: 1px solid #000000;
            background: #ffffff;
            color: #000000;
            font-size: 15px;
            line-height: 1;
            font-weight: 700;
            cursor: pointer;
            white-space: nowrap;
            transition:
              background 0.2s ease,
              color 0.2s ease;
          }

          .template-button:hover:not(:disabled) {
            background: #000000;
            color: #ffffff;
          }

          .template-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          /* =================================================
             GUIDE
          ================================================= */

          .guide-card {
            display: flex;
            gap: 20px;
            padding: 25px 27px;
            margin-bottom: 24px;
            border: 1px solid #cccccc;
            background: #ffffff;
          }

          .guide-icon {
            flex: 0 0 48px;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000000;
            color: #ffffff;
          }

          .guide-content {
            flex: 1;
            min-width: 0;
          }

          .guide-content h2 {
            margin: 0 0 18px;
            color: #000000;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 26px;
            line-height: 1.3;
            font-weight: 700;
          }

          .guide-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 21px;
          }

          .guide-grid > div {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 11px;
          }

          .guide-grid span {
            color: #000000;
            font-size: 14px;
            line-height: 1.4;
            font-weight: 700;
          }

          .guide-grid p {
            margin: 0;
            color: #000000;
            font-size: 16px;
            line-height: 1.6;
            font-weight: 400;
          }

          .guide-grid p strong {
            color: #000000;
            font-weight: 700;
          }

          /* =================================================
             UPLOAD GRID
          ================================================= */

          .upload-grid {
            display: grid;
            grid-template-columns: repeat(
              2,
              minmax(0, 1fr)
            );
            gap: 22px;
          }

          .upload-card {
            padding: 28px;
            border: 1px solid #dddddd;
            background: #ffffff;
            box-sizing: border-box;
          }

          .card-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
          }

          .upload-icon {
            width: 52px;
            height: 52px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #000000;
            color: #ffffff;
          }

          .required,
          .optional {
            padding: 7px 10px;
            font-size: 13px;
            line-height: 1;
            font-weight: 700;
            letter-spacing: 0.08em;
          }

          .required {
            border: 1px solid #000000;
            background: #ffffff;
            color: #000000;
          }

          .optional {
            border: 1px solid #cccccc;
            background: #f7f7f7;
            color: #000000;
          }

          .upload-card h2 {
            margin: 0;
            color: #000000;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 28px;
            line-height: 1.3;
            font-weight: 700;
          }

          .card-description {
            min-height: 50px;
            margin: 10px 0 21px;
            color: #000000;
            font-size: 16px;
            line-height: 1.6;
            font-weight: 400;
          }

          /* =================================================
             EXCEL DROP
          ================================================= */

          .drop-zone {
            min-height: 215px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            border: 1px dashed #999999;
            background: #fafafa;
            cursor: pointer;
            padding: 20px;
            box-sizing: border-box;
            transition:
              background 0.2s ease,
              border-color 0.2s ease;
          }

          .drop-zone:hover,
          .drop-zone.dragging {
            border-color: #000000;
            background: #f2f2f2;
          }

          .drop-zone.has-file {
            border-style: solid;
            border-color: #000000;
            background: #f5f5f5;
          }

          .drop-icon,
          .image-select-icon,
          .selected-icon {
            width: 58px;
            height: 58px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 13px;
          }

          .drop-icon {
            background: #eeeeee;
            color: #000000;
          }

          .image-select-icon {
            background: #eeeeee;
            color: #000000;
          }

          .selected-icon {
            color: #000000;
          }

          .drop-title {
            color: #000000;
            font-size: 17px;
            line-height: 1.4;
            font-weight: 700;
          }

          .drop-subtitle {
            margin-top: 6px;
            color: #000000;
            opacity: 0.6;
            font-size: 15px;
            line-height: 1.4;
          }

          .file-types {
            margin-top: 15px;
            color: #000000;
            opacity: 0.55;
            font-size: 13px;
            line-height: 1.3;
            font-weight: 700;
            letter-spacing: 0.08em;
          }

          .selected-title {
            max-width: 88%;
            overflow: hidden;
            color: #000000;
            font-size: 16px;
            line-height: 1.4;
            font-weight: 700;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .selected-meta {
            margin-top: 6px;
            color: #000000;
            opacity: 0.6;
            font-size: 14px;
            line-height: 1.4;
          }

          .change-file {
            margin-top: 13px;
            border: 0;
            border-bottom: 1px solid #000000;
            padding: 0 0 3px;
            background: transparent;
            color: #000000;
            font-size: 14px;
            line-height: 1.3;
            font-weight: 700;
            cursor: pointer;
          }

          /* =================================================
             IMAGE SELECT
          ================================================= */

          .image-select-zone {
            min-height: 215px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            border: 1px dashed #999999;
            background: #fafafa;
            padding: 20px;
            box-sizing: border-box;
          }

          .image-select-main {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }

          .image-select-main:hover
            .image-select-icon {
            background: #e7e7e7;
          }

          .folder-upload-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-top: 19px;
            min-height: 44px;
            padding: 0 14px;
            border: 1px solid #000000;
            background: #ffffff;
            color: #000000;
            font-size: 15px;
            line-height: 1;
            font-weight: 700;
            cursor: pointer;
            transition:
              background 0.2s ease,
              color 0.2s ease;
          }

          .folder-upload-button:hover {
            background: #000000;
            color: #ffffff;
          }

          .folder-help {
            margin-top: 8px;
            color: #000000;
            opacity: 0.55;
            font-size: 14px;
            line-height: 1.4;
          }

          .image-count {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            margin-top: 14px;
            padding: 8px 11px;
            border: 1px solid #000000;
            background: #ffffff;
            color: #000000;
            font-size: 14px;
            line-height: 1.3;
            font-weight: 700;
          }

          /* =================================================
             IMAGE LIST
          ================================================= */

          .image-list {
            display: flex;
            flex-direction: column;
            gap: 6px;
            margin-top: 11px;
          }

          .image-item {
            display: flex;
            align-items: center;
            gap: 9px;
            min-width: 0;
            padding: 9px 10px;
            border: 1px solid #dddddd;
            background: #fafafa;
            color: #000000;
            font-size: 14px;
            line-height: 1.4;
          }

          .image-item span {
            flex: 1;
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: #000000;
          }

          .image-item button {
            width: 28px;
            height: 28px;
            padding: 0;
            border: none;
            background: #eeeeee;
            color: #000000;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            flex-shrink: 0;
          }

          .image-item button:hover {
            background: #000000;
            color: #ffffff;
          }

          .more-images {
            padding: 6px 10px;
            color: #000000;
            opacity: 0.6;
            font-size: 14px;
            line-height: 1.4;
          }

          /* =================================================
             NAMING CARD
          ================================================= */

          .naming-card {
            margin-top: 22px;
            padding: 28px;
            border: 1px solid #dddddd;
            background: #ffffff;
            box-sizing: border-box;
          }

          .naming-heading {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 21px;
          }

          .naming-heading h2,
          .result-heading h2 {
            margin: 0;
            color: #000000;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 28px;
            line-height: 1.3;
            font-weight: 700;
          }

          .naming-note {
            padding: 8px 11px;
            border: 1px solid #000000;
            background: #ffffff;
            color: #000000;
            font-size: 14px;
            line-height: 1.3;
            font-weight: 700;
          }

          .naming-table {
            overflow: hidden;
            border: 1px solid #dddddd;
          }

          .naming-row {
            display: grid;
            grid-template-columns:
              0.8fr 1fr 1.5fr;
            border-bottom:
              1px solid #dddddd;
          }

          .naming-row:last-child {
            border-bottom: 0;
          }

          .naming-row > * {
            padding: 14px 15px;
            color: #000000;
            font-size: 15px;
            line-height: 1.55;
          }

          .naming-row > * + * {
            border-left:
              1px solid #dddddd;
          }

          .naming-row.header {
            background: #f1f1f1;
          }

          .naming-row.header > * {
            color: #000000;
            font-size: 14px;
            line-height: 1.35;
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }

          .naming-row strong {
            color: #000000;
            font-weight: 700;
          }

          .naming-footer {
            margin: 15px 0 0;
            color: #000000;
            font-size: 14px;
            line-height: 1.6;
          }

          .naming-footer strong {
            color: #000000;
            font-weight: 700;
          }

          /* =================================================
             STATUS
          ================================================= */

          .status {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-top: 22px;
            padding: 16px 18px;
            border: 1px solid #cccccc;
            background: #ffffff;
            color: #000000;
            font-size: 16px;
            line-height: 1.55;
          }

          .status.success {
            border-color: #999999;
          }

          .status.error {
            border-color: #999999;
          }

          /* =================================================
             RESULT
          ================================================= */

          .result-card {
            margin-top: 22px;
            padding: 28px;
            border: 1px solid #dddddd;
            background: #ffffff;
            box-sizing: border-box;
          }

          .result-heading {
            margin-bottom: 22px;
          }

          .result-stats {
            display: grid;
            grid-template-columns:
              repeat(4, 1fr);
            border: 1px solid #dddddd;
          }

          .stat {
            padding: 20px;
            border-right:
              1px solid #dddddd;
          }

          .stat:last-child {
            border-right: 0;
          }

          .stat span {
            display: block;
            margin-bottom: 8px;
            color: #000000;
            opacity: 0.6;
            font-size: 14px;
            line-height: 1.3;
            font-weight: 700;
            letter-spacing: 0.06em;
            text-transform: uppercase;
          }

          .stat strong {
            color: #000000;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 31px;
            line-height: 1.2;
            font-weight: 700;
          }

          .stat strong.created,
          .stat strong.updated,
          .stat strong.failed {
            color: #000000;
          }

          /* =================================================
             ERRORS
          ================================================= */

          .errors-section,
          .processed-section {
            margin-top: 27px;
          }

          .errors-section h3,
          .processed-section h3 {
            margin: 0;
            color: #000000;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 21px;
            line-height: 1.3;
            font-weight: 700;
          }

          .errors-list {
            display: flex;
            flex-direction: column;
            gap: 9px;
            margin-top: 13px;
          }

          .error-row {
            padding: 13px 15px;
            border: 1px solid #dddddd;
            background: #fafafa;
          }

          .error-row-top {
            display: flex;
            align-items: center;
            gap: 13px;
          }

          .error-row-top strong {
            color: #000000;
            font-size: 14px;
            line-height: 1.4;
            font-weight: 700;
          }

          .error-row-top span {
            color: #000000;
            opacity: 0.65;
            font-size: 14px;
            line-height: 1.4;
          }

          .error-product {
            margin-top: 5px;
            color: #000000;
            font-size: 15px;
            line-height: 1.45;
            font-weight: 600;
          }

          .error-reason {
            margin-top: 5px;
            color: #000000;
            font-size: 15px;
            line-height: 1.5;
          }

          /* =================================================
             PROCESSED
          ================================================= */

          .processed-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
          }

          .processed-top > span {
            color: #000000;
            opacity: 0.6;
            font-size: 14px;
            line-height: 1.4;
          }

          .processed-list {
            overflow: hidden;
            margin-top: 13px;
            border: 1px solid #dddddd;
          }

          .processed-row {
            display: grid;
            grid-template-columns:
              140px 1fr 95px;
            gap: 12px;
            align-items: center;
            padding: 12px 14px;
            border-bottom:
              1px solid #dddddd;
          }

          .processed-row:last-child {
            border-bottom: 0;
          }

          .processed-row > span {
            color: #000000;
            font-family: monospace;
            font-size: 14px;
            line-height: 1.4;
          }

          .processed-row strong {
            overflow: hidden;
            color: #000000;
            font-size: 15px;
            line-height: 1.4;
            font-weight: 600;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .processed-row em {
            justify-self: end;
            padding: 5px 8px;
            border: 1px solid #cccccc;
            background: #ffffff;
            color: #000000;
            font-size: 12px;
            line-height: 1.3;
            font-style: normal;
            font-weight: 700;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }

          .processed-row em.created,
          .processed-row em.updated {
            color: #000000;
          }

          .processed-more {
            margin: 10px 0 0;
            color: #000000;
            opacity: 0.6;
            font-size: 14px;
            line-height: 1.5;
          }

          /* =================================================
             ACTION BAR
          ================================================= */

          .action-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 25px;
            margin-top: 28px;
            padding: 22px 24px;
            border: 1px solid #cccccc;
            background: #ffffff;
          }

          .action-title {
            color: #000000;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 22px;
            line-height: 1.3;
            font-weight: 700;
          }

          .action-subtitle {
            max-width: 650px;
            margin-top: 5px;
            overflow: hidden;
            color: #000000;
            opacity: 0.6;
            font-size: 14px;
            line-height: 1.45;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .action-buttons {
            display: flex;
            align-items: center;
            gap: 15px;
          }

          .clear-button {
            min-height: 44px;
            padding: 0 14px;
            border: 1px solid #cccccc;
            background: #ffffff;
            color: #000000;
            font-size: 15px;
            line-height: 1;
            font-weight: 600;
            cursor: pointer;
          }

          .clear-button:hover {
            background: #f3f3f3;
          }

          .upload-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 9px;
            min-width: 205px;
            min-height: 48px;
            border: 1px solid #000000;
            padding: 0 19px;
            background: #000000;
            color: #ffffff;
            font-size: 15px;
            line-height: 1;
            font-weight: 700;
            cursor: pointer;
            transition:
              background 0.2s ease,
              color 0.2s ease;
          }

          .upload-button:hover:not(:disabled) {
            background: #ffffff;
            color: #000000;
          }

          .upload-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .spin {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
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

          @media (max-width: 1100px) {
            .bulk-container {
              padding:
                34px 28px 60px;
            }

            .guide-grid {
              grid-template-columns:
                repeat(2, 1fr);
            }

            .bulk-header {
              align-items:
                flex-start;
              flex-direction:
                column;
            }

            .upload-grid {
              grid-template-columns:
                1fr;
            }

            .result-stats {
              grid-template-columns:
                repeat(2, 1fr);
            }

            .stat:nth-child(2) {
              border-right: 0;
            }

            .stat:nth-child(-n + 2) {
              border-bottom:
                1px solid #dddddd;
            }

            .action-bar {
              flex-direction:
                column;
              align-items:
                flex-start;
            }

            .action-buttons {
              width: 100%;
              justify-content:
                flex-end;
            }
          }

          @media (max-width: 650px) {
            .bulk-container {
              padding:
                24px 16px 45px;
            }

            .bulk-header h1 {
              font-size: 34px;
            }

            .bulk-header p {
              font-size: 15px;
            }

            .guide-card {
              flex-direction:
                column;
              padding:
                22px 19px;
            }

            .guide-grid {
              grid-template-columns:
                1fr;
              gap: 17px;
            }

            .upload-card,
            .naming-card,
            .result-card {
              padding:
                20px;
            }

            .naming-heading {
              flex-direction:
                column;
              align-items:
                flex-start;
            }

            .naming-row {
              grid-template-columns:
                0.75fr 1fr 1.35fr;
            }

            .naming-row > * {
              padding:
                11px 10px;
              font-size: 13px;
            }

            .result-stats {
              grid-template-columns:
                1fr;
            }

            .stat,
            .stat:nth-child(2) {
              border-right: 0;
              border-bottom:
                1px solid #dddddd;
            }

            .stat:last-child {
              border-bottom: 0;
            }

            .processed-row {
              grid-template-columns:
                1fr auto;
            }

            .processed-row > span {
              grid-column:
                1 / -1;
            }

            .processed-row strong {
              grid-column: 1;
            }

            .processed-row em {
              grid-column: 2;
              grid-row: 2;
            }

            .action-buttons {
              flex-direction:
                column-reverse;
              width: 100%;
            }

            .upload-button,
            .clear-button {
              width: 100%;
            }

            .action-subtitle {
              max-width: 100%;
            }
          }

        `}</style>
      </div>
    </AdminShell>
  );
}