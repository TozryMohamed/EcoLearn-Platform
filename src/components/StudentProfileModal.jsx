// src/components/StudentProfileModal.jsx
import { useEffect, useState } from 'react'
import {
  X, Mail, Calendar, Shield, ShieldCheck, ShieldOff,
  Trash2, User, CheckCircle2, AlertCircle, Clock
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { supabase } from '../supabaseClient'

const StudentProfileModal = ({ student, onClose, onUpdate }) => {
  const [fullName, setFullName] = useState(student.full_name || '')
  const [saving, setSaving] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  // Bloquer le scroll du body quand la modal est ouverte
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [])

  // Fermer avec la touche Échap
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
  }

  const handleToggleStatus = async () => {
    setSaving(true)
    const newStatus = student.account_status === 'active' ? 'disabled' : 'active'
    const { error } = await supabase
      .from('profiles')
      .update({ account_status: newStatus })
      .eq('id', student.id)

    if (error) {
      alert('Erreur: ' + error.message)
      setSaving(false)
    } else {
      onUpdate({ ...student, account_status: newStatus })
      onClose()
    }
  }

  const handleSaveName = async () => {
    if (!fullName.trim()) {
      alert('Le nom ne peut pas être vide.')
      return
    }
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName })
      .eq('id', student.id)

    if (error) {
      alert('Erreur: ' + error.message)
      setSaving(false)
    } else {
      onUpdate({ ...student, full_name: fullName })
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', student.id)

    if (error) {
      alert('Erreur: ' + error.message)
      setSaving(false)
    } else {
      onUpdate(null, student.id)
      onClose()
    }
  }

  const statusStyles = {
    active: {
      bg: 'bg-green-50',
      text: 'text-green-700',
      border: 'border-green-200',
      icon: ShieldCheck,
      label: 'Compte actif',
      description: "L'étudiant peut accéder à toutes les leçons.",
    },
    pending: {
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      border: 'border-orange-200',
      icon: Clock,
      label: 'En attente de validation',
      description: "L'étudiant ne peut pas encore accéder aux leçons.",
    },
    disabled: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: ShieldOff,
      label: 'Compte désactivé',
      description: "L'accès de l'étudiant est bloqué.",
    },
  }

  const status = statusStyles[student.account_status] || statusStyles.pending
  const StatusIcon = status.icon

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête avec avatar */}
        <div className="relative p-6 pb-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg">
              {getInitials(student.full_name)}
            </div>

            <div className="flex-1 min-w-0 pt-1">
              <h2 className="text-xl font-bold text-gray-900 truncate">
                {student.full_name}
              </h2>
              <p className="text-sm text-gray-500 truncate flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                {student.email}
              </p>
            </div>
          </div>
        </div>

        {/* Bandeau statut */}
        <div className="px-6 pt-4">
          <div className={`flex items-start gap-3 p-3 rounded-xl border ${status.bg} ${status.border}`}>
            <StatusIcon className={`w-5 h-5 ${status.text} flex-shrink-0 mt-0.5`} />
            <div className="min-w-0">
              <p className={`text-sm font-semibold ${status.text}`}>
                {status.label}
              </p>
              <p className={`text-xs ${status.text} opacity-80 mt-0.5`}>
                {status.description}
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nom complet
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                value={student.email}
                disabled
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              L'email ne peut pas être modifié ici.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Rôle
              </label>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">
                  {student.role === 'student' ? 'Étudiant' : 'Professeur'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Inscription
              </label>
              <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700 truncate">
                  {format(new Date(student.created_at), 'd MMM yyyy', { locale: fr })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pied de page avec actions */}
        <div className="px-6 pb-6 pt-2 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between border-t border-gray-100">

          {!showConfirmDelete ? (
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="flex items-center justify-center gap-2 text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition order-2 sm:order-1"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          ) : (
            <div className="flex items-center gap-2 order-2 sm:order-1">
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex items-center gap-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg transition disabled:opacity-50"
              >
                <AlertCircle className="w-4 h-4" />
                Confirmer
              </button>
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="text-sm font-medium text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg transition"
              >
                Annuler
              </button>
            </div>
          )}

          <div className="flex gap-2 order-1 sm:order-2">
            <button
              onClick={handleToggleStatus}
              disabled={saving}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50 ${
                student.account_status === 'active'
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {student.account_status === 'active' ? (
                <>
                  <ShieldOff className="w-4 h-4" />
                  Désactiver
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Activer
                </>
              )}
            </button>

            {fullName !== student.full_name && (
              <button
                onClick={handleSaveName}
                disabled={saving}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition disabled:opacity-50"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoom-in-95 {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-in { animation: fade-in 0.15s ease-out; }
        .zoom-in-95 { animation: zoom-in-95 0.15s ease-out; }
      `}</style>
    </div>
  )
}

export default StudentProfileModal