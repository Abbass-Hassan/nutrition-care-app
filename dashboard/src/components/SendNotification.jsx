import React, { useMemo, useState } from 'react';
import { MdSend } from 'react-icons/md';

function SendNotification() {
  const [form, setForm] = useState({ audience: 'all', title: '', message: '' });

  const canSubmit = useMemo(() => {
    if (!form.title.trim() || !form.message.trim()) return false;
    return true;
  }, [form]);

  const onField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const handleSend = () => {
    // design-only action
    console.log('Send notification (design-only)', form);
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
        <div className="form-row">
          <div className="form-group">
            <label>Audience</label>
            <select className="form-input" value={form.audience} onChange={onField('audience')}>
              <option value="all">All Clients</option>
              <option value="clients">Specific Clients (IDs, comma-separated)</option>
            </select>
          </div>
        </div>

        {form.audience === 'clients' && (
          <div className="form-row full-width">
            <div className="form-group">
              <label>Client IDs</label>
              <textarea
                className="form-textarea"
                placeholder="e.g. 123, 456, 789"
                value={form.clientsText || ''}
                onChange={onField('clientsText')}
                rows={2}
              />
            </div>
          </div>
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

        {/* Bottom actions removed to match Client Management layout */}
      </div>
    </div>
  );
}

export default SendNotification;


