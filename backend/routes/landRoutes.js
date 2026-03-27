const express = require("express");
const router = express.Router();

const {
  createLandPost,
  getApprovedLands,
  getMyLandPosts,
  getPendingLands,
  approveLandPost,
  getSingleLand,
} = require("../controllers/landController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly, userOnly } = require("../middleware/roleMiddleware");

router.get("/", getApprovedLands);
router.post("/", protect, userOnly, createLandPost);
router.get("/my-posts", protect, userOnly, getMyLandPosts);
router.get("/pending", protect, adminOnly, getPendingLands);
router.patch("/:id/approve", protect, adminOnly, approveLandPost);
router.get("/:id", getSingleLand);
module.exports = router;