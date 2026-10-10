// src/pages/Home.jsx
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center px-4">
      <h1 className="text-5xl font-extrabold text-green-600 mb-4">EcoLearn</h1>
      <p className="text-xl text-gray-600 max-w-2xl mb-8">
        La plateforme d'apprentissage dédiée à un seul professeur et ses étudiants. 
        Accédez à vos cours, vidéos et documents en toute simplicité.
      </p>
      <div className="flex gap-4">
        <Link to="/login" className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition">
          Se connecter
        </Link>
        <Link to="/register" className="bg-white text-green-600 border border-green-600 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition">
          Créer un compte étudiant
        </Link>
      </div>
    </div>
  )
}
export default Home