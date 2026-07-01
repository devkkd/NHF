/**
 * services/uploadService.js
 *
 * Two strategies:
 *
 * 1. generatePresignedUrl()  — backend signs a PUT URL, frontend uploads directly.
 *    Best for large files / keeping bandwidth off the backend.
 *
 * 2. uploadBufferToR2()      — backend receives the file and pipes it to R2.
 *    Used as fallback or for server-side processing.
 */

import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { getR2Client } from "../config/r2.js";

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
const MAX_BYTES    = 5 * 1024 * 1024; // 5 MB

// Read at call-time so dotenv has already loaded
const getBucket    = () => process.env.R2_BUCKET_NAME || "nhf";
const getPublicUrl = () => (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");

// ── Helpers ──────────────────────────────────────────────
const ext = (mime) => ({
  "image/jpeg": "jpg",
  "image/png":  "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif":  "gif",
}[mime] ?? "jpg");

/**
 * Build the organised object key:
 *   categories/2026/06/uuid.png
 */
const buildKey = (folder, mimeType) => {
  const now  = new Date();
  const yyyy = now.getFullYear();
  const mm   = String(now.getMonth() + 1).padStart(2, "0");
  return `${folder}/${yyyy}/${mm}/${randomUUID()}.${ext(mimeType)}`;
};

// ── Public API ────────────────────────────────────────────

/**
 * Generate a presigned PUT URL for direct browser → R2 upload.
 *
 * @param {string} folder   e.g. "categories"
 * @param {string} mimeType e.g. "image/png"
 * @param {number} fileSize bytes
 * @returns {{ uploadUrl: string, key: string, publicUrl: string }}
 */
export const generatePresignedUrl = async ({ folder = "uploads", mimeType, fileSize }) => {
  if (!ALLOWED_MIME.includes(mimeType)) {
    throw Object.assign(new Error(`File type "${mimeType}" is not allowed.`), { status: 400, code: "INVALID_FILE_TYPE" });
  }
  if (fileSize > MAX_BYTES) {
    throw Object.assign(new Error("File exceeds 5 MB limit."), { status: 400, code: "FILE_TOO_LARGE" });
  }

  const key     = buildKey(folder, mimeType);
  // Do NOT include ContentLength here — it would be added to X-Amz-SignedHeaders,
  // but browsers treat Content-Length as a forbidden header they set automatically,
  // causing a signature mismatch and a 403 from R2.
  const command = new PutObjectCommand({
    Bucket:      getBucket(),
    Key:         key,
    ContentType: mimeType,
  });

  const uploadUrl = await getSignedUrl(getR2Client(), command, { expiresIn: 300 });
  const publicUrl = `${getPublicUrl()}/${key}`;

  return { uploadUrl, key, publicUrl };
};

/**
 * Upload a Buffer directly from the backend (multer or similar).
 *
 * @param {Buffer} buffer
 * @param {string} mimeType
 * @param {string} folder
 * @returns {{ key: string, publicUrl: string }}
 */
export const uploadBufferToR2 = async ({ buffer, mimeType, folder = "uploads" }) => {
  if (!ALLOWED_MIME.includes(mimeType)) {
    throw Object.assign(new Error(`File type "${mimeType}" is not allowed.`), { status: 400, code: "INVALID_FILE_TYPE" });
  }

  const key = buildKey(folder, mimeType);
  await getR2Client().send(new PutObjectCommand({
    Bucket:        getBucket(),
    Key:           key,
    Body:          buffer,
    ContentType:   mimeType,
    ContentLength: buffer.length,
  }));

  return { key, publicUrl: `${getPublicUrl()}/${key}` };
};

/**
 * Delete an object by its key.
 */
export const deleteFromR2 = async (key) => {
  if (!key) return;
  await getR2Client().send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }));
};
