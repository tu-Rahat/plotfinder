const express = require("express");
const router = express.Router();

const {
  createBuyRequest,
  getMyBuyRequests,
  getRequestsForMyLands
} = require("../controllers/buyRequestController");

const { protect } = require("../middleware/authMiddleware");
const { userOnly } = require("../middleware/roleMiddleware");

router.post("/", protect, userOnly, createBuyRequest);
router.get("/my-requests", protect, userOnly, getMyBuyRequests);
router.get("/incoming", protect, userOnly, getRequestsForMyLands);
module.exports = router;