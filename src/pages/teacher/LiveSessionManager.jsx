// src/pages/teacher/LiveSessionManager.jsx
import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../supabaseClient'

const LiveSessionManager = () => {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeRoom, setActiveRoom] = useState(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', scheduled_at: '' })

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

  const handleCreate = async () => {
    if (!form.title.trim()) {
      alert('Le titre est obligatoire.')
      return
    }
    setCreating(true)

    const roomId = `ecolearn-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`

    const { error } = await supabase
      .from('live_sessions')
      .insert([{
        title: form.title,
        description: form.description,
        scheduled_at: form.scheduled_at || new Date().toISOString(),
        room_id: roomId,
        status: 'scheduled',
      }])

    if (error) {
      alert('Erreur: ' + error.message)
    } else {
      setForm({ title: '', description: '', scheduled_at: '' })
      fetchSessions()
    }
    setCreating(false)
  }

  const handleDelete = async (sessionId) => {
    if (!confirm('Supprimer cette session ?')) return
    await supabase.from('live_sessions').delete().eq('id', sessionId)
    fetchSessions()
  }

  const handleStart = async (session) => {
    // Marquer comme "live"
    await supabase
      .from('live_sessions')
      .update({ status: 'live' })
      .eq('id', session.id)
    setActiveRoom(session)
  }

  const handleEnd = async (session) => {
    await supabase
      .from('live_sessions')
      .update({ status: 'ended' })
      .eq('id', session.id)
    setActiveRoom(null)
    fetchSessions()
  }

  // Vue : salle de réunion ouverte
  if (activeRoom) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{activeRoom.title}</h1>
            <p className="text-sm text-gray-500">Séance en cours — ID: {activeRoom.room_id}</p>
          </div>
          <button
            onClick={() => handleEnd(activeRoom)}
            className="bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-red-700"
          >
            Terminer la séance
          </button>
        </div>

        {/* Jitsi via iframe (plus simple que le SDK) */}
        <div className="bg-black rounded-xl overflow-hidden">
          <iframe
            src={`https://meet.jit.si/${activeRoom.room_id}#userInfo.displayName="Professeur"&config.prejoinPageEnabled=false`}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            style={{ width: '100%', height: '75vh', border: 'none' }}
            title="Séance en ligne"
          />
        </div>
      </div>
    )
  }

  // Vue : liste
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Séances en ligne</h1>
        <p className="text-gray-600 mt-2">
          Créez des sessions vidéo avec vos étudiants via Jitsi Meet (gratuit, sans compte).
        </p>
      </div>

      {/* Formulaire de création */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Nouvelle session</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ex: Révision chapitre 3"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder="Ex: Nous réviserons les exercices 1 à 5"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date et heure</label>
            <input
              type="datetime-local"
              value={form.scheduled_at}
              onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="w-full bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {creating ? 'Création...' : '+ Créer la session'}
            </button>
          </div>
        </div>
      </div>

      {/* Liste des sessions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Sessions existantes</h2>
        </div>
        {loading ? (
          <div className="p-10 text-center text-gray-500">Chargement...</div>
        ) : sessions.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Aucune session créée pour le moment.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sessions.map((session) => (
              <div key={session.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-800">{session.title}</h3>
                    <StatusBadge status={session.status} />
                  </div>
                  {session.description && (
                    <p className="text-sm text-gray-600 mt-1">{session.description}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(session.scheduled_at).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleStart(session)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    Démarrer
                  </button>
                  <button
                    onClick={() => handleDelete(session.id)}
                    className="px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 text-sm"
                    title="Supprimer"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const StatusBadge = ({ status }) => {
  const styles = {
    scheduled: 'bg-blue-100 text-blue-700',
    live: 'bg-red-100 text-red-700 animate-pulse',
    ended: 'bg-gray-100 text-gray-600',
  }
  const labels = { scheduled: 'Planifiée', live: '🔴 En direct', ended: 'Terminée' }
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

export default LiveSessionManager