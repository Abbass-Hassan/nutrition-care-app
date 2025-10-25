import React, { useMemo, useState, useEffect } from 'react';
import { MdSend } from 'react-icons/md';
import { API_BASE } from '../config';

function SendNotification() {
  const [form, setForm] = useState({ audience: 'all', title: '', message: '', clients: [] });
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [error, setError] = useState(null);
  const [clientQuery, setClientQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState('asc');

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoadingClients(true);
        setError(null);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/clients`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        const data = await response.json();
        if (response.ok && Array.isArray(data.clients)) {
          setClients(data.clients);
        } else {
          setError(data.message || 'Failed to load clients');
        }
      } catch (e) {
        setError('Unable to load clients');
      } finally {
        setLoadingClients(false);
      }
    };
    fetchClients();
  }, []);

  const canSubmit = useMemo(() => {
    if (!form.title.trim() || !form.message.trim()) return false;
    if (form.audience === 'clients' && form.clients.length === 0) return false;
    return true;
  }, [form]);

  const onField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const onToggleClient = (clientId) => () =>
    setForm((f) => ({
      ...f,
      clients: f.clients.includes(clientId)
        ? f.clients.filter((id) => id !== clientId)
        : [...f.clients, clientId],
    }));
  const handleSend = () => {
    const payload = {
      audience: form.audience,
      title: form.title.trim(),
      message: form.message.trim(),
      clientIds: form.audience === 'clients' ? form.clients : undefined,
    };
    console.log('Send notification (design-only)', payload);
  };

  const filteredClients = useMemo(() => {
    const q = clientQuery.trim().toLowerCase();
    const filtered = !q ? clients : clients.filter((c) =>
      (c.name || '').toLowerCase().includes(q) || (c.username || '').toLowerCase().includes(q)
    );
    const sorted = [...filtered].sort((a, b) => {
      const va = (a[sortBy] || '').toString().toLowerCase();
      const vb = (b[sortBy] || '').toString().toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [clients, clientQuery, sortBy, sortDir]);

  const allFilteredSelected = useMemo(() => {
    if (filteredClients.length === 0) return false;
    return filteredClients.every((c) => form.clients.includes(c.id));
  }, [filteredClients, form.clients]);

  const toggleSelectAll = () => {
    setForm((f) => {
      if (allFilteredSelected) {
        const filteredIds = new Set(filteredClients.map((c) => c.id));
        return { ...f, clients: f.clients.filter((id) => !filteredIds.has(id)) };
      }
      const next = new Set(f.clients);
      filteredClients.forEach((c) => next.add(c.id));
      return { ...f, clients: Array.from(next) };
    });
  };

  const toggleSort = (key) => () => {
    if (sortBy === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

  const formatDate = (iso) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return '—'; }
  };

  return (
    <div className="client-management">
      <div className="section-header">
        <h2 className="section-title">Send Notification</h2>
        <button className="add-client-btn" onClick={handleSend} disabled={!canSubmit}>
          <i className="fas fa-paper-plane"></i>
          <span>Send</span>
        </button>
      </div>
      <div className="clients-list-container">
        {error && <div className="empty-state">{error}</div>}

        <div className="form-row">
          <div className="form-group">
            <label>Audience</label>
            <select
              className="form-input"
              value={form.audience}
              onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))}
            >
              <option value="all">All Clients</option>
              <option value="clients">Specific Clients</option>
            </select>
          </div>
        </div>

        {form.audience === 'clients' && (
          <>
            <div className="form-row full-width">
              <div className="form-group" style={{ width: '100%' }}>
                <label>Select Clients</label>
                <input
                  className="form-input"
                  placeholder="Search by name or @username"
                  value={clientQuery}
                  onChange={(e) => setClientQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="form-row full-width">
              <div className="form-group" style={{ width: '100%' }}>
                <div className="select-toolbar">
                  <div className="selected-count">Selected: {form.clients.length}</div>
                </div>
                <div className="table-scroll">
                  <table className="clean-table selectable sticky" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        <th onClick={toggleSort('name')} className="th-sortable">Client {sortBy==='name' ? (sortDir==='asc' ? '▲' : '▼') : ''}</th>
                        <th onClick={toggleSort('username')} className="th-sortable">Username {sortBy==='username' ? (sortDir==='asc' ? '▲' : '▼') : ''}</th>
                        <th className="col-select">
                          <input type="checkbox" checked={allFilteredSelected} onChange={toggleSelectAll} />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingClients ? (
                        <tr><td colSpan={3}>Loading clients...</td></tr>
                      ) : filteredClients.length === 0 ? (
                        <tr><td colSpan={3}>No clients found.</td></tr>
                      ) : (
                        filteredClients.map((c) => {
                          const selected = form.clients.includes(c.id);
                          return (
                            <tr key={c.id} className={selected ? 'selected-row' : ''} onClick={onToggleClient(c.id)}>
                              <td>{c.name || '—'}</td>
                              <td>@{c.username || '—'}</td>
                              <td className="col-select" onClick={(e) => e.stopPropagation()}>
                                <input type="checkbox" checked={selected} onChange={onToggleClient(c.id)} />
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>Title</label>
            <input className="form-input" placeholder="Weekly tip is here" value={form.title} onChange={onField('title')} />
          </div>
        </div>

        <div className="form-row full-width">
          <div className="form-group">
            <label>Message</label>
            <textarea
              className="form-textarea"
              placeholder="Keep it short and actionable..."
              value={form.message}
              onChange={onField('message')}
              rows={5}
              maxLength={240}
            />
            <div className="hint">{form.message.length} / 240</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SendNotification;


