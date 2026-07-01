/**
 * config/r2.js
 * Lazy R2 client — created on first use so that dotenv has
 * already loaded by the time we read env vars.
 */

import { S3Client } from "@aws-sdk/client-s3";

let _client = null;

export const getR2Client = () => {
  if (_client) return _client;

  const accountId  = process.env.CF_ACCOUNT_ID;
  const accessKey  = process.env.R2_ACCESS_KEY_ID;
  const secretKey  = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKey || !secretKey) {
    throw new Error("[R2] Missing CF_ACCOUNT_ID, R2_ACCESS_KEY_ID or R2_SECRET_ACCESS_KEY in .env");
  }

  _client = new S3Client({
    region:   "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId:     accessKey,
      secretAccessKey: secretKey,
    },
    // Disable automatic checksum — R2 doesn't support x-amz-checksum-crc32
    requestChecksumCalculation: "when_required",
    responseChecksumValidation: "when_required",
  });

  return _client;
};

export default { getR2Client };
