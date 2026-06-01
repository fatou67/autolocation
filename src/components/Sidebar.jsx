import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Menu, X } from 'lucide-react'
import Notifications from './Notifications'

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/vehicules', label: 'Véhicules' },
  { to: '/clients', label: 'Clients' },
  { to: '/locations', label: 'Locations' },
  { to: '/statistiques', label: 'Statistiques' },
  { to: '/calendrier', label: 'Calendrier' },
   { to: '/profil', label: '👤 Profil' },
]

export default function Sidebar() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <>
      {/* Bouton hamburger mobile */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 bg-[#0a0f1e] border border-[#1e2d45] p-2 rounded"
      >
        <Menu size={20} className="text-white" />
      </button>

      {/* Overlay mobile */}
      {open && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static top-0 left-0 z-50
        w-44 bg-[#0a0f1e] flex flex-col flex-shrink-0 h-screen
        transform transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#1e2d45]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs">🚗</span>
            </div>
            <span className="text-white text-xs font-semibold">AutoLocation</span>
          </div>
          <button onClick={() => setOpen(false)} className="md:hidden text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex flex-col flex-1 overflow-y-auto">
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `px-6 py-3 text-sm border-b border-[#1e2d45] transition-colors text-center ` +
                (isActive
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-400 hover:bg-[#1a2745] hover:text-white')
              }
            >
              {label}
            </NavLink>
          ))}

          {/* Notifications */}
          <Notifications />
        </nav>

        {/* Déconnexion tout en bas */}
        <button
          onClick={handleLogout}
          className="w-full px-6 py-4 text-sm text-gray-400 hover:bg-[#1a2745] hover:text-white border-t border-[#1e2d45] transition-colors text-center"
        >
          Déconnexion
        </button>
      </aside>
    </>
  )
}