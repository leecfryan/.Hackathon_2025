import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// Get user conversations
router.get("/conversations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `
      SELECT 
        c.id,
        c.name,
        c.type,
        c.created_at,
        c.updated_at
      FROM conversations c
      JOIN conversation_participants cp ON c.id = cp.conversation_id
      WHERE cp.user_id = $1
      ORDER BY c.updated_at DESC
    `,
      [userId]
    );

    res.json({
      success: true,
      conversations: result.rows,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
});

// Get conversation messages
router.get("/conversations/:conversationId/messages", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const limit = req.query.limit || 50;

    const result = await pool.query(
      `
      SELECT 
        m.id,
        m.content,
        m.created_at,
        m.user_id,
        u.email,
        u.display_name
      FROM messages m
      JOIN users u ON m.user_id = u.id
      WHERE m.conversation_id = $1
      ORDER BY m.created_at ASC
      LIMIT $2
    `,
      [conversationId, limit]
    );

    res.json({
      success: true,
      messages: result.rows,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
});

// Send a message
router.post("/conversations/:conversationId/messages", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId, content } = req.body;

    // Verify user is participant
    const participantCheck = await pool.query(
      "SELECT * FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2",
      [conversationId, userId]
    );

    if (participantCheck.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to send messages to this conversation",
      });
    }

    // Insert message
    const result = await pool.query(
      `
      INSERT INTO messages (conversation_id, user_id, content, created_at)
      VALUES ($1, $2, $3, NOW())
      RETURNING 
        id,
        content,
        created_at,
        user_id,
        (SELECT email FROM users WHERE id = $2) as email,
        (SELECT display_name FROM users WHERE id = $2) as display_name
    `,
      [conversationId, userId, content]
    );

    // Update conversation timestamp
    await pool.query(
      "UPDATE conversations SET updated_at = NOW() WHERE id = $1",
      [conversationId]
    );

    res.json({
      success: true,
      message: result.rows[0],
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
});

// Create a new conversation
router.post("/conversations", async (req, res) => {
  try {
    const { name, type = "group", creatorId } = req.body;

    // Create conversation
    const conversationResult = await pool.query(
      `
      INSERT INTO conversations (name, type, created_at, updated_at)
      VALUES ($1, $2, NOW(), NOW())
      RETURNING *
    `,
      [name, type]
    );

    const conversation = conversationResult.rows[0];

    // Add creator as participant
    await pool.query(
      `
      INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
      VALUES ($1, $2, NOW())
    `,
      [conversation.id, creatorId]
    );

    res.json({
      success: true,
      conversation: conversation,
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create conversation",
    });
  }
});

// Join a conversation
router.post("/conversations/:conversationId/join", async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.body;

    // Check if already a participant
    const existingParticipant = await pool.query(
      "SELECT * FROM conversation_participants WHERE conversation_id = $1 AND user_id = $2",
      [conversationId, userId]
    );

    if (existingParticipant.rows.length > 0) {
      return res.json({
        success: true,
        message: "Already a participant",
      });
    }

    // Add as participant
    await pool.query(
      `
      INSERT INTO conversation_participants (conversation_id, user_id, joined_at)
      VALUES ($1, $2, NOW())
    `,
      [conversationId, userId]
    );

    res.json({
      success: true,
      message: "Successfully joined conversation",
    });
  } catch (error) {
    console.error("Error joining conversation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to join conversation",
    });
  }
});

export default router;
