const express = require("express");
const router = express.Router();

const {
  createBuyRequest,
  getMyBuyRequests,
  getRequestsForMyLands,
  updateBuyRequestStatus,
} = require("../controllers/buyRequestController");

const { protect } = require("../middleware/authMiddleware");
const { userOnly } = require("../middleware/roleMiddleware");

router.post("/", protect, userOnly, createBuyRequest);
router.get("/my-requests", protect, userOnly, getMyBuyRequests);
router.get("/incoming", protect, userOnly, getRequestsForMyLands);
router.patch("/:id/status", protect, userOnly, updateBuyRequestStatus);
module.exports = router;