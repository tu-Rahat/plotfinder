const mongoose = require("mongoose");

const locationPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    division: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    upazila: {
      type: String,
      trim: true,
      default: "",
    },
    landType: {
      type: String,
      trim: true,
      default: "",
    },
    maxPrice: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

locationPreferenceSchema.index(
  { userId: 1, division: 1, district: 1, upazila: 1, landType: 1, maxPrice: 1 },
  { unique: true }
);

module.exports = mongoose.model("LocationPreference", locationPreferenceSchema);