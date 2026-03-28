const Shortlist = require("../models/Shortlist");
const Land = require("../models/Land");

const addToShortlist = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    const { landId } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid user. Please login again.",
      });
    }

    if (!landId) {
      return res.status(400).json({
        message: "Land ID is required",
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
        message: "Only approved lands can be shortlisted",
      });
    }

    const existing = await Shortlist.findOne({ userId, landId });

    if (existing) {
      return res.status(400).json({
        message: "This land is already in your shortlist",
      });
    }

    const newShortlistItem = await Shortlist.create({
      userId,
      landId,
    });

    return res.status(201).json({
      message: "Land added to shortlist",
      shortlistItem: newShortlistItem,
    });
  } catch (error) {
    console.error("Add to shortlist error:", error);

    return res.status(500).json({
      message: error.message || "Server error while adding to shortlist",
    });
  }
};

const getMyShortlist = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid user. Please login again.",
      });
    }

    const shortlist = await Shortlist.find({ userId })
      .populate("landId")
      .sort({ createdAt: -1 });

    return res.status(200).json(shortlist);
  } catch (error) {
    console.error("Get shortlist error:", error);

    return res.status(500).json({
      message: error.message || "Server error while fetching shortlist",
    });
  }
};

const removeFromShortlist = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;
    const { landId } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "Invalid user. Please login again.",
      });
    }

    const shortlistItem = await Shortlist.findOne({ userId, landId });

    if (!shortlistItem) {
      return res.status(404).json({
        message: "Shortlist item not found",
      });
    }

    await shortlistItem.deleteOne();

    return res.status(200).json({
      message: "Land removed from shortlist",
    });
  } catch (error) {
    console.error("Remove from shortlist error:", error);

    return res.status(500).json({
      message: error.message || "Server error while removing from shortlist",
    });
  }
};

module.exports = {
  addToShortlist,
  getMyShortlist,
  removeFromShortlist,
};