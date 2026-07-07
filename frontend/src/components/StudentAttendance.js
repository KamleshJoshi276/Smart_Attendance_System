import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../auth';
import { markAttendance } from '../api';
import CameraCapture from './CameraCapture';

export default function StudentAttendance() {
  const user = getCurrentUser();
  const cameraRef = useRef(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/student/login');
  }

 async function handleSubmit() {

  const imageData = cameraRef.current?.capture();

  if (!imageData) {
    setMessage({
      type: "error",
      text: "Please allow camera access and try again."
    });
    return;
  }

  if (!navigator.geolocation) {
    setMessage({
      type: "error",
      text: "Geolocation is not supported by this browser."
    });
    return;
  }

  setLoading(true);
  setMessage(null);

  navigator.geolocation.getCurrentPosition(

    async (position) => {

      try {

        await markAttendance({

          image: imageData,

          latitude: position.coords.latitude,

          longitude: position.coords.longitude

        });

        setMessage({
          type: "success",
          text: "Attendance Marked Successfully"
        });

      } catch (error) {

        const backendMessage =
          error.response?.data?.message || "";

        if (
          error.response?.status === 403 ||
          backendMessage.toLowerCase().includes("face verification")
        ) {

          setMessage({
            type: "error",
            text: "Face Verification Failed"
          });

        } else {

          setMessage({
            type: "error",
            text:
              backendMessage || "Attendance submission failed"
          });

        }

      } finally {

        setLoading(false);

      }

    },

    () => {

      setLoading(false);

      setMessage({
        type: "error",
        text: "Location permission is required to mark attendance."
      });

    },

    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
 }
   return (
    <main className="page-card">

      <div className="top-bar">

        <div>
          <h1 className="section-title">
            Mark Attendance
          </h1>

          <p className="notice">
            Welcome, {user?.name} ({user?.identifier})
          </p>
        </div>

        <button
          className="secondary"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

      {message && (
        <div
          className={`notice ${
            message.type === "error"
              ? "error"
              : "success"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid-2">

        <CameraCapture
          ref={cameraRef}
          title="Live Camera"
        />

        <div className="card">

          <h3>Attendance Details</h3>

          <p>
            <strong>Name:</strong> {user?.name}
          </p>

          <p>
            <strong>ID:</strong> {user?.identifier}
          </p>

          <p>
            Please allow both Camera and Location
            permission before marking attendance.
          </p>

          <button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Submitting..."
              : "Mark Attendance"}
          </button>

        </div>

      </div>

    </main>
  );
}