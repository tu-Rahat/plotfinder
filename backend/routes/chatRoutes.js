const express = require("express");
const {
  createOrGetConversation,
  getMyConversations,
  getConversationMessages,
  sendMessage,
} = require("../controllers/chatController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/conversations", protect, createOrGetConversation);
router.get("/conversations/my", protect, getMyConversations);
router.get("/messages/:conversationId", protect, getConversationMessages);
router.post("/messages/:conversationId", protect, sendMessage);

module.exports = router;