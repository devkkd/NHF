"use client";

/**
 * ImageUploader.jsx
 *
 * Flow:
 *  1. User picks a file (drag-drop or click)
 *  2. Component calls backend  POST /upload/presign  to get a signed PUT URL
 *  3. Browser PUTs the file directly to Cloudflare R2 (no bytes through our backend)
 *  4. On success, calls onUpload(publicUrl) so the parent can save the URL
 */

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { getAccessToken } from "@/lib/adminApi";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_MB  = 5;

export default function ImageUploader({ value, onUpload, folder = "categories" }) {
  const [status,    setStatus]    = useState("idle"); // idle | uploading | error
  const [progress,  setProgress]  = useState(0);
  const [errMsg,    setErrMsg]    = useState("");
  const [dragOver,  setDragOver]  = useState(false);
  const inputRef = useRef(null);

  const upload = useCallback(async (file) => {
    // Client-side validation
    if (!ALLOWED.includes(file.type)) {
      setErrMsg("Only JPEG, PNG, WebP or AVIF images allowed.");
      setStatus("error");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setErrMsg(`File too large. Max ${MAX_MB} MB.`);
      setStatus("error");
      return;
    }

    setStatus("uploading");
    setProgress(0);
    setErrMsg("");

    try {
      // 1. Get presigned URL from our backend
      console.log("[ImageUploader] Requesting presign from backend...");
      const presignRes = await fetch(`${API}/upload/presign`, {
        method:  "POST",
        headers: {
          "Content-Type":  "application/json",
          "Authorization": `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({ mimeType: file.type, fileSize: file.size, folder }),
      });

      const presignBody = await presignRes.json();
      console.log("[ImageUploader] Presign response:", presignRes.status, presignBody);
      if (!presignRes.ok) {
        throw new Error(presignBody.error || "Failed to get upload URL");
      }

      const { uploadUrl, publicUrl } = presignBody.data;

      // 2. PUT file directly to R2 using fetch (better error visibility than XHR)
      console.log("[ImageUploader] PUT →", uploadUrl.slice(0, 80) + "...");
      console.log("[ImageUploader] file type:", file.type, "size:", file.size);

      let r2Res;
      try {
        r2Res = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
      } catch (networkErr) {
        console.error("[ImageUploader] fetch threw (network-level block):", networkErr);
        throw new Error("Network error: browser blocked the request to R2. Check browser console for CORS details.");
      }

      if (!r2Res.ok) {
        const errBody = await r2Res.text().catch(() => "");
        console.error("[ImageUploader] R2 PUT failed:", r2Res.status, errBody);
        throw new Error(`R2 upload failed (HTTP ${r2Res.status}): ${errBody || "no response body"}`);
      }

      console.log("[ImageUploader] Upload success ✔");

      // 3. Done — pass URL to parent
      setStatus("idle");
      setProgress(0);
      onUpload(publicUrl);

    } catch (err) {
      setErrMsg(err.message || "Upload failed. Try again.");
      setStatus("error");
    }
  }, [folder, onUpload]);

  const handleFiles = (files) => {
    const file = files?.[0];
    if (file) upload(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const isUploading = status === "uploading";

  return (
    <div>
      {/* Drop zone */}
      <div
        className={`img-uploader${dragOver ? " drag" : ""}${isUploading ? " uploading" : ""}`}
        onClick={() => !isUploading && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        aria-label="Upload image"
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED.join(",")}
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Preview */}
        {value && !isUploading ? (
          <div className="img-preview-wrap">
            <Image
              src={value}
              alt="Category image"
              fill
              sizes="200px"
              style={{ objectFit: "cover" }}
            />
            <div className="img-preview-overlay">
              <span>Change image</span>
            </div>
          </div>
        ) : isUploading ? (
          <div className="img-progress-wrap">
            <div className="img-progress-bar-track">
              <div className="img-progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="img-progress-label">Uploading… {progress}%</p>
          </div>
        ) : (
          <div className="img-placeholder-content">
            <div className="img-upload-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
              </svg>
            </div>
            <p className="img-upload-label">
              <span>Click to upload</span> or drag &amp; drop
            </p>
            <p className="img-upload-hint">PNG, JPG, WebP · Max {MAX_MB} MB</p>
          </div>
        )}
      </div>

      {/* Error */}
      {status === "error" && (
        <p style={{ fontSize:12, color:"#e05252", marginTop:6 }}>{errMsg}</p>
      )}

      {/* Or paste URL */}
      <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ flex:1, height:1, background:"#E8E4DC" }} />
        <span style={{ fontSize:11, color:"#C0BAB0", whiteSpace:"nowrap" }}>or paste URL</span>
        <div style={{ flex:1, height:1, background:"#E8E4DC" }} />
      </div>
      <input
        type="url"
        className="nhf-form-input"
        style={{ marginTop:8 }}
        value={value || ""}
        onChange={(e) => onUpload(e.target.value)}
        placeholder="https://pub-xxx.r2.dev/categories/..."
      />

      <style jsx>{`
        .img-uploader {
          position: relative;
          width: 100%;
          height: 160px;
          border: 2px dashed #E8E4DC;
          border-radius: 10px;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
          overflow: hidden;
          background: #FAFAF6;
        }
        .img-uploader:hover,
        .img-uploader.drag {
          border-color: #7B7F5C;
          background: rgba(123,127,92,0.04);
        }
        .img-uploader.uploading {
          cursor: default;
          border-color: #7B7F5C;
        }

        /* Preview */
        .img-preview-wrap {
          position: absolute;
          inset: 0;
        }
        .img-preview-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .img-uploader:hover .img-preview-overlay {
          background: rgba(0,0,0,0.35);
        }
        .img-preview-overlay span {
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .img-uploader:hover .img-preview-overlay span { opacity: 1; }

        /* Progress */
        .img-progress-wrap {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 20px;
        }
        .img-progress-bar-track {
          width: 100%;
          height: 4px;
          background: #E8E4DC;
          border-radius: 2px;
          overflow: hidden;
        }
        .img-progress-bar-fill {
          height: 100%;
          background: #7B7F5C;
          border-radius: 2px;
          transition: width 0.1s linear;
        }
        .img-progress-label {
          font-size: 12px;
          color: #7B7F5C;
          font-weight: 600;
        }

        /* Placeholder */
        .img-placeholder-content {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .img-upload-icon {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: rgba(123,127,92,0.10);
          color: #7B7F5C;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2px;
        }
        .img-upload-label {
          font-size: 13px;
          color: #888;
          text-align: center;
        }
        .img-upload-label span {
          color: #7B7F5C;
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .img-upload-hint {
          font-size: 11px;
          color: #C0BAB0;
        }
      `}</style>
    </div>
  );
}
