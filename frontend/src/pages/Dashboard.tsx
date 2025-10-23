import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { attemptsAPI, type Attempt } from '../api/client';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  
  const { logout } = useAuth();
  const navigate = useNavigate();

  const fetchAttempts = async () => {
    try {
      const response = await attemptsAPI.getAll();
      setAttempts(response.data);
      setError('');
    } catch (err: any) {
      setError('Failed to load attempts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSending(true);

    try {
      await attemptsAPI.send(email, subject || undefined, content || undefined);
      setSuccess('Phishing email sent successfully!');
      setEmail('');
      setSubject('');
      setContent('');
      await fetchAttempts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      pending: 'status-pending',
      sent: 'status-sent',
      clicked: 'status-clicked',
      failed: 'status-failed',
    };
    return badges[status] || 'status-pending';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Phishing Simulation Dashboard</h1>
          <button onClick={handleLogout} className="btn-logout">
            Sign Out
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-grid">
          <section className="card send-card">
            <h2>Send Phishing Attempt</h2>
            <form onSubmit={handleSend} className="send-form">
              <div className="form-group">
                <label htmlFor="email">Recipient Email *</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="target@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="subject">Subject (optional)</label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Security Alert"
                />
              </div>

              <div className="form-group">
                <label htmlFor="content">Content (optional)</label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Please verify your account..."
                  rows={4}
                />
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <button type="submit" className="btn-primary" disabled={sending}>
                {sending ? 'Sending...' : 'Send Phishing Email'}
              </button>
            </form>
          </section>

          <section className="card attempts-card">
            <h2>Phishing Attempts</h2>
            {loading ? (
              <div className="loading">Loading attempts...</div>
            ) : attempts.length === 0 ? (
              <div className="empty-state">No attempts yet</div>
            ) : (
              <div className="table-container">
                <table className="attempts-table">
                  <thead>
                    <tr>
                      <th>Email</th>
                      <th>Subject</th>
                      <th>Status</th>
                      <th>Sent At</th>
                      <th>Clicked At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attempts.map((attempt) => (
                      <tr key={attempt._id}>
                        <td className="email-cell">{attempt.email}</td>
                        <td>{attempt.subject || '—'}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadge(attempt.status)}`}>
                            {attempt.status}
                          </span>
                        </td>
                        <td>{attempt.sentAt ? formatDate(attempt.sentAt) : '—'}</td>
                        <td>{attempt.clickedAt ? formatDate(attempt.clickedAt) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};
