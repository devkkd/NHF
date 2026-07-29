"use client";
import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { apiFetch } from "@/lib/adminApi";
import { Upload, X, Loader } from "lucide-react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function ImageUploader({
  value,
  onChange,
  multiple = false,
  folder = "uploads",
}) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  const handleFile = useCallback(
    async (file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Only JPEG, PNG, WebP, or GIF allowed.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("File must be under 10 MB.");
        return;
      }
      setError("");
      setUploading(true);
      try {
        // 1. Get presigned URL
        const presign = await apiFetch("/upload/presign", {
          method: "POST",
          body: JSON.stringify({
            mimeType: file.type,
            fileSize: file.size,
            folder,
          }),
        });
        if (!presign.ok) throw new Error(presign.data?.error || "Presign failed");
        const { uploadUrl, publicUrl } = presign.data.data;

        // 2. PUT directly to R2
        const r2Res = await fetch(uploadUrl, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!r2Res.ok) throw new Error("Upload to storage failed");

        // 3. Notify parent
        if (multiple) {
          onChange([...(Array.isArray(value) ? value : []), publicUrl]);
        } else {
          onChange(publicUrl);
        }
      } catch (err) {
        setError(err.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [multiple, value, onChange, folder]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onInputChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  const removeImage = (idx) => {
    if (!Array.isArray(value)) return;
    onChange(value.filter((_, i) => i !== idx));
  };

  const hasSinglePreview = !multiple && value && typeof value === "string" && value.length > 0;
  const galleryImages = multiple && Array.isArray(value) ? value : [];

  return (
    <div>
      {/* Drop zone */}
      <div
        className={`img-uploader${dragOver ? " drag" : ""}${uploading ? " disabled" : ""}`}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        aria-label="Upload image"
        onKeyDown={(e) => e.key === "Enter" && !uploading && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          style={{ display: "none" }}
          onChange={onInputChange}
          disabled={uploading}
          aria-hidden="true"
        />

        {/* Single preview */}
        {hasSinglePreview && (
          <div className="img-preview-wrap">
            <Image
              src={value}
              alt="Preview"
              fill
              sizes="200px"
              style={{ objectFit: "cover" }}
            />
            <div className="img-preview-overlay">
              <span>Click to change</span>
            </div>
          </div>
        )}

        {/* Uploading overlay */}
        {uploading && (
          <div className="img-upload-progress">
            <Loader size={20} className="nhf-spinner" />
            <span>Uploading…</span>
          </div>
        )}

        {/* Placeholder */}
        {!hasSinglePreview && !uploading && (
          <div className="img-placeholder-content">
            <div className="img-upload-icon">
              <Upload size={18} />
            </div>
            <div className="img-upload-label">
              <span>Click to upload</span> or drag & drop
            </div>
            <div className="img-upload-hint">JPEG, PNG, WebP, GIF · max 10 MB</div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && <div className="img-upload-error">{error}</div>}

      {/* Gallery thumbnails (multiple mode) */}
      {multiple && galleryImages.length > 0 && (
        <div className="img-gallery">
          {galleryImages.map((url, idx) => (
            <div key={url + idx} className="img-gallery-thumb">
              <Image
                src={url}
                alt={`Gallery image ${idx + 1}`}
                fill
                sizes="80px"
                style={{ objectFit: "cover" }}
              />
              <button
                className="img-gallery-remove"
                onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                aria-label={`Remove image ${idx + 1}`}
                type="button"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
