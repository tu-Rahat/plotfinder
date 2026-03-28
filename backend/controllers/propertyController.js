const mongoose = require("mongoose");
const Property = require("../models/Property");
const PropertyRating = require("../models/PropertyRating");

const ratingKeys = [
  "location",
  "nearbyConstructions",
  "dailyAccessibilities",
  "roadHealth",
  "crimeRate",
];

const buildAggregateRatings = async () => {
  const groupStage = {
    _id: "$property",
    total: { $sum: 1 },
  };

  ratingKeys.forEach((key) => {
    groupStage[key] = { $avg: `$ratings.${key}` };
  });

  const rows = await PropertyRating.aggregate([{ $group: groupStage }]);
  const map = new Map();

  rows.forEach((row) => {
    const ratings = {};
    ratingKeys.forEach((key) => {
      ratings[key] = Number((row[key] || 0).toFixed(1));
    });

    const overall =
      ratingKeys.reduce((sum, key) => sum + ratings[key], 0) / ratingKeys.length;

    map.set(String(row._id), {
      ratings,
      overall: Number(overall.toFixed(1)),
      totalRatings: row.total || 0,
    });
  });

  return map;
};

exports.getProperties = async (req, res) => {
  try {
    const [properties, aggregateMap] = await Promise.all([
      Property.find({}).sort({ createdAt: -1 }).lean(),
      buildAggregateRatings(),
    ]);

    let userRatingsMap = new Map();

    if (req.user?.id) {
      const userRows = await PropertyRating.find({ user: req.user.id }).lean();
      userRatingsMap = new Map(
        userRows.map((row) => [String(row.property), row.ratings])
      );
    }

    const payload = properties.map((property) => {
      const aggregate = aggregateMap.get(String(property._id)) || {
        ratings: {
          location: 0,
          nearbyConstructions: 0,
          dailyAccessibilities: 0,
          roadHealth: 0,
          crimeRate: 0,
        },
        overall: 0,
        totalRatings: 0,
      };

      return {
        ...property,
        averageRatings: aggregate.ratings,
        overallRating: aggregate.overall,
        totalRatings: aggregate.totalRatings,
        userRatings: userRatingsMap.get(String(property._id)) || null,
      };
    });

    return res.status(200).json({ properties: payload });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.rateProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { ratings } = req.body;

    if (!mongoose.Types.ObjectId.isValid(propertyId)) {
      return res.status(400).json({ message: "Invalid property id" });
    }

    if (!ratings || typeof ratings !== "object") {
      return res.status(400).json({ message: "Ratings are required" });
    }

    const normalizedRatings = {};
    for (const key of ratingKeys) {
      const value = Number(ratings[key]);
      if (!Number.isFinite(value) || value < 1 || value > 5) {
        return res
          .status(400)
          .json({ message: `Invalid rating for ${key}. Use 1-5.` });
      }
      normalizedRatings[key] = value;
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    await PropertyRating.findOneAndUpdate(
      { property: propertyId, user: req.user.id },
      {
        property: propertyId,
        user: req.user.id,
        ratings: normalizedRatings,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ message: "Rating submitted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.createProperty = async (req, res) => {
  try {
    const {
      title,
      location,
      price,
      acres,
      tag,
      image,
      features,
    } = req.body;

    if (!title || !location || !price || !acres || !tag || !image) {
      return res.status(400).json({
        message:
          "Missing required fields: title, location, price, acres, tag, image",
      });
    }

    let parsedFeatures = [];
    if (Array.isArray(features)) {
      parsedFeatures = features.map(String).map((s) => s.trim()).filter(Boolean);
    } else if (typeof features === "string") {
      parsedFeatures = features
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const property = await Property.create({
      title,
      location,
      price,
      acres,
      tag,
      image,
      features: parsedFeatures,
    });

    return res.status(201).json({ property });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
