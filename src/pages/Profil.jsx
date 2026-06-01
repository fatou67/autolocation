import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { User, Mail, Lock, Save } from 'lucide-react'

export default function Profil() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [formEmail, setFormEmail] = useState('')
  const [formPassword, setFormPassword] = useState('')
  const [formConfirm, setFormConfirm] = useState('')

  useEffect(() => {
    if (user) setFormEmail(user.email || '')
  }, [user])

  const handleUpdateEmail = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    const { error } = await supabase.auth.updateUser({ email: formEmail })
    if (error) {
      setError('Erreur : ' + error.message)
    } else {
      setSuccess('Email mis à jour avec succès !')
    }
    setLoading(false)
  }

  const handleUpdatePassword = async () => {
    setError('')
    setSuccess('')
    if (formPassword !== formConfirm) {
      setError('Les mots de passe ne correspondent pas !')
      return
    }
    if (formPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères !')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: formPassword })
    if (error) {
      setError('Erreur : ' + error.message)
    } else {
      setSuccess('Mot de passe mis à jour avec succès !')
      setFormPassword('')
      setFormConfirm('')
    }
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-xl">
      <div className="mb-6">
        <h1 className="text-white text-xl font-bold">Profil Admin</h1>
        <p className="text-gray-400 text-xs mt-1">Gérez vos informations de connexion</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 bg-[#111e35] border border-[#1e2d45] rounded-lg p-5 mb-5">
        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <User size={32} className="text-white" />
        </div>
        <div>
          <p className="text-white font-semibold text-sm">{user?.email}</p>
          <p className="text-gray-500 text-xs mt-1">Administrateur</p>
          <p className="text-gray-600 text-xs mt-1">
            Compte créé le {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}
          </p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-900/30 border border-red-700/50 rounded px-4 py-2 text-red-400 text-xs mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-900/30 border border-green-700/50 rounded px-4 py-2 text-green-400 text-xs mb-4">
          {success}
        </div>
      )}

      {/* Modifier email */}
      <div className="bg-[#111e35] border border-[#1e2d45] rounded-lg p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Mail size={16} className="text-blue-400" />
          <h2 className="text-white font-semibold text-sm">Modifier l'email</h2>
        </div>
        <div className="mb-4">
          <label className="block text-gray-400 text-xs mb-1">Nouvel email</label>
          <input
            type="email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
            className="w-full bg-[#0d1526] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
          />
        </div>
        <button
          onClick={handleUpdateEmail}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Save size={14} /> Mettre à jour l'email
        </button>
      </div>

      {/* Modifier mot de passe */}
      <div className="bg-[#111e35] border border-[#1e2d45] rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={16} className="text-orange-400" />
          <h2 className="text-white font-semibold text-sm">Modifier le mot de passe</h2>
        </div>
        <div className="mb-3">
          <label className="block text-gray-400 text-xs mb-1">Nouveau mot de passe</label>
          <input
            type="password"
            value={formPassword}
            onChange={(e) => setFormPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-[#0d1526] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-400 text-xs mb-1">Confirmer le mot de passe</label>
          <input
            type="password"
            value={formConfirm}
            onChange={(e) => setFormConfirm(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-[#0d1526] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
          />
        </div>
        <button
          onClick={handleUpdatePassword}
          disabled={loading}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Save size={14} /> Mettre à jour le mot de passe
        </button>
      </div>
    </div>
  )
}