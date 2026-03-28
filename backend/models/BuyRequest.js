const mongoose = require("mongoose");

const buyRequestSchema = new mongoose.Schema(
  {
    landId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Land",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    buyerFirstName: {
      type: String,
      required: true,
      trim: true,
    },
    buyerLastName: {
      type: String,
      default: "",
      trim: true,
    },
    buyerEmail: {
      type: String,
      required: true,
      trim: true,
    },
    buyerPhone: {
      type: String,
      required: true,
      trim: true,
    },

    offeredPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    purpose: {
      type: String,
      default: "",
      trim: true,
    },
    preferredContactMethod: {
      type: String,
      default: "phone",
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "under_review", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BuyRequest", buyRequestSchema);