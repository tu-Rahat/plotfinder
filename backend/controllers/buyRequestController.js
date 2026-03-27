const BuyRequest = require("../models/BuyRequest");
const Land = require("../models/Land");

const createBuyRequest = async (req, res) => {
  try {
    const {
      landId,
      buyerFirstName,
      buyerLastName,
      buyerEmail,
      buyerPhone,
      offeredPrice,
      purpose,
      preferredContactMethod,
      message,
    } = req.body;

    const buyerId = req.user?.id || req.user?._id || req.user?.userId;

    if (!buyerId) {
      return res.status(401).json({
        message: "Invalid user. Please login again.",
      });
    }

    if (
      !landId ||
      !buyerFirstName ||
      !buyerEmail ||
      !buyerPhone ||
      !offeredPrice ||
      !message
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const land = await Land.findById(landId);

    if (!land) {
      return res.status(404).json({
        message: "Land not found",
      });
    }

    if (land.status !== "approved") {
      return res.status(400).json({
        message: "This land is not available for buy requests",
      });
    }

    if (String(land.sellerId) === String(buyerId)) {
      return res.status(400).json({
        message: "You cannot send a buy request for your own land",
      });
    }

    const existingRequest = await BuyRequest.findOne({
      landId,
      buyerId,
      status: { $in: ["pending", "under_review"] },
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You already have an active request for this land",
      });
    }

    const newRequest = await BuyRequest.create({
      landId,
      sellerId: land.sellerId,
      buyerId,
      buyerFirstName,
      buyerLastName,
      buyerEmail,
      buyerPhone,
      offeredPrice,
      purpose,
      preferredContactMethod,
      message,
      status: "pending",
    });

    return res.status(201).json({
      message: "Buy request submitted successfully",
      request: newRequest,
    });
  } catch (error) {
    console.error("Create buy request error:", error);

    return res.status(500).json({
      message: error.message || "Server error while creating buy request",
    });
  }
};

const getMyBuyRequests = async (req, res) => {
  try {
    const buyerId = req.user?.id || req.user?._id || req.user?.userId;

    if (!buyerId) {
      return res.status(401).json({
        message: "Invalid user. Please login again.",
      });
    }

    const requests = await BuyRequest.find({ buyerId })
      .populate("landId", "title price landSizeSqft location status")
      .sort({ createdAt: -1 });

    return res.status(200).json(requests);
  } catch (error) {
    console.error("Get my buy requests error:", error);

    return res.status(500).json({
      message: error.message || "Server error while fetching buy requests",
    });
  }
};

const getRequestsForMyLands = async (req, res) => {
  try {
    const sellerId = req.user?.id || req.user?._id || req.user?.userId;

    if (!sellerId) {
      return res.status(401).json({
        message: "Invalid user. Please login again.",
      });
    }

    const requests = await BuyRequest.find({ sellerId })
      .populate("landId", "title price landSizeSqft location status")
      .sort({ createdAt: -1 });

    return res.status(200).json(requests);
  } catch (error) {
    console.error("Get requests for my lands error:", error);

    return res.status(500).json({
      message: error.message || "Server error while fetching incoming requests",
    });
  }
};



module.exports = {
  createBuyRequest,
  getMyBuyRequests,
  getRequestsForMyLands,
};