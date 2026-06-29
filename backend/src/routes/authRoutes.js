import express from "express";
import { login, refresh, logout } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public auth routes
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

// Protected debug/profile route to test authentication
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    ok: true,
    data: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

export default router;
