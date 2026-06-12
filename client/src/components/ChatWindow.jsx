import { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';
import { Bot, Code, Lightbulb, BookOpen, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  { icon: <Code size={18} />, text: "Explain how async/await works in JavaScript" },
  { icon: <Lightbulb size={18} />, text: "Give me 5 creative project ideas for beginners" },
  { icon: <BookOpen size={18} />, text: "Summarize the key concepts of machine learning" },
  { icon: <Sparkles size={18} />, text: "Write a Python function to sort a list" },
];

function ChatWindow({ messages, isLoading, onSuggestionClick }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="chat-window" id="chat-window">
        <div className="chat-empty">
          <div className="chat-empty-icon">
            <Bot size={36} color="white" />
          </div>
          <h2>How can I help you today?</h2>
          <p>I'm your AI assistant. Ask me anything — coding, writing, math, ideas, and more.</p>
          {onSuggestionClick && (
            <div className="chat-suggestions">
              {SUGGESTIONS.map((s, i) => (
                <button key={i} className="suggestion-card" onClick={() => onSuggestionClick(s.text)}>
                  <div className="suggestion-card-icon">{s.icon}</div>
                  {s.text}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window" id="chat-window">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isLoading && (
        <div className="typing-indicator">
          <div className="message-avatar assistant-avatar">
            <Bot size={18} />
          </div>
          <div className="typing-bubble">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

export default ChatWindow;
