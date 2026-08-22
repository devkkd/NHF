"use client";

import {
  useRef,
  useState,
} from "react";

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

  const [excelFile, setExcelFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);

  const [uploading, setUploading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const [draggingExcel, setDraggingExcel] =
    useState(false);

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

    const validExtensions = [
      ".xlsx",
      ".xls",
      ".csv",
    ];

    const extension =
      "." +
      file.name
        .split(".")
        .pop()
        .toLowerCase();

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
    const file =
      event.target.files?.[0];

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

    const file =
      event.dataTransfer.files?.[0];

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
        file.name
          .split(".")
          .pop()
          .toLowerCase();

      return (
        allowedImageTypes.includes(type) ||
        [".jpg", ".jpeg", ".png", ".webp"].includes(
          extension
        )
      );
    });
  };

  /* =========================================================
     IMAGE SELECT - MULTIPLE FILES
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

    /*
      Folder selection returns all files recursively
      in supported browsers.

      We keep the original File objects so they can
      directly be appended to FormData.
    */

    setImageFiles(validImages);
  };

  /* =========================================================
     REMOVE IMAGE
  ========================================================= */

  const removeImage = (index) => {
    setImageFiles((current) =>
      current.filter(
        (_, i) => i !== index
      )
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

      const url =
        window.URL.createObjectURL(
          response.blob
        );

      const anchor =
        document.createElement("a");

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
      Backend expects:
      excel
      images
    */

    formData.append(
      "excel",
      excelFile
    );

    imageFiles.forEach((image) => {
      formData.append(
        "images",
        image
      );
    });

    setUploading(true);

    try {
      const response =
        await bulkUploadProducts(
          formData
        );

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

      setResult(
        uploadResult || null
      );

      setMessage(
        response.data?.message ||
          "Bulk product upload completed successfully."
      );

      /*
        Reset selected files after
        successful upload.
      */

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

  const imageCount =
    imageFiles.length;

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
                Add or update multiple products using one Excel
                sheet with Category, Subcategory, Product Serial
                Number and SKU-based product images.
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
                    size={15}
                    className="spin"
                  />

                  Preparing...
                </>
              ) : (
                <>
                  <Download
                    size={15}
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
                size={20}
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
                    Download the template and check the
                    Categories sheet before entering products.
                  </p>
                </div>

                <div>
                  <span>02</span>
                  <p>
                    Enter the main Category slug and the
                    matching Subcategory slug.
                  </p>
                </div>

                <div>
                  <span>03</span>
                  <p>
                    Enter Product Serial Number in
                    <strong> sortOrder </strong> starting from 1.
                  </p>
                </div>

                <div>
                  <span>04</span>
                  <p>
                    Keep SKU unique. Existing SKU records
                    will be updated automatically.
                  </p>
                </div>

                <div>
                  <span>05</span>
                  <p>
                    Use exact SKU for the main image, then
                    SKU-1, SKU-2, SKU-3 for gallery images.
                  </p>
                </div>

                <div>
                  <span>06</span>
                  <p>
                    Every product must belong to a valid
                    Subcategory under the selected Category.
                  </p>
                </div>
              </div>

            </div>

          </section>

          {/* =================================================
              UPLOAD CARDS
          ================================================= */}

          <section className="upload-grid">

            {/* =================================================
                EXCEL CARD
            ================================================= */}

            <div className="upload-card">

              <div className="card-top">

                <div className="upload-icon excel">

                  <FileSpreadsheet
                    size={23}
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
                onDrop={handleDrop}
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
                        size={26}
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
                        size={28}
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
                IMAGES CARD
            ================================================= */}

            <div className="upload-card">

              <div className="card-top">

                <div className="upload-icon images">

                  <ImageIcon
                    size={23}
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
                Filename must match the
                product SKU.
              </p>

              {/* NORMAL MULTI IMAGE INPUT */}

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

              {/* =================================================
                  IMAGE SELECT ZONE
              ================================================= */}

              <div className="image-select-zone">

                <div
                  className="image-select-main"
                  onClick={() =>
                    imageInputRef.current?.click()
                  }
                >

                  <div className="image-select-icon">

                    <FileImage
                      size={27}
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

                {/* =================================================
                    FOLDER BUTTON
                ================================================= */}

                <button
                  type="button"
                  className="folder-upload-button"
                  onClick={(event) => {
                    event.stopPropagation();

                    folderInputRef.current?.click();
                  }}
                >

                  <FolderOpen
                    size={15}
                    strokeWidth={1.8}
                  />

                  Select Image Folder

                </button>

                <div className="folder-help">
                  Select one folder to add all
                  product images at once
                </div>

                {imageCount > 0 && (

                  <div className="image-count">

                    <CheckCircle2
                      size={14}
                    />

                    {imageCount} image
                    {imageCount > 1
                      ? "s"
                      : ""}{" "}
                    selected

                  </div>

                )}

              </div>

              {/* =================================================
                  IMAGE LIST
              ================================================= */}

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
                            size={14}
                          />

                          <span>
                            {file.name}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              removeImage(index)
                            }
                            aria-label={`Remove ${file.name}`}
                          >

                            <X
                              size={13}
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

              The exact SKU filename becomes
              the main image. Files ending in
              <strong>
                -1, -2, -3
              </strong>{" "}
              become gallery images.

            </p>

          </section>

          {/* =================================================
              STATUS
          ================================================= */}

          {message && (

            <div className="status success">

              <CheckCircle2
                size={18}
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
                size={18}
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

              {result.products?.length > 0 && (

                <div className="processed-section">

                  <div className="processed-top">

                    <h3>
                      Processed products
                    </h3>

                    <span>
                      {result.products.length}{" "}
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
                              {product.sku}
                            </span>

                            <strong>
                              {product.name}
                            </strong>

                            <em
                              className={
                                product.action ===
                                "created"
                                  ? "created"
                                  : "updated"
                              }
                            >
                              {product.action}
                            </em>

                          </div>

                        )
                      )}

                  </div>

                  {result.products.length >
                    20 && (

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
              ACTION
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
                  onClick={clearAll}
                  disabled={uploading}
                >
                  Clear
                </button>

              )}

              <button
                type="button"
                className="upload-button"
                onClick={handleUpload}
                disabled={
                  uploading ||
                  !excelFile
                }
              >

                {uploading ? (
                  <>

                    <RefreshCw
                      size={16}
                      className="spin"
                    />

                    Uploading Products...

                  </>
                ) : (
                  <>

                    <UploadCloud
                      size={17}
                    />

                    Upload Products

                  </>
                )}

              </button>

            </div>

          </section>

        </div>

        {/* ===================================================
            STYLES
        =================================================== */}

        <style jsx>{`

          .bulk-page {
            min-height: 100%;
            color: #444936;
            font-family: "Mona Sans", Arial, sans-serif;
          }

          .bulk-container {
            width: 100%;
            max-width: 1500px;
            margin: 0 auto;
            padding: 42px 42px 70px;
          }

          .bulk-header {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 30px;
            margin-bottom: 34px;
          }

          .eyebrow {
            margin-bottom: 8px;
            color: #999d80;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.16em;
            text-transform: uppercase;
          }

          .bulk-header h1 {
            margin: 0;
            color: #707551;
            font-family: "Tobias TRIAL", Georgia, serif;
            font-size: clamp(34px, 4vw, 48px);
            font-weight: 600;
            line-height: 1.05;
            letter-spacing: -0.025em;
          }

          .bulk-header p {
            max-width: 650px;
            margin: 12px 0 0;
            color: #858a71;
            font-size: 14px;
            line-height: 1.7;
          }

          .template-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 9px;
            min-height: 44px;
            padding: 0 18px;
            border: 1px solid #cfd4b9;
            background: #fff;
            color: #707551;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.04em;
            cursor: pointer;
            transition:
              background 0.2s ease,
              border-color 0.2s ease,
              transform 0.2s ease;
          }

          .template-button:hover:not(:disabled) {
            border-color: #7b7f5c;
            background: #f7f9ec;
            transform: translateY(-1px);
          }

          .template-button:disabled {
            cursor: not-allowed;
            opacity: 0.55;
          }

          .guide-card {
            display: flex;
            gap: 20px;
            padding: 25px 27px;
            margin-bottom: 24px;
            border: 1px solid #dfe4c9;
            background: #f8faea;
          }

          .guide-icon {
            flex: 0 0 44px;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #7b7f5c;
            color: #fff;
          }

          .guide-content {
            flex: 1;
          }

          .guide-content h2 {
            margin: 0 0 17px;
            color: #686d50;
            font-family: "Tobias TRIAL", Georgia, serif;
            font-size: 22px;
            font-weight: 600;
          }

          .guide-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }

          .guide-grid > div {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 10px;
          }

          .guide-grid span {
            color: #9ba081;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.08em;
          }

          .guide-grid p {
            margin: 0;
            color: #777c63;
            font-size: 12px;
            line-height: 1.55;
          }

          .upload-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 22px;
          }

          .upload-card {
            padding: 28px;
            border: 1px solid #e0e4d4;
            background: #fff;
          }

          .card-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
          }

          .upload-icon {
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .upload-icon.excel {
            background: #7b7f5c;
            color: #fff;
          }

          .upload-icon.images {
            background: #929775;
            color: #fff;
          }

          .required,
          .optional {
            padding: 6px 9px;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.12em;
          }

          .required {
            background: #f1f3e5;
            color: #707551;
          }

          .optional {
            background: #f7f7f1;
            color: #969a83;
          }

          .upload-card h2 {
            margin: 0;
            color: #60654a;
            font-family: "Tobias TRIAL", Georgia, serif;
            font-size: 26px;
            font-weight: 600;
          }

          .card-description {
            min-height: 42px;
            margin: 9px 0 20px;
            color: #888c76;
            font-size: 13px;
            line-height: 1.6;
          }

          .drop-zone {
            min-height: 205px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            border: 1px dashed #ccd2b5;
            background: #fafbf5;
            cursor: pointer;
            transition:
              background 0.2s ease,
              border-color 0.2s ease;
          }

          .drop-zone:hover,
          .drop-zone.dragging {
            border-color: #7b7f5c;
            background: #f5f7e9;
          }

          .drop-zone.has-file {
            border-style: solid;
            border-color: #bfcaa2;
            background: #f4f7e8;
          }

          .image-select-zone {
            min-height: 205px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            border: 1px dashed #ccd2b5;
            background: #fafbf5;
            padding: 20px;
          }

          .image-select-main {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }

          .image-select-main:hover .image-select-icon {
            background: #e9ecd9;
          }

          .drop-icon,
          .image-select-icon,
          .selected-icon {
            width: 54px;
            height: 54px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 12px;
          }

          .drop-icon {
            background: #eef1df;
            color: #7b7f5c;
          }

          .image-select-icon {
            background: #f0f1e7;
            color: #83886c;
            transition: background 0.2s ease;
          }

          .selected-icon {
            margin-bottom: 8px;
            color: #718244;
          }

          .drop-title {
            color: #686d52;
            font-size: 13px;
            font-weight: 600;
          }

          .drop-subtitle {
            margin-top: 5px;
            color: #999d89;
            font-size: 11px;
          }

          .file-types {
            margin-top: 14px;
            color: #b0b39f;
            font-size: 9px;
            font-weight: 600;
            letter-spacing: 0.12em;
          }

          .selected-title {
            max-width: 85%;
            overflow: hidden;
            color: #62684d;
            font-size: 13px;
            font-weight: 600;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .selected-meta {
            margin-top: 5px;
            color: #999d87;
            font-size: 11px;
          }

          .change-file {
            margin-top: 12px;
            border: 0;
            border-bottom: 1px solid #7b7f5c;
            padding: 0 0 2px;
            background: transparent;
            color: #707551;
            font-size: 10px;
            font-weight: 600;
            cursor: pointer;
          }

          .folder-upload-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
            margin-top: 18px;
            padding: 9px 13px;
            border: 1px solid #cfd4b9;
            background: #fff;
            color: #707551;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.04em;
            cursor: pointer;
            transition:
              background 0.2s ease,
              border-color 0.2s ease;
          }

          .folder-upload-button:hover {
            border-color: #7b7f5c;
            background: #f1f4e5;
          }

          .folder-help {
            margin-top: 7px;
            color: #a1a48f;
            font-size: 9px;
          }

          .image-count {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            margin-top: 13px;
            padding: 7px 10px;
            background: #eef3df;
            color: #6e7d48;
            font-size: 10px;
            font-weight: 600;
          }

          .image-list {
            display: flex;
            flex-direction: column;
            gap: 5px;
            margin-top: 10px;
          }

          .image-item {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
            padding: 7px 9px;
            background: #f7f8f1;
            color: #777c66;
            font-size: 10px;
          }

          .image-item span {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .image-item button {
            display: flex;
            align-items: center;
            justify-content: center;
            border: 0;
            background: transparent;
            color: #a3a68f;
            cursor: pointer;
          }

          .image-item button:hover {
            color: #9a5d56;
          }

          .more-images {
            padding: 5px 9px;
            color: #989d85;
            font-size: 10px;
          }

          .naming-card {
            margin-top: 22px;
            padding: 28px;
            border: 1px solid #e0e4d4;
            background: #fff;
          }

          .naming-heading {
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
            gap: 20px;
            margin-bottom: 20px;
          }

          .naming-heading h2,
          .result-heading h2 {
            margin: 0;
            color: #656a4d;
            font-family: "Tobias TRIAL", Georgia, serif;
            font-size: 26px;
            font-weight: 600;
          }

          .naming-note {
            padding: 7px 10px;
            background: #f0f3e2;
            color: #747a55;
            font-size: 10px;
            font-weight: 600;
          }

          .naming-table {
            overflow: hidden;
            border: 1px solid #e2e5d8;
          }

          .naming-row {
            display: grid;
            grid-template-columns: 0.8fr 1fr 1.5fr;
            border-bottom: 1px solid #e7e9df;
          }

          .naming-row:last-child {
            border-bottom: 0;
          }

          .naming-row > * {
            padding: 12px 14px;
            color: #777c67;
            font-size: 12px;
            line-height: 1.5;
          }

          .naming-row > * + * {
            border-left: 1px solid #e7e9df;
          }

          .naming-row.header {
            background: #f1f4e5;
          }

          .naming-row.header > * {
            color: #666b4d;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .naming-row strong {
            color: #666b4d;
            font-weight: 700;
          }

          .naming-footer {
            margin: 14px 0 0;
            color: #999d88;
            font-size: 11px;
            line-height: 1.6;
          }

          .naming-footer strong {
            color: #747a58;
          }

          .status {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            margin-top: 22px;
            padding: 15px 17px;
            font-size: 12px;
            line-height: 1.5;
          }

          .status.success {
            border: 1px solid #ceddb4;
            background: #eef5e3;
            color: #61713e;
          }

          .status.error {
            border: 1px solid #e7c7c2;
            background: #fff1ef;
            color: #a05148;
          }

          .result-card {
            margin-top: 22px;
            padding: 28px;
            border: 1px solid #e0e4d4;
            background: #fff;
          }

          .result-heading {
            margin-bottom: 22px;
          }

          .result-stats {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            border: 1px solid #e3e6db;
          }

          .stat {
            padding: 19px;
            border-right: 1px solid #e3e6db;
          }

          .stat:last-child {
            border-right: 0;
          }

          .stat span {
            display: block;
            margin-bottom: 7px;
            color: #999d88;
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }

          .stat strong {
            color: #656a4e;
            font-family: "Tobias TRIAL", Georgia, serif;
            font-size: 29px;
            font-weight: 600;
          }

          .stat strong.created {
            color: #718248;
          }

          .stat strong.updated {
            color: #7b7f5c;
          }

          .stat strong.failed {
            color: #a15a52;
          }

          .errors-section,
          .processed-section {
            margin-top: 25px;
          }

          .errors-section h3,
          .processed-section h3 {
            margin: 0;
            color: #686d51;
            font-family: "Tobias TRIAL", Georgia, serif;
            font-size: 19px;
            font-weight: 600;
          }

          .errors-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-top: 12px;
          }

          .error-row {
            padding: 12px 14px;
            border: 1px solid #edd7d3;
            background: #fff8f6;
          }

          .error-row-top {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .error-row-top strong {
            color: #8e514a;
            font-size: 11px;
          }

          .error-row-top span {
            color: #a1948f;
            font-size: 10px;
          }

          .error-product {
            margin-top: 4px;
            color: #686d59;
            font-size: 12px;
            font-weight: 600;
          }

          .error-reason {
            margin-top: 4px;
            color: #a45a50;
            font-size: 11px;
          }

          .processed-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
          }

          .processed-top > span {
            color: #999d88;
            font-size: 10px;
          }

          .processed-list {
            overflow: hidden;
            margin-top: 12px;
            border: 1px solid #e3e6dc;
          }

          .processed-row {
            display: grid;
            grid-template-columns: 130px 1fr 90px;
            gap: 12px;
            align-items: center;
            padding: 10px 13px;
            border-bottom: 1px solid #e9ebe3;
          }

          .processed-row:last-child {
            border-bottom: 0;
          }

          .processed-row > span {
            color: #777c64;
            font-size: 11px;
          }

          .processed-row strong {
            overflow: hidden;
            color: #686d53;
            font-size: 11px;
            font-weight: 600;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .processed-row em {
            justify-self: end;
            padding: 4px 7px;
            font-size: 8px;
            font-style: normal;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }

          .processed-row em.created {
            background: #eef5e2;
            color: #718247;
          }

          .processed-row em.updated {
            background: #f1f3e6;
            color: #7b7f5c;
          }

          .processed-more {
            margin: 9px 0 0;
            color: #a0a38f;
            font-size: 10px;
          }

          .action-bar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 25px;
            margin-top: 28px;
            padding: 21px 23px;
            border: 1px solid #dce1ca;
            background: #f8faed;
          }

          .action-title {
            color: #62674b;
            font-family: "Tobias TRIAL", Georgia, serif;
            font-size: 20px;
            font-weight: 600;
          }

          .action-subtitle {
            max-width: 650px;
            margin-top: 4px;
            overflow: hidden;
            color: #969a84;
            font-size: 10px;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .action-buttons {
            display: flex;
            align-items: center;
            gap: 15px;
          }

          .clear-button {
            border: 0;
            border-bottom: 1px solid #c7cbb9;
            padding: 9px 3px;
            background: transparent;
            color: #8f9380;
            font-size: 11px;
            cursor: pointer;
          }

          .clear-button:hover {
            color: #707551;
          }

          .upload-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 9px;
            min-width: 185px;
            min-height: 45px;
            border: 1px solid #7b7f5c;
            padding: 0 18px;
            background: #7b7f5c;
            color: #fff;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            cursor: pointer;
            transition:
              background 0.2s ease,
              opacity 0.2s ease;
          }

          .upload-button:hover:not(:disabled) {
            background: #696d4d;
          }

          .upload-button:disabled {
            cursor: not-allowed;
            opacity: 0.45;
          }

          .spin {
            animation: spin 0.9s linear infinite;
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          @media (max-width: 1180px) {
            .guide-grid {
              grid-template-columns: repeat(2, 1fr);
            }
          }

          @media (max-width: 900px) {
            .bulk-container {
              padding: 30px 24px 55px;
            }

            .bulk-header {
              align-items: flex-start;
              flex-direction: column;
            }

            .upload-grid {
              grid-template-columns: 1fr;
            }

            .result-stats {
              grid-template-columns: repeat(2, 1fr);
            }

            .stat:nth-child(2) {
              border-right: 0;
            }

            .stat:nth-child(-n + 2) {
              border-bottom: 1px solid #e3e6db;
            }

            .action-bar {
              align-items: flex-start;
              flex-direction: column;
            }

            .action-buttons {
              width: 100%;
            }

            .upload-button {
              flex: 1;
            }
          }

          @media (max-width: 650px) {
            .bulk-container {
              padding: 24px 16px 45px;
            }

            .bulk-header h1 {
              font-size: 34px;
            }

            .template-button {
              width: 100%;
            }

            .guide-card {
              padding: 20px;
            }

            .guide-grid {
              grid-template-columns: 1fr;
              gap: 14px;
            }

            .upload-card,
            .naming-card,
            .result-card {
              padding: 20px;
            }

            .naming-heading {
              align-items: flex-start;
              flex-direction: column;
            }

            .naming-row {
              grid-template-columns: 0.8fr 1fr;
            }

            .naming-row > *:nth-child(3) {
              grid-column: 2;
              border-left: 0;
              border-top: 1px solid #e7e9df;
            }

            .naming-row.header > *:nth-child(3) {
              grid-column: 2;
            }

            .result-stats {
              grid-template-columns: 1fr 1fr;
            }

            .stat {
              padding: 14px;
            }

            .stat strong {
              font-size: 24px;
            }

            .processed-row {
              grid-template-columns: 1fr auto;
            }

            .processed-row strong {
              grid-column: 1 / -1;
              grid-row: 2;
            }

            .processed-row em {
              grid-column: 2;
              grid-row: 1;
            }

            .action-buttons {
              flex-direction: column-reverse;
              align-items: stretch;
            }

            .upload-button,
            .clear-button {
              width: 100%;
            }
          }

        `}</style>

      </div>

    </AdminShell>
  );
}