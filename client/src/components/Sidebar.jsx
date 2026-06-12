import { MessageSquare, Plus, Trash2, Zap } from 'lucide-react';

function Sidebar({ sessions, activeSessionId, onNewChat, onSelectSession, onDeleteSession }) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar-header">
        <button className="new-chat-btn" onClick={onNewChat} id="new-chat-btn">
          <Plus size={18} /> New Chat
        </button>
      </div>
      <div className="sidebar-sessions" id="session-list">
        {sessions.length === 0 ? (
          <div className="sidebar-empty">
            <MessageSquare size={32} />
            <p>No conversations yet</p>
            <p>Start a new chat!</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`session-item ${session.id === activeSessionId ? 'active' : ''}`}
              onClick={() => onSelectSession(session.id)}
            >
              <MessageSquare size={16} className="session-item-icon" />
              <div className="session-item-text">
                <div className="session-item-title">{session.title}</div>
                <div className="session-item-date">
                  {formatDate(session.updatedAt)} · {session.messageCount} msgs
                </div>
              </div>
              <button
                className="session-delete-btn"
                onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                aria-label="Delete session"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
      <div className="sidebar-footer">
        <span className="sidebar-footer-text"><Zap size={12} /> Powered by OpenAI</span>
      </div>
    </aside>
  );
}

export default Sidebar;
