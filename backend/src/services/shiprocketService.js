import axios from "axios";

let shiprocketToken = null;

/* ==========================================
   LOGIN
========================================== */

const loginShiprocket = async () => {
  try {
    if (shiprocketToken) return shiprocketToken;

    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }
    );

    shiprocketToken = response.data.token;

    console.log("✅ Shiprocket Login Success");

    return shiprocketToken;
  } catch (error) {
    console.log("❌ Shiprocket Login Failed");
    console.log(error.response?.data || error.message);
    throw error;
  }
};

/* ==========================================
   CREATE ORDER
========================================== */

export const createShiprocketOrder = async (order) => {
  try {
    const token = await loginShiprocket();

    const items = order.items.map((item) => ({
      name: item.name,
      sku: `SKU-${item.product?.toString() || item.name}`,
      units: item.quantity,
      selling_price: item.price,
    }));

    const payload = {
      order_id: order._id.toString(),
      order_date: new Date().toISOString().split("T")[0],

      pickup_location: "Home",

      // Billing
      billing_customer_name: order.address.firstName,
      billing_last_name: order.address.lastName || "",
      billing_address: order.address.address1,
      billing_address_2: order.address.address2 || "",
      billing_city: order.address.city,
      billing_state: order.address.state,
      billing_country: order.address.country || "India",
      billing_pincode: order.address.pin,
      billing_phone: order.address.mobile,
      billing_email: order.address.email,

      // Shipping
      shipping_customer_name: order.address.firstName,
      shipping_last_name: order.address.lastName || "",
      shipping_address: order.address.address1,
      shipping_address_2: order.address.address2 || "",
      shipping_city: order.address.city,
      shipping_state: order.address.state,
      shipping_country: order.address.country || "India",
      shipping_pincode: order.address.pin,
      shipping_phone: order.address.mobile,
      shipping_email: order.address.email,

      shipping_is_billing: true,

      // Products
      order_items: items,

      payment_method:
        order.paymentMethod === "cod" ? "COD" : "Prepaid",

      sub_total: Number(order.subtotal),

      shipping_charges: 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: 0,
      cod_charges: 0,

      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5,
    };

    console.log("====================================");
    console.log("SHIPROCKET REQUEST");
    console.log(JSON.stringify(payload, null, 2));
    console.log("====================================");

    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        validateStatus: () => true,
      }
    );

    console.log("====================================");
    console.log("SHIPROCKET STATUS:", response.status);
    console.log("SHIPROCKET RESPONSE");
    console.log(JSON.stringify(response.data, null, 2));
    console.log("====================================");

    if (response.status >= 400) {
      throw new Error(
        response.data.message || "Shiprocket order creation failed"
      );
    }

    // Save Order & Shipment
    if (response.data.order_id) {
      order.shiprocketOrderId = response.data.order_id;
      order.shipmentId = response.data.shipment_id || "";

      // ==========================================
      // ASSIGN COURIER + GENERATE AWB
      // ==========================================

      if (response.data.shipment_id) {
        try {
          const awbResponse = await axios.post(
            "https://apiv2.shiprocket.in/v1/external/courier/assign/awb",
            {
              shipment_id: response.data.shipment_id,
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          console.log("========== AWB RESPONSE ==========");
          console.log(JSON.stringify(awbResponse.data, null, 2));

          if (
            awbResponse.data.awb_assign_status === 1 &&
            awbResponse.data.response?.data
          ) {
            order.awbCode =
              awbResponse.data.response.data.awb_code || "";

            order.courierName =
              awbResponse.data.response.data.courier_name || "";

            order.trackingUrl =
              awbResponse.data.response.data.track_url || "";
          } else {
            console.log("⚠️ AWB not generated yet.");
          }
        } catch (err) {
          console.log("========== AWB ERROR ==========");
          console.log(err.response?.data || err.message);
        }
      }

      await order.save();
    }

    return response.data;
  } catch (error) {
    console.log("====================================");
    console.log("SHIPROCKET ERROR");

    if (error.response) {
      console.log("Status :", error.response.status);
      console.log(JSON.stringify(error.response.data, null, 2));
    } else {
      console.log(error.message);
    }

    console.log("====================================");

    throw error;
  }
};
export const getTrackingDetails = async (awbCode) => {
  const token = await loginShiprocket();

  const response = await axios.get(
    `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awbCode}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};