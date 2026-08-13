import multer from "multer";

const storage = multer.memoryStorage();

const allowedExcelTypes = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
];

const allowedImageTypes = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const fileFilter = (req, file, cb) => {
  if (
    allowedExcelTypes.includes(file.mimetype) ||
    allowedImageTypes.includes(file.mimetype)
  ) {
    return cb(null, true);
  }

  return cb(
    new Error(
      `Unsupported file type: ${file.mimetype}`
    ),
    false
  );
};

const upload = multer({
  storage,

  limits: {
    /*
      IMPORTANT:
      Multer's fileSize limit applies PER FILE,
      not to the combined request size.
    */

    fileSize: 500 * 1024 * 1024,

    files: 1000,
  },

  fileFilter,
});

export const bulkUploadFiles = upload.fields([
  {
    name: "excel",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 999,
  },
]);