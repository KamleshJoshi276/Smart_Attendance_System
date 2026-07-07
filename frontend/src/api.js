import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smart_attendance_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// =======================
// Authentication
// =======================

export async function login(payload) {
  return api.post('/auth/login', payload);
}

export async function registerTeacher(payload) {
  return api.post('/auth/teacher/register', payload);
}

export async function registerStudent(payload) {
  return api.post('/auth/student/register', payload);
}

// =======================
// Attendance
// =======================

export async function markAttendance(payload) {
  return api.post('/attendance/mark', payload);
}

export async function getAttendance(params = {}) {
  return api.get('/attendance/list', { params });
}

export async function searchAttendance(params = {}) {
  return api.get('/attendance/list', { params });
}

export async function getStats() {
  return api.get('/attendance/stats');
}

export async function exportAttendance() {
  return api.get('/admin/attendance/export', {
    responseType: 'blob',
  });
}

// =======================
// Students
// =======================

export async function getStudents() {
  return api.get('/admin/students');
}

export async function deleteStudent(id) {
  return api.delete(`/admin/student/${id}`);
}

export async function updateStudent(id, payload) {
  return api.put(`/admin/student/${id}`, payload);
}

export async function createStudent(payload) {
  return api.post('/admin/student', payload);
}

export default api;