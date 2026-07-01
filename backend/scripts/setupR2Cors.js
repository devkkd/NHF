/**
 * scripts/setupR2Cors.js
 * One-time script — applies CORS policy to your R2 bucket.
 *
 * Run from backend/:
 *   node scripts/setupR2Cors.js
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { PutBucketCorsCommand } from "@aws-sdk/client-s3";
import { getR2Client } from "../src/config/r2.js";

// Load .env from backend root
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });

const BUCKET = process.env.R2_BUCKET_NAME || "nhf-images";

const corsConfig = {
  CORSRules: [
    {
      AllowedOrigins: [
        "http://localhost:3000",
        "http://localhost:3001",
        // Add your production URL before deploying:
        // "https://nikitahomefurnishings.com",
      ],
      AllowedMethods: ["PUT", "GET", "HEAD"],
      AllowedHeaders: ["*"],
      ExposeHeaders:  ["ETag"],
      MaxAgeSeconds:  3600,
    },
  ],
};

console.log(`Applying CORS to bucket: ${BUCKET} ...`);

try {
  await getR2Client().send(
    new PutBucketCorsCommand({
      Bucket:            BUCKET,
      CORSConfiguration: corsConfig,
    })
  );
  console.log("✔ CORS policy applied successfully!");
  console.log("  Allowed origins:", corsConfig.CORSRules[0].AllowedOrigins.join(", "));
  console.log("  Allowed methods:", corsConfig.CORSRules[0].AllowedMethods.join(", "));
} catch (err) {
  console.error("✖ Failed:", err.message);
  process.exit(1);
}
