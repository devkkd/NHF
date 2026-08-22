/**
 * Keep sibling records ordered as 1..N and support moving an item
 * to a new serial position without creating duplicate serial numbers.
 */

const toPositiveInt = (value) => {
  const number = Number(value);

  return Number.isInteger(number) && number > 0
    ? number
    : null;
};

const scopeWithoutId = (scope, id) => ({
  ...scope,
  ...(id
    ? {
        _id: {
          $ne: id,
        },
      }
    : {}),
});

/**
 * Normalize all records inside a particular scope:
 *
 * Example:
 * 2, 6, 9
 *
 * becomes:
 * 1, 2, 3
 */
export const normalizeScopeOrders = async (Model, scope) => {
  const docs = await Model.find(scope)
    .sort({
      sortOrder: 1,
      createdAt: 1,
      _id: 1,
    })
    .select('_id sortOrder')
    .lean();

  const operations = [];

  docs.forEach((doc, index) => {
    const order = index + 1;

    if (Number(doc.sortOrder) !== order) {
      operations.push({
        updateOne: {
          filter: {
            _id: doc._id,
          },
          update: {
            $set: {
              sortOrder: order,
            },
          },
        },
      });
    }
  });

  if (operations.length) {
    await Model.bulkWrite(operations);
  }

  return docs.length;
};

/**
 * Insert a new record at requested position.
 *
 * Example:
 *
 * Existing:
 * 1 A
 * 2 B
 * 3 C
 *
 * Insert at 2:
 *
 * 1 A
 * 2 New
 * 3 B
 * 4 C
 */
export const insertAtOrder = async ({
  Model,
  scope,
  requestedOrder,
}) => {
  await normalizeScopeOrders(Model, scope);

  const count = await Model.countDocuments(scope);

  const requested = toPositiveInt(requestedOrder);

  const target = requested
    ? Math.min(requested, count + 1)
    : count + 1;

  if (count && target <= count) {
    await Model.updateMany(
      {
        ...scope,
        sortOrder: {
          $gte: target,
        },
      },
      {
        $inc: {
          sortOrder: 1,
        },
      }
    );
  }

  return target;
};

/**
 * Move existing item from old position to requested position.
 *
 * Works for:
 * - Same category
 * - Different parent category
 * - Products between positions
 * - Category/subcategory reordering
 */
export const moveToOrder = async ({
  Model,
  id,
  oldScope,
  newScope,
  oldOrder,
  requestedOrder,
}) => {
  await normalizeScopeOrders(Model, oldScope);

  const sameScope =
    JSON.stringify(oldScope) === JSON.stringify(newScope);

  if (!sameScope) {
    await normalizeScopeOrders(Model, newScope);
  }

  const siblingsCount = await Model.countDocuments(
    scopeWithoutId(newScope, id)
  );

  const requested = toPositiveInt(requestedOrder);

  const target = requested
    ? Math.min(requested, siblingsCount + 1)
    : siblingsCount + 1;

  const current = toPositiveInt(oldOrder);

  /**
   * Moving inside same parent.
   */
  if (sameScope && current) {
    /**
     * Moving UP
     *
     * 1 A
     * 2 B
     * 3 C
     *
     * Move C -> 1
     *
     * 1 C
     * 2 A
     * 3 B
     */
    if (target < current) {
      await Model.updateMany(
        {
          ...newScope,
          _id: {
            $ne: id,
          },
          sortOrder: {
            $gte: target,
            $lt: current,
          },
        },
        {
          $inc: {
            sortOrder: 1,
          },
        }
      );
    }

    /**
     * Moving DOWN
     *
     * 1 A
     * 2 B
     * 3 C
     *
     * Move A -> 3
     *
     * 1 B
     * 2 C
     * 3 A
     */
    else if (target > current) {
      await Model.updateMany(
        {
          ...newScope,
          _id: {
            $ne: id,
          },
          sortOrder: {
            $gt: current,
            $lte: target,
          },
        },
        {
          $inc: {
            sortOrder: -1,
          },
        }
      );
    }
  }

  /**
   * Moving from one parent to another.
   *
   * Example:
   *
   * Category A
   * 1 X
   * 2 Y
   *
   * Category B
   * 1 P
   * 2 Q
   *
   * Move Y -> B position 1
   *
   * Category A
   * 1 X
   *
   * Category B
   * 1 Y
   * 2 P
   * 3 Q
   */
  else {
    /**
     * Close the gap in old scope.
     */
    if (current) {
      await Model.updateMany(
        {
          ...oldScope,
          _id: {
            $ne: id,
          },
          sortOrder: {
            $gt: current,
          },
        },
        {
          $inc: {
            sortOrder: -1,
          },
        }
      );
    }

    /**
     * Make space in new scope.
     */
    await Model.updateMany(
      {
        ...newScope,
        _id: {
          $ne: id,
        },
        sortOrder: {
          $gte: target,
        },
      },
      {
        $inc: {
          sortOrder: 1,
        },
      }
    );
  }

  return target;
};