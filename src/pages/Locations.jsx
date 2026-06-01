import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import ContratPDF from '../components/ContratPDF'

const STATUS_MAP = {
  en_cours: { label: 'En cours', variant: 'info' },
  terminee: { label: 'Terminée', variant: 'success' },
  annulee: { label: 'Annulée', variant: 'danger' },
  reservee: { label: 'Réservée', variant: 'warning' },
}

const empty = {
  client_id: '', vehicule_id: '',
  date_debut: '', date_fin: '',
  montant_total: '', statut: 'en_cours', notes: ''
}

export default function Locations() {
  const [locations, setLocations] = useState([])
  const [clients, setClients] = useState([])
  const [vehicules, setVehicules] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    const [{ data: locs }, { data: cls }, { data: vehs }] = await Promise.all([
      supabase.from('locations')
        .select('*, clients(prenom, nom, email, telephone, permis_numero), vehicules(marque, modele, immatriculation, tarif_journalier)')
        .order('created_at', { ascending: false }),
      supabase.from('clients').select('id, prenom, nom').eq('actif', true),
      supabase.from('vehicules').select('id, marque, modele, immatriculation, tarif_journalier'),
    ])
    setLocations(locs || [])
    setClients(cls || [])
    setVehicules(vehs || [])
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  useEffect(() => {
    if (form.date_debut && form.date_fin && form.vehicule_id) {
      const v = vehicules.find((v) => v.id === form.vehicule_id)
      if (v) {
        const days = Math.max(1, Math.ceil(
          (new Date(form.date_fin) - new Date(form.date_debut)) / (1000 * 60 * 60 * 24)
        ))
        setForm((f) => ({ ...f, montant_total: days * v.tarif_journalier }))
      }
    }
  }, [form.date_debut, form.date_fin, form.vehicule_id])

  const openAdd = () => { setEditing(null); setForm(empty); setModalOpen(true) }
  const openEdit = (l) => { setEditing(l); setForm({ ...l }); setModalOpen(true) }

  const handleSave = async () => {
    setSaving(true)
    const payload = {
      client_id: form.client_id,
      vehicule_id: form.vehicule_id,
      date_debut: form.date_debut,
      date_fin: form.date_fin,
      montant_total: form.montant_total,
      statut: form.statut,
      notes: form.notes,
    }
    if (editing) {
      await supabase.from('locations').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('locations').insert(payload)
    }
    setSaving(false)
    setModalOpen(false)
    fetchAll()
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette location ?')) return
    await supabase.from('locations').delete().eq('id', id)
    fetchAll()
  }

  const filtered = locations.filter((l) => {
    const clientName = `${l.clients?.prenom || ''} ${l.clients?.nom || ''}`.toLowerCase()
    const vehicule = `${l.vehicules?.marque || ''} ${l.vehicules?.modele || ''} ${l.vehicules?.immatriculation || ''}`.toLowerCase()
    return (clientName + vehicule).includes(search.toLowerCase())
  })

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—'

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-xl font-bold">Locations</h1>
          <p className="text-gray-400 text-xs mt-1">Gérez vos contrats de location</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Nouvelle location
        </button>
      </div>

      <div className="flex items-center gap-2 bg-[#111e35] border border-[#1e2d45] rounded px-3 py-2 mb-5 max-w-xs">
        <Search size={14} className="text-gray-500" />
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-white text-sm outline-none placeholder-gray-600 w-full"
        />
      </div>

      <div className="bg-[#111e35] border border-[#1e2d45] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2d45]">
              {['Client', 'Véhicule', 'Début', 'Fin', 'Montant', 'Statut', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 text-xs font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-600">Chargement…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-600">Aucune location trouvée</td></tr>
            ) : (
              filtered.map((l) => {
                const s = STATUS_MAP[l.statut] || { label: l.statut, variant: 'gray' }
                return (
                  <tr key={l.id} className="border-b border-[#1e2d45] hover:bg-[#1a2745] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-400 text-xs font-bold">
                            {(l.clients?.prenom?.[0] || '') + (l.clients?.nom?.[0] || '')}
                          </span>
                        </div>
                        <span className="text-white">{l.clients?.prenom} {l.clients?.nom}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-300">{l.vehicules?.marque} {l.vehicules?.modele}</span>
                      <br /><span className="text-gray-600 text-xs">{l.vehicules?.immatriculation}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{formatDate(l.date_debut)}</td>
                    <td className="px-4 py-3 text-gray-300">{formatDate(l.date_fin)}</td>
                    <td className="px-4 py-3 text-green-400 font-medium">{l.montant_total}£</td>
                    <td className="px-4 py-3"><Badge label={s.label} variant={s.variant} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(l)} className="text-gray-400 hover:text-blue-400 transition-colors p-1">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(l.id)} className="text-gray-400 hover:text-red-400 transition-colors p-1">
                          <Trash2 size={14} />
                        </button>
                        <ContratPDF location={l} />
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier la location' : 'Nouvelle location'}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-400 text-xs mb-1">Client</label>
            <select
              value={form.client_id}
              onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              className="w-full bg-[#0d1526] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
            >
              <option value="">Sélectionner…</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Véhicule</label>
            <select
              value={form.vehicule_id}
              onChange={(e) => setForm({ ...form, vehicule_id: e.target.value })}
              className="w-full bg-[#0d1526] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
            >
              <option value="">Sélectionner…</option>
              {vehicules.map((v) => (
                <option key={v.id} value={v.id}>{v.marque} {v.modele} — {v.immatriculation}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Date de début</label>
            <input
              type="date"
              value={form.date_debut}
              onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
              className="w-full bg-[#0d1526] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Date de fin</label>
            <input
              type="date"
              value={form.date_fin}
              onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
              className="w-full bg-[#0d1526] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Montant total (£)</label>
            <input
              type="number"
              value={form.montant_total}
              onChange={(e) => setForm({ ...form, montant_total: e.target.value })}
              placeholder="Calculé automatiquement"
              className="w-full bg-[#0d1526] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1">Statut</label>
            <select
              value={form.statut}
              onChange={(e) => setForm({ ...form, statut: e.target.value })}
              className="w-full bg-[#0d1526] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
            >
              {Object.entries(STATUS_MAP).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-gray-400 text-xs mb-1">Notes</label>
          <textarea
            value={form.notes || ''}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={2}
            placeholder="Remarques sur la location..."
            className="w-full bg-[#0d1526] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-600 resize-none"
          />
        </div>
        <div className="flex gap-3 justify-end mt-5">
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </Modal>
    </div>
  )
}