import { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import ThemeToggle from './components/ThemeToggle';
import * as api from './utils/api';
import { Menu, X, Sparkles } from 'lucide-react';
import './App.css';

function App() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('chatbot-theme') || 'dark';
  });

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('chatbot-theme', theme);
  }, [theme]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await api.getSessions();
      setSessions(data.sessions || []);
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  const loadSession = useCallback(async (sessionId) => {
    try {
      const data = await api.getSession(sessionId);
      if (data.session) {
        setMessages(data.session.messages || []);
        setActiveSessionId(sessionId);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    }
  }, []);

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
  };

  const handleSelectSession = (sessionId) => {
    if (sessionId === activeSessionId) return;
    loadSession(sessionId);
    // Close sidebar on mobile
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await api.deleteSession(sessionId);
      if (sessionId === activeSessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
      await loadSessions();
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const handleSendMessage = async (message) => {
    if (isLoading) return;

    // Optimistically add user message
    const tempUserMsg = {
      id: 'temp-' + Date.now(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      const data = await api.sendMessage(message, activeSessionId);

      // Replace temp message with real ones
      setMessages(prev => {
        const withoutTemp = prev.filter(m => m.id !== tempUserMsg.id);
        return [...withoutTemp, data.userMessage, data.assistantMessage];
      });

      // Update session
      if (!activeSessionId) {
        setActiveSessionId(data.sessionId);
      }
      await loadSessions();

    } catch (err) {
      console.error('Failed to send message:', err);
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          role: 'assistant',
          content: `⚠️ **Error**: ${err.message || 'Failed to get response. Please try again.'}`,
          timestamp: new Date().toISOString(),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="app" id="app-root">
      {/* Sidebar */}
      <div className={`sidebar-container ${sidebarOpen ? 'open' : 'closed'}`}>
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <main className="main-area">
        {/* Header */}
        <header className="chat-header" id="chat-header">
          <div className="header-left">
            <button
              className="menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
              id="sidebar-toggle"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="header-title">
              <Sparkles size={20} className="header-icon" />
              <h1>AI Chatbot</h1>
            </div>
          </div>
          <div className="header-right">
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>

        {/* Chat Window */}
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSuggestionClick={handleSendMessage}
        />

        {/* Chat Input */}
        <ChatInput
          onSend={handleSendMessage}
          isLoading={isLoading}
        />
      </main>
    </div>
  );
}

export default App;
