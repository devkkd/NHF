import { apiFetch } from "./api";

// Get All Addresses
export const getAddresses = () => {
  return apiFetch("/user/addresses");
};

// Get Default Address
export const getDefaultAddress = () => {
  return apiFetch("/user/addresses/default");
};

// Add Address
export const addAddress = (body) => {
  return apiFetch("/user/addresses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
};

// Update Address
export const updateAddress = (id, body) => {
  return apiFetch(`/user/addresses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
};

// Delete Address
export const deleteAddress = (id) => {
  return apiFetch(`/user/addresses/${id}`, {
    method: "DELETE",
  });
};

// Set Default Address
export const setDefaultAddress = (id) => {
  return apiFetch(`/user/addresses/${id}/default`, {
    method: "PATCH",
  });
};