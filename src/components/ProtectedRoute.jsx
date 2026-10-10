// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, profile, loading } = useAuth()

  if (loading) return <div className="h-screen flex items-center justify-center">Chargement...</div>
  
  // Si pas connecté, rediriger vers login
  if (!user) return <Navigate to="/login" replace />

  // Si le profil n'est pas encore chargé
  if (!profile) return <div className="h-screen flex items-center justify-center">Chargement du profil...</div>

  // Si l'utilisateur n'a pas le rôle requis
  if (!allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />
  }

  // Si c'est un étudiant non actif, on le redirige vers la page d'attente
  if (profile.role === 'student' && profile.account_status !== 'active') {
    return <Navigate to="/pending" replace />
  }

  return <Outlet />
}

export default ProtectedRoute