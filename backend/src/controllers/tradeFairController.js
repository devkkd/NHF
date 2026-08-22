import {
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import TradeFair from "../models/TradeFair.js";

import {
  r2Client,
  R2_BUCKET,
  R2_PUBLIC_URL,
} from "../config/r2.js";


// ======================================================
// R2 FILE NAME
// ======================================================

function createR2Key(
  type,
  originalName
) {
  const ext =
    originalName
      ?.split(".")
      .pop()
      ?.toLowerCase() ||
    "jpg";

  const safeType =
    type === "upcoming"
      ? "upcoming"
      : "past";

  return `trade-fairs/${safeType}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;
}


// ======================================================
// UPLOAD IMAGE TO R2
// ======================================================

async function uploadImageToR2(
  file,
  type
) {
  const key =
    createR2Key(
      type,
      file.originalname
    );

  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,

      Key: key,

      Body: file.buffer,

      ContentType:
        file.mimetype,

      CacheControl:
        "public,max-age=31536000,immutable",
    })
  );

  return {
    key,

    url: `${R2_PUBLIC_URL}/${key}`,
  };
}


// ======================================================
// DELETE IMAGE FROM R2
// ======================================================

async function deleteImageFromR2(
  url
) {
  try {
    if (
      !url ||
      !R2_PUBLIC_URL
    ) {
      return;
    }

    const prefix =
      `${R2_PUBLIC_URL}/`;

    if (
      !url.startsWith(prefix)
    ) {
      return;
    }

    const key =
      decodeURIComponent(
        url.slice(
          prefix.length
        )
      );

    if (!key) {
      return;
    }

    await r2Client.send(
      new DeleteObjectCommand({
        Bucket:
          R2_BUCKET,

        Key: key,
      })
    );
  } catch (error) {
    console.error(
      "R2 DELETE ERROR:",
      error
    );
  }
}


// ======================================================
// GET PUBLIC TRADE FAIRS
// ======================================================

export const getTradeFairs =
  async (
    req,
    res
  ) => {
    try {
      const {
        type,
      } = req.query;

      const filter = {
        active:
          true,
      };

      if (
        type ===
          "past" ||
        type ===
          "upcoming"
      ) {
        filter.type =
          type;
      }

      const fairs =
        await TradeFair.find(
          filter
        )
          .sort({
            sortOrder: 1,
            createdAt: -1,
          })
          .lean();

      return res.status(
        200
      ).json({
        success: true,

        data: {
          fairs,
        },
      });
    } catch (error) {
      console.error(
        "GET TRADE FAIRS ERROR:",
        error
      );

      return res.status(
        500
      ).json({
        success: false,
        message:
          "Failed to load trade fairs.",
      });
    }
  };


// ======================================================
// GET ADMIN TRADE FAIRS
// ======================================================

export const getAdminTradeFairs =
  async (
    req,
    res
  ) => {
    try {
      const fairs =
        await TradeFair.find()
          .sort({
            type: 1,
            sortOrder: 1,
            createdAt: -1,
          })
          .lean();

      return res.status(
        200
      ).json({
        success: true,

        data: {
          fairs,
        },
      });
    } catch (error) {
      console.error(
        "ADMIN TRADE FAIR ERROR:",
        error
      );

      return res.status(
        500
      ).json({
        success: false,
        message:
          "Failed to load trade fairs.",
      });
    }
  };


// ======================================================
// CREATE TRADE FAIR
// ======================================================

export const createTradeFair =
  async (
    req,
    res
  ) => {
    try {
      const {
        type,
        title,
        description,
        date,
        dateText,
        venue,
        timing,
        location,
        sortOrder,
        active,
      } = req.body;

      // ----------------------------------------------
      // VALIDATION
      // ----------------------------------------------

      if (
        !type ||
        ![
          "past",
          "upcoming",
        ].includes(type)
      ) {
        return res.status(
          400
        ).json({
          success: false,
          message:
            "Valid trade fair type is required.",
        });
      }

      if (
        !title?.trim()
      ) {
        return res.status(
          400
        ).json({
          success: false,
          message:
            "Trade fair title is required.",
        });
      }

      const files =
        Array.isArray(
          req.files
        )
          ? req.files
          : [];

      /*
       * Upcoming:
       * only ONE image.
       *
       * Past:
       * multiple images allowed.
       */

      if (
        type ===
          "upcoming" &&
        files.length >
          1
      ) {
        return res.status(
          400
        ).json({
          success: false,
          message:
            "Upcoming trade fair can have only one image.",
        });
      }

      // ----------------------------------------------
      // UPLOAD IMAGES
      // ----------------------------------------------

      const images = [];

      for (
        const file of files
      ) {
        const uploaded =
          await uploadImageToR2(
            file,
            type
          );

        images.push({
          url:
            uploaded.url,

          alt:
            title.trim(),
        });
      }

      // ----------------------------------------------
      // CREATE
      // ----------------------------------------------

      const fair =
        await TradeFair.create({
          type,
          title:
            title.trim(),

          description:
            description
              ?.trim() ||
            "",

          images,

          date:
            date
              ? new Date(
                  date
                )
              : null,

          dateText:
            dateText
              ?.trim() ||
            "",

          venue:
            venue
              ?.trim() ||
            "",

          timing:
            timing
              ?.trim() ||
            "",

          location:
            location
              ?.trim() ||
            "",

          sortOrder:
            Number(
              sortOrder
            ) || 0,

          active:
            active !==
            undefined
              ? active ===
                true ||
                active ===
                "true"
              : true,
        });

      return res.status(
        201
      ).json({
        success: true,

        message:
          "Trade fair created successfully.",

        data: {
          fair,
        },
      });
    } catch (error) {
      console.error(
        "CREATE TRADE FAIR ERROR:",
        error
      );

      return res.status(
        500
      ).json({
        success: false,
        message:
          error.message ||
          "Failed to create trade fair.",
      });
    }
  };


// ======================================================
// UPDATE TRADE FAIR
// ======================================================

export const updateTradeFair =
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } = req.params;

      const fair =
        await TradeFair.findById(
          id
        );

      if (!fair) {
        return res.status(
          404
        ).json({
          success: false,
          message:
            "Trade fair not found.",
        });
      }

      const {
        title,
        description,
        date,
        dateText,
        venue,
        timing,
        location,
        sortOrder,
        active,
      } = req.body;

      // ----------------------------------------------
      // UPDATE TEXT DATA
      // ----------------------------------------------

      if (
        title !==
        undefined
      ) {
        fair.title =
          title.trim();
      }

      if (
        description !==
        undefined
      ) {
        fair.description =
          description.trim();
      }

      if (
        date !==
        undefined
      ) {
        fair.date =
          date
            ? new Date(date)
            : null;
      }

      if (
        dateText !==
        undefined
      ) {
        fair.dateText =
          dateText.trim();
      }

      if (
        venue !==
        undefined
      ) {
        fair.venue =
          venue.trim();
      }

      if (
        timing !==
        undefined
      ) {
        fair.timing =
          timing.trim();
      }

      if (
        location !==
        undefined
      ) {
        fair.location =
          location.trim();
      }

      if (
        sortOrder !==
        undefined
      ) {
        fair.sortOrder =
          Number(
            sortOrder
          ) || 0;
      }

      if (
        active !==
        undefined
      ) {
        fair.active =
          active ===
            true ||
          active ===
            "true";
      }

      // ----------------------------------------------
      // NEW IMAGES
      // ----------------------------------------------

      const files =
        Array.isArray(
          req.files
        )
          ? req.files
          : [];

      if (
        files.length >
        0
      ) {
        /*
         * Upcoming:
         * replace old image.
         */

        if (
          fair.type ===
          "upcoming"
        ) {
          if (
            files.length >
            1
          ) {
            return res.status(
              400
            ).json({
              success: false,
              message:
                "Upcoming trade fair can have only one image.",
            });
          }

          if (
            fair.images?.[0]
              ?.url
          ) {
            await deleteImageFromR2(
              fair.images[0]
                .url
            );
          }

          const uploaded =
            await uploadImageToR2(
              files[0],
              fair.type
            );

          fair.images =
            [
              {
                url:
                  uploaded.url,

                alt:
                  fair.title,
              },
            ];
        } else {
          /*
           * Past:
           * append uploaded images.
           */

          for (
            const file of files
          ) {
            const uploaded =
              await uploadImageToR2(
                file,
                fair.type
              );

            fair.images.push({
              url:
                uploaded.url,

              alt:
                fair.title,
            });
          }
        }
      }

      await fair.save();

      return res.status(
        200
      ).json({
        success: true,

        message:
          "Trade fair updated successfully.",

        data: {
          fair,
        },
      });
    } catch (error) {
      console.error(
        "UPDATE TRADE FAIR ERROR:",
        error
      );

      return res.status(
        500
      ).json({
        success: false,
        message:
          error.message ||
          "Failed to update trade fair.",
      });
    }
  };


// ======================================================
// DELETE TRADE FAIR
// ======================================================

export const deleteTradeFair =
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } = req.params;

      const fair =
        await TradeFair.findById(
          id
        );

      if (!fair) {
        return res.status(
          404
        ).json({
          success: false,
          message:
            "Trade fair not found.",
        });
      }

      // ----------------------------------------------
      // DELETE R2 IMAGES
      // ----------------------------------------------

      if (
        Array.isArray(
          fair.images
        )
      ) {
        for (
          const image of fair.images
        ) {
          if (
            image?.url
          ) {
            await deleteImageFromR2(
              image.url
            );
          }
        }
      }

      await TradeFair.findByIdAndDelete(
        id
      );

      return res.status(
        200
      ).json({
        success: true,

        message:
          "Trade fair deleted successfully.",
      });
    } catch (error) {
      console.error(
        "DELETE TRADE FAIR ERROR:",
        error
      );

      return res.status(
        500
      ).json({
        success: false,
        message:
          "Failed to delete trade fair.",
      });
    }
  };


// ======================================================
// DELETE SINGLE IMAGE
// ======================================================

export const deleteTradeFairImage =
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
        imageId,
      } = req.params;

      const fair =
        await TradeFair.findById(
          id
        );

      if (!fair) {
        return res.status(
          404
        ).json({
          success: false,
          message:
            "Trade fair not found.",
        });
      }

      const image =
        fair.images.id(
          imageId
        );

      if (!image) {
        return res.status(
          404
        ).json({
          success: false,
          message:
            "Image not found.",
        });
      }

      await deleteImageFromR2(
        image.url
      );

      image.deleteOne();

      await fair.save();

      return res.status(
        200
      ).json({
        success: true,

        message:
          "Trade fair image deleted successfully.",

        data: {
          fair,
        },
      });
    } catch (error) {
      console.error(
        "DELETE TRADE FAIR IMAGE ERROR:",
        error
      );

      return res.status(
        500
      ).json({
        success: false,
        message:
          "Failed to delete trade fair image.",
      });
    }
  };