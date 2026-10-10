// src/pages/teacher/TeacherDashboard.jsx
import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../context/AuthContext'

const TeacherDashboard = () => {
  const { profile } = useAuth()
  const [recentStudents, setRecentStudents] = useState([])
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, published: 0, lessons: 0 })
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    setLoading(true)

    // Étudiants (pour stats + aperçu)
    const { data: studentsData } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false })

    const allStudents = studentsData || []
    setRecentStudents(allStudents.slice(0, 5)) // Les 5 plus récents

    // Leçons
    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('status')

    const allLessons = lessonsData || []

    setStats({
      total: allStudents.length,
      active: allStudents.filter(s => s.account_status === 'active').length,
      pending: allStudents.filter(s => s.account_status === 'pending').length,
      published: allLessons.filter(l => l.status === 'published').length,
      lessons: allLessons.length
    })

    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData()
  }, [fetchDashboardData])

  const handleActivate = async (studentId) => {
    await supabase
      .from('profiles')
      .update({ account_status: 'active' })
      .eq('id', studentId)
    fetchDashboardData()
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-gray-500">Chargement...</div>
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>
          <p className="text-gray-600 mt-2">
            Bienvenue, <span className="font-semibold text-green-700">{profile?.full_name}</span>
          </p>
        </div>
        <Link
          to="/teacher/lessons"
          className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2"
        >
          <span>+</span> Nouvelle leçon
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Étudiants" value={stats.total} color="gray" />
        <StatCard label="Comptes Actifs" value={stats.active} color="green" />
        <StatCard label="En Attente" value={stats.pending} color="orange" />
        <StatCard label="Leçons Publiées" value={stats.published} color="blue" />
      </div>

      {/* Dernières inscriptions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Dernières inscriptions</h2>
            <p className="text-sm text-gray-500 mt-1">Les 5 derniers étudiants inscrits</p>
          </div>
          <Link
            to="/teacher/students"
            className="text-green-600 font-medium hover:underline text-sm"
          >
            Voir tout →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm">
                <th className="p-4 font-medium">Nom complet</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Statut</th>
                <th className="p-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{student.full_name}</td>
                  <td className="p-4 text-gray-600">{student.email}</td>
                  <td className="p-4 text-gray-500 text-sm">
                    {new Date(student.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={student.account_status} />
                  </td>
                  <td className="p-4">
                    {student.account_status === 'pending' && (
                      <button
                        onClick={() => handleActivate(student.id)}
                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                      >
                        Activer
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {recentStudents.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">
                    Aucun étudiant inscrit pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raccourcis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickLink
          to="/teacher/students"
          icon="👥"
          title="Gestion des étudiants"
          description="Activer, désactiver et gérer les comptes"
        />
        <QuickLink
          to="/teacher/lessons"
          icon="📚"
          title="Gestion des leçons"
          description="Créer et publier des cours"
        />
        <QuickLink
          to="/teacher/live"
          icon="🎥"
          title="Séances en ligne"
          description="Créer des sessions Jitsi Meet"
        />
      </div>
    </div>
  )
}

// Composants auxiliaires
const StatCard = ({ label, value, color }) => {
  const colorMap = {
    gray: 'text-gray-800',
    green: 'text-green-600',
    orange: 'text-orange-500',
    blue: 'text-blue-600',
  }
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-sm font-medium text-gray-500">{label}</h3>
      <p className={`text-3xl font-bold mt-2 ${colorMap[color]}`}>{value}</p>
    </div>
  )
}

const StatusBadge = ({ status }) => {
  const styles = {
    active: 'bg-green-100 text-green-700',
    pending: 'bg-orange-100 text-orange-700',
    disabled: 'bg-red-100 text-red-700',
  }
  const labels = { active: 'Actif', pending: 'En attente', disabled: 'Désactivé' }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

const QuickLink = ({ to, icon, title, description }) => (
  <Link
    to={to}
    className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition group"
  >
    <div className="text-3xl mb-3">{icon}</div>
    <h3 className="font-bold text-gray-800 group-hover:text-green-700 transition">{title}</h3>
    <p className="text-sm text-gray-500 mt-1">{description}</p>
  </Link>
)

export default TeacherDashboard