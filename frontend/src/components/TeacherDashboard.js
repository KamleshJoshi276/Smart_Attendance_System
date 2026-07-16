import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../auth';
import { getStats, searchAttendance, exportAttendance } from '../api';

export default function TeacherDashboard() {

  const user = getCurrentUser();

  const [stats, setStats] = useState({
    total_students: 0,
    present_today: 0,
    absent_today: 0,
    attendance_percentage: 0
  });

  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {

    fetchStats();
    fetchRecords();

    const socket = io(
      process.env.REACT_APP_API_URL?.replace('/api', '') ||
      'http://localhost:5000'
    );

    socket.on("attendance_update", (update) => {

      setRecords(prev => [update, ...prev]);

      fetchStats();

    });

    return () => socket.disconnect();

  }, []);

  async function fetchStats() {

    try {

      const response = await getStats();

      setStats(response.data);

    } catch (error) {

      setMessage("Unable to load dashboard statistics.");

    }

  }

  async function fetchRecords() {

    setLoading(true);

    try {

      const response = await searchAttendance({});

      setRecords(response.data);

    } catch (error) {

      setMessage("Unable to load attendance records.");

    } finally {

      setLoading(false);

    }

  }

  function handleLogout() {

    logout();

    navigate("/admin/login");

  }

  async function handleExport() {

    try {

      const response = await exportAttendance();

      const blob = new Blob(
        [response.data],
        { type: "text/csv" }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        "UK_Robotics_Attendance.csv"
      );

      document.body.appendChild(link);

      link.click();

      link.remove();

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
        error.message
      );

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
              width: 90,
              marginBottom: 10
            }}
          />

          <h1 className="section-title">
            UK Robotics Admin Dashboard
          </h1>

          <p className="notice">

            Welcome,
            <strong> {user?.name}</strong>

            <br />

            Admin ID : {user?.identifier}

          </p>

        </div>

        <div className="action-row">

          <button
            type="button"
            onClick={() => navigate("/engineer/register")}
          >
            Register Engineer
          </button>

          <button
            type="button"
            className="secondary"
            onClick={() => navigate("/admin/engineers")}
          >
            Engineer List
          </button>

          <button
            type="button"
            className="secondary"
            onClick={() => navigate("/admin/attendance")}
          >
            Attendance Report
          </button>

          <button
            className="secondary"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </div>

      <div className="card-grid">

        <div className="card">

          <h3>Total Engineers</h3>

          <p className="stat-value">
            {stats.total_students}
          </p>

        </div>

        <div className="card">

          <h3>Present Today</h3>

          <p className="stat-value">
            {stats.present_today}
          </p>

        </div>

        <div className="card">

          <h3>Absent Today</h3>

          <p className="stat-value">
            {stats.absent_today}
          </p>

        </div>

        <div className="card">

          <h3>Attendance %</h3>

          <p className="stat-value">
            {stats.attendance_percentage}%
          </p>

        </div>

      </div>

      {message && (

        <div className="notice error">

          {message}

        </div>

      )}

      <div className="top-bar">

        <h2 style={{ margin: 0 }}>

          Today's Attendance

        </h2>

        <button
          type="button"
          onClick={handleExport}
        >
          Export CSV
        </button>

      </div>

      <div className="table-wrapper">

        <table>

          <thead>

            <tr>

              <th>Engineer Name</th>

              <th>Engineer ID</th>

              <th>Date</th>

              <th>Time</th>

              <th>Location</th>

              <th>Photo</th>

            </tr>

          </thead>

          <tbody>
                        {loading ? (

              <tr>

                <td colSpan="6">
                  Loading attendance records...
                </td>

              </tr>

            ) : records.length ? (

              records.map((record) => (

                <tr
                  key={`${record.student_id}-${record.date}-${record.time}`}
                >

                  <td>{record.student_name}</td>

                  <td>{record.student_id}</td>

                  <td>{record.date}</td>

                  <td>{record.time}</td>

                  <td>

                    {record.map_url ? (

                      <a
                        href={record.map_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        📍 View Map
                      </a>

                    ) : (

                      "Location Not Available"

                    )}

                  </td>

                  <td>

                    {record.image_url ? (

                      <a
                        href={record.image_url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Photo
                      </a>

                    ) : (

                      "No Photo"

                    )}

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td colSpan="6">

                  No attendance records found.

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

      <div
        style={{
          textAlign: "center",
          marginTop: "25px",
          color: "#666",
          fontSize: "14px"
        }}
      >

        © 2026 UK Robotics Pvt. Ltd.
        <br />
        AI Powered Engineer Attendance Management System

      </div>

    </main>

  );

}