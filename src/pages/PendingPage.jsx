// src/pages/PendingPage.jsx
import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Hourglass, ArrowRight, CheckCircle2 } from 'lucide-react'

const REDIRECT_DELAY = 4 // secondes

const PendingPage = () => {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(REDIRECT_DELAY)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Compte à rebours seconde par seconde
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Barre de progression fluide
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 100 / (REDIRECT_DELAY * 20), 100))
    }, 50)

    // Redirection automatique
    const redirectTimer = setTimeout(() => {
      navigate('/login', { replace: true })
    }, REDIRECT_DELAY * 1000)

    // Nettoyage
    return () => {
      clearInterval(countdownInterval)
      clearInterval(progressInterval)
      clearTimeout(redirectTimer)
    }
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">

        {/* Barre de progression en haut */}
        <div className="h-1.5 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-8 text-center">
          {/* Icône sablier */}
          <div className="relative w-20 h-20 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 animate-pulse" />
            <div className="relative w-full h-full flex items-center justify-center">
              <Hourglass className="w-10 h-10 text-amber-500" />
            </div>
          </div>

          {/* Titre */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Compte en attente
          </h2>

          {/* Message */}
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            Votre compte a bien été créé. Il doit maintenant être <strong className="text-gray-800">validé par le professeur</strong> avant que vous puissiez accéder aux leçons.
          </p>

          {/* Compte à rebours */}
          <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-medium mb-6">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold animate-pulse">
              {countdown}
            </div>
            Redirection vers la connexion...
          </div>

          {/* Étapes suivantes */}
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 mb-6">
            <div className="flex items-start gap-2 text-xs text-gray-600">
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Votre inscription a été enregistrée</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-600">
              <Hourglass className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <span>En attente de validation par le professeur</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-gray-600">
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <span>Vous pourrez vous connecter dès que votre compte sera activé</span>
            </div>
          </div>

          {/* Bouton manuel (au cas où l'utilisateur veut aller plus vite) */}
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition shadow-md"
          >
            Aller à la connexion maintenant
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PendingPage