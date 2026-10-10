// src/pages/student/LessonView.jsx
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, Clock, Calendar, FileText, Download,
  BookOpen, ChevronUp, Share2, CheckCircle2
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../supabaseClient'

const LessonView = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [showTopBtn, setShowTopBtn] = useState(false)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    const fetchLesson = async () => {
      setLoading(true)
      const { data, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .single()

      if (lessonError || !data) {
        setError("Cette leçon n'existe pas ou n'est pas encore publiée.")
        setLoading(false)
        return
      }
      setLesson(data)

      const { data: resourcesData } = await supabase
        .from('lesson_resources')
        .select('*')
        .eq('lesson_id', id)
      setResources(resourcesData || [])
      setLoading(false)
    }
    fetchLesson()
  }, [id])

  // Barre de progression au scroll
  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight
      const progress = total > 0 ? (window.scrollY / total) * 100 : 0
      setScrollProgress(progress)
      setShowTopBtn(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try { await navigator.share({ title: lesson.title, url }) } catch { /* annulé */ }
    } else {
      await navigator.clipboard.writeText(url)
      alert('Lien copié dans le presse-papier !')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-gray-500">Chargement de la leçon...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100 text-center">
        <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4">
          <BookOpen className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Leçon indisponible</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link
          to="/student/dashboard"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-green-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux leçons
        </Link>
      </div>
    )
  }

  const words = (lesson.content || '').replace(/<[^>]+>/g, ' ').split(/\s+/).length
  const readTime = Math.max(1, Math.ceil(words / 200))

  return (
    <>
      {/* Barre de progression */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* ===== HERO ===== */}
      <header className="bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 border-b border-green-100">
        <div className="max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8 md:py-12">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-700 mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux leçons
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-white px-3 py-1.5 rounded-full w-fit mb-4 shadow-sm">
            <BookOpen className="w-3.5 h-3.5" />
            LEÇON
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-5 tracking-tight break-words">
            {lesson.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1.5 bg-white/70 backdrop-blur px-3 py-1.5 rounded-lg">
              <Calendar className="w-4 h-4 text-green-600" />
              <span className="whitespace-nowrap">
                {format(new Date(lesson.created_at), 'd MMM yyyy', { locale: fr })}
              </span>
            </span>
            <span className="flex items-center gap-1.5 bg-white/70 backdrop-blur px-3 py-1.5 rounded-lg">
              <Clock className="w-4 h-4 text-green-600" />
              <span className="whitespace-nowrap">{readTime} min</span>
            </span>
            {resources.length > 0 && (
              <span className="flex items-center gap-1.5 bg-white/70 backdrop-blur px-3 py-1.5 rounded-lg">
                <FileText className="w-4 h-4 text-green-600" />
                <span className="whitespace-nowrap">
                  {resources.length} doc{resources.length > 1 ? 's' : ''}
                </span>
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ===== Corps principal ===== */}
      <div className="max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-6 md:py-8">

        {/* Contenu principal */}
        <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8 md:p-10 lg:p-12">
          <div
            className="lesson-content"
            dangerouslySetInnerHTML={{ __html: lesson.content }}
          />
        </article>

        {/* Vidéo */}
        {lesson.video_url && (
          <section className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-red-500" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-gray-800">Vidéo</h2>
                <p className="text-xs text-gray-500">Regardez pour approfondir</p>
              </div>
            </div>
            <div className="aspect-video bg-black">
              <VideoEmbed url={lesson.video_url} />
            </div>
          </section>
        )}

        {/* Ressources PDF */}
        {resources.length > 0 && (
          <section className="mt-6 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-green-600" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-gray-800">Documents</h2>
                <p className="text-xs text-gray-500">
                  {resources.length} fichier{resources.length > 1 ? 's' : ''} PDF
                </p>
              </div>
            </div>
            <ul className="divide-y divide-gray-100">
              {resources.map((res) => {
                const url = supabase.storage
                  .from('lesson-resources')
                  .getPublicUrl(res.file_path).data.publicUrl
                return (
                  <li key={res.id} className="flex items-center gap-3 p-4 hover:bg-gray-50 transition">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {res.file_name}
                      </p>
                      <p className="text-xs text-gray-500">PDF</p>
                    </div>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-3 py-2 rounded-lg transition flex-shrink-0"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Ouvrir</span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        {/* Carte "Terminer" */}
        <div className="mt-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 sm:p-6 md:p-8 text-white shadow-lg">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 break-words">
                Vous avez terminé cette leçon ?
              </h3>
              <p className="text-emerald-50 text-sm opacity-90">
                Marquez-la comme complétée pour suivre votre progression.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleShare}
                className="p-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl hover:bg-white/20 transition flex-shrink-0"
                title="Partager"
              >
                <Share2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCompleted(!completed)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-3 rounded-xl font-semibold transition shadow-lg flex-1 sm:flex-initial justify-center ${
                  completed
                    ? 'bg-white text-emerald-700'
                    : 'bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span className="whitespace-nowrap text-sm sm:text-base">
                  {completed ? 'Terminée ✓' : 'Marquer comme terminée'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton retour en haut */}
      {showTopBtn && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-4 sm:right-6 w-11 h-11 sm:w-12 sm:h-12 bg-gray-900 text-white rounded-full shadow-xl hover:bg-green-600 transition flex items-center justify-center z-40"
          title="Retour en haut"
        >
          <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}
    </>
  )
}

// ===== Composant vidéo =====
const VideoEmbed = ({ url }) => {
  if (!url) return null

  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
  if (ytMatch) {
    return (
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube.com/embed/${ytMatch[1]}`}
        title="Vidéo de la leçon"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    )
  }

  if (url.includes('facebook.com')) {
    return (
      <iframe
        src={`https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`}
        width="100%"
        height="100%"
        style={{ border: 'none', overflow: 'hidden' }}
        scrolling="no"
        frameBorder="0"
        allowFullScreen
      />
    )
  }

  return (
    <div className="p-4 text-sm text-gray-400 bg-gray-900 text-center">
      Format vidéo non reconnu.
    </div>
  )
}

export default LessonView