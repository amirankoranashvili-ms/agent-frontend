import { useState } from 'react'
import './ChatSidebar.css'

export default function ChatSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen(!open)} aria-label="Open chat">
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      <div className={`chat-sidebar ${open ? 'open' : ''}`}>
        <div className="chat-sidebar-header">
          <div className="chat-sidebar-logo">X</div>
          <div>
            <div className="chat-sidebar-title">Fast X Food Chat</div>
            <div className="chat-sidebar-status">AI Assistant</div>
          </div>
        </div>

        <div className="chat-sidebar-body">
          <div className="chat-placeholder-icon">
            <svg viewBox="0 0 48 48" fill="none" stroke="var(--color-bg-warm)" strokeWidth="1.5">
              <path d="M42 23a2 2 0 0 1-2 2H12l-6 6V7a2 2 0 0 1 2-2h32a2 2 0 0 1 2 2z" />
              <line x1="14" y1="14" x2="34" y2="14" />
              <line x1="14" y1="19" x2="28" y2="19" />
            </svg>
          </div>
          <h3>Chat with us</h3>
          <p>
            Our AI text assistant will be available here soon. Ask about the menu,
            place an order, check your loyalty points — all through chat.
          </p>
          <p className="chat-placeholder-note">
            Powered by Google CX Agent Studio
          </p>
        </div>
      </div>

      {open && <div className="chat-overlay" onClick={() => setOpen(false)} />}
    </>
  )
}
