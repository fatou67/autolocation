import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Modal from '../components/Modal'
import Badge from '../components/Badge'

const empty = { nom: '', prenom: '', email: '', telephone: '', adresse: '', permis_numero: '', actif: true }

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)

  const fetchClients = async () => {
    setLoading(true)
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchClients() }, [])

  const openAdd = () => { setEditing(null); setForm(empty); setModalOpen(true) }
  const openEdit = (c) => { setEditing(c); setForm({ ...c }); setModalOpen(true) }

  const handleSave = async () => {
    setSaving(true)
    if (editing) {
      await supabase.from('clients').update(form).eq('id', editing.id)
    } else {
      await supabase.from('clients').insert(form)
    }
    setSaving(false)
    setModalOpen(false)
    fetchClients()
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce client ?')) return
    await supabase.from('clients').delete().eq('id', id)
    fetchClients()
  }

  const filtered = clients.filter((c) =>
    `${c.nom} ${c.prenom} ${c.email} ${c.telephone}`.toLowerCase().includes(search.toLowerCase())
  )

  const initials = (c) => `${c.prenom?.[0] || ''}${c.nom?.[0] || ''}`.toUpperCase()
  const avatarColors = ['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-orange-600', 'bg-red-600', 'bg-teal-600']
  const getColor = (i) => avatarColors[i % avatarColors.length]

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-xl font-bold">Clients</h1>
          <p className="text-gray-400 text-xs mt-1">Gérez vos clients et leurs informations</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Ajouter
        </button>
      </div>

      <div className="flex items-center gap-2 bg-[#111e35] border border-[#1e2d45] rounded px-3 py-2 mb-5 max-w-xs">
        <Search size={14} className="text-gray-500" />
        <input
          type="text"
          placeholder="Rechercher un client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-white text-sm outline-none placeholder-gray-600 w-full"
        />
      </div>

      <div className="bg-[#111e35] border border-[#1e2d45] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2d45]">
              {['Client', 'Email', 'Téléphone', 'N° Permis', 'Statut', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 text-xs font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-600">Chargement…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-600">Aucun client trouvé</td></tr>
            ) : (
              filtered.map((c, i) => (
                <tr key={c.id} className="border-b border-[#1e2d45] hover:bg-[#1a2745] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${getColor(i)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {initials(c)}
                      </div>
                      <span className="text-white font-medium">{c.prenom} {c.nom}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{c.email}</td>
                  <td className="px-4 py-3 text-gray-300">{c.telephone}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{c.permis_numero || '—'}</td>
                  <td className="px-4 py-3">
                    <Badge label={c.actif ? 'Actif' : 'Inactif'} variant={c.actif ? 'success' : 'gray'} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(c)} className="text-gray-400 hover:text-blue-400 transition-colors p-1">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="text-gray-400 hover:text-red-400 transition-colors p-1">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le client' : 'Nouveau client'}>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'prenom', label: 'Prénom', placeholder: 'Mohamed' },
            { key: 'nom', label: 'Nom', placeholder: 'Dupont' },
            { key: 'email', label: 'Email', placeholder: 'client@email.com' },
            { key: 'telephone', label: 'Téléphone', placeholder: '+33 6 00 00 00 00' },
            { key: 'permis_numero', label: 'N° Permis', placeholder: 'AB123456' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-gray-400 text-xs mb-1">{label}</label>
              <input
                type="text"
                value={form[key] || ''}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                className="w-full bg-[#0d1526] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
              />
            </div>
          ))}
          <div>
            <label className="block text-gray-400 text-xs mb-1">Statut</label>
            <select
              value={form.actif ? 'true' : 'false'}
              onChange={(e) => setForm({ ...form, actif: e.target.value === 'true' })}
              className="w-full bg-[#0d1526] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
            >
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-gray-400 text-xs mb-1">Adresse</label>
          <input
            type="text"
            value={form.adresse || ''}
            onChange={(e) => setForm({ ...form, adresse: e.target.value })}
            placeholder="123 rue de la Paix, Paris"
            className="w-full bg-[#0d1526] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
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