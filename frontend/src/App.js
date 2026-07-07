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
        <Route path="/" element={<Navigate to="/student/login" replace />} />
        <Route path="/student/login" element={<LoginForm onAuth={() => setUser(getCurrentUser())} />} />
        <Route path="/student/register" element={<StudentRegistration />} />
        <Route path="/teacher/login" element={<TeacherLogin onAuth={() => setUser(getCurrentUser())} />} />
        <Route path="/teacher/register" element={<TeacherRegistration />} />
        <Route path="/student/attendance" element={
          <ProtectedRoute user={user} type="student">
            <StudentAttendance />
          </ProtectedRoute>
        } />
        <Route path="/teacher/dashboard" element={
          <ProtectedRoute user={user} type="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        <Route path="/teacher/attendance" element={
          <ProtectedRoute user={user} type="teacher">
            <TeacherAttendance />
          </ProtectedRoute>
        } />
        <Route path="/teacher/students" element={
          <ProtectedRoute user={user} type="teacher">
            <StudentList />
          </ProtectedRoute>
        } />
        <Route path="/teacher/edit-student/:id" element={
         <ProtectedRoute user={user} type="teacher">
          <EditStudent />
         </ProtectedRoute>
        }/>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function ProtectedRoute({ user, type, children }) {
  if (!user || user.type !== type) {
    return <Navigate to={`/${type}/login`} replace />;
  }
  return children;
}

export default App;
