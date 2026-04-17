const LocationPreference = require("../models/LocationPreference");
const Notification = require("../models/Notification");

const createLocationPreference = async (req, res) => {
  try {
    const userId = req.user.id;
    const { division, district, upazila, landType, maxPrice } = req.body;

    if (!division || !district) {
      return res.status(400).json({
        message: "Division and district are required",
      });
    }

    const preference = await LocationPreference.create({
      userId,
      division: division.trim(),
      district: district.trim(),
      upazila: upazila ? upazila.trim() : "",
      landType: landType ? landType.trim() : "",
      maxPrice: maxPrice || null,
    });

    return res.status(201).json(preference);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "This location preference already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to create location preference",
      error: error.message,
    });
  }
};

const getMyLocationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const preferences = await LocationPreference.find({ userId }).sort({
      createdAt: -1,
    });

    return res.status(200).json(preferences);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch location preferences",
      error: error.message,
    });
  }
};

const deleteLocationPreference = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferenceId } = req.params;

    const preference = await LocationPreference.findById(preferenceId);

    if (!preference) {
      return res.status(404).json({
        message: "Location preference not found",
      });
    }

    if (preference.userId.toString() !== userId) {
      return res.status(403).json({
        message: "Not authorized to delete this preference",
      });
    }

    await preference.deleteOne();

    return res.status(200).json({
      message: "Location preference deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete location preference",
      error: error.message,
    });
  }
};

const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await Notification.find({ userId })
      .populate("landId", "title price landType location")
      .sort({ createdAt: -1 });

    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({
        message: "Notification not found",
      });
    }

    if (notification.userId.toString() !== userId) {
      return res.status(403).json({
        message: "Not authorized to update this notification",
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return res.status(200).json({
      message: "Notification marked as read",
      notification,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update notification",
      error: error.message,
    });
  }
};

module.exports = {
  createLocationPreference,
  getMyLocationPreferences,
  deleteLocationPreference,
  getMyNotifications,
  markNotificationAsRead,
};