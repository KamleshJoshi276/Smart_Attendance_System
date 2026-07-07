import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerStudent } from '../api';
import CameraCapture from './CameraCapture';

export default function StudentRegistration() {
  const [form, setForm] = useState({ student_id: '', name: '', password: '' });
  const [capturedImage, setCapturedImage] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef(null);
  const navigate = useNavigate();

  function handleCaptureFace() {
    const imageData = cameraRef.current?.capture();
    if (!imageData) {
      setMessage({ type: 'error', text: 'Please allow camera access and try again.' });
      return;
    }
    setCapturedImage(imageData);
    setMessage({ type: 'success', text: 'Face captured. You can now register the student.' });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!capturedImage) {
      setMessage({ type: 'error', text: 'Capture a face image before submitting the form.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await registerStudent({
        student_id: form.student_id,
        name: form.name,
        password: form.password,
        profile_image: capturedImage,
      });

      setMessage({ type: 'success', text: 'Student registered successfully.' });
      setTimeout(() => navigate('/student/login'), 1200);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Student registration failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page-card">
      <div className="top-bar">
        <div>
          <h1 className="section-title">Student Registration</h1>
          <p className="notice">Register a new student and capture their face for verification.</p>
        </div>
        <Link className="link-button secondary" to="/student/login">Back to login</Link>
      </div>

      {message && <div className={`notice ${message.type === 'error' ? 'error' : 'success'}`}>{message.text}</div>}

      <div className="grid-2">
        <form onSubmit={handleSubmit} className="card">
          <div className="form-field">
            <label>Student ID</label>
            <input value={form.student_id} onChange={(e) => setForm(prev => ({ ...prev, student_id: e.target.value }))} placeholder="S1001" />
          </div>
          <div className="form-field">
            <label>Student Name</label>
            <input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Jamie Lee" />
          </div>
          <div className="form-field">
            <label>Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))} placeholder="••••••••" />
          </div>
          <div className="action-row">
            <button type="button" className="secondary" onClick={handleCaptureFace}>Capture Face</button>
            <button type="submit" disabled={loading}>{loading ? 'Registering...' : 'Register Student'}</button>
          </div>
        </form>

        <div className="card">
          <CameraCapture ref={cameraRef} onCapture={setCapturedImage} capturedImage={capturedImage} title="Face capture" />
          {capturedImage && (
            <div className="preview-box">
              <h3>Captured Preview</h3>
              <img src={capturedImage} alt="Captured student face" className="preview-image" />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
