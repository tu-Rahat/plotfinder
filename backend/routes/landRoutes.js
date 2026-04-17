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
  verifyLandPayment,
  rejectLandPayment,
  updateLandPostByAdmin,
  deleteLandPostByAdmin,
  updateMyLandPost,
  deleteMyLandPost,
  getSingleLand,
  getPendingPayments,
  requestBoostPayment,
  verifyBoostPayment,
  rejectBoostPayment,
  getPendingBoosts,
} = require("../controllers/landController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly, userOnly } = require("../middleware/roleMiddleware");

router.get("/", getApprovedLands);
router.post("/", protect, userOnly, createLandPost);

router.get("/my-posts", protect, userOnly, getMyLandPosts);
router.put("/my-posts/:id", protect, userOnly, updateMyLandPost);
router.delete("/my-posts/:id", protect, userOnly, deleteMyLandPost);
router.post("/my-posts/:id/boost", protect, userOnly, requestBoostPayment);

router.get("/pending", protect, adminOnly, getPendingLands);
router.get("/admin/pending-payments", protect, adminOnly, getPendingPayments);
router.get("/admin/pending-boosts", protect, adminOnly, getPendingBoosts);
router.get("/admin/all", protect, adminOnly, getAllLandsForAdmin);
router.patch("/:id/approve", protect, adminOnly, approveLandPost);
router.patch("/:id/reject", protect, adminOnly, rejectLandPost);
router.patch("/:id/payment/verify", protect, adminOnly, verifyLandPayment);
router.patch("/:id/payment/reject", protect, adminOnly, rejectLandPayment);
router.patch("/admin/boost/:id/verify", protect, adminOnly, verifyBoostPayment);
router.patch("/admin/boost/:id/reject", protect, adminOnly, rejectBoostPayment);
router.put("/:id", protect, adminOnly, updateLandPostByAdmin);
router.delete("/:id", protect, adminOnly, deleteLandPostByAdmin);

router.get("/:id", getSingleLand);

module.exports = router;