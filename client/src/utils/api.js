/**
 * API utility for communicating with the chatbot backend
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

/**
 * Send a chat message and get AI response
 */
export async function sendMessage(message, sessionId = null) {
  return request('/chat', {
    method: 'POST',
    body: JSON.stringify({ message, sessionId }),
  });
}

/**
 * Get all chat sessions
 */
export async function getSessions() {
  return request('/chat/sessions');
}

/**
 * Get a specific session with messages
 */
export async function getSession(id) {
  return request(`/chat/sessions/${id}`);
}

/**
 * Create a new chat session
 */
export async function createSession(title) {
  return request('/chat/sessions', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
}

/**
 * Delete a chat session
 */
export async function deleteSession(id) {
  return request(`/chat/sessions/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Health check
 */
export async function healthCheck() {
  return request('/health');
}
