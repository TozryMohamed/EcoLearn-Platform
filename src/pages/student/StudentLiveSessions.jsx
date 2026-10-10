// src/pages/student/StudentLiveSessions.jsx
import { useEffect, useState, useCallback } from 'react'
import {
  Video, Calendar, Clock, Radio, 
  X} from 'lucide-react'
import { format, formatDistanceToNow, isFuture } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../../supabaseClient'

const StudentLiveSessions = () => {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeRoom, setActiveRoom] = useState(null)
  const [filter, setFilter] = useState('all') // all | upcoming | live | past

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('live_sessions')
      .select('*')
      .order('scheduled_at', { ascending: false })

    if (error) console.error(error)
    else setSessions(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSessions()
  }, [fetchSessions])

  // Rejoindre une session
  const handleJoin = (session) => {
    setActiveRoom(session)
  }

  const handleLeave = () => {
    setActiveRoom(null)
  }

  // Filtrer les sessions
  const filtered = sessions.filter(s => {
    if (filter === 'all') return true
    if (filter === 'live') return s.status === 'live'
    if (filter === 'upcoming') {
      return s.status === 'scheduled' && isFuture(new Date(s.scheduled_at))
    }
    if (filter === 'past') {
      return s.status === 'ended' || (!isFuture(new Date(s.scheduled_at)) && s.status !== 'live')
    }
    return true
  })

  const counts = {
    all: sessions.length,
    live: sessions.filter(s => s.status === 'live').length,
    upcoming: sessions.filter(s => s.status === 'scheduled' && isFuture(new Date(s.scheduled_at))).length,
    past: sessions.filter(s => s.status === 'ended').length,
  }

  // ===== Vue : session ouverte =====
  if (activeRoom) {
    return (
      <div className="space-y-4 max-w-5xl lg:max-w-6xl mx-auto">
        {/* Bandeau info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-gray-800 truncate">
                {activeRoom.title}
              </h1>
              <p className="text-xs text-gray-500">
                Session en cours • ID: {activeRoom.room_id}
              </p>
            </div>
          </div>
          <button
            onClick={handleLeave}
            className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition flex-shrink-0"
          >
            <X className="w-4 h-4" />
            Quitter
          </button>
        </div>

        {/* Jitsi dans un iframe */}
        <div className="bg-black rounded-2xl overflow-hidden shadow-lg">
          <iframe
            src={`https://meet.jit.si/${activeRoom.room_id}#userInfo.displayName="Étudiant"&config.prejoinPageEnabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=true`}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            style={{ width: '100%', height: '70vh', border: 'none', minHeight: '500px' }}
            title="Séance en ligne"
          />
        </div>

        {/* Description */}
        {activeRoom.description && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-2">À propos de cette session</h3>
            <p className="text-sm text-gray-600">{activeRoom.description}</p>
          </div>
        )}
      </div>
    )
  }

  // ===== Vue : liste =====
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse text-gray-500">Chargement des séances...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-5xl lg:max-w-6xl mx-auto">

      {/* ===== Header ===== */}
      <div className="bg-gradient-to-br from-red-500 via-rose-600 to-pink-600 rounded-2xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-white rounded-full" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white rounded-full" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 text-xs font-semibold bg-white/20 backdrop-blur px-3 py-1.5 rounded-full w-fit mb-4">
            <Radio className="w-3.5 h-3.5" />
            SÉANCES EN DIRECT
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Cours en ligne
          </h1>
          <p className="text-white/90 text-sm md:text-base max-w-lg">
            Rejoignez les sessions vidéo organisées par votre professeur.
          </p>

          {counts.live > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-xl font-semibold text-sm shadow-lg animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              {counts.live} session{counts.live > 1 ? 's' : ''} en direct maintenant !
            </div>
          )}
        </div>
      </div>

      {/* ===== Filtres ===== */}
      {sessions.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: 'all', label: 'Toutes', count: counts.all },
            { key: 'live', label: 'En direct', count: counts.live },
            { key: 'upcoming', label: 'À venir', count: counts.upcoming },
            { key: 'past', label: 'Passées', count: counts.past },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                filter === tab.key
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-md text-xs ${
                filter === tab.key
                  ? 'bg-white/20'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* ===== Liste des sessions ===== */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 md:p-16 rounded-2xl shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Video className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">
            {sessions.length === 0
              ? 'Aucune séance programmée'
              : 'Aucune séance dans cette catégorie'}
          </h2>
          <p className="text-gray-500 max-w-md mx-auto">
            {sessions.length === 0
              ? "Votre professeur n'a pas encore créé de séance en ligne. Revenez plus tard."
              : 'Essayez un autre filtre.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {filtered.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onJoin={() => handleJoin(session)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ===== Carte de session =====
const SessionCard = ({ session, onJoin }) => {
  const scheduledDate = new Date(session.scheduled_at)
  const isLive = session.status === 'live'
  const isEnded = session.status === 'ended'
  const isUpcoming = session.status === 'scheduled' && isFuture(scheduledDate)

  // Style selon le statut
  const statusStyles = {
    live: {
      bg: 'from-red-500 to-rose-600',
      badge: 'bg-white text-red-600',
      badgeText: 'EN DIRECT',
      icon: <Radio className="w-3.5 h-3.5" />,
      pulse: true,
    },
    scheduled: {
      bg: 'from-blue-500 to-indigo-600',
      badge: 'bg-white/20 text-white',
      badgeText: 'À VENIR',
      icon: <Calendar className="w-3.5 h-3.5" />,
      pulse: false,
    },
    ended: {
      bg: 'from-gray-400 to-gray-500',
      badge: 'bg-white/20 text-white',
      badgeText: 'TERMINÉE',
      icon: <Clock className="w-3.5 h-3.5" />,
      pulse: false,
    },
  }

  const style = statusStyles[isLive ? 'live' : isEnded ? 'ended' : 'scheduled']

  return (
    <article
      className={`group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 ${
        isLive ? 'ring-2 ring-red-400 shadow-red-100' : 'hover:shadow-lg hover:-translate-y-1'
      }`}
    >
      {/* Bandeau de statut */}
      <div className={`relative bg-gradient-to-br ${style.bg} h-24 overflow-hidden`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white rounded-full" />
          <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-white rounded-full" />
        </div>

        <div className="relative h-full flex items-center justify-center">
          <Video className="w-12 h-12 text-white/90" strokeWidth={1.5} />
        </div>

        {/* Badge statut */}
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur shadow-sm ${style.badge} ${style.pulse ? 'animate-pulse' : ''}`}>
          {style.icon}
          {style.badgeText}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
          {session.title}
        </h3>

        {session.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-4">
            {session.description}
          </p>
        )}

        {/* Métadonnées */}
        <div className="flex flex-col gap-2 text-xs text-gray-500 mb-4">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            {format(scheduledDate, 'EEEE d MMMM yyyy', { locale: fr })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            {format(scheduledDate, 'HH:mm', { locale: fr })}
            {isUpcoming && (
              <span className="text-blue-600 font-medium">
                • {formatDistanceToNow(scheduledDate, { addSuffix: true, locale: fr })}
              </span>
            )}
          </span>
        </div>

        {/* Bouton */}
        <div className="mt-auto">
          {isLive ? (
            <button
              onClick={onJoin}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-md"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              Rejoindre maintenant
            </button>
          ) : isEnded ? (
            <button
              disabled
              className="w-full bg-gray-100 text-gray-400 py-3 rounded-xl font-medium cursor-not-allowed"
            >
              Session terminée
            </button>
          ) : (
            <button
              disabled
              className="w-full bg-blue-50 text-blue-600 py-3 rounded-xl font-medium cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" />
              En attente du professeur
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

export default StudentLiveSessions