import "dotenv/config";

import mongoose from "mongoose";
import Category from "../models/Category.js";

const OLD_BASE =
  "https://9beec4047f7c0798e4bafb72d5a833f1.r2.cloudflarestorage.com/nikita2026";

const NEW_BASE = (
  process.env.R2_PUBLIC_URL || ""
).replace(/\/$/, "");

if (!NEW_BASE) {
  throw new Error(
    "R2_PUBLIC_URL is missing from .env"
  );
}

if (!process.env.MONGO_URI) {
  throw new Error(
    "MONGO_URI is missing from .env"
  );
}

try {
  await mongoose.connect(
    process.env.MONGO_URI
  );

  console.log(
    "✅ MongoDB connected"
  );

  console.log(
    "Old base:",
    OLD_BASE
  );

  console.log(
    "New base:",
    NEW_BASE
  );

  const result =
    await Category.updateMany(
      {
        image: {
          $regex:
            "^" +
            OLD_BASE.replace(
              /[.*+?^${}()|[\]\\]/g,
              "\\$&"
            ),
        },
      },
      [
        {
          $set: {
            image: {
              $replaceOne: {
                input: "$image",
                find: OLD_BASE,
                replacement: NEW_BASE,
              },
            },
          },
        },
      ]
    );

  console.log(
    `✅ Categories updated: ${result.modifiedCount}`
  );

  await mongoose.disconnect();

  console.log(
    "✅ Migration completed"
  );
} catch (error) {
  console.error(
    "❌ R2 URL migration failed:",
    error
  );

  await mongoose.disconnect();

  process.exit(1);
}