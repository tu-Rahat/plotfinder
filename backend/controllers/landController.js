const Land = require("../models/Land");

const createLandPost = async (req, res) => {
  try {
    const {
      sellerFirstName,
      sellerLastName,
      sellerEmail,
      sellerPhone,
      title,
      description,
      landType,
      price,
      landSizeSqft,
      division,
      district,
      upazila,
      address,
      ownershipType,
      roadAccess,
      nearbyLandmark,
      priceNegotiable,
    } = req.body;

    const sellerId = req.user?.id || req.user?.userId || req.user?._id;

    console.log("req.user:", req.user);
    console.log("sellerId:", sellerId);
    console.log("req.body:", req.body);

    if (!sellerId) {
      return res.status(401).json({
        message: "Invalid user token. Please log in again.",
      });
    }

    if (
      !sellerFirstName ||
      !sellerEmail ||
      !sellerPhone ||
      !title ||
      !description ||
      !landType ||
      !price ||
      !landSizeSqft ||
      !division ||
      !district ||
      !upazila ||
      !address
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    const newLand = await Land.create({
      sellerId,
      sellerFirstName,
      sellerLastName,
      sellerEmail,
      sellerPhone,
      title,
      description,
      landType,
      price,
      landSizeSqft,
      location: {
        division,
        district,
        upazila,
        address,
      },
      ownershipType,
      roadAccess,
      nearbyLandmark,
      priceNegotiable,
      status: "pending",
    });

    return res.status(201).json({
      message: "Land post submitted successfully and is waiting for admin approval",
      land: newLand,
    });
  } catch (error) {
    console.error("Create land post error:", error);

    return res.status(500).json({
      message: error.message || "Server error while creating land post",
      error: error.errors || null,
    });
  }
};

const getApprovedLands = async (req, res) => {
  try {
    const lands = await Land.find({ status: "approved" }).sort({ createdAt: -1 });

    return res.status(200).json(lands);
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching approved lands",
      error: error.message,
    });
  }
};

const getMyLandPosts = async (req, res) => {
  try {
    const sellerId = req.user.id || req.user.userId || req.user._id;
    const lands = await Land.find({ sellerId }).sort({ createdAt: -1 });

    return res.status(200).json(lands);
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching your land posts",
      error: error.message,
    });
  }
};

const getPendingLands = async (req, res) => {
  try {
    const lands = await Land.find({ status: "pending" }).sort({ createdAt: -1 });

    return res.status(200).json(lands);
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching pending land posts",
      error: error.message,
    });
  }
};

const approveLandPost = async (req, res) => {
  try {
    const { id } = req.params;

    const land = await Land.findById(id);

    if (!land) {
      return res.status(404).json({
        message: "Land post not found",
      });
    }

    land.status = "approved";
    land.approvedAt = new Date();
    land.approvedBy = req.user.email || "admin";

    await land.save();

    return res.status(200).json({
      message: "Land post approved successfully",
      land,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while approving land post",
      error: error.message,
    });
  }
};

module.exports = {
  createLandPost,
  getApprovedLands,
  getMyLandPosts,
  getPendingLands,
  approveLandPost,
};