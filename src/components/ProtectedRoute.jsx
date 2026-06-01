import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060c1a] flex items-center justify-center">
        <div className="text-gray-500 text-sm">Chargement…</div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}