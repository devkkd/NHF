import { S3Client } from "@aws-sdk/client-s3";

const accountId =
  process.env.CF_ACCOUNT_ID;

const accessKeyId =
  process.env.R2_ACCESS_KEY_ID;

const secretAccessKey =
  process.env.R2_SECRET_ACCESS_KEY;

const bucketName =
  process.env.R2_BUCKET_NAME;

const publicUrl =
  process.env.R2_PUBLIC_URL;


// ======================================================
// VALIDATION
// ======================================================

if (!accountId) {
  throw new Error(
    "CF_ACCOUNT_ID is missing."
  );
}

if (!accessKeyId) {
  throw new Error(
    "R2_ACCESS_KEY_ID is missing."
  );
}

if (!secretAccessKey) {
  throw new Error(
    "R2_SECRET_ACCESS_KEY is missing."
  );
}

if (!bucketName) {
  throw new Error(
    "R2_BUCKET_NAME is missing."
  );
}

if (!publicUrl) {
  throw new Error(
    "R2_PUBLIC_URL is missing."
  );
}


// ======================================================
// CLOUDFLARE R2 CLIENT
// ======================================================

export const r2Client =
  new S3Client({
    region: "auto",

    endpoint:
      `https://${accountId}.r2.cloudflarestorage.com`,

    credentials: {
      accessKeyId,

      secretAccessKey,
    },
  });


// ======================================================
// COMMON R2 VALUES
// ======================================================

export const R2_BUCKET =
  bucketName;

export const R2_PUBLIC_URL =
  publicUrl.replace(
    /\/$/,
    ""
  );


// ======================================================
// BACKWARD COMPATIBILITY
// ======================================================

export const r2 =
  r2Client;

export default r2Client;