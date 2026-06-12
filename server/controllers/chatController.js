/**
 * Chat Controller
 * Handles chat logic and OpenAI integration
 */
const OpenAI = require('openai');
const chatModel = require('../models/chatModel');

// Initialize OpenAI client
// Supports both direct OpenAI keys (sk-...) and OpenRouter keys (sk-or-...)
let openai = null;
try {
  if (process.env.OPENAI_API_KEY) {
    const isOpenRouter = process.env.OPENAI_API_KEY.startsWith('sk-or-');
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: isOpenRouter ? 'https://openrouter.ai/api/v1' : undefined,
      defaultHeaders: isOpenRouter ? { 'HTTP-Referer': 'http://localhost:5173', 'X-Title': 'AI Chatbot' } : undefined,
    });
    console.log(`🔑 Using ${isOpenRouter ? 'OpenRouter' : 'OpenAI'} API`);
  }
} catch (err) {
  console.warn('OpenAI client initialization failed:', err.message);
}

// System prompt for the chatbot
const SYSTEM_PROMPT = `You are a helpful, friendly, and knowledgeable AI assistant. You provide clear, accurate, and well-structured responses. When providing code examples, use proper formatting with language-specific code blocks. Be concise but thorough.`;

/**
 * Generate a fallback response when OpenAI is not configured
 */
function generateFallbackResponse(userMessage) {
  const responses = [
    `That's an interesting question about "${userMessage.substring(0, 30)}..." — I'd love to help! To get real AI responses, please configure your OpenAI API key in the .env file.`,
    `Great question! I'm currently running in demo mode. Add your OpenAI API key to the .env file to unlock full AI capabilities.`,
    `I appreciate your curiosity! This is a demo response. For intelligent AI answers, set up your OPENAI_API_KEY in the .env file and restart the server.`,
    `Hello! I'm your AI assistant running in demo mode. Here's what I can tell you:\n\n- **To enable real AI**: Add your OpenAI API key to \`.env\`\n- **Restart the server** after adding the key\n- Then ask me anything!\n\nYour message was: "${userMessage.substring(0, 50)}"`,
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Send a message and get AI response
 */
async function sendMessage(req, res, next) {
  try {
    const { message, sessionId } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create session
    let session;
    if (sessionId) {
      session = chatModel.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: 'Session not found' });
      }
    } else {
      session = chatModel.createSession();
    }

    // Add user message
    const userMsg = chatModel.addMessage(session.id, 'user', message.trim());

    let assistantContent;

    if (openai) {
      // Build message history for OpenAI
      const messages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...session.messages.map(m => ({
          role: m.role,
          content: m.content
        }))
      ];

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 2048,
        temperature: 0.7,
      });

      assistantContent = completion.choices[0]?.message?.content || 'I apologize, but I was unable to generate a response.';
    } else {
      // Demo mode fallback
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
      assistantContent = generateFallbackResponse(message);
    }

    // Add assistant message to session
    const assistantMsg = chatModel.addMessage(session.id, 'assistant', assistantContent);

    // Return response
    res.json({
      sessionId: session.id,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      sessionTitle: session.title
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Get all chat sessions
 */
function getSessions(req, res) {
  const sessions = chatModel.getAllSessions();
  res.json({ sessions });
}

/**
 * Get a single session with messages
 */
function getSession(req, res) {
  const session = chatModel.getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json({ session });
}

/**
 * Create a new session
 */
function createSession(req, res) {
  const { title } = req.body || {};
  const session = chatModel.createSession(title);
  res.status(201).json({ session });
}

/**
 * Delete a session
 */
function deleteSessionHandler(req, res) {
  const deleted = chatModel.deleteSession(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Session not found' });
  }
  res.json({ success: true });
}

module.exports = {
  sendMessage,
  getSessions,
  getSession,
  createSession,
  deleteSession: deleteSessionHandler
};
