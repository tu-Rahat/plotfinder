const mongoose = require("mongoose");

const ratingFields = {
  type: Number,
  required: true,
  min: 1,
  max: 5,
};

const propertyRatingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ratings: {
      location: ratingFields,
      nearbyConstructions: ratingFields,
      dailyAccessibilities: ratingFields,
      roadHealth: ratingFields,
      crimeRate: ratingFields,
    },
  },
  { timestamps: true }
);

propertyRatingSchema.index({ property: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("PropertyRating", propertyRatingSchema);
