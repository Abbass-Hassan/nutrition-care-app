import React, { useEffect, useMemo, useState } from 'react';
import Notification from './Notification';

const Chat = ({ onBack }) => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8000/api/clients', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();
        if (res.ok) {
          setClients(data.clients || []);
        } else {
          setNotification({ message: data.message || 'Failed to load clients', type: 'error' });
        }
      } catch (e) {
        setNotification({ message: 'Failed to load clients. Please try again.', type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(c => (c.username || '').toLowerCase().includes(q) || (c.name || '').toLowerCase().includes(q));
  }, [clients, search]);

  const openConversation = (client) => {
    setSelectedClient(client);
    // Placeholder conversation until backend endpoints exist
    setMessages([
      { id: 'm1', from: 'client', text: `Hi, I'm ${client.name}.`, at: new Date().toISOString() },
      { id: 'm2', from: 'dietitian', text: 'Hello! How can I help you today?', at: new Date().toISOString() },
    ]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim() || !selectedClient) return;

    const newMsg = { id: String(Date.now()), from: 'dietitian', text: draft.trim(), at: new Date().toISOString() };
    setMessages(prev => [...prev, newMsg]);
    setDraft('');

    // TODO: Replace with real API call when backend is ready
    // try {
    //   const token = localStorage.getItem('token');
    //   const res = await fetch(`http://localhost:8000/api/chats/${selectedClient.id}/messages`, {
    //     method: 'POST',
    //     headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ text: newMsg.text })
    //   });
    //   if (!res.ok) {
    //     const data = await res.json();
    //     setNotification({ message: data.message || 'Failed to send message', type: 'error' });
    //   }
    // } catch (err) {
    //   setNotification({ message: 'Failed to send message. Please try again.', type: 'error' });
    // }
  };

  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="client-management">
        <div className="section-header">
          <h2 className="section-title">Chat</h2>
        </div>

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

                <div className="chat-messages">
                  {messages.map(m => (
                    <div key={m.id} className={`chat-message ${m.from === 'dietitian' ? 'outgoing' : 'incoming'}`}>
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