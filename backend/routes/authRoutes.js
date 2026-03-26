const { protect } = require("../middleware/authMiddleware");
const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    message: "Protected route working",
    user: req.user,
  });
});
module.exports = router;