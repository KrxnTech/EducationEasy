// App.jsx — Central router: maps every URL to its page component
// ProtectedRoute guards pages that need login

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

// Pages — we'll build these in the next steps
// For now they show a placeholder so routing works immediately
import LoginPage           from '@/pages/LoginPage'
import TeacherDashboard    from '@/pages/TeacherDashboard'
import AttendancePage      from '@/pages/AttendancePage'
import GradesPage          from '@/pages/GradesPage'
import ReportsPage         from '@/pages/ReportsPage'
import AlertsPage          from '@/pages/AlertsPage'
import TimetablePage       from '@/pages/TimetablePage'
import AdminDashboard      from '@/pages/AdminDashboard'
import AdminStudentsPage   from '@/pages/AdminStudentsPage'
import AdminTeachersPage from '@/pages/AdminTeachersPage'
import StudentProfilePage  from '@/pages/StudentProfilePage'

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public route */}
      <Route path="/login" element={
        // If already logged in, redirect to correct dashboard
        user
          ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />
          : <LoginPage />
      } />

      {/* Teacher routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute requiredRole="teacher"><TeacherDashboard /></ProtectedRoute>
      } />
      <Route path="/attendance" element={
        <ProtectedRoute requiredRole="teacher"><AttendancePage /></ProtectedRoute>
      } />
      <Route path="/grades" element={
        <ProtectedRoute requiredRole="teacher"><GradesPage /></ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute requiredRole="teacher"><ReportsPage /></ProtectedRoute>
      } />
      <Route path="/alerts" element={
        <ProtectedRoute requiredRole="teacher"><AlertsPage /></ProtectedRoute>
      } />

      {/* Shared routes (both teacher and admin) */}
      <Route path="/timetable" element={
        <ProtectedRoute><TimetablePage /></ProtectedRoute>
      } />
      <Route path="/students/:id" element={
        <ProtectedRoute><StudentProfilePage /></ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/students" element={
        <ProtectedRoute requiredRole="admin"><AdminStudentsPage /></ProtectedRoute>
      } />
      <Route path="/admin/teachers" element={
        <ProtectedRoute requiredRole="admin"><AdminTeachersPage /></ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="/" element={
        <Navigate to={user ? (user.role === 'admin' ? '/admin' : '/dashboard') : '/login'} replace />
      } />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}