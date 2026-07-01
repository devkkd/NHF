/**
 * controllers/uploadController.js
 *
 * POST /api/v1/upload/presign
 * Admin calls this to get a short-lived presigned PUT URL.
 * The browser then PUTs the file directly to Cloudflare R2.
 * The returned publicUrl is saved in the category.image field.
 */

import { generatePresignedUrl } from "../services/uploadService.js";

export const presign = async (req, res, next) => {
  try {
    const { mimeType, fileSize, folder = "categories" } = req.body;

    if (!mimeType || !fileSize) {
      return res.status(400).json({
        ok: false,
        error: "mimeType and fileSize are required",
        code: "BAD_REQUEST",
      });
    }

    const result = await generatePresignedUrl({
      folder,
      mimeType,
      fileSize: Number(fileSize),
    });

    res.status(200).json({ ok: true, data: result });
  } catch (err) {
    console.error("[uploadController] presign error:", err.message);
    if (err.status) {
      return res.status(err.status).json({ ok: false, error: err.message, code: err.code });
    }
    next(err);
  }
};
