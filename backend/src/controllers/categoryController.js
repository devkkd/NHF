import Category from "../models/Category.js";

/* =========================================================
   PAGINATION
========================================================= */

const paginate = (
  page = 1,
  limit = 50
) => {
  const pg = Math.max(
    Number(page) || 1,
    1
  );

  const lim = Math.min(
    Math.max(
      Number(limit) || 50,
      1
    ),
    100
  );

  return {
    skip: (pg - 1) * lim,
    limit: lim,
    page: pg,
  };
};

/* =========================================================
   BOOLEAN
========================================================= */

const toBoolean = (
  value,
  defaultValue = false
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return defaultValue;
  }

  if (
    value === true ||
    value === "true"
  ) {
    return true;
  }

  if (
    value === false ||
    value === "false"
  ) {
    return false;
  }

  return defaultValue;
};

/* =========================================================
   SLUG
========================================================= */

const normalizeSlug = (
  value
) => {
  return String(value)
    .toLowerCase()
    .replace(
      /[^a-z0-9\s-]/g,
      ""
    )
    .replace(
      /\s+/g,
      "-"
    )
    .replace(
      /-{2,}/g,
      "-"
    )
    .trim();
};

/* =========================================================
   ORDER
========================================================= */

const getOrder = (
  value
) => {
  const order = Number(value);

  if (
    !Number.isInteger(
      order
    ) ||
    order < 1
  ) {
    return null;
  }

  return order;
};

/* =========================================================
   FOOTER CATEGORIES
========================================================= */

export const getFooterCategories =
  async (
    req,
    res,
    next
  ) => {
    try {
      const all =
        await Category.find({
          isActive: true,
          showInFooter: true,
        })
          .sort({
            sortOrder: 1,
            createdAt: 1,
          })
          .lean();

      const parents =
        all.filter(
          (category) =>
            !category.parent
        );

      const tree =
        parents.map(
          (parent) => ({
            ...parent,

            children:
              all
                .filter(
                  (category) =>
                    category.parent &&
                    category.parent.toString() ===
                      parent._id.toString()
                )
                .sort(
                  (
                    a,
                    b
                  ) => {
                    if (
                      a.sortOrder !==
                      b.sortOrder
                    ) {
                      return (
                        a.sortOrder -
                        b.sortOrder
                      );
                    }

                    return (
                      new Date(
                        a.createdAt
                      ).getTime() -
                      new Date(
                        b.createdAt
                      ).getTime()
                    );
                  }
                ),
          })
        );

      res.json({
        ok: true,
        data: tree,
      });
    } catch (err) {
      next(err);
    }
  };

/* =========================================================
   PUBLIC CATEGORIES
========================================================= */

export const getCategories =
  async (
    req,
    res,
    next
  ) => {
    try {
      const filter = {
        isActive: true,
      };

      if (
        req.query.wardrobe ===
        "true"
      ) {
        filter.showInWardrobe =
          true;
      }

      if (
        req.query.home ===
        "true"
      ) {
        filter.showInHome =
          true;
      }

      const categories =
        await Category.find(
          filter
        )
          .sort({
            sortOrder: 1,
            createdAt: 1,
          })
          .lean();

      /* ================================================
         FLAT RESPONSE
      ================================================= */

      if (
        req.query.tree !==
        "true"
      ) {
        return res.json({
          ok: true,
          data: {
            categories,
          },
        });
      }

      /* ================================================
         TREE RESPONSE
      ================================================= */

      const parents =
        categories.filter(
          (category) =>
            !category.parent
        );

      const tree =
        parents.map(
          (parent) => ({
            ...parent,

            children:
              categories
                .filter(
                  (category) =>
                    category.parent &&
                    category.parent.toString() ===
                      parent._id.toString()
                )
                .sort(
                  (
                    a,
                    b
                  ) => {
                    if (
                      a.sortOrder !==
                      b.sortOrder
                    ) {
                      return (
                        a.sortOrder -
                        b.sortOrder
                      );
                    }

                    return (
                      new Date(
                        a.createdAt
                      ).getTime() -
                      new Date(
                        b.createdAt
                      ).getTime()
                    );
                  }
                ),
          })
        );

      return res.json({
        ok: true,
        data: {
          categories: tree,
        },
      });
    } catch (err) {
      next(err);
    }
  };

/* =========================================================
   CATEGORY BY SLUG
========================================================= */

export const getCategoryBySlug =
  async (
    req,
    res,
    next
  ) => {
    try {
      const category =
        await Category.findOne({
          slug: req.params.slug,
          isActive: true,
        }).lean();

      if (!category) {
        return res
          .status(404)
          .json({
            ok: false,
            error: "Not found",
          });
      }

      const children =
        await Category.find({
          parent:
            category._id,
          isActive: true,
        })
          .sort({
            sortOrder: 1,
            createdAt: 1,
          })
          .lean();

      res.json({
        ok: true,
        data: {
          category,
          children,
        },
      });
    } catch (err) {
      next(err);
    }
  };

/* =========================================================
   SUBCATEGORIES
========================================================= */

export const getSubcategories =
  async (
    req,
    res,
    next
  ) => {
    try {
      const parent =
        await Category.findOne({
          _id: req.params.id,
          isActive: true,
        }).lean();

      if (!parent) {
        return res
          .status(404)
          .json({
            ok: false,
            error:
              "Parent category not found",
          });
      }

      const subcategories =
        await Category.find({
          parent:
            parent._id,
          isActive: true,
        })
          .sort({
            sortOrder: 1,
            createdAt: 1,
          })
          .lean();

      res.json({
        ok: true,
        data: {
          parent,
          subcategories,
        },
      });
    } catch (err) {
      next(err);
    }
  };

/* =========================================================
   ADMIN - ALL CATEGORIES
========================================================= */

export const getAllCategoriesAdmin =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        page,
        limit,
        search,
        parent,
        active,
        home,
        wardrobe,
      } = req.query;

      const {
        skip,
        limit: lim,
        page: pg,
      } = paginate(
        page,
        limit
      );

      const filter = {};

      if (search) {
        filter.name = {
          $regex: search,
          $options: "i",
        };
      }

      if (
        parent !== undefined
      ) {
        if (
          parent === "null" ||
          parent === ""
        ) {
          filter.parent = null;
        } else {
          filter.parent =
            parent;
        }
      }

      if (
        active === "true"
      ) {
        filter.isActive =
          true;
      }

      if (
        active === "false"
      ) {
        filter.isActive =
          false;
      }

      if (
        home === "true"
      ) {
        filter.showInHome =
          true;
      }

      if (
        wardrobe === "true"
      ) {
        filter.showInWardrobe =
          true;
      }

      const [
        categories,
        total,
      ] = await Promise.all([
        Category.find(filter)
          .populate(
            "parent",
            "name slug sortOrder"
          )
          .sort({
            parent: 1,
            sortOrder: 1,
            createdAt: -1,
          })
          .skip(skip)
          .limit(lim)
          .lean(),

        Category.countDocuments(
          filter
        ),
      ]);

      res.json({
        ok: true,
        data: {
          categories,
          total,
          page: pg,
          limit: lim,
          pages:
            Math.ceil(
              total / lim
            ),
        },
      });
    } catch (err) {
      next(err);
    }
  };

/* =========================================================
   CREATE CATEGORY / SUBCATEGORY
========================================================= */

export const createCategory =
  async (
    req,
    res,
    next
  ) => {
    try {
      const {
        name,
        description,
        image,

        // NEW
        heroImage,
        mobileHeroImage,

        showInHome,
        showInWardrobe,
        showInFooter,
        parent,
        sortOrder,
      } = req.body;

      /* ================================================
         NAME
      ================================================= */

      if (!name?.trim()) {
        return res
          .status(400)
          .json({
            ok: false,
            error:
              "Name required",
          });
      }

      /* ================================================
         PARENT
      ================================================= */

      let parentCategory =
        null;

      if (parent) {
        parentCategory =
          await Category.findOne(
            {
              _id: parent,
              isActive: true,
            }
          );

        if (!parentCategory) {
          return res
            .status(400)
            .json({
              ok: false,
              error:
                "Parent category not found",
            });
        }

        /* ==============================================
           ONLY 2 LEVELS
        ============================================== */

        if (
          parentCategory.parent
        ) {
          return res
            .status(400)
            .json({
              ok: false,
              error:
                "Nested subcategories are not allowed",
            });
        }
      }

      /* ================================================
         SERIAL
      ================================================= */

      const requestedOrder =
        getOrder(
          sortOrder
        );

      const siblingFilter = {
        parent:
          parent || null,
        isActive: true,
      };

      const siblingCount =
        await Category.countDocuments(
          siblingFilter
        );

      const finalOrder =
        requestedOrder
          ? Math.min(
              requestedOrder,
              siblingCount + 1
            )
          : siblingCount + 1;

      /* ================================================
         SHIFT SERIAL NUMBERS
      ================================================= */

      if (
        siblingCount > 0 &&
        finalOrder <=
          siblingCount
      ) {
        await Category.updateMany(
          {
            ...siblingFilter,

            sortOrder: {
              $gte:
                finalOrder,
            },
          },
          {
            $inc: {
              sortOrder: 1,
            },
          }
        );
      }

      /* ================================================
         CREATE
      ================================================= */

      const category =
        await Category.create({
          name:
            name.trim(),

          slug:
            normalizeSlug(
              name
            ),

          description:
            description?.trim() ||
            "",

          /* NORMAL IMAGE */
          image:
            image?.trim() ||
            "",

          /* DESKTOP HERO */
          heroImage:
            heroImage?.trim() ||
            "",

          /* OPTIONAL MOBILE HERO */
          mobileHeroImage:
            mobileHeroImage?.trim() ||
            "",

          parent:
            parent || null,

          showInHome:
            toBoolean(
              showInHome,
              false
            ),

          showInWardrobe:
            toBoolean(
              showInWardrobe,
              false
            ),

          showInFooter:
            toBoolean(
              showInFooter,
              true
            ),

          isActive: true,

          sortOrder:
            finalOrder,
        });

      await category.populate(
        "parent",
        "name slug sortOrder"
      );

      res
        .status(201)
        .json({
          ok: true,
          data: {
            category,
          },
        });
    } catch (err) {
      if (
        err.code ===
        11000
      ) {
        return res
          .status(409)
          .json({
            ok: false,
            error:
              "Name/slug already exists",
          });
      }

      next(err);
    }
  };

/* =========================================================
   UPDATE CATEGORY / SUBCATEGORY
========================================================= */

export const updateCategory =
  async (
    req,
    res,
    next
  ) => {
    try {
      const category =
        await Category.findById(
          req.params.id
        );

      if (!category) {
        return res
          .status(404)
          .json({
            ok: false,
            error:
              "Not found",
          });
      }

      const body =
        req.body;

      /* ================================================
         RESOLVE PARENT
      ================================================= */

      let newParent =
        category.parent ||
        null;

      if (
        "parent" in body
      ) {
        newParent =
          body.parent ||
          null;
      }

      /* ================================================
         SELF PARENT CHECK
      ================================================= */

      if (
        newParent &&
        newParent.toString() ===
          category._id.toString()
      ) {
        return res
          .status(400)
          .json({
            ok: false,
            error:
              "Category cannot be its own parent",
          });
      }

      /* ================================================
         PARENT VALIDATION
      ================================================= */

      if (newParent) {
        const parentCategory =
          await Category.findOne(
            {
              _id:
                newParent,
              isActive: true,
            }
          ).lean();

        if (
          !parentCategory
        ) {
          return res
            .status(400)
            .json({
              ok: false,
              error:
                "Parent category not found",
            });
        }

        if (
          parentCategory.parent
        ) {
          return res
            .status(400)
            .json({
              ok: false,
              error:
                "Nested subcategories are not allowed",
            });
        }
      }

      /* ================================================
         UPDATE OBJECT
      ================================================= */

      const update = {};

      /* NAME */

      if (
        body.name !==
        undefined
      ) {
        const trimmedName =
          String(
            body.name
          ).trim();

        if (
          !trimmedName
        ) {
          return res
            .status(400)
            .json({
              ok: false,
              error:
                "Name required",
            });
        }

        update.name =
          trimmedName;

        update.slug =
          normalizeSlug(
            trimmedName
          );
      }

      /* DESCRIPTION */

      if (
        body.description !==
        undefined
      ) {
        update.description =
          String(
            body.description
          ).trim();
      }

      /* NORMAL IMAGE */

      if (
        body.image !==
        undefined
      ) {
        update.image =
          String(
            body.image
          ).trim();
      }

      /* ================================================
         DESKTOP HERO IMAGE
      ================================================= */

      if (
        body.heroImage !==
        undefined
      ) {
        update.heroImage =
          String(
            body.heroImage
          ).trim();
      }

      /* ================================================
         MOBILE HERO IMAGE
         OPTIONAL
      ================================================= */

      if (
        body.mobileHeroImage !==
        undefined
      ) {
        update.mobileHeroImage =
          String(
            body.mobileHeroImage
          ).trim();
      }

      /* HOME */

      if (
        body.showInHome !==
        undefined
      ) {
        update.showInHome =
          toBoolean(
            body.showInHome
          );
      }

      /* WARDROBE */

      if (
        body.showInWardrobe !==
        undefined
      ) {
        update.showInWardrobe =
          toBoolean(
            body.showInWardrobe
          );
      }

      /* FOOTER */

      if (
        body.showInFooter !==
        undefined
      ) {
        update.showInFooter =
          toBoolean(
            body.showInFooter,
            category.showInFooter
          );
      }

      /* ACTIVE */

      if (
        body.isActive !==
        undefined
      ) {
        update.isActive =
          toBoolean(
            body.isActive,
            category.isActive
          );
      }

      /* ================================================
         PARENT CHANGE
      ================================================= */

      const oldParent =
        category.parent
          ? category.parent.toString()
          : null;

      const newParentString =
        newParent
          ? newParent.toString()
          : null;

      const parentChanged =
        oldParent !==
        newParentString;

      /* ================================================
         OLD ORDER
      ================================================= */

      const oldOrder =
        Number(
          category.sortOrder
        ) || 1;

      const requestedOrder =
        body.sortOrder !==
        undefined
          ? getOrder(
              body.sortOrder
            )
          : null;

      /* ================================================
         PARENT CHANGED
      ================================================= */

      if (
        parentChanged
      ) {
        /* CLOSE OLD GAP */

        await Category.updateMany(
          {
            parent:
              category.parent ||
              null,

            _id: {
              $ne:
                category._id,
            },

            isActive: true,

            sortOrder: {
              $gt:
                oldOrder,
            },
          },
          {
            $inc: {
              sortOrder:
                -1,
            },
          }
        );

        /* NEW SIBLING COUNT */

        const newSiblingCount =
          await Category.countDocuments(
            {
              parent:
                newParent ||
                null,

              _id: {
                $ne:
                  category._id,
              },

              isActive: true,
            }
          );

        const newOrder =
          requestedOrder
            ? Math.min(
                requestedOrder,
                newSiblingCount +
                  1
              )
            : newSiblingCount +
              1;

        /* MAKE SPACE */

        await Category.updateMany(
          {
            parent:
              newParent ||
              null,

            _id: {
              $ne:
                category._id,
            },

            isActive: true,

            sortOrder: {
              $gte:
                newOrder,
            },
          },
          {
            $inc: {
              sortOrder: 1,
            },
          }
        );

        update.parent =
          newParent ||
          null;

        update.sortOrder =
          newOrder;
      }

      /* ================================================
         SAME PARENT / ONLY SERIAL CHANGED
      ================================================= */

      else if (
        requestedOrder !==
        null
      ) {
        const siblingCount =
          await Category.countDocuments(
            {
              parent:
                category.parent ||
                null,

              _id: {
                $ne:
                  category._id,
              },

              isActive: true,
            }
          );

        const targetOrder =
          Math.min(
            requestedOrder,
            siblingCount +
              1
          );

        /* MOVE UP */

        if (
          targetOrder <
          oldOrder
        ) {
          await Category.updateMany(
            {
              parent:
                category.parent ||
                null,

              _id: {
                $ne:
                  category._id,
              },

              isActive: true,

              sortOrder: {
                $gte:
                  targetOrder,

                $lt:
                  oldOrder,
              },
            },
            {
              $inc: {
                sortOrder: 1,
              },
            }
          );
        }

        /* MOVE DOWN */

        else if (
          targetOrder >
          oldOrder
        ) {
          await Category.updateMany(
            {
              parent:
                category.parent ||
                null,

              _id: {
                $ne:
                  category._id,
              },

              isActive: true,

              sortOrder: {
                $gt:
                  oldOrder,

                $lte:
                  targetOrder,
              },
            },
            {
              $inc: {
                sortOrder:
                  -1,
              },
            }
          );
        }

        update.sortOrder =
          targetOrder;
      }

      /* ================================================
         SAVE
      ================================================= */

      const updatedCategory =
        Object.keys(update)
          .length > 0
          ? await Category.findByIdAndUpdate(
              category._id,
              {
                $set: update,
              },
              {
                new: true,
                runValidators: true,
              }
            )
          : category;

      await updatedCategory.populate(
        "parent",
        "name slug sortOrder"
      );

      res.json({
        ok: true,
        data: {
          category:
            updatedCategory,
        },
      });
    } catch (err) {
      if (
        err.code ===
        11000
      ) {
        return res
          .status(409)
          .json({
            ok: false,
            error:
              "Name/slug already exists",
          });
      }

      next(err);
    }
  };

/* =========================================================
   SOFT DELETE
========================================================= */

export const deleteCategory =
  async (
    req,
    res,
    next
  ) => {
    try {
      const category =
        await Category.findById(
          req.params.id
        );

      if (!category) {
        return res
          .status(404)
          .json({
            ok: false,
            error:
              "Not found",
          });
      }

      const childCount =
        await Category.countDocuments(
          {
            parent:
              category._id,

            isActive: true,
          }
        );

      if (
        childCount > 0
      ) {
        return res
          .status(400)
          .json({
            ok: false,
            error:
              "This category has active subcategories. Deactivate or remove them first.",
          });
      }

      const oldParent =
        category.parent ||
        null;

      const oldOrder =
        Number(
          category.sortOrder
        ) || 1;

      const updatedCategory =
        await Category.findByIdAndUpdate(
          category._id,
          {
            $set: {
              isActive: false,
            },
          },
          {
            new: true,
          }
        );

      /* COMPACT SERIAL */

      await Category.updateMany(
        {
          parent:
            oldParent,

          isActive: true,

          sortOrder: {
            $gt:
              oldOrder,
          },
        },
        {
          $inc: {
            sortOrder:
              -1,
          },
        }
      );

      res.json({
        ok: true,
        data: {
          message:
            "Deactivated",

          category:
            updatedCategory,
        },
      });
    } catch (err) {
      next(err);
    }
  };

/* =========================================================
   PERMANENT DELETE
========================================================= */

export const permanentlyDeleteCategory =
  async (
    req,
    res,
    next
  ) => {
    try {
      const category =
        await Category.findById(
          req.params.id
        );

      if (!category) {
        return res
          .status(404)
          .json({
            ok: false,
            error:
              "Category not found",
          });
      }

      /* ================================================
         MAIN CATEGORY
         DELETE CHILDREN TOO
      ================================================= */

      if (
        !category.parent
      ) {
        const children =
          await Category.find({
            parent:
              category._id,
          }).select(
            "_id"
          );

        const childIds =
          children.map(
            (child) =>
              child._id
          );

        if (
          childIds.length >
          0
        ) {
          await Category.deleteMany(
            {
              _id: {
                $in:
                  childIds,
              },
            }
          );

          /*
           * If products belonging to
           * these subcategories should
           * also be deleted, Product model
           * can be imported here.
           */
        }
      }

      await Category.findByIdAndDelete(
        req.params.id
      );

      return res.json({
        ok: true,
        data: {
          message:
            "Category permanently deleted",
        },
      });
    } catch (err) {
      next(err);
    }
  };