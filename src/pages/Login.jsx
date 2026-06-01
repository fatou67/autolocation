import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email ou mot de passe incorrect')
    } else {
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#060c1a] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-3">
            <Car size={24} className="text-white" />
          </div>
          <h1 className="text-white text-xl font-bold">AutoLocation</h1>
          <p className="text-gray-500 text-sm mt-1">Connectez-vous à votre espace</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="bg-[#111e35] border border-[#1e2d45] rounded-lg p-6">
          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded px-3 py-2 text-red-400 text-xs mb-4">
              {error}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-400 text-xs mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@autolocation.com"
              required
              className="w-full bg-[#0d1526] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 text-xs mb-1">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#0d1526] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}