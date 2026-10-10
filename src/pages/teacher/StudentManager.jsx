// // src/pages/teacher/StudentManager.jsx
// import { useEffect, useState, useCallback } from 'react'
// import { supabase } from '../../supabaseClient'

// const StudentManager = () => {
//   const [students, setStudents] = useState([])
//   const [, setLoading] = useState(true)
//   const [filter, setFilter] = useState('all') // all | pending | active | disabled
//   const [search, setSearch] = useState('')
//   const [actionLoading, setActionLoading] = useState(null)

//   const fetchStudents = useCallback(async () => {
//     setLoading(true)
//     const { data, error } = await supabase
//       .from('profiles')
//       .select('*')
//       .eq('role', 'student')
//       .order('created_at', { ascending: false })

//     if (error) console.error(error)
//     else setStudents(data || [])
//     setLoading(false)
//   }, [])

//   useEffect(() => {
//     // eslint-disable-next-line react-hooks/set-state-in-effect
//     fetchStudents()
//   }, [fetchStudents])

//   const handleToggleStatus = async (studentId, currentStatus) => {
//     setActionLoading(studentId)
//     const newStatus = currentStatus === 'active' ? 'disabled' : 'active'

//     const { error } = await supabase
//       .from('profiles')
//       .update({ account_status: newStatus })
//       .eq('id', studentId)

//     if (error) alert("Erreur lors de la mise à jour.")
//     else await fetchStudents()
//     setActionLoading(null)
//   }

//   const filteredStudents = students.filter(s => {
//     const matchFilter = filter === 'all' || s.account_status === filter
//     const matchSearch =
//       s.full_name.toLowerCase().includes(search.toLowerCase()) ||
//       s.email.toLowerCase().includes(search.toLowerCase())
//     return matchFilter && matchSearch
//   })

//   const counts = {
//     all: students.length,
//     pending: students.filter(s => s.account_status === 'pending').length,
//     active: students.filter(s => s.account_status === 'active').length,
//     disabled: students.filter(s => s.account_status === 'disabled').length,
//   }

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold text-gray-800">Gestion des étudiants</h1>
//         <p className="text-gray-600 mt-2">Activez ou désactivez les comptes étudiants.</p>
//       </div>

//       {/* Filtres */}
//       <div className="flex flex-wrap gap-3 items-center">
//         <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200">
//           {[
//             { key: 'all', label: 'Tous', count: counts.all },
//             { key: 'pending', label: 'En attente', count: counts.pending },
//             { key: 'active', label: 'Actifs', count: counts.active },
//             { key: 'disabled', label: 'Désactivés', count: counts.disabled },
//           ].map(tab => (
//             <button
//               key={tab.key}
//               onClick={() => setFilter(tab.key)}
//               className={`px-4 py-2 rounded-md text-sm font-medium transition ${
//                 filter === tab.key
//                   ? 'bg-green-600 text-white'
//                   : 'text-gray-600 hover:bg-gray-100'
//               }`}
//             >
//               {tab.label} ({tab.count})
//             </button>
//           ))}
//         </div>

//         <input
//           type="text"
//           placeholder="Rechercher un étudiant..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
//         />
//       </div>

//       {/* Tableau */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-gray-50 text-gray-600 text-sm">
//                 <th className="p-4 font-medium">Nom complet</th>
//                 <th className="p-4 font-medium">Email</th>
//                 <th className="p-4 font-medium">Inscription</th>
//                 <th className="p-4 font-medium">Statut</th>
//                 <th className="p-4 font-medium">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {filteredStudents.map((student) => (
//                 <tr key={student.id} className="hover:bg-gray-50">
//                   <td className="p-4 font-medium text-gray-800">{student.full_name}</td>
//                   <td className="p-4 text-gray-600">{student.email}</td>
//                   <td className="p-4 text-gray-500 text-sm">
//                     {new Date(student.created_at).toLocaleDateString('fr-FR')}
//                   </td>
//                   <td className="p-4">
//                     <span
//                       className={`px-3 py-1 rounded-full text-xs font-medium ${
//                         student.account_status === 'active'
//                           ? 'bg-green-100 text-green-700'
//                           : student.account_status === 'pending'
//                           ? 'bg-orange-100 text-orange-700'
//                           : 'bg-red-100 text-red-700'
//                       }`}
//                     >
//                       {student.account_status === 'active'
//                         ? 'Actif'
//                         : student.account_status === 'pending'
//                         ? 'En attente'
//                         : 'Désactivé'}
//                     </span>
//                   </td>
//                   <td className="p-4">
//                     <button
//                       onClick={() => handleToggleStatus(student.id, student.account_status)}
//                       disabled={actionLoading === student.id}
//                       className={`px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 ${
//                         student.account_status === 'active'
//                           ? 'bg-red-50 text-red-600 hover:bg-red-100'
//                           : 'bg-green-600 text-white hover:bg-green-700'
//                       }`}
//                     >
//                       {actionLoading === student.id
//                         ? '...'
//                         : student.account_status === 'active'
//                         ? 'Désactiver'
//                         : 'Activer'}
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {filteredStudents.length === 0 && (
//                 <tr>
//                   <td colSpan="5" className="p-8 text-center text-gray-500">
//                     Aucun étudiant trouvé.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default StudentManager


// src/pages/teacher/StudentManager.jsx
import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Search, Users, ChevronRight, GraduationCap, X,
  ChevronLeft, ChevronsLeft, ChevronsRight, Mail
} from 'lucide-react'
import { supabase } from '../../supabaseClient'
import StudentProfileModal from '../../components/StudentProfileModal'

// ===== Constantes =====
const STUDENTS_PER_PAGE = 10

const LEVELS = [
  { value: '2eme_economie_services', label: '2ème', fullLabel: '2ème — Éco & Services', emoji: '📘' },
  { value: '3eme_economie_gestion', label: '3ème', fullLabel: '3ème — Éco & Gestion', emoji: '📗' },
  { value: '4eme_economie_gestion', label: '4ème', fullLabel: '4ème — Éco & Gestion', emoji: '📕' },
]

const getLevelLabel = (value) => {
  const lvl = LEVELS.find(l => l.value === value)
  return lvl ? lvl.fullLabel : 'Niveau non défini'
}
const getLevelEmoji = (value) => {
  const lvl = LEVELS.find(l => l.value === value)
  return lvl ? lvl.emoji : '📚'
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const StudentManager = () => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [currentPage, setCurrentPage] = useState(1) // ⬅️ pagination

  // ===== Récupération =====
  const fetchStudents = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false })

    if (error) console.error(error)
    else setStudents(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStudents()
  }, [fetchStudents])

  // Reset la pagination quand un filtre change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1)
  }, [filter, levelFilter, search])

  // ===== Toggle activation =====
  const handleToggleStatus = async (e, studentId, currentStatus) => {
    e.stopPropagation()
    setActionLoading(studentId)
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active'

    const { error } = await supabase
      .from('profiles')
      .update({ account_status: newStatus })
      .eq('id', studentId)

    if (error) alert('Erreur lors de la mise à jour.')
    else await fetchStudents()
    setActionLoading(null)
  }

  // ===== Callback modal =====
  const handleUpdateFromModal = (updatedStudent, deletedId) => {
    if (deletedId) {
      setStudents(prev => prev.filter(s => s.id !== deletedId))
    } else if (updatedStudent) {
      setStudents(prev =>
        prev.map(s => (s.id === updatedStudent.id ? updatedStudent : s))
      )
    }
  }

  // ===== Filtrage =====
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchStatus = filter === 'all' || s.account_status === filter
      const matchLevel = levelFilter === 'all' || s.level === levelFilter
      const searchLower = search.toLowerCase()
      const matchSearch =
        !search ||
        s.full_name?.toLowerCase().includes(searchLower) ||
        s.email?.toLowerCase().includes(searchLower)
      return matchStatus && matchLevel && matchSearch
    })
  }, [students, filter, levelFilter, search])

  // ===== Pagination =====
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / STUDENTS_PER_PAGE))
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * STUDENTS_PER_PAGE
    const end = start + STUDENTS_PER_PAGE
    return filteredStudents.slice(start, end)
  }, [filteredStudents, currentPage])

  const goToPage = (page) => {
    const p = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(p)
    // Scroll vers le haut du tableau
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ===== Compteurs =====
  const counts = {
    all: students.length,
    pending: students.filter(s => s.account_status === 'pending').length,
    active: students.filter(s => s.account_status === 'active').length,
    disabled: students.filter(s => s.account_status === 'disabled').length,
  }

  const studentsByStatus = useMemo(() => {
    return students.filter(s => filter === 'all' || s.account_status === filter)
  }, [students, filter])

  const levelCounts = useMemo(() => {
    const counts = { all: studentsByStatus.length }
    LEVELS.forEach(lvl => {
      counts[lvl.value] = studentsByStatus.filter(s => s.level === lvl.value).length
    })
    counts.no_level = studentsByStatus.filter(s => !s.level).length
    return counts
  }, [studentsByStatus])

  // Indice de début / fin pour le résumé
  const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE + 1
  const endIndex = Math.min(currentPage * STUDENTS_PER_PAGE, filteredStudents.length)

  return (
    <>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* En-tête */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Gestion des étudiants
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            Filtrez, recherchez et gérez les comptes étudiants.
          </p>
        </div>

        {/* ===== Filtres statut + recherche ===== */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-gray-200 overflow-x-auto">
            {[
              { key: 'all', label: 'Tous', count: counts.all },
              { key: 'pending', label: 'En attente', count: counts.pending },
              { key: 'active', label: 'Actifs', count: counts.active },
              { key: 'disabled', label: 'Désactivés', count: counts.disabled },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium transition whitespace-nowrap ${
                  filter === tab.key
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un étudiant..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* ===== Filtre niveau ===== */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-4 h-4 text-green-600" />
            <h2 className="text-sm font-semibold text-gray-700">
              Filtrer par niveau scolaire
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setLevelFilter('all')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition border ${
                levelFilter === 'all'
                  ? 'bg-green-600 text-white border-green-600 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span className="text-base">📚</span>
              Tous les niveaux
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                levelFilter === 'all' ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
              }`}>
                {levelCounts.all}
              </span>
            </button>

            {LEVELS.map(lvl => {
              const isActive = levelFilter === lvl.value
              const count = levelCounts[lvl.value] || 0
              return (
                <button
                  key={lvl.value}
                  onClick={() => setLevelFilter(lvl.value)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition border ${
                    isActive
                      ? 'bg-green-600 text-white border-green-600 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base">{lvl.emoji}</span>
                  <span className="whitespace-nowrap">{lvl.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {count}
                  </span>
                </button>
              )
            })}

            {levelCounts.no_level > 0 && (
              <button
                onClick={() => setLevelFilter('no_level')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition border ${
                  levelFilter === 'no_level'
                    ? 'bg-gray-700 text-white border-gray-700 shadow-sm'
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <span className="text-base">❔</span>
                <span className="whitespace-nowrap">Sans niveau</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  levelFilter === 'no_level' ? 'bg-white/20' : 'bg-gray-100 text-gray-600'
                }`}>
                  {levelCounts.no_level}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ===== Résumé du filtrage ===== */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-500">
          <span>
            {filteredStudents.length > 0 ? (
              <>
                Affichage de{' '}
                <strong className="text-gray-800">{startIndex}–{endIndex}</strong>{' '}
                sur <strong className="text-gray-800">{filteredStudents.length}</strong>{' '}
                étudiant{filteredStudents.length > 1 ? 's' : ''}
              </>
            ) : (
              <>Aucun étudiant à afficher</>
            )}
          </span>
          {(filter !== 'all' || levelFilter !== 'all' || search) && (
            <button
              onClick={() => { setFilter('all'); setLevelFilter('all'); setSearch('') }}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Effacer tous les filtres
            </button>
          )}
        </div>

        {/* ===== Tableau ===== */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500">Chargement...</div>
          ) : paginatedStudents.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                Aucun étudiant ne correspond aux filtres.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Étudiant
                      </th>
                      <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Niveau
                      </th>
                      <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Inscription
                      </th>
                      <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedStudents.map((student) => (
                      <tr
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className="hover:bg-green-50/40 cursor-pointer transition group"
                      >
                        {/* Colonne : Étudiant */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                              {getInitials(student.full_name)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-800 truncate text-sm">
                                {student.full_name}
                              </p>
                              <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                                <Mail className="w-3 h-3" />
                                {student.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Colonne : Niveau */}
                        <td className="px-5 py-4 hidden md:table-cell">
                          {student.level ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-100 whitespace-nowrap">
                              <span>{getLevelEmoji(student.level)}</span>
                              <span>{getLevelLabel(student.level)}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-500 border border-gray-100 whitespace-nowrap">
                              ❔ Sans niveau
                            </span>
                          )}
                        </td>

                        {/* Colonne : Inscription */}
                        <td className="px-5 py-4 hidden lg:table-cell">
                          <span className="text-sm text-gray-600 whitespace-nowrap">
                            {formatDate(student.created_at)}
                          </span>
                        </td>

                        {/* Colonne : Statut */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              student.account_status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : student.account_status === 'pending'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              student.account_status === 'active'
                                ? 'bg-green-500'
                                : student.account_status === 'pending'
                                ? 'bg-orange-500 animate-pulse'
                                : 'bg-red-500'
                            }`} />
                            {student.account_status === 'active'
                              ? 'Actif'
                              : student.account_status === 'pending'
                              ? 'En attente'
                              : 'Désactivé'}
                          </span>
                        </td>

                        {/* Colonne : Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {student.account_status === 'pending' && (
                              <button
                                onClick={(e) => handleToggleStatus(e, student.id, student.account_status)}
                                disabled={actionLoading === student.id}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 disabled:opacity-50 hidden sm:inline-flex whitespace-nowrap"
                              >
                                {actionLoading === student.id ? '...' : 'Activer'}
                              </button>
                            )}
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-green-600 group-hover:translate-x-0.5 transition flex-shrink-0" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ===== Pagination ===== */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={goToPage}
                  total={filteredStudents.length}
                  perPage={STUDENTS_PER_PAGE}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onUpdate={handleUpdateFromModal}
        />
      )}
    </>
  )
}

// ===== Composant Pagination =====
const Pagination = ({ currentPage, totalPages, onPageChange, perPage }) => {
  // Génère la liste des pages à afficher (avec ellipses si besoin)
  const getPageNumbers = () => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)

      if (currentPage > 3) pages.push('...')

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)

      for (let i = start; i <= end; i++) pages.push(i)

      if (currentPage < totalPages - 2) pages.push('...')

      pages.push(totalPages)
    }

    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-gray-100 bg-gray-50/50">

      {/* Info */}
      <div className="text-xs text-gray-500">
        Page <strong className="text-gray-800">{currentPage}</strong> sur{' '}
        <strong className="text-gray-800">{totalPages}</strong>
        <span className="hidden sm:inline">
          {' '}• {perPage} étudiants par page
        </span>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-1">
        {/* Premier */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:text-green-600 border border-transparent hover:border-gray-200 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          aria-label="Première page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Précédent */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:text-green-600 border border-transparent hover:border-gray-200 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          aria-label="Page précédente"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Numéros de page */}
        <div className="flex items-center gap-1 mx-1">
          {pages.map((page, idx) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm"
                >
                  ...
                </span>
              )
            }
            const isActive = page === currentPage
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-white hover:text-green-600 border border-transparent hover:border-gray-200'
                }`}
              >
                {page}
              </button>
            )
          })}
        </div>

        {/* Suivant */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:text-green-600 border border-transparent hover:border-gray-200 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          aria-label="Page suivante"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Dernier */}
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:text-green-600 border border-transparent hover:border-gray-200 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          aria-label="Dernière page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default StudentManager