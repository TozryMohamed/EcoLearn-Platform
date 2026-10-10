// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import PendingPage from './pages/PendingPage'  // ⬅️ AJOUT

// Tableaux de bord
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import StudentDashboard from './pages/student/StudentDashboard'

// Pages professeur
import StudentManager from './pages/teacher/StudentManager'
import LessonManager from './pages/teacher/LessonManager'
import LiveSessionManager from './pages/teacher/LiveSessionManager'

// Pages étudiant
import LessonView from './pages/student/LessonView'
import StudentLiveSessions from './pages/student/StudentLiveSessions'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pending" element={<PendingPage />} />  {/* ⬅️ Utilise le nouveau composant */}

          {/* Routes protégées */}
          <Route element={<Layout />}>

            {/* Professeur */}
            <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
              <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
              <Route path="/teacher/students" element={<StudentManager />} />
              <Route path="/teacher/lessons" element={<LessonManager />} />
              <Route path="/teacher/live" element={<LiveSessionManager />} />
            </Route>

            {/* Étudiant */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/lesson/:id" element={<LessonView />} />
              <Route path="/student/live" element={<StudentLiveSessions />} />
            </Route>

          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App