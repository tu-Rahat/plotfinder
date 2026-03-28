const express = require("express");
const router = express.Router();

const {
  addToShortlist,
  getMyShortlist,
  removeFromShortlist,
} = require("../controllers/shortlistController");

const { protect } = require("../middleware/authMiddleware");
const { userOnly } = require("../middleware/roleMiddleware");

router.post("/", protect, userOnly, addToShortlist);
router.get("/my-shortlist", protect, userOnly, getMyShortlist);
router.delete("/:landId", protect, userOnly, removeFromShortlist);

module.exports = router;