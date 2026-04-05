const express = require("express");
const router = express.Router();

const {
  createLandPost,
  getApprovedLands,
  getMyLandPosts,
  getPendingLands,
  getAllLandsForAdmin,
  approveLandPost,
  rejectLandPost,
  deleteLandPostByAdmin,
  getSingleLand,
} = require("../controllers/landController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly, userOnly } = require("../middleware/roleMiddleware");

router.get("/", getApprovedLands);
router.post("/", protect, userOnly, createLandPost);
router.get("/my-posts", protect, userOnly, getMyLandPosts);

router.get("/pending", protect, adminOnly, getPendingLands);
router.get("/admin/all", protect, adminOnly, getAllLandsForAdmin);
router.patch("/:id/approve", protect, adminOnly, approveLandPost);
router.patch("/:id/reject", protect, adminOnly, rejectLandPost);
router.delete("/:id", protect, adminOnly, deleteLandPostByAdmin);

router.get("/:id", getSingleLand);

module.exports = router;