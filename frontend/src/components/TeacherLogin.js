import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';
import { setAuthData } from '../auth';

export default function TeacherLogin({ onAuth }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);
    setLoading(true);
    try {
      const response = await login({ user_type: 'teacher', identifier, password });
      setAuthData(response.data);
      onAuth?.();
      navigate('/teacher/dashboard');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-card">
      <h1 className="section-title">Teacher Login</h1>
      <p className="notice">Use your teacher credentials to view attendance analytics.</p>
      {message && <div className="notice error">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Teacher ID</label>
          <input value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="T12345" />
        </div>
        <div className="form-field">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
      </form>
      <div className="action-row" style={{ marginTop: 16 }}>
        <Link className="link-button secondary" to="/student/login">Student login</Link>
        <Link className="link-button" to="/teacher/register">Create account</Link>
      </div>
    </main>
  );
}
