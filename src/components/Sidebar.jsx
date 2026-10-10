// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Video} from 'lucide-react'

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { profile } = useAuth()
  const isTeacher = profile?.role === 'teacher'

  const navItems = isTeacher
    ? [
        { path: '/teacher/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
        { path: '/teacher/students', label: 'Gestion des étudiants', icon: Users },
        { path: '/teacher/lessons', label: 'Gestion des leçons', icon: BookOpen },
        { path: '/teacher/live', label: 'Séances en ligne', icon: Video },
      ]
    : [
        { path: '/student/dashboard', label: 'Mes Leçons', icon: BookOpen },
        { path: '/student/live', label: 'Séances en direct', icon: Video },
      ]

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 flex flex-col
        `}
      >
        {/* ===== Logo ===== */}
        <div className="h-20 flex items-center justify-center border-b border-gray-200 px-4">
          <img
            src="/Logo.png"
            alt="EcoLearn"
            className="h-14 w-auto object-contain"
          />
        </div>

        {/* ===== Navigation ===== */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all
                  ${
                    isActive
                      ? 'bg-green-50 text-green-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        {/* ===== Pied de sidebar : profil ===== */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-gray-50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              {profile?.full_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {profile?.full_name}
              </p>
              <p className="text-xs text-gray-500">
                {isTeacher ? 'Professeur' : 'Étudiant'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar