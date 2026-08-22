import multer from "multer";

// ======================================================
// MEMORY STORAGE
// ======================================================

const storage =
  multer.memoryStorage();


// ======================================================
// FILE FILTER
// ======================================================

const fileFilter = (
  req,
  file,
  cb
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif",
  ];

  if (
    allowedTypes.includes(
      file.mimetype
    )
  ) {
    cb(null, true);
    return;
  }

  cb(
    new Error(
      "Only JPG, JPEG, PNG, WEBP and AVIF images are allowed."
    )
  );
};


// ======================================================
// MULTER
// ======================================================

const tradeFairUpload =
  multer({
    storage,

    limits: {
      /*
       * Maximum single image:
       * 10 MB
       */
      fileSize:
        10 * 1024 * 1024,

      /*
       * Maximum number of
       * uploaded images:
       * 8
       */
      files: 8,
    },

    fileFilter,
  });

export default tradeFairUpload;