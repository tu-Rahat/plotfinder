const mongoose = require("mongoose");

const shortlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    landId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Land",
      required: true,
    },
  },
  { timestamps: true }
);

shortlistSchema.index({ userId: 1, landId: 1 }, { unique: true });

module.exports = mongoose.model("Shortlist", shortlistSchema);