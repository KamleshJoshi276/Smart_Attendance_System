import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerTeacher } from '../api';

export default function TeacherRegistration() {
  const [form, setForm] = useState({ teacher_id: '', name: '', password: '' });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      await registerTeacher(form);
      setMessage({ type: 'success', text: 'Teacher registered successfully. You can sign in now.' });
      setTimeout(() => navigate('/teacher/login'), 1000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Teacher registration failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-card">
      <div className="top-bar">
        <div>
          <h1 className="section-title">Teacher Registration</h1>
          <p className="notice">Create a teacher account to manage attendance and student records.</p>
        </div>
        <Link className="link-button secondary" to="/teacher/login">Back to login</Link>
      </div>

      {message && <div className={`notice ${message.type === 'error' ? 'error' : 'success'}`}>{message.text}</div>}

      <div className="grid-2">
        <form onSubmit={handleSubmit} className="card">
          <div className="form-field">
            <label>Teacher ID</label>
            <input value={form.teacher_id} onChange={(e) => setForm(prev => ({ ...prev, teacher_id: e.target.value }))} placeholder="T1001" />
          </div>
          <div className="form-field">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Alex Morgan" />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))} placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading}>{loading ? 'Creating account...' : 'Register Teacher'}</button>
        </form>

        <div className="card">
          <h3>What you can do</h3>
          <p>After registration, you can sign in to review attendance, monitor statistics, view registered students, and export reports.</p>
          <div className="action-row" style={{ marginTop: 16 }}>
            <Link className="link-button" to="/teacher/login">Teacher Login</Link>
            <Link className="link-button secondary" to="/student/login">Student Login</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
