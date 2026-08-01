export const validateAddress = (req, res, next) => {
  const {
    firstName,
    lastName,
    address1,
    city,
    state,
    country,
    pin,
    mobile,
  } = req.body;

  if (
    !firstName?.trim() ||
    !lastName?.trim() ||
    !address1?.trim() ||
    !city?.trim() ||
    !state?.trim() ||
    !country?.trim() ||
    !pin?.trim() ||
    !mobile?.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Please fill all required fields.",
    });
  }

  if (!/^[0-9]{6}$/.test(pin)) {
    return res.status(400).json({
      success: false,
      message: "Invalid PIN Code.",
    });
  }

  if (!/^[0-9]{10}$/.test(mobile)) {
    return res.status(400).json({
      success: false,
      message: "Invalid Mobile Number.",
    });
  }

  next();
};