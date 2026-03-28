const express = require("express");
const { protect, optionalProtect } = require("../middleware/authMiddleware");
const {
  getProperties,
  rateProperty,
  createProperty,
} = require("../controllers/propertyController");

const router = express.Router();

router.get("/", optionalProtect, getProperties);
router.post("/:propertyId/rate", protect, rateProperty);
router.post("/", protect, (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }
  return next();
}, createProperty);

module.exports = router;
