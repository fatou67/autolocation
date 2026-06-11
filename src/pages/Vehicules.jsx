import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Car, Search, X, Image } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Modal from '../components/Modal'
import Badge from '../components/Badge'

const STATUS_MAP = {
  disponible: { label: 'Disponible', variant: 'success' },
  loue: { label: 'Loué', variant: 'info' },
  maintenance: { label: 'Maintenance', variant: 'warning' },
  hors_service: { label: 'Hors service', variant: 'danger' },
}

const empty = { marque: '', modele: '', annee: '', immatriculation: '', statut: 'disponible', tarif_journalier: '', description: '', photo_url: '' }

export default function Vehicules() {
  const [vehicules, setVehicules] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [photosModalOpen, setPhotosModalOpen] = useState(false)
  const [selectedVehicule, setSelectedVehicule] = useState(null)
  const [photos, setPhotos] = useState([])
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [newPhotoFile, setNewPhotoFile] = useState(null)

  const fetchVehicules = async () => {
    setLoading(true)
    const { data } = await supabase.from('vehicules').select('*').order('created_at', { ascending: false })
    setVehicules(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchVehicules() }, [])

  const fetchPhotos = async (vehiculeId) => {
    const { data } = await supabase
      .from('photos_vehicules')
      .select('*')
      .eq('vehicule_id', vehiculeId)
      .order('created_at', { ascending: false })
    setPhotos(data || [])
  }

  const openAdd = () => {
    setEditing(null)
    setForm(empty)
    setPhotoFile(null)
    setPhotoPreview(null)
    setModalOpen(true)
  }

  const openEdit = (v) => {
    setEditing(v)
    setForm({ ...v })
    setPhotoFile(null)
    setPhotoPreview(v.photo_url || null)
    setModalOpen(true)
  }

  const openPhotos = async (v) => {
    setSelectedVehicule(v)
    await fetchPhotos(v.id)
    setPhotosModalOpen(true)
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhotoFile(file)
      setPhotoPreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    let photo_url = form.photo_url || null

    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const fileName = `${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('vehicules').upload(fileName, photoFile)
      if (!error) {
        const { data: urlData } = supabase.storage.from('vehicules').getPublicUrl(fileName)
        photo_url = urlData.publicUrl
      }
    }

    const payload = { ...form, photo_url }
    if (editing) {
      await supabase.from('vehicules').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('vehicules').insert(payload)
    }

    setSaving(false)
    setModalOpen(false)
    setPhotoFile(null)
    setPhotoPreview(null)
    fetchVehicules()
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce véhicule ?')) return
    await supabase.from('vehicules').delete().eq('id', id)
    fetchVehicules()
  }

  const handleAddPhoto = async () => {
    if (!newPhotoFile || !selectedVehicule) return
    setUploadingPhoto(true)

    const ext = newPhotoFile.name.split('.').pop()
    const fileName = `${selectedVehicule.id}_${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('vehicules').upload(fileName, newPhotoFile)

    if (!error) {
      const { data: urlData } = supabase.storage.from('vehicules').getPublicUrl(fileName)
      await supabase.from('photos_vehicules').insert({
        vehicule_id: selectedVehicule.id,
        url: urlData.publicUrl,
      })
      await fetchPhotos(selectedVehicule.id)
      setNewPhotoFile(null)
    }
    setUploadingPhoto(false)
  }

  const handleDeletePhoto = async (photoId) => {
    if (!confirm('Supprimer cette photo ?')) return
    await supabase.from('photos_vehicules').delete().eq('id', photoId)
    await fetchPhotos(selectedVehicule.id)
  }

  const filtered = vehicules.filter((v) =>
    `${v.marque} ${v.modele} ${v.immatriculation}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-white text-xl font-bold">Véhicules</h1>
          <p className="text-gray-400 text-xs mt-1">Gérez votre flotte de véhicules</p>
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
          placeholder="Rechercher un véhicule..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-white text-sm outline-none placeholder-gray-600 w-full"
        />
      </div>

      <div className="bg-[#111e35] border border-[#1e2d45] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e2d45]">
              {['Photo', 'Véhicule', 'Immatriculation', 'Année', 'Tarif/jour', 'Statut', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-gray-500 text-xs font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-600">Chargement…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-600">Aucun véhicule trouvé</td></tr>
            ) : (
              filtered.map((v) => {
                const s = STATUS_MAP[v.statut] || { label: v.statut, variant: 'gray' }
                return (
                  <tr key={v.id} className="border-b border-[#1e2d45] hover:bg-[#1a2745] transition-colors">
                    <td className="px-4 py-3">
                      {v.photo_url ? (
                        <img src={v.photo_url} alt={v.marque} className="w-12 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-10 bg-[#1e2d45] rounded flex items-center justify-center">
                          <Car size={16} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white font-medium">{v.marque} {v.modele}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{v.immatriculation}</td>
                    <td className="px-4 py-3 text-gray-300">{v.annee}</td>
                    <td className="px-4 py-3 text-green-400 font-medium">{v.tarif_journalier}£/j</td>
                    <td className="px-4 py-3"><Badge label={s.label} variant={s.variant} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(v)} className="text-gray-400 hover:text-blue-400 transition-colors p-1">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(v.id)} className="text-gray-400 hover:text-red-400 transition-colors p-1">
                          <Trash2 size={14} />
                        </button>
                        <button onClick={() => openPhotos(v)} className="text-gray-400 hover:text-purple-400 transition-colors p-1" title="Galerie photos">
                          <Image size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le véhicule' : 'Nouveau véhicule'}>
        <div className="grid grid-cols-2 gap-4">
          {[
            { key: 'marque', label: 'Marque', placeholder: 'Toyota' },
            { key: 'modele', label: 'Modèle', placeholder: 'Corolla' },
            { key: 'annee', label: 'Année', placeholder: '2023' },
            { key: 'immatriculation', label: 'Immatriculation', placeholder: 'AB-123-CD' },
            { key: 'tarif_journalier', label: 'Tarif/jour (£)', placeholder: '50' },
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
              value={form.statut || 'disponible'}
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
          <label className="block text-gray-400 text-xs mb-1">Photo principale</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full bg-[#0d1526] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm outline-none"
          />
          {photoPreview && (
            <img src={photoPreview} alt="Preview" className="mt-2 w-full h-32 object-cover rounded border border-[#1e2d45]" />
          )}
        </div>

        <div className="mt-4">
          <label className="block text-gray-400 text-xs mb-1">Description</label>
          <textarea
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            placeholder="Informations supplémentaires..."
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

      <Modal isOpen={photosModalOpen} onClose={() => setPhotosModalOpen(false)} title={`Photos — ${selectedVehicule?.marque} ${selectedVehicule?.modele}`}>
        <div className="mb-4">
          <label className="block text-gray-400 text-xs mb-1">Ajouter une photo</label>
          <div className="flex gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setNewPhotoFile(e.target.files[0])}
              className="flex-1 bg-[#0d1526] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm outline-none"
            />
            <button
              onClick={handleAddPhoto}
              disabled={!newPhotoFile || uploadingPhoto}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50"
            >
              {uploadingPhoto ? '…' : 'Ajouter'}
            </button>
          </div>
        </div>

        {photos.length === 0 ? (
          <div className="text-center text-gray-600 py-8 text-sm">
            Aucune photo ajoutée pour ce véhicule
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {photos.map((p) => (
              <div key={p.id} className="relative group">
                <img src={p.url} alt="Photo" className="w-full h-28 object-cover rounded border border-[#1e2d45]" />
                <button
                  onClick={() => handleDeletePhoto(p.id)}
                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}