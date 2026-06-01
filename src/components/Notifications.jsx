import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Notifications() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    async function fetchExpiring() {
      const today = new Date()
      const in3days = new Date()
      in3days.setDate(today.getDate() + 3)

      const { data } = await supabase
        .from('locations')
        .select('*, clients(prenom, nom), vehicules(marque, modele)')
        .eq('statut', 'en_cours')
        .lte('date_fin', in3days.toISOString().split('T')[0])
        .gte('date_fin', today.toISOString().split('T')[0])

      setNotifications(data || [])
    }
    fetchExpiring()
  }, [])

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—'

  const getDaysLeft = (date_fin) => {
    const today = new Date()
    const fin = new Date(date_fin)
    const diff = Math.ceil((fin - today) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Aujourd\'hui !'
    if (diff === 1) return 'Demain'
    return `Dans ${diff} jours`
  }

  const getUrgencyColor = (date_fin) => {
    const today = new Date()
    const fin = new Date(date_fin)
    const diff = Math.ceil((fin - today) / (1000 * 60 * 60 * 24))
    if (diff <= 0) return 'text-red-400'
    if (diff === 1) return 'text-orange-400'
    return 'text-yellow-400'
  }

  return (
    <div className="relative">
      {/* Bouton cloche */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:bg-[#1a2745] hover:text-white transition-colors w-full border-b border-[#1e2d45]"
      >
        <Bell size={16} />
        <span>Notifications</span>
        {notifications.length > 0 && (
          <span className="ml-auto bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Overlay pour fermer */}
          <div
            className="fixed inset-0 z-[99]"
            onClick={() => setOpen(false)}
          />
          <div className="fixed left-44 top-auto w-72 bg-[#111e35] border border-[#1e2d45] rounded-lg shadow-2xl z-[100]">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e2d45]">
              <h3 className="text-white text-sm font-semibold">Locations qui expirent</h3>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
                <X size={14} />
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-gray-600 text-sm">
                ✅ Aucune location n'expire bientôt
              </div>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className="px-4 py-3 border-b border-[#1e2d45] hover:bg-[#1a2745] transition-colors">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white text-xs font-medium">
                        {n.clients?.prenom} {n.clients?.nom}
                      </p>
                      <span className={`text-xs font-bold ${getUrgencyColor(n.date_fin)}`}>
                        {getDaysLeft(n.date_fin)}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs">
                      {n.vehicules?.marque} {n.vehicules?.modele}
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                      Fin le {formatDate(n.date_fin)} — {n.montant_total}£
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}