import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerStudent } from '../api';
import CameraCapture from './CameraCapture';

export default function StudentRegistration() {

  const [form, setForm] = useState({
    student_id: '',
    name: '',
    password: ''
  });

  const [capturedImage, setCapturedImage] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const cameraRef = useRef(null);
  const navigate = useNavigate();

  function handleCaptureFace() {

    const imageData = cameraRef.current?.capture();

    if (!imageData) {
      setMessage({
        type: "error",
        text: "Please allow camera access and try again."
      });
      return;
    }

    setCapturedImage(imageData);

    setMessage({
      type: "success",
      text: "Engineer face captured successfully."
    });

  }

  async function handleSubmit(event) {

    event.preventDefault();

    if (!capturedImage) {
      setMessage({
        type: "error",
        text: "Capture engineer face before registration."
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {

      await registerStudent({
        student_id: form.student_id,
        name: form.name,
        password: form.password,
        profile_image: capturedImage
      });

      setMessage({
        type: "success",
        text: "Engineer Registered Successfully."
      });

      setTimeout(() => {
        navigate("/engineer/login");
      }, 1200);

    } catch (error) {

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Engineer Registration Failed"
      });

    } finally {

      setLoading(false);

    }

  }
    return (

    <main className="page-card">

      <div className="top-bar">

        <div>

          <img
            src="/uk_robotics_logo.png"
            alt="UK Robotics"
            style={{
              width: 100,
              marginBottom: 10
            }}
          />

          <h1 className="section-title">
            Engineer Registration
          </h1>

          <p className="notice">
            Register a new Engineer for AI Face Recognition Attendance.
          </p>

        </div>

        <Link
          className="link-button secondary"
          to="/engineer/login"
        >
          Engineer Login
        </Link>

      </div>

      {message && (
        <div className={`notice ${message.type === "error" ? "error" : "success"}`}>
          {message.text}
        </div>
      )}

      <div className="grid-2">

        <form
          onSubmit={handleSubmit}
          className="card"
        >

          <div className="form-field">

            <label>Engineer ID</label>

            <input
              value={form.student_id}
              onChange={(e) =>
                setForm({
                  ...form,
                  student_id: e.target.value
                })
              }
              placeholder="ENG001"
            />

          </div>

          <div className="form-field">

            <label>Engineer Name</label>

            <input
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value
                })
              }
              placeholder="Kamal Joshi"
            />

          </div>

          <div className="form-field">

            <label>Password</label>

            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({
                  ...form,
                  password: e.target.value
                })
              }
              placeholder="********"
            />

          </div>

          <div className="action-row">

            <button
              type="button"
              className="secondary"
              onClick={handleCaptureFace}
            >
              Capture Face
            </button>

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Registering..."
                : "Register Engineer"}
            </button>

          </div>

        </form>

        <div className="card">

          <CameraCapture
            ref={cameraRef}
            onCapture={setCapturedImage}
            capturedImage={capturedImage}
            title="Engineer Face Capture"
          />

          {capturedImage && (

            <div className="preview-box">

              <h3>Captured Preview</h3>

              <img
                src={capturedImage}
                alt="Engineer Face"
                className="preview-image"
              />

            </div>

          )}

        </div>

      </div>

    </main>

  );

}