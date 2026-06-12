/**
 * Chat API Routes
 */
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Send a message and get AI response
router.post('/', chatController.sendMessage);

// Get all chat sessions
router.get('/sessions', chatController.getSessions);

// Create a new chat session
router.post('/sessions', chatController.createSession);

// Get a specific session with messages
router.get('/sessions/:id', chatController.getSession);

// Delete a session
router.delete('/sessions/:id', chatController.deleteSession);

module.exports = router;
