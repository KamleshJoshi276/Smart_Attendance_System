import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../auth';
import { getStats, searchAttendance, exportAttendance } from '../api';

export default function TeacherDashboard() {
  const user = getCurrentUser();
  const [stats, setStats] = useState({ total_students: 0, present_today: 0, absent_today: 0, attendance_percentage: 0 });
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchRecords();
    const socket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000');
    socket.on('attendance_update', update => {
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
      setMessage('Could not load stats.');
    }
  }

  async function fetchRecords() {
    setLoading(true);
    try {
      const response = await searchAttendance({});
      setRecords(response.data);
    } catch (error) {
      setMessage('Could not load attendance records.');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/teacher/login');
  }

  async function handleExport() {
    try {
      const response = await exportAttendance();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
    console.error(error);

    if (error.response) {
        console.log(error.response.status);
        console.log(error.response.data);
    }

    alert(error.response?.data?.message || error.message);
}
  }
  return (
    <main className="page-card">
      <div className="top-bar">
        <div>
          <h1 className="section-title">Teacher Dashboard</h1>
          <p className="notice">Logged in as {user?.name} ({user?.identifier})</p>
        </div>
        <div className="action-row">
          <button type="button" onClick={() => navigate('/student/register')}>Register Student</button>
          <button type="button" className="secondary" onClick={() => navigate('/teacher/students')}>View Students</button>
          <button type="button" className="secondary" onClick={() => navigate('/teacher/attendance')}>View Attendance</button>
          <button className="secondary" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="card-grid">
        <div className="card">
          <h3>Total Students</h3>
          <p className="stat-value">{stats.total_students}</p>
        </div>
        <div className="card">
          <h3>Present Today</h3>
          <p className="stat-value">{stats.present_today}</p>
        </div>
        <div className="card">
          <h3>Absent Today</h3>
          <p className="stat-value">{stats.absent_today}</p>
        </div>
        <div className="card">
          <h3>Attendance %</h3>
          <p className="stat-value">{stats.attendance_percentage}%</p>
        </div>
      </div>

      {message && <div className="notice error">{message}</div>}

      <div className="top-bar">
        <h2 style={{ margin: 0 }}>Latest Attendance</h2>
        <button type="button" onClick={handleExport}>Export to CSV</button>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Student ID</th>
              <th>Date</th>
              <th>Time</th>
              <th>Location</th>
              <th>Image</th>
            </tr>
          </thead>
        <tbody>
  {loading ? (
    <tr>
      <td colSpan="6">Loading records...</td>
    </tr>
  ) : records.length ? (
    records.map((record) => (
      <tr key={`${record.student_id}-${record.date}-${record.time}`}>
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
          <a
            href={record.image_url}
            target="_blank"
            rel="noreferrer"
          >
            View
          </a>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="6">No attendance records found.</td>
    </tr>
  )}
</tbody>

</table>
</div>

</main>
);
}