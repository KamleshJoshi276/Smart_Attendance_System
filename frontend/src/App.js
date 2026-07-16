import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import LoginForm from './components/LoginForm';
import TeacherLogin from './components/TeacherLogin';
import StudentAttendance from './components/StudentAttendance';
import TeacherDashboard from './components/TeacherDashboard';
import TeacherRegistration from './components/TeacherRegistration';
import StudentRegistration from './components/StudentRegistration';
import TeacherAttendance from './components/TeacherAttendance';
import StudentList from './components/StudentList';
import EditStudent from "./components/EditStudent";

import { getCurrentUser } from './auth';

function App() {

  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <div className="app-shell">

      <Routes>

        {/* Home */}
        <Route
          path="/"
          element={<Navigate to="/engineer/login" replace />}
        />

        {/* Engineer */}
        <Route
          path="/engineer/login"
          element={<LoginForm onAuth={() => setUser(getCurrentUser())} />}
        />

        <Route
          path="/engineer/register"
          element={<StudentRegistration />}
        />

        <Route
          path="/engineer/attendance"
          element={
            <ProtectedRoute user={user} type="student">
              <StudentAttendance />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin/login"
          element={<TeacherLogin onAuth={() => setUser(getCurrentUser())} />}
        />

        <Route
          path="/admin/register"
          element={<TeacherRegistration />}
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute user={user} type="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute user={user} type="teacher">
              <TeacherAttendance />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/engineers"
          element={
            <ProtectedRoute user={user} type="teacher">
              <StudentList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/edit-engineer/:id"
          element={
            <ProtectedRoute user={user} type="teacher">
              <EditStudent />
            </ProtectedRoute>
          }
        />

        {/* Invalid URL */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </div>
  );
}

function ProtectedRoute({ user, type, children }) {

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (type === "student" && user.type !== "student") {
    return <Navigate to="/engineer/login" replace />;
  }

  if (type === "teacher" && user.type !== "teacher") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;

}

export default App;