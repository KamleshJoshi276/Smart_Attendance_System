import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../auth';
import { searchAttendance } from '../api';

export default function TeacherAttendance() {
  const user = getCurrentUser();
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({ student_name: '', student_id: '', date: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords(customFilters = filters) {
    setLoading(true);
    setMessage(null);
    try {
      const response = await searchAttendance(customFilters);
      setRecords(response.data);
    } catch (error) {
      setMessage('Unable to load attendance records.');
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    navigate('/teacher/login');
  }

  return (
    <main className="page-card">
      <div className="top-bar">
        <div>
          <h1 className="section-title">Admin Attendance Records</h1>
          <p className="notice">Logged in as {user?.name} ({user?.identifier})</p>
        </div>
        <div className="action-row">
          <Link className="link-button secondary" to="/teacher/dashboard">Dashboard</Link>
          <Link className="link-button secondary" to="/teacher/students">Engineers</Link>
          <button className="secondary" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="card">
        <h3>Search attendance</h3>
        <div className="grid-2">
          <input value={filters.student_name} onChange={(e) => setFilters(prev => ({ ...prev, student_name: e.target.value }))} placeholder="Search by engineer name" />
          <input value={filters.student_id} onChange={(e) => setFilters(prev => ({ ...prev, student_id: e.target.value }))} placeholder="Search by engineer ID" />
        </div>
        <div className="grid-2" style={{ marginTop: 12 }}>
          <input type="date" value={filters.date} onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))} />
          <button type="button" onClick={() => fetchRecords(filters)}>Apply filters</button>
        </div>
      </div>

      {message && <div className="notice error">{message}</div>}

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Engineer Name</th>
              <th>Engineer ID</th>
              <th>Date</th>
              <th>Time</th>
              <th>Attendance Image</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5">Loading records…</td></tr>
            ) : records.length ? (
              records.map((record) => (
                <tr key={`${record.student_id}-${record.date}-${record.time}`}>
                  <td>{record.student_name}</td>
                  <td>{record.student_id}</td>
                  <td>{record.date}</td>
                  <td>{record.time}</td>
                  <td><a href={record.image_url} target="_blank" rel="noreferrer">View</a></td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5">No attendance records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
