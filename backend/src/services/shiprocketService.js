import axios from "axios";

/* =========================================================
   SHIPROCKET CONFIG
========================================================= */

const SHIPROCKET_BASE_URL =
  "https://apiv2.shiprocket.in/v1/external";

const SHIPROCKET_EMAIL =
  process.env.SHIPROCKET_EMAIL;

const SHIPROCKET_PASSWORD =
  process.env.SHIPROCKET_PASSWORD;

const PICKUP_LOCATION =
  process.env.SHIPROCKET_PICKUP_LOCATION ||
  "Home";

/*
 * Shiprocket token memory me rakhenge.
 *
 * NOTE:
 * Shiprocket token expiry aaye to login dubara
 * automatically kiya jayega.
 */
let shiprocketToken = null;
let shiprocketTokenExpiresAt = 0;

/* =========================================================
   AXIOS HELPERS
========================================================= */

const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

/* =========================================================
   LOGIN
========================================================= */

const loginShiprocket = async () => {
  try {
    const now = Date.now();

    /*
     * Existing token abhi valid hai.
     */
    if (
      shiprocketToken &&
      shiprocketTokenExpiresAt > now + 60 * 1000
    ) {
      return shiprocketToken;
    }

    if (
      !SHIPROCKET_EMAIL ||
      !SHIPROCKET_PASSWORD
    ) {
      throw new Error(
        "SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD is missing."
      );
    }

    const response =
      await axios.post(
        `${SHIPROCKET_BASE_URL}/auth/login`,
        {
          email:
            SHIPROCKET_EMAIL,

          password:
            SHIPROCKET_PASSWORD,
        },
        {
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

    if (
      !response.data?.token
    ) {
      throw new Error(
        "Shiprocket login succeeded but token was not returned."
      );
    }

    shiprocketToken =
      response.data.token;

    /*
     * Shiprocket token generally has a limited lifetime.
     * We keep a safe 9-day cache and automatically re-login.
     *
     * If API rejects token earlier, request retry logic
     * below will also clear it.
     */
    shiprocketTokenExpiresAt =
      Date.now() +
      9 * 24 * 60 * 60 * 1000;

    console.log(
      "✅ Shiprocket Login Success"
    );

    return shiprocketToken;
  } catch (error) {
    shiprocketToken = null;
    shiprocketTokenExpiresAt = 0;

    console.error(
      "❌ Shiprocket Login Failed"
    );

    console.error(
      error.response?.data ||
        error.message
    );

    throw error;
  }
};

/* =========================================================
   AUTHENTICATED REQUEST

   Handles:
   - token expiry
   - automatic re-login
   - one retry
========================================================= */

const shiprocketRequest = async ({
  method,
  url,
  data = undefined,
  params = undefined,
}) => {
  let token =
    await loginShiprocket();

  try {
    const response =
      await axios({
        method,
        url,
        data,
        params,

        headers:
          getAuthHeaders(token),

        validateStatus:
          () => true,
      });

    /*
     * Token expired / unauthorized.
     *
     * Clear cached token and login again once.
     */
    if (
      response.status === 401
    ) {
      console.log(
        "⚠️ Shiprocket token expired. Re-login..."
      );

      shiprocketToken = null;
      shiprocketTokenExpiresAt = 0;

      token =
        await loginShiprocket();

      const retryResponse =
        await axios({
          method,
          url,
          data,
          params,

          headers:
            getAuthHeaders(token),

          validateStatus:
            () => true,
        });

      if (
        retryResponse.status >= 400
      ) {
        throw new Error(
          retryResponse.data?.message ||
            "Shiprocket request failed."
        );
      }

      return retryResponse.data;
    }

    if (
      response.status >= 400
    ) {
      const message =
        response.data?.message ||
        response.data?.error ||
        "Shiprocket request failed.";

      const error =
        new Error(message);

      error.status =
        response.status;

      error.response =
        response;

      throw error;
    }

    return response.data;
  } catch (error) {
    console.error(
      "❌ Shiprocket API Error:",
      error.response?.data ||
        error.message
    );

    throw error;
  }
};

/* =========================================================
   BUILD SHIPROCKET ORDER ITEMS
========================================================= */

const buildShiprocketItems = (
  order
) => {
  return (
    Array.isArray(order?.items)
      ? order.items
      : []
  ).map((item) => ({
    name:
      item.name ||
      "Product",

    sku:
      `SKU-${String(
        item.product ||
          item.name ||
          "PRODUCT"
      )}`,

    units:
      Number(
        item.quantity || 1
      ),

    selling_price:
      Number(
        item.price || 0
      ),

    discount: 0,

    tax: 0,

    hsn: "",
  }));
};

/* =========================================================
   CREATE SHIPROCKET ORDER
========================================================= */

export const createShiprocketOrder =
  async (order) => {
    try {
      if (!order?._id) {
        throw new Error(
          "Order is required for Shiprocket creation."
        );
      }

      /*
       * Already created?
       * Don't create duplicate Shiprocket orders.
       */

      if (
        order.shiprocket?.orderId ||
        order.shiprocketOrderId
      ) {
        console.log(
          "ℹ️ Shiprocket order already exists:",
          order.shiprocket?.orderId ||
            order.shiprocketOrderId
        );

        return {
          alreadyExists: true,

          order_id:
            order.shiprocket?.orderId ||
            order.shiprocketOrderId,

          shipment_id:
            order.shiprocket?.shipmentId ||
            order.shipmentId ||
            "",
        };
      }

      const token =
        await loginShiprocket();

      const items =
        buildShiprocketItems(
          order
        );

      if (
        items.length === 0
      ) {
        throw new Error(
          "Cannot create Shiprocket order without items."
        );
      }

      const subtotal =
        Number(
          order.subtotal || 0
        );

      const shipping =
        Number(
          order.shipping || 0
        );

      const tax =
        Number(
          order.tax || 0
        );

      const discount =
        Number(
          order.discount || 0
        );

      const total =
        Number(
          order.total || 0
        );

      const payload = {
        /*
         * IMPORTANT:
         * Internal Mongo order ID is used as Shiprocket order_id.
         */
        order_id:
          order._id.toString(),

        order_date:
          order.createdAt
            ? new Date(
                order.createdAt
              )
                .toISOString()
                .split("T")[0]
            : new Date()
                .toISOString()
                .split("T")[0],

        pickup_location:
          PICKUP_LOCATION,

        /* ===================================================
           BILLING
        =================================================== */

        billing_customer_name:
          order.address?.firstName ||
          "",

        billing_last_name:
          order.address?.lastName ||
          "",

        billing_address:
          order.address?.address1 ||
          "",

        billing_address_2:
          order.address?.address2 ||
          "",

        billing_city:
          order.address?.city ||
          "",

        billing_state:
          order.address?.state ||
          "",

        billing_country:
          order.address?.country ||
          "India",

        billing_pincode:
          order.address?.pin ||
          "",

        billing_phone:
          order.address?.mobile ||
          "",

        billing_email:
          order.address?.email ||
          "",

        /* ===================================================
           SHIPPING
        =================================================== */

        shipping_customer_name:
          order.address?.firstName ||
          "",

        shipping_last_name:
          order.address?.lastName ||
          "",

        shipping_address:
          order.address?.address1 ||
          "",

        shipping_address_2:
          order.address?.address2 ||
          "",

        shipping_city:
          order.address?.city ||
          "",

        shipping_state:
          order.address?.state ||
          "",

        shipping_country:
          order.address?.country ||
          "India",

        shipping_pincode:
          order.address?.pin ||
          "",

        shipping_phone:
          order.address?.mobile ||
          "",

        shipping_email:
          order.address?.email ||
          "",

        shipping_is_billing:
          true,

        /* ===================================================
           ITEMS
        =================================================== */

        order_items:
          items,

        /* ===================================================
           PAYMENT
        =================================================== */

        payment_method:
          order.paymentMethod ===
          "cod"
            ? "COD"
            : "Prepaid",

        /* ===================================================
           TOTALS
        =================================================== */

        sub_total:
          subtotal,

        shipping_charges:
          shipping,

        giftwrap_charges:
          0,

        transaction_charges:
          0,

        total_discount:
          discount,

        cod_charges:
          0,

        /*
         * Package dimensions
         *
         * Currently kept as fallback.
         * Later product/package dimensions can be added.
         */

        length:
          10,

        breadth:
          10,

        height:
          10,

        weight:
          0.5,
      };

      console.log(
        "===================================="
      );

      console.log(
        "🚀 SHIPROCKET CREATE ORDER"
      );

      console.log(
        JSON.stringify(
          payload,
          null,
          2
        )
      );

      console.log(
        "===================================="
      );

      const response =
        await shiprocketRequest({
          method:
            "POST",

          url:
            `${SHIPROCKET_BASE_URL}/orders/create/adhoc`,

          data:
            payload,
        });

      console.log(
        "===================================="
      );

      console.log(
        "✅ SHIPROCKET CREATE RESPONSE"
      );

      console.log(
        JSON.stringify(
          response,
          null,
          2
        )
      );

      console.log(
        "===================================="
      );

      /*
       * IMPORTANT:
       * Shiprocket returns its own order_id and shipment_id.
       */

      const shiprocketOrderId =
        response?.order_id ||
        "";

      const shipmentId =
        response?.shipment_id ||
        "";

      /*
       * Ensure nested object exists.
       */

      if (
        !order.shiprocket
      ) {
        order.shiprocket = {};
      }

      /* =====================================================
         SAVE SHIPROCKET DATA
      ==================================================== */

      order.shiprocket.orderId =
        String(
          shiprocketOrderId
        );

      order.shiprocket.shipmentId =
        String(
          shipmentId
        );

      order.shiprocket.status =
        "created";

      order.shiprocket.createdAt =
        new Date();

      /*
       * BACKWARD COMPATIBILITY
       */

      order.shiprocketOrderId =
        String(
          shiprocketOrderId
        );

      order.shipmentId =
        String(
          shipmentId
        );

      await order.save();

      /* =====================================================
         AUTO AWB ASSIGN
      ==================================================== */

      let awbResult = null;

      if (
        shipmentId
      ) {
        try {
          awbResult =
            await assignAWB(
              order,
              shipmentId
            );
        } catch (awbError) {
          /*
           * Shiprocket order was already created.
           * AWB may fail temporarily.
           *
           * Do NOT destroy the order.
           */
          console.error(
            "⚠️ AWB assignment failed:",
            awbError.message
          );
        }
      }

      return {
        ...response,

        awb:
          awbResult,
      };
    } catch (error) {
      console.error(
        "===================================="
      );

      console.error(
        "❌ SHIPROCKET CREATE ORDER ERROR"
      );

      console.error(
        error.response?.data ||
          error.message
      );

      console.error(
        "===================================="
      );

      throw error;
    }
  };

/* =========================================================
   ASSIGN AWB / COURIER
========================================================= */

export const assignAWB =
  async (
    order,
    shipmentId = ""
  ) => {
    try {
      const finalShipmentId =
        shipmentId ||
        order?.shiprocket
          ?.shipmentId ||
        order?.shipmentId ||
        "";

      if (
        !finalShipmentId
      ) {
        throw new Error(
          "Shipment ID is required for AWB assignment."
        );
      }

      /*
       * Already has AWB.
       */

      if (
        order?.shiprocket?.awbCode ||
        order?.awbCode
      ) {
        console.log(
          "ℹ️ AWB already exists:",
          order.shiprocket?.awbCode ||
            order.awbCode
        );

        return {
          alreadyExists: true,

          awb_code:
            order.shiprocket?.awbCode ||
            order.awbCode,

          courier_name:
            order.shiprocket
              ?.courierName ||
            order.courierName ||
            "",
        };
      }

      console.log(
        "🚚 Assigning Shiprocket AWB..."
      );

      const response =
        await shiprocketRequest({
          method:
            "POST",

          url:
            `${SHIPROCKET_BASE_URL}/courier/assign/awb`,

          data: {
            shipment_id:
              finalShipmentId,
          },
        });

      console.log(
        "========== AWB RESPONSE =========="
      );

      console.log(
        JSON.stringify(
          response,
          null,
          2
        )
      );

      const responseData =
        response?.response?.data ||
        {};

      const awbCode =
        responseData?.awb_code ||
        "";

      const courierName =
        responseData?.courier_name ||
        "";

      const courierCompanyId =
        responseData
          ?.courier_company_id ||
        "";

      const trackingUrl =
        responseData?.track_url ||
        "";

      if (
        !awbCode
      ) {
        console.warn(
          "⚠️ Shiprocket did not return an AWB code yet."
        );

        return response;
      }

      /*
       * Nested structure
       */

      if (
        !order.shiprocket
      ) {
        order.shiprocket = {};
      }

      order.shiprocket.shipmentId =
        String(
          finalShipmentId
        );

      order.shiprocket.awbCode =
        String(
          awbCode
        );

      order.shiprocket.courierName =
        String(
          courierName
        );

      order.shiprocket.courierCompanyId =
        String(
          courierCompanyId
        );

      order.shiprocket.trackingUrl =
        String(
          trackingUrl
        );

      order.shiprocket.status =
        "awb_assigned";

      /*
       * Legacy fields
       */

      order.shipmentId =
        String(
          finalShipmentId
        );

      order.awbCode =
        String(
          awbCode
        );

      order.courierName =
        String(
          courierName
        );

      order.trackingUrl =
        String(
          trackingUrl
        );

      await order.save();

      console.log(
        "✅ AWB Assigned:",
        awbCode
      );

      return {
        ...response,

        awb_code:
          awbCode,

        courier_name:
          courierName,

        tracking_url:
          trackingUrl,
      };
    } catch (error) {
      console.error(
        "❌ AWB ASSIGN ERROR:",
        error.response?.data ||
          error.message
      );

      throw error;
    }
  };

/* =========================================================
   REQUEST PICKUP
========================================================= */

export const requestPickup =
  async (
    order
  ) => {
    try {
      const shipmentId =
        order?.shiprocket
          ?.shipmentId ||
        order?.shipmentId ||
        "";

      const awbCode =
        order?.shiprocket
          ?.awbCode ||
        order?.awbCode ||
        "";

      if (
        !shipmentId
      ) {
        throw new Error(
          "Shipment ID is required before requesting pickup."
        );
      }

      console.log(
        "📦 Requesting Shiprocket Pickup..."
      );

      const response =
        await shiprocketRequest({
          method:
            "POST",

          url:
            `${SHIPROCKET_BASE_URL}/courier/generate/pickup`,

          data: {
            shipment_id:
              Number(
                shipmentId
              ),
          },
        });

      console.log(
        "========== PICKUP RESPONSE =========="
      );

      console.log(
        JSON.stringify(
          response,
          null,
          2
        )
      );

      if (
        !order.shiprocket
      ) {
        order.shiprocket = {};
      }

      order.shiprocket.status =
        "pickup_requested";

      if (
        !order.shiprocket
          .pickedUpAt &&
        response
      ) {
        /*
         * This does NOT mean courier physically picked it up.
         * It only means pickup request was generated.
         *
         * Therefore we intentionally DO NOT set pickedUpAt.
         */
      }

      await order.save();

      return {
        ...response,

        awbCode,
      };
    } catch (error) {
      console.error(
        "❌ PICKUP REQUEST ERROR:",
        error.response?.data ||
          error.message
      );

      throw error;
    }
  };

/* =========================================================
   GET TRACKING DETAILS
========================================================= */

export const getTrackingDetails =
  async (
    awbCode
  ) => {
    try {
      const finalAwb =
        String(
          awbCode || ""
        ).trim();

      if (!finalAwb) {
        throw new Error(
          "AWB code is required for tracking."
        );
      }

      const response =
        await shiprocketRequest({
          method:
            "GET",

          url:
            `${SHIPROCKET_BASE_URL}/courier/track/awb/${encodeURIComponent(
              finalAwb
            )}`,
        });

      return response;
    } catch (error) {
      console.error(
        "❌ TRACKING ERROR:",
        error.response?.data ||
          error.message
      );

      throw error;
    }
  };

/* =========================================================
   GET SHIPMENT DETAILS
========================================================= */

export const getShipmentDetails =
  async (
    shipmentId
  ) => {
    const finalShipmentId =
      String(
        shipmentId || ""
      ).trim();

    if (
      !finalShipmentId
    ) {
      throw new Error(
        "Shipment ID is required."
      );
    }

    return shiprocketRequest({
      method:
        "GET",

      url:
        `${SHIPROCKET_BASE_URL}/shipments/${encodeURIComponent(
          finalShipmentId
        )}`,
    });
  };

/* =========================================================
   EXPORT LOGIN
   Useful for testing if needed.
========================================================= */

export {
  loginShiprocket,
};