// src/pages/Register.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, GraduationCap, Check } from 'lucide-react'
import { supabase } from '../supabaseClient'

// Liste des niveaux disponibles
const LEVELS = [
  {
    value: '2eme_economie_services',
    label: '2ème année',
    subtitle: 'Économie et Services',
    emoji: '📘',
  },
  {
    value: '3eme_economie_gestion',
    label: '3ème année',
    subtitle: 'Économie et Gestion',
    emoji: '📗',
  },
  {
    value: '4eme_economie_gestion',
    label: '4ème année',
    subtitle: 'Économie et Gestion',
    emoji: '📕',
  },
]

const Register = () => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [level, setLevel] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!level) {
      setError('Veuillez sélectionner votre niveau.')
      return
    }

    setLoading(true)

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          level: level, // ⬅️ niveau envoyé au trigger
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      navigate('/pending')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 px-4 py-8">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">

        {/* ===== En-tête ===== */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            Inscription Étudiant
          </h2>
          <p className="text-gray-500 text-sm">
            Votre compte sera validé par le professeur.
          </p>
        </div>

        {/* ===== Erreur ===== */}
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-5 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">

          {/* Nom complet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nom complet
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Ahmed Ben Ali"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Adresse email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="6 caractères minimum"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
              />
            </div>
          </div>

          {/* ⬇️ NOUVEAU : Sélecteur de niveau ⬇️ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Votre niveau <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {LEVELS.map((lvl) => {
                const isSelected = level === lvl.value
                return (
                  <button
                    type="button"
                    key={lvl.value}
                    onClick={() => setLevel(lvl.value)}
                    className={`relative p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-green-500 bg-green-50 shadow-sm'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {/* Coche si sélectionné */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}

                    <div className="text-2xl mb-1">{lvl.emoji}</div>
                    <p className={`text-sm font-bold ${isSelected ? 'text-green-700' : 'text-gray-800'}`}>
                      {lvl.label}
                    </p>
                    <p className={`text-xs ${isSelected ? 'text-green-600' : 'text-gray-500'}`}>
                      {lvl.subtitle}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Bouton d'inscription */}
          <button
            type="submit"
            disabled={loading || !level}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Inscription en cours...
              </>
            ) : (
              "Créer mon compte"
            )}
          </button>
        </form>

        {/* Lien vers login */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Déjà un compte ?{' '}
          <Link to="/login" className="text-green-600 font-semibold hover:underline">
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register