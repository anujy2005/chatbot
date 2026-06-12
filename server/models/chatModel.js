/**
 * In-memory Chat Data Store
 * Manages chat sessions and messages
 */
const { v4: uuidv4 } = require('uuid');

// In-memory storage
const sessions = new Map();

/**
 * Create a new chat session
 */
function createSession(title = 'New Chat') {
  const session = {
    id: uuidv4(),
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: []
  };
  sessions.set(session.id, session);
  return session;
}

/**
 * Get all sessions (without full message history for listing)
 */
function getAllSessions() {
  const list = [];
  for (const session of sessions.values()) {
    list.push({
      id: session.id,
      title: session.title,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      messageCount: session.messages.length
    });
  }
  // Sort by most recently updated
  list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  return list;
}

/**
 * Get a single session by ID (with full messages)
 */
function getSession(id) {
  return sessions.get(id) || null;
}

/**
 * Add a message to a session
 */
function addMessage(sessionId, role, content) {
  const session = sessions.get(sessionId);
  if (!session) return null;

  const message = {
    id: uuidv4(),
    role, // 'user' | 'assistant' | 'system'
    content,
    timestamp: new Date().toISOString()
  };

  session.messages.push(message);
  session.updatedAt = new Date().toISOString();

  // Auto-title: use first user message as title
  if (role === 'user' && session.messages.filter(m => m.role === 'user').length === 1) {
    session.title = content.length > 50 ? content.substring(0, 50) + '...' : content;
  }

  return message;
}

/**
 * Delete a session
 */
function deleteSession(id) {
  return sessions.delete(id);
}

/**
 * Clear all sessions
 */
function clearAll() {
  sessions.clear();
}

module.exports = {
  createSession,
  getAllSessions,
  getSession,
  addMessage,
  deleteSession,
  clearAll
};
