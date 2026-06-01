import { useState, useEffect } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import { supabase } from '../lib/supabase'

const STATUS_COLORS = {
  en_cours: '#2563eb',
  terminee: '#16a34a',
  annulee: '#dc2626',
  reservee: '#ea580c',
}

export default function Calendrier() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    async function fetchLocations() {
      const { data } = await supabase
        .from('locations')
        .select('*, clients(prenom, nom), vehicules(marque, modele)')

      const calEvents = data?.map((l) => ({
        id: l.id,
        title: `${l.clients?.prenom || ''} ${l.clients?.nom || ''} — ${l.vehicules?.marque || ''} ${l.vehicules?.modele || ''}`,
        start: l.date_debut,
        end: l.date_fin,
        backgroundColor: STATUS_COLORS[l.statut] || '#2563eb',
        borderColor: STATUS_COLORS[l.statut] || '#2563eb',
        extendedProps: { ...l },
      })) || []

      setEvents(calEvents)
      setLoading(false)
    }
    fetchLocations()
  }, [])

  const handleEventClick = (info) => {
    setSelected(info.event.extendedProps)
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—'

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-white text-xl font-bold">Calendrier</h1>
        <p className="text-gray-400 text-xs mt-1">Vue calendrier de toutes vos locations</p>
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 mb-5">
        {Object.entries(STATUS_COLORS).map(([statut, color]) => (
          <div key={statut} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            <span className="text-gray-400 text-xs capitalize">{statut.replace('_', ' ')}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Calendrier */}
        <div className="lg:col-span-2 bg-[#111e35] border border-[#1e2d45] rounded-lg p-4">
          {loading ? (
            <div className="text-center text-gray-600 py-20">Chargement…</div>
          ) : (
            <style>{`
              .fc { color: #fff; }
              .fc-toolbar-title { color: #fff; font-size: 16px; }
              .fc-button { background: #1e2d45 !important; border-color: #1e2d45 !important; color: #fff !important; }
              .fc-button:hover { background: #2563eb !important; }
              .fc-button-active { background: #2563eb !important; }
              .fc-daygrid-day { background: #0d1526; }
              .fc-daygrid-day:hover { background: #1a2745; }
              .fc-col-header-cell { background: #111e35; color: #64748b; }
              .fc-scrollgrid { border-color: #1e2d45 !important; }
              .fc-scrollgrid td, .fc-scrollgrid th { border-color: #1e2d45 !important; }
              .fc-day-today { background: #1a2745 !important; }
              .fc-event { cursor: pointer; border-radius: 4px; font-size: 11px; }
              .fc-daygrid-day-number { color: #94a3b8; }
            `}</style>
          )}
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            eventClick={handleEventClick}
            locale="fr"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,dayGridWeek'
            }}
            height={500}
          />
        </div>

        {/* Détail location sélectionnée */}
        <div className="bg-[#111e35] border border-[#1e2d45] rounded-lg p-4">
          <h2 className="text-white font-semibold text-sm mb-4">
            {selected ? 'Détails de la location' : 'Cliquez sur une location'}
          </h2>

          {!selected ? (
            <div className="text-center text-gray-600 py-10 text-sm">
              Sélectionnez une location sur le calendrier pour voir les détails
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="bg-[#0d1526] rounded p-3">
                <p className="text-gray-500 text-xs mb-1">Client</p>
                <p className="text-white text-sm font-medium">
                  {selected.clients?.prenom} {selected.clients?.nom}
                </p>
              </div>
              <div className="bg-[#0d1526] rounded p-3">
                <p className="text-gray-500 text-xs mb-1">Véhicule</p>
                <p className="text-white text-sm font-medium">
                  {selected.vehicules?.marque} {selected.vehicules?.modele}
                </p>
              </div>
              <div className="bg-[#0d1526] rounded p-3">
                <p className="text-gray-500 text-xs mb-1">Période</p>
                <p className="text-white text-sm font-medium">
                  {formatDate(selected.date_debut)} → {formatDate(selected.date_fin)}
                </p>
              </div>
              <div className="bg-[#0d1526] rounded p-3">
                <p className="text-gray-500 text-xs mb-1">Montant</p>
                <p className="text-green-400 text-sm font-bold">{selected.montant_total}£</p>
              </div>
              <div className="bg-[#0d1526] rounded p-3">
                <p className="text-gray-500 text-xs mb-1">Statut</p>
                <div
                  className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white"
                  style={{ background: STATUS_COLORS[selected.statut] }}
                >
                  {selected.statut?.replace('_', ' ')}
                </div>
              </div>
              {selected.notes && (
                <div className="bg-[#0d1526] rounded p-3">
                  <p className="text-gray-500 text-xs mb-1">Notes</p>
                  <p className="text-gray-300 text-sm">{selected.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}