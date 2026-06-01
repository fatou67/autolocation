import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Home from './pages/Home'
import Vehicules from './pages/Vehicules'
import Clients from './pages/Clients'
import Locations from './pages/Locations'
import Statistiques from './pages/Statistiques'
import Calendrier from './pages/Calendrier'
import Profil from './pages/Profil'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="vehicules" element={<Vehicules />} />
            <Route path="clients" element={<Clients />} />
            <Route path="locations" element={<Locations />} />
            <Route path="statistiques" element={<Statistiques />} />
            <Route path="calendrier" element={<Calendrier />} />
            <Route path="profil" element={<Profil />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}