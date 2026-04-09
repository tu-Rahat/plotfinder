const express = require("express");
const { getNearbyPlacesForLocation } = require("../controllers/placeController");

const router = express.Router();

router.get("/nearby", getNearbyPlacesForLocation);

module.exports = router;