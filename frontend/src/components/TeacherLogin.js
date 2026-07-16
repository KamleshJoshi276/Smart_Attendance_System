import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';
import { setAuthData } from '../auth';
import logo from "./ukrobotics.jpeg";

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

      const response = await login({
        user_type: 'teacher',
        identifier,
        password
      });

      setAuthData(response.data);

      onAuth?.();

      navigate('/admin/dashboard');

    } catch (error) {

      setMessage(
        error.response?.data?.message || 'Admin Login Failed'
      );

    } finally {

      setLoading(false);

    }

  }

  return (

    <main className="page-card">

    <div style={{ textAlign: "center", marginBottom: 20 }}>

  <img
    src={logo}
    alt="UK Robotics"
    style={{
      width: 180,
      height: "auto",
      marginBottom: 10
    }}
  />

  <h1 className="section-title">
    UK Robotics
  </h1>

  <h2 style={{ marginTop: 5 }}>
    Admin Panel
  </h2>

  <p className="notice">
    Secure Administrator Access
  </p>

</div>

      {message && (
        <div className="notice error">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        <div className="form-field">

          <label>Admin ID</label>

          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="ADMIN001"
          />

        </div>

        <div className="form-field">

          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
          />

        </div>

        <button
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing In..." : "Admin Login"}
        </button>

      </form>

      <div
        className="action-row"
        style={{ marginTop: 20 }}
      >

        <Link
          className="link-button secondary"
          to="/engineer/login"
        >
          Engineer Login
        </Link>

      </div>

    </main>

  );

}