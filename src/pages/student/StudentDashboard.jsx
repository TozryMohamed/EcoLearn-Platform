// src/pages/student/StudentDashboard.jsx
import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, Clock, Sparkles, Search, TrendingUp,
  Calendar, GraduationCap, Globe
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../context/AuthContext'
import { LEVELS } from '../../constants/levels'

const StudentDashboard = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchPublishedLessons = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) console.error(error)
    else setLessons(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPublishedLessons()
  }, [fetchPublishedLessons])

  const filtered = lessons.filter(l =>
    l.title.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: lessons.length,
    thisWeek: lessons.filter(l => {
      const created = new Date(l.created_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return created > weekAgo
    }).length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-gray-500">Chargement des cours...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ===== Header ===== */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-green-100 text-sm font-medium mb-1">
              Bonjour 👋
            </p>
            <h1 className="text-3xl md:text-4xl font-bold">
              {profile?.full_name}
            </h1>
            <p className="text-green-50 mt-2 max-w-lg">
              Prêt à apprendre quelque chose de nouveau aujourd'hui ?
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-xs text-green-100 uppercase tracking-wide">
              Cours disponibles
            </p>
            <p className="text-3xl font-bold mt-1">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* ===== Barre de recherche + stats ===== */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-green-600" />
            Mes Leçons
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {stats.thisWeek > 0
              ? `${stats.thisWeek} nouvelle${stats.thisWeek > 1 ? 's' : ''} leçon${stats.thisWeek > 1 ? 's' : ''} cette semaine`
              : 'Toutes les leçons publiées par votre professeur'}
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un cours..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-72 pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
          />
        </div>
      </div>

      {/* ===== Liste des leçons ===== */}
      {filtered.length === 0 ? (
        <div className="bg-white p-16 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            {search ? 'Aucun résultat' : 'Aucune leçon disponible'}
          </h2>
          <p className="text-gray-500">
            {search
              ? `Aucun cours ne correspond à "${search}".`
              : "Le professeur n'a pas encore publié de leçons. Revenez plus tard."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onOpen={() => navigate(`/student/lesson/${lesson.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ===== Carte de leçon =====
const LessonCard = ({ lesson, onOpen }) => {
  const isNew = () => {
    // eslint-disable-next-line react-hooks/purity
    const days = (Date.now() - new Date(lesson.created_at).getTime()) / (1000 * 60 * 60 * 24)
    return days < 7
  }

  const getPlainText = (html) => {
    if (!html) return ''
    return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').trim()
  }

  const estimateReadTime = (html) => {
    const words = getPlainText(html).split(/\s+/).length
    return Math.max(1, Math.ceil(words / 200))
  }

  // ⬇️ NOUVEAU : Infos du niveau/spécialité
  const lessonLevels = lesson.levels || ['all']
  const isForAll = lessonLevels.includes('all')
  const levelInfos = lessonLevels
    .filter(l => l !== 'all')
    .map(l => LEVELS.find(x => x.value === l))
    .filter(Boolean)

  return (
    <article
      onClick={onOpen}
      className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
    >
      {/* Cover / header de la carte */}
      <div className="relative h-32 bg-gradient-to-br from-green-500 via-emerald-600 to-teal-700 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/30" />
          <div className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full bg-white/20" />
        </div>
        <div className="relative h-full flex items-center justify-center">
          <BookOpen className="w-14 h-14 text-white/90" strokeWidth={1.5} />
        </div>

        {/* Badge "Nouveau" */}
        {isNew() && (
          <span className="absolute top-3 left-3 bg-white text-green-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <Sparkles className="w-3 h-3" />
            NOUVEAU
          </span>
        )}

        {/* ⬇️ Badge SPÉCIALITÉ en haut à droite ⬇️ */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
          {isForAll ? (
            <span className="bg-white/90 backdrop-blur-sm text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
              <Globe className="w-3 h-3" />
              Toutes
            </span>
          ) : (
            levelInfos.map((lvl, idx) => (
              <span
                key={idx}
                className="bg-white/90 backdrop-blur-sm text-green-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md"
              >
                <span>{lvl.emoji}</span>
                {lvl.label}
              </span>
            ))
          )}
        </div>

        {/* Indicateur vidéo en bas à droite */}
        <div className="absolute bottom-3 right-3 flex gap-1.5">
          {lesson.video_url && (
            <span className="bg-black/40 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded-full">
              🎬 Vidéo
            </span>
          )}
        </div>
      </div>

      {/* Corps de la carte */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-green-700 transition">
          {lesson.title}
        </h3>

        {/* Badge spécialité détaillé (optionnel, plus visible) */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {isForAll ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
              <Globe className="w-3 h-3" />
              Toutes les spécialités
            </span>
          ) : (
            levelInfos.map((lvl, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-100"
              >
                <GraduationCap className="w-3 h-3" />
                {lvl.label} — {lvl.specialty}
              </span>
            ))
          )}
        </div>

        <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
          {getPlainText(lesson.content).substring(0, 120)}...
        </p>

        {/* Métadonnées */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDistanceToNow(new Date(lesson.created_at), { addSuffix: true, locale: fr })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {estimateReadTime(lesson.content)} min
          </span>
        </div>

        {/* Bouton */}
        <button
          className="w-full bg-gray-900 text-white py-2.5 rounded-xl font-medium group-hover:bg-green-600 transition flex items-center justify-center gap-2"
          onClick={(e) => { e.stopPropagation(); onOpen() }}
        >
          Commencer
          <TrendingUp className="w-4 h-4" />
        </button>
      </div>
    </article>
  )
}

export default StudentDashboard