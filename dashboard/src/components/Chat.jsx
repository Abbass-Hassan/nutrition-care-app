import React, { useEffect, useMemo, useRef, useState } from 'react';
import ErrorMessage from './ErrorMessage';
import { API_BASE, SOCKET_URL } from '../config';
import { io } from 'socket.io-client';

const Chat = ({ onBack }) => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const socketRef = useRef(null);
  const messagesRef = useRef(null);
  const currentChatIdRef = useRef(null);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const scrollToBottom = () => {
    const el = messagesRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  };

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/clients`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        if (res.ok) {
          setClients(data.clients || []);
        } else {
          setErrorMessage({
            message: data.message || 'Failed to load clients. Please try again.',
            type: 'error'
          });
        }
      } catch (e) {
        setErrorMessage({
          message: 'Unable to connect to the server. Please check your internet connection and try again.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedClient]);

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(c => (c.username || '').toLowerCase().includes(q) || (c.name || '').toLowerCase().includes(q));
  }, [clients, search]);

  const bindSocket = (activeChatId) => {
    if (!socketRef.current) return;
    // Remove previous handler to avoid stale closures
    socketRef.current.off('new-message');
    socketRef.current.on('new-message', (message) => {
      if (message.chat_id === currentChatIdRef.current) {
        setMessages(prev => [...prev, message]);
      }
    });
    // Ensure joined
    socketRef.current.emit('join-chat', activeChatId);
  };

  const openConversation = async (client) => {
    try {
      setSelectedClient(client);
      setMessages([]);
      setChat(null);

      // Ensure chat exists and fetch it
      const initRes = await fetch(`${API_BASE}/chats/init/${client.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const initData = await initRes.json();
      if (!initRes.ok || !initData.success) {
        setErrorMessage({
          message: initData.message || 'Failed to open chat. Please try again.',
          type: 'error'
        });
        return;
      }
      setChat(initData.chat);
      currentChatIdRef.current = initData.chat.id;

      // Fetch message history
      const msgRes = await fetch(`${API_BASE}/chats/${initData.chat.id}/messages`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const msgData = await msgRes.json();
      if (msgRes.ok && msgData.success) {
        setMessages(msgData.messages || []);
      }

      // Connect socket and join room
      if (!socketRef.current) {
        socketRef.current = io(SOCKET_URL, { auth: { token }, transports: ['websocket'] });
        socketRef.current.on('connect_error', (err) => {
          setNotification({ message: err?.message || 'Socket connection failed', type: 'error' });
        });
      }
      bindSocket(initData.chat.id);
    } catch (e) {
      setNotification({ message: 'Failed to open chat. Please try again.', type: 'error' });
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !chat) return;
    try {
      const text = draft.trim();
      socketRef.current?.emit('send-message', { chatId: chat.id, text });
      setDraft('');
      scrollToBottom();
      // Optional: optimistic append (will be duplicated briefly if server echoes fast)
      // setMessages(prev => [...prev, { id: `tmp-${Date.now()}`, sender_id: -1, text }]);
    } catch (err) {
      setErrorMessage({
        message: 'Failed to send message. Please try again.',
        type: 'error'
      });
    }
  };

  return (
    <>
      <ErrorMessage 
        message={errorMessage?.message} 
        type={errorMessage?.type} 
        show={!!errorMessage}
        onClose={() => setErrorMessage(null)}
        autoClose={true}
        duration={6000}
      />

      <div className="client-management">
        <div className="chat-layout">
          <div className="chat-sidebar">
            <div className="chat-search">
              <input
                type="text"
                placeholder="Search by username or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="chat-client-list">
              {loading ? (
                <div className="loading">Loading clients...</div>
              ) : filteredClients.length === 0 ? (
                <div className="empty-state">No clients found</div>
              ) : (
                filteredClients.map(client => (
                  <div
                    key={client.id}
                    className={`chat-client-item ${selectedClient?.id === client.id ? 'active' : ''}`}
                    onClick={() => openConversation(client)}
                  >
                    <div className="client-avatar small">{(client.name || client.username || 'C').slice(0,2).toUpperCase()}</div>
                    <div className="chat-client-info">
                      <div className="name">{client.name}</div>
                      <div className="username">@{client.username}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="chat-main">
            {!selectedClient ? (
              <div className="chat-empty">Select a client to start chatting</div>
            ) : (
              <div className="chat-conversation">
                <div className="chat-header">
                  <div className="client-avatar small">{(selectedClient.name || selectedClient.username || 'C').slice(0,2).toUpperCase()}</div>
                  <div className="chat-header-info">
                    <div className="name">{selectedClient.name}</div>
                    <div className="username">@{selectedClient.username}</div>
                  </div>
                </div>

                <div className="chat-messages" ref={messagesRef} style={{ height: 'calc(85vh - 140px)', overflowY: 'auto' }}>
                  {messages.map(m => (
                    <div key={m.id} className={`chat-message ${m.sender_id !== selectedClient.id ? 'outgoing' : 'incoming'}`}>
                      <div className="bubble">{m.text}</div>
                    </div>
                  ))}
                </div>

                <form className="chat-composer" onSubmit={handleSend}>
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <button className="btn-primary" type="submit" disabled={!draft.trim()}>
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Chat; 