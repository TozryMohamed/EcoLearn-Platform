// src/pages/teacher/LessonManager.jsx
import { useEffect, useState, useCallback } from 'react'
import {
  Plus, Edit, Trash2, Eye, EyeOff, Globe,
  FileText, Video, Save, X, Upload, Check,
  AlertCircle, Loader2
} from 'lucide-react'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { supabase } from '../../supabaseClient'
import { LEVELS } from '../../constants/levels'

const MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean'],
  ],
}

const FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'list', 'bullet', 'align',
  'blockquote', 'code-block', 'link', 'image',
]

const LessonManager = () => {
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const fetchLessons = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('lessons')
      .select('*, lesson_resources(*)')
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    else setLessons(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (editing === null) fetchLessons()
  }, [editing, fetchLessons])

  const handleNew = () => {
    setEditing({
      id: null,
      title: '',
      content: '',
      video_url: '',
      status: 'draft',
      levels: ['all'],
      resources: [],
      pendingResources: [], // ⬅️ Fichiers uploadés avant sauvegarde
    })
  }

  const handleEdit = (lesson) => {
    setEditing({
      ...lesson,
      levels: lesson.levels || ['all'],
      resources: lesson.lesson_resources || [],
      pendingResources: [],
    })
  }

  const handleSave = async () => {
    if (!editing.title.trim()) {
      alert('Le titre est obligatoire.')
      return
    }
    if (!editing.levels || editing.levels.length === 0) {
      alert('Sélectionnez au moins une spécialité.')
      return
    }

    setSaving(true)
    let lessonId = editing.id

    const payload = {
      title: editing.title,
      content: editing.content,
      video_url: editing.video_url,
      status: editing.status,
      levels: editing.levels,
      updated_at: new Date().toISOString(),
    }

    // 1. Créer ou mettre à jour la leçon
    if (lessonId) {
      const { error } = await supabase
        .from('lessons')
        .update(payload)
        .eq('id', lessonId)
      if (error) {
        alert('Erreur: ' + error.message)
        setSaving(false)
        return
      }
    } else {
      const { data, error } = await supabase
        .from('lessons')
        .insert([payload])
        .select()
        .single()
      if (error) {
        alert('Erreur: ' + error.message)
        setSaving(false)
        return
      }
      lessonId = data.id
    }

    // 2. Attacher les fichiers temporaires (pendingResources)
    if (editing.pendingResources && editing.pendingResources.length > 0) {
      for (const pending of editing.pendingResources) {
        // Déplacer le fichier de tmp/ vers lessons/{lessonId}/
        const newPath = `lessons/${lessonId}/${pending.file_name}`
        
        // Copier
        const { error: copyError } = await supabase.storage
          .from('lesson-resources')
          .copy(pending.temp_path, newPath)

        if (copyError) {
          console.error('Erreur copie:', copyError)
          continue
        }

        // Supprimer le fichier temporaire
        await supabase.storage
          .from('lesson-resources')
          .remove([pending.temp_path])

        // Insérer en base
        await supabase.from('lesson_resources').insert([{
          lesson_id: lessonId,
          file_name: pending.file_name,
          file_path: newPath,
          resource_type: 'pdf',
        }])
      }
    }

    setSaving(false)
    setEditing(null)
    fetchLessons()
  }

  const handleDelete = async (lessonId) => {
    if (!confirm('Supprimer cette leçon ?')) return
    await supabase.from('lessons').delete().eq('id', lessonId)
    fetchLessons()
  }

  const handleTogglePublish = async (lesson) => {
    const newStatus = lesson.status === 'published' ? 'draft' : 'published'
    await supabase.from('lessons').update({ status: newStatus }).eq('id', lesson.id)
    fetchLessons()
  }

  if (editing) {
    return (
      <LessonEditor
        editing={editing}
        setEditing={setEditing}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
        saving={saving}
      />
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Gestion des leçons
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            Créez vos leçons et choisissez les spécialités concernées.
          </p>
        </div>
        <button
          onClick={handleNew}
          className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Nouvelle leçon
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">Chargement...</div>
      ) : lessons.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Aucune leçon</h2>
          <p className="text-gray-500 mb-4">Créez votre première leçon.</p>
          <button
            onClick={handleNew}
            className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-green-700"
          >
            Créer une leçon
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onEdit={() => handleEdit(lesson)}
              onDelete={() => handleDelete(lesson.id)}
              onTogglePublish={() => handleTogglePublish(lesson)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ===== Carte leçon =====
const LessonCard = ({ lesson, onEdit, onDelete, onTogglePublish }) => {
  const levels = lesson.levels || ['all']
  const isForAll = levels.includes('all')

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition">
      <div className="p-5 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2 flex-1">
            {lesson.title}
          </h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              lesson.status === 'published'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {lesson.status === 'published' ? 'Publié' : 'Brouillon'}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {isForAll ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
              <Globe className="w-3 h-3" />
              Toutes spécialités
            </span>
          ) : (
            levels.map(lvl => {
              const info = LEVELS.find(l => l.value === lvl)
              return (
                <span
                  key={lvl}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-100"
                >
                  <span>{info?.emoji || '📚'}</span>
                  {info?.label || lvl}
                </span>
              )
            })
          )}
        </div>

        <p className="text-sm text-gray-500">
          Modifié le {new Date(lesson.updated_at || lesson.created_at).toLocaleDateString('fr-FR')}
        </p>
      </div>

      <div className="p-3 bg-gray-50 border-t border-gray-100 flex gap-2">
        <button
          onClick={onEdit}
          className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition flex items-center justify-center gap-1.5"
        >
          <Edit className="w-3.5 h-3.5" />
          Modifier
        </button>
        <button
          onClick={onTogglePublish}
          className={`flex-1 py-2 rounded-lg text-sm font-medium text-white transition flex items-center justify-center gap-1.5 ${
            lesson.status === 'published'
              ? 'bg-orange-500 hover:bg-orange-600'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {lesson.status === 'published' ? (
            <><EyeOff className="w-3.5 h-3.5" /> Dépublier</>
          ) : (
            <><Eye className="w-3.5 h-3.5" /> Publier</>
          )}
        </button>
        <button
          onClick={onDelete}
          className="px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ===== Éditeur =====
const LessonEditor = ({ editing, setEditing, onSave, onCancel, saving }) => {
  const [uploading, setUploading] = useState(false)

  const toggleLevel = (value) => {
    const current = editing.levels || []

    let newLevels
    if (current.includes(value)) {
      newLevels = current.filter(l => l !== value)
    } else {
      newLevels = [...current.filter(l => l !== 'all'), value]
    }

    if (newLevels.length === 0) newLevels = ['all']

    setEditing({ ...editing, levels: newLevels })
  }

  const isLevelSelected = (value) => {
    return (editing.levels || []).includes(value)
  }

  // ⬇️ NOUVELLE LOGIQUE : upload dans tmp/ si la leçon n'existe pas encore
  const handlePdfUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.type !== 'application/pdf') {
      alert('Seuls les fichiers PDF sont acceptés.')
      return
    }

    setUploading(true)

    // Si la leçon existe déjà → upload direct dans son dossier
    // Sinon → upload dans tmp/ en attendant la sauvegarde
    const isExistingLesson = !!editing.id
    const filePath = isExistingLesson
      ? `lessons/${editing.id}/${Date.now()}_${file.name}`
      : `tmp/${Date.now()}_${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('lesson-resources')
      .upload(filePath, file)

    if (uploadError) {
      alert('Erreur upload: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('lesson-resources')
      .getPublicUrl(filePath)

    if (isExistingLesson) {
      // Leçon existante : insérer directement en base
      const { data: newRes } = await supabase
        .from('lesson_resources')
        .insert([{
          lesson_id: editing.id,
          file_name: file.name,
          file_path: filePath,
          resource_type: 'pdf',
        }])
        .select()
        .single()

      setEditing({
        ...editing,
        resources: [...editing.resources, { ...newRes, url: publicUrl }],
      })
    } else {
      // Nouvelle leçon : garder en attente
      setEditing({
        ...editing,
        pendingResources: [
          ...(editing.pendingResources || []),
          {
            file_name: file.name,
            temp_path: filePath,
            url: publicUrl,
          },
        ],
      })
    }

    setUploading(false)
    // Reset l'input pour pouvoir re-uploader le même fichier
    e.target.value = ''
  }

  const handleDeleteResource = async (resourceId, filePath) => {
    if (!confirm('Supprimer ce fichier ?')) return
    await supabase.storage.from('lesson-resources').remove([filePath])
    await supabase.from('lesson_resources').delete().eq('id', resourceId)
    setEditing({
      ...editing,
      resources: editing.resources.filter(r => r.id !== resourceId),
    })
  }

  const handleDeletePending = async (tempPath) => {
    if (!confirm('Supprimer ce fichier ?')) return
    await supabase.storage.from('lesson-resources').remove([tempPath])
    setEditing({
      ...editing,
      pendingResources: editing.pendingResources.filter(p => p.temp_path !== tempPath),
    })
  }

  const isAllSelected = isLevelSelected('all')
  const selectedCount = (editing.levels || []).filter(l => l !== 'all').length
  const totalResources = (editing.resources?.length || 0) + (editing.pendingResources?.length || 0)

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          {editing.id ? 'Modifier la leçon' : 'Nouvelle leçon'}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 font-medium transition flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition flex items-center gap-2 shadow-sm"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">

        {/* Titre */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Titre de la leçon *
          </label>
          <input
            type="text"
            value={editing.title}
            onChange={(e) => setEditing({ ...editing, title: e.target.value })}
            placeholder="Ex: Introduction à la croissance économique"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-base"
          />
        </div>

        {/* SÉLECTEUR DE SPÉCIALITÉS */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Spécialités concernées *
          </label>
          <p className="text-xs text-gray-500 mb-4">
            Choisissez les spécialités qui verront cette leçon.
          </p>

          <div className="flex gap-2 mb-4 p-1 bg-gray-100 rounded-xl">
            <button
              type="button"
              onClick={() => setEditing({ ...editing, levels: ['all'] })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                isAllSelected
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🌍 Toutes les spécialités
            </button>
            <button
              type="button"
              onClick={() => {
                if (isAllSelected) {
                  setEditing({ ...editing, levels: [] })
                }
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                !isAllSelected && selectedCount > 0
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🎯 Cibler une spécialité
            </button>
          </div>

          {isAllSelected ? (
            <div className="p-4 rounded-xl border-2 border-green-500 bg-green-50">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🌍</span>
                <div>
                  <p className="text-sm font-semibold text-green-700">
                    Toutes les spécialités
                  </p>
                  <p className="text-xs text-green-600">
                    Cette leçon sera visible par tous les étudiants, quel que soit leur niveau.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {LEVELS.map((lvl) => {
                const isSelected = isLevelSelected(lvl.value)
                return (
                  <button
                    type="button"
                    key={lvl.value}
                    onClick={() => toggleLevel(lvl.value)}
                    className={`relative p-4 rounded-xl border-2 transition text-left ${
                      isSelected
                        ? 'border-green-500 bg-green-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}

                    <div className="text-3xl mb-2">{lvl.emoji}</div>
                    <p className={`text-sm font-bold mb-0.5 ${
                      isSelected ? 'text-green-700' : 'text-gray-800'
                    }`}>
                      {lvl.label}
                    </p>
                    <p className={`text-xs ${
                      isSelected ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {lvl.specialty}
                    </p>
                  </button>
                )
              })}
            </div>
          )}

          {!isAllSelected && selectedCount === 0 && (
            <p className="mt-3 text-xs text-orange-600 bg-orange-50 p-2 rounded-lg">
              ⚠️ Sélectionnez au moins une spécialité, ou revenez à "Toutes les spécialités".
            </p>
          )}

          {editing.levels && editing.levels.length > 0 && (
            <div className="mt-4 text-xs text-gray-500">
              Cette leçon sera visible par :{' '}
              <span className="font-semibold text-green-700">
                {isAllSelected
                  ? 'tous les étudiants'
                  : editing.levels.map(l => {
                      const info = LEVELS.find(x => x.value === l)
                      return info ? `${info.label} (${info.specialty})` : l
                    }).join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Contenu */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Contenu de la leçon
          </label>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <ReactQuill
              theme="snow"
              value={editing.content}
              onChange={(content) => setEditing({ ...editing, content })}
              modules={MODULES}
              formats={FORMATS}
              placeholder="Écrivez le contenu de votre leçon..."
              className="min-h-[300px]"
            />
          </div>
        </div>

        {/* Vidéo */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Video className="w-4 h-4 text-red-500" />
            Vidéo (YouTube ou Facebook)
          </label>
          <input
            type="url"
            value={editing.video_url}
            onChange={(e) => setEditing({ ...editing, video_url: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=... "
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        </div>

        {/* PDF — MAINTENANT DISPONIBLE MÊME EN CRÉATION */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4 text-green-600" />
            Documents PDF
            {totalResources > 0 && (
              <span className="ml-auto text-xs font-normal text-gray-500">
                {totalResources} fichier{totalResources > 1 ? 's' : ''}
              </span>
            )}
          </label>

          {/* Zone d'upload */}
          <label className={`block cursor-pointer ${uploading ? 'cursor-wait' : ''}`}>
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfUpload}
              disabled={uploading}
              className="hidden"
            />
            <div className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
              uploading
                ? 'border-green-400 bg-green-50/50 cursor-wait'
                : 'border-gray-300 hover:border-green-400 hover:bg-green-50/30'
            }`}>
              {uploading ? (
                <>
                  <Loader2 className="w-6 h-6 text-green-600 mx-auto mb-2 animate-spin" />
                  <p className="text-sm text-green-700 font-medium">
                    Upload en cours...
                  </p>
                </>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 font-medium">
                    Cliquez pour uploader un PDF
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Les fichiers seront attachés à la leçon à l'enregistrement
                  </p>
                </>
              )}
            </div>
          </label>

          {/* Fichiers déjà enregistrés (leçon existante) */}
          {editing.resources && editing.resources.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">
                Fichiers enregistrés ({editing.resources.length})
              </p>
              <ul className="space-y-2">
                {editing.resources.map((res) => (
                  <li
                    key={res.id || res.file_path}
                    className="flex items-center justify-between bg-green-50 border border-green-100 px-4 py-2.5 rounded-xl"
                  >
                    <span className="text-sm text-gray-700 truncate flex items-center gap-2">
                      <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                      {res.file_name}
                    </span>
                    <button
                      onClick={() => handleDeleteResource(res.id, res.file_path)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium ml-2 flex-shrink-0"
                    >
                      Supprimer
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Fichiers en attente (nouvelle leçon) */}
          {editing.pendingResources && editing.pendingResources.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-xs font-semibold text-gray-500">
                  Fichiers en attente ({editing.pendingResources.length})
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                  <AlertCircle className="w-3 h-3" />
                  Sera attaché après enregistrement
                </span>
              </div>
              <ul className="space-y-2">
                {editing.pendingResources.map((res) => (
                  <li
                    key={res.temp_path}
                    className="flex items-center justify-between bg-orange-50 border border-orange-100 px-4 py-2.5 rounded-xl"
                  >
                    <span className="text-sm text-gray-700 truncate flex items-center gap-2">
                      <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                      {res.file_name}
                    </span>
                    <button
                      onClick={() => handleDeletePending(res.temp_path)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium ml-2 flex-shrink-0"
                    >
                      Supprimer
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Statut */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Statut
          </label>
          <select
            value={editing.status}
            onChange={(e) => setEditing({ ...editing, status: e.target.value })}
            className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          >
            <option value="draft">Brouillon (non visible)</option>
            <option value="published">Publié (visible par les spécialités sélectionnées)</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default LessonManager