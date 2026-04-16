const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const Land = require("../models/Land");

const createOrGetConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { landId } = req.body;

    if (!landId) {
      return res.status(400).json({ message: "landId is required" });
    }

    const land = await Land.findById(landId);

    if (!land) {
      return res.status(404).json({ message: "Land not found" });
    }

    const sellerId = land.sellerId?.toString();

    if (!sellerId) {
      return res.status(400).json({ message: "Land seller not found" });
    }

    if (sellerId === userId) {
      return res.status(400).json({ message: "You cannot chat on your own land post" });
    }

    let conversation = await Conversation.findOne({
      landId,
      buyerId: userId,
      sellerId,
    })
      .populate("landId", "title price landType")
      .populate("buyerId", "firstName lastName email")
      .populate("sellerId", "firstName lastName email");

    if (!conversation) {
      conversation = await Conversation.create({
        landId,
        buyerId: userId,
        sellerId,
        participants: [userId, sellerId],
      });

      conversation = await Conversation.findById(conversation._id)
        .populate("landId", "title price landType")
        .populate("buyerId", "firstName lastName email")
        .populate("sellerId", "firstName lastName email");
    }

    res.status(200).json(conversation);
  } catch (error) {
    res.status(500).json({ message: "Failed to create or get conversation", error: error.message });
  }
};

const getMyConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("landId", "title price landType location")
      .populate("buyerId", "firstName lastName email")
      .populate("sellerId", "firstName lastName email")
      .sort({ lastMessageAt: -1, updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch conversations", error: error.message });
  }
};

const getConversationMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (participantId) => participantId.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({ message: "Not authorized to view these messages" });
    }

    const messages = await Message.find({ conversationId })
      .populate("senderId", "firstName lastName email")
      .populate("receiverId", "firstName lastName email")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages", error: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Message text is required" });
    }

    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (participantId) => participantId.toString() === userId
    );

    if (!isParticipant) {
      return res.status(403).json({ message: "Not authorized to send message in this conversation" });
    }

    const receiverId =
      conversation.buyerId.toString() === userId
        ? conversation.sellerId
        : conversation.buyerId;

    const message = await Message.create({
      conversationId,
      senderId: userId,
      receiverId,
      text: text.trim(),
    });

    conversation.lastMessage = text.trim();
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "firstName lastName email")
      .populate("receiverId", "firstName lastName email");

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: "Failed to send message", error: error.message });
  }
};

module.exports = {
  createOrGetConversation,
  getMyConversations,
  getConversationMessages,
  sendMessage,
};