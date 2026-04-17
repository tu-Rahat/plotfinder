const express = require("express");
const {
  createLocationPreference,
  getMyLocationPreferences,
  deleteLocationPreference,
  getMyNotifications,
  markNotificationAsRead,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/preferences", protect, createLocationPreference);
router.get("/preferences/my", protect, getMyLocationPreferences);
router.delete("/preferences/:preferenceId", protect, deleteLocationPreference);

router.get("/my", protect, getMyNotifications);
router.patch("/:notificationId/read", protect, markNotificationAsRead);

module.exports = router;