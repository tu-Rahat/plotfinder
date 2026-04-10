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
      latitude,
      longitude,
      formattedAddress,
    } = req.body;

    const sellerId = req.user?.id || req.user?.userId || req.user?._id;

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
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        formattedAddress: formattedAddress || "",
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

const getSingleLand = async (req, res) => {
  try {
    const land = await Land.findById(req.params.id);

    if (!land) {
      return res.status(404).json({ message: "Land not found" });
    }

    return res.status(200).json(land);
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching land",
      error: error.message,
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

const getAllLandsForAdmin = async (req, res) => {
  try {
    const lands = await Land.find().sort({ createdAt: -1 });

    return res.status(200).json(lands);
  } catch (error) {
    return res.status(500).json({
      message: "Server error while fetching all land posts",
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
    land.rejectedAt = null;
    land.rejectedBy = "";
    land.rejectionReason = "";

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

const rejectLandPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const land = await Land.findById(id);

    if (!land) {
      return res.status(404).json({
        message: "Land post not found",
      });
    }

    land.status = "rejected";
    land.rejectedAt = new Date();
    land.rejectedBy = req.user.email || "admin";
    land.rejectionReason = rejectionReason || "";
    land.approvedAt = null;
    land.approvedBy = "";

    await land.save();

    return res.status(200).json({
      message: "Land post rejected successfully",
      land,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while rejecting land post",
      error: error.message,
    });
  }
};

const updateLandPostByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const {
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
      latitude,
      longitude,
      formattedAddress,
    } = req.body;

    const land = await Land.findById(id);

    if (!land) {
      return res.status(404).json({
        message: "Land post not found",
      });
    }

    if (
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

    land.title = title;
    land.description = description;
    land.landType = landType;
    land.price = price;
    land.landSizeSqft = landSizeSqft;
    land.location = {
      division,
      district,
      upazila,
      address,
      latitude: latitude ?? land.location?.latitude ?? null,
      longitude: longitude ?? land.location?.longitude ?? null,
      formattedAddress: formattedAddress ?? land.location?.formattedAddress ?? "",
    };
    land.ownershipType = ownershipType || "";
    land.roadAccess = roadAccess || "";
    land.nearbyLandmark = nearbyLandmark || "";
    land.priceNegotiable = priceNegotiable || false;

    await land.save();

    return res.status(200).json({
      message: "Land post updated successfully",
      land,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while updating land post",
      error: error.message,
    });
  }
};

const deleteLandPostByAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const land = await Land.findById(id);

    if (!land) {
      return res.status(404).json({
        message: "Land post not found",
      });
    }

    await Land.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Land post deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while deleting land post",
      error: error.message,
    });
  }
};

const updateMyLandPost = async (req, res) => {
  try {
    const sellerId = req.user.id || req.user.userId || req.user._id;
    const { id } = req.params;

    const {
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
      sellerPhone,
      priceNegotiable,
      latitude,
      longitude,
      formattedAddress,
    } = req.body;

    const land = await Land.findOne({ _id: id, sellerId });

    if (!land) {
      return res.status(404).json({
        message: "Land post not found or you are not allowed to edit it",
      });
    }

    if (
      !title ||
      !description ||
      !landType ||
      !price ||
      !landSizeSqft ||
      !division ||
      !district ||
      !upazila ||
      !address ||
      !sellerPhone
    ) {
      return res.status(400).json({
        message: "Please fill all required fields",
      });
    }

    land.title = title;
    land.description = description;
    land.landType = landType;
    land.price = price;
    land.landSizeSqft = landSizeSqft;
    land.location = {
      division,
      district,
      upazila,
      address,
      latitude: latitude ?? land.location?.latitude ?? null,
      longitude: longitude ?? land.location?.longitude ?? null,
      formattedAddress: formattedAddress ?? land.location?.formattedAddress ?? "",
    };
    land.ownershipType = ownershipType || "";
    land.roadAccess = roadAccess || "";
    land.nearbyLandmark = nearbyLandmark || "";
    land.sellerPhone = sellerPhone;
    land.priceNegotiable = priceNegotiable || false;

    await land.save();

    return res.status(200).json({
      message: "Your land post updated successfully",
      land,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while updating your land post",
      error: error.message,
    });
  }
};

const deleteMyLandPost = async (req, res) => {
  try {
    const sellerId = req.user.id || req.user.userId || req.user._id;
    const { id } = req.params;

    const land = await Land.findOne({ _id: id, sellerId });

    if (!land) {
      return res.status(404).json({
        message: "Land post not found or you are not allowed to delete it",
      });
    }

    await Land.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Your land post deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error while deleting your land post",
      error: error.message,
    });
  }
};

module.exports = {
  createLandPost,
  getApprovedLands,
  getMyLandPosts,
  getPendingLands,
  getAllLandsForAdmin,
  approveLandPost,
  rejectLandPost,
  updateLandPostByAdmin,
  deleteLandPostByAdmin,
  updateMyLandPost,
  deleteMyLandPost,
  getSingleLand,
};