import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User } from 'lucide-react';

function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`message-row ${message.role}`}>
      <div className={`message-avatar ${isUser ? 'user-avatar' : 'assistant-avatar'}`}>
        {isUser ? <User size={18} /> : <Bot size={18} />}
      </div>
      <div className={`message-bubble ${isUser ? 'user-bubble' : 'assistant-bubble'} ${message.isError ? 'error-bubble' : ''}`}>
        {isUser ? (
          <span>{message.content}</span>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        )}
        <div className="message-time">{time}</div>
      </div>
    </div>
  );
}

export default MessageBubble;
