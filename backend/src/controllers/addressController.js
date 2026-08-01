import mongoose from "mongoose";
import User from "../models/User.js";

/* ===========================
   Get All Addresses
=========================== */

export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("addresses");

    return res.status(200).json({
      success: true,
      addresses: user.addresses,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch addresses.",
    });
  }
};

/* ===========================
   Add Address
=========================== */

export const addAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const {
      firstName,
      lastName,
      address1,
      address2,
      city,
      state,
      country,
      pin,
      mobile,
      altMobile,
      lat,
      lng,
      label,
      isDefault,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !address1 ||
      !city ||
      !state ||
      !country ||
      !pin ||
      !mobile
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    if (user.addresses.length >= 10) {
      return res.status(400).json({
        success: false,
        message: "Maximum 10 addresses allowed.",
      });
    }

    const duplicate = user.addresses.find(
      (addr) =>
        addr.address1.trim().toLowerCase() ===
          address1.trim().toLowerCase() &&
        addr.pin === pin &&
        addr.mobile === mobile
    );

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: "Address already exists.",
      });
    }

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      firstName,
      lastName,
      address1,
      address2,
      city,
      state,
      country,
      pin,
      mobile,
      altMobile,
      lat,
      lng,
      label,
      isDefault: isDefault || user.addresses.length === 0,
    });

    await user.save();

    return res.status(201).json({
      success: true,
      message: "Address added successfully.",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

/* ===========================
   Update Address
=========================== */

export const updateAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const address = user.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    Object.assign(address, req.body);

    if (req.body.isDefault) {
      user.addresses.forEach((addr) => {
        if (addr._id.toString() !== req.params.id) {
          addr.isDefault = false;
        }
      });

      address.isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      message: "Address updated successfully.",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

/* ===========================
   Delete Address
=========================== */

export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const address = user.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    address.deleteOne();

    await user.save();

    if (
      user.addresses.length &&
      !user.addresses.some((a) => a.isDefault)
    ) {
      user.addresses[0].isDefault = true;
      await user.save();
    }

    res.json({
      success: true,
      message: "Address removed successfully.",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

/* ===========================
   Set Default Address
=========================== */

export const setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const address = user.addresses.id(req.params.id);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found.",
      });
    }

    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });

    address.isDefault = true;

    await user.save();

    res.json({
      success: true,
      message: "Default address updated.",
      addresses: user.addresses,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};
export const getDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const address = user.addresses.find(
      (a) => a.isDefault
    );

    return res.json({
      success: true,
      address,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch default address.",
    });

  }
};