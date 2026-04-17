const mongoose = require("mongoose");

const landSchema = new mongoose.Schema(
  {
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerFirstName: {
      type: String,
      required: true,
      trim: true,
    },
    sellerLastName: {
      type: String,
      default: "",
      trim: true,
    },
    sellerEmail: {
      type: String,
      required: true,
      trim: true,
    },
    sellerPhone: {
      type: String,
      required: true,
      trim: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    landType: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    landSizeSqft: {
      type: Number,
      required: true,
      min: 1,
    },

    location: {
      division: { type: String, required: true, trim: true },
      district: { type: String, required: true, trim: true },
      upazila: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      formattedAddress: { type: String, default: "", trim: true },
    },

    ownershipType: {
      type: String,
      default: "",
      trim: true,
    },
    roadAccess: {
      type: String,
      default: "",
      trim: true,
    },
    nearbyLandmark: {
      type: String,
      default: "",
      trim: true,
    },
    locationRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    nearbyConstructionRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    accessibilityRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    roadHealthRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    crimeRateRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    overallRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    priceNegotiable: {
      type: Boolean,
      default: false,
    },
    listingFee: {
      type: Number,
      default: 500,
    },
    paymentMethod: {
      type: String,
      enum: ["bKash", "Nagad", "Rocket", "Bank Transfer"],
      default: "",
      trim: true,
    },
    paymentSender: {
      type: String,
      default: "",
      trim: true,
    },
    paymentTransactionId: {
      type: String,
      default: "",
      trim: true,
    },
    paymentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    paymentVerifiedAt: {
      type: Date,
      default: null,
    },
    paymentVerifiedBy: {
      type: String,
      default: "",
      trim: true,
    },
    paymentNotes: {
      type: String,
      default: "",
      trim: true,
    },
    listingFeePaid: {
      type: Boolean,
      default: false,
    },
    preview3D: {
      enabled: {
        type: Boolean,
        default: false,
      },
      shapeType: {
        type: String,
        enum: ["rectangle", "polygon"],
        default: "rectangle",
      },
      plotPolygon: {
        type: [
          {
            x: {
              type: Number,
              required: true,
            },
            y: {
              type: Number,
              required: true,
            },
          },
        ],
        default: [],
      },
      plotWidth: {
        type: Number,
        min: 10,
        default: 40,
      },
      plotDepth: {
        type: Number,
        min: 10,
        default: 60,
      },
      floors: {
        type: Number,
        min: 1,
        max: 20,
        default: 2,
      },
      floorHeight: {
        type: Number,
        min: 8,
        max: 20,
        default: 10,
      },
      buildingWidth: {
        type: Number,
        min: 5,
        default: 24,
      },
      buildingDepth: {
        type: Number,
        min: 5,
        default: 36,
      },
      minOpenSpacePercent: {
        type: Number,
        min: 10,
        max: 80,
        default: 30,
      },
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    approvedBy: {
      type: String,
      default: "",
    },

    rejectedAt: {
      type: Date,
      default: null,
    },
    rejectedBy: {
      type: String,
      default: "",
    },
    rejectionReason: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Land", landSchema);