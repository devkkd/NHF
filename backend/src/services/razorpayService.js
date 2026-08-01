import razorpay from "../config/razorpay.js";

export const createRazorpayOrder = async ({
  amount,
  receipt,
  notes = {},
}) => {
  try {
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt,
      payment_capture: 1,
      notes,
    });

    return order;
  } catch (error) {
    throw new Error(error.error?.description || error.message);
  }
};