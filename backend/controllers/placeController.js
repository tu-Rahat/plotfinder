const { getNearbyPlaces } = require("../services/nearbyPlacesService");

const getNearbyPlacesForLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        message: "Latitude and longitude are required",
      });
    }

    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);

    if (Number.isNaN(parsedLatitude) || Number.isNaN(parsedLongitude)) {
      return res.status(400).json({
        message: "Latitude and longitude must be valid numbers",
      });
    }

    const places = await getNearbyPlaces(parsedLatitude, parsedLongitude);

    return res.status(200).json({
      message: "Nearby places fetched successfully",
      places,
    });
  } catch (error) {
    console.error("Nearby places error:", error.message);

    return res.status(500).json({
      message: error.message || "Failed to fetch nearby places",
    });
  }
};

module.exports = {
  getNearbyPlacesForLocation,
};