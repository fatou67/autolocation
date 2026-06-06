import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Car } from 'lucide-react'

export default function Catalogue() {
  const [vehicules, setVehicules] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ nom: '', telephone: '', email: '', date_debut: '', date_fin: '' })
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchVehicules() {
      const { data } = await supabase
        .from('vehicules')
        .select('*')
        .eq('statut', 'disponible')
      setVehicules(data || [])
      setLoading(false)
    }
    fetchVehicules()
  }, [])

  const handleReserver = async () => {
    if (!form.nom || !form.telephone || !form.date_debut || !form.date_fin) {
      alert('Veuillez remplir tous les champs obligatoires !')
      return
    }
    setSaving(true)

    let clientId = null
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('telephone', form.telephone)
      .single()

    if (existing) {
      clientId = existing.id
    } else {
      const nameParts = form.nom.trim().split(' ')
      const prenom = nameParts[0]
      const nom = nameParts.slice(1).join(' ') || prenom
      const { data: newClient } = await supabase
        .from('clients')
        .insert({ prenom, nom, telephone: form.telephone, email: form.email, actif: true })
        .select()
        .single()
      clientId = newClient?.id
    }

    const days = Math.max(1, Math.ceil(
      (new Date(form.date_fin) - new Date(form.date_debut)) / (1000 * 60 * 60 * 24)
    ))
    const montant = days * (selected.tarif_journalier || 0)

    await supabase.from('locations').insert({
      client_id: clientId,
      vehicule_id: selected.id,
      date_debut: form.date_debut,
      date_fin: form.date_fin,
      montant_total: montant,
      statut: 'reservee',
      notes: `Réservation en ligne — ${form.nom}`,
    })

    setSaving(false)
    setSuccess(true)
    setSelected(null)
    setForm({ nom: '', telephone: '', email: '', date_debut: '', date_fin: '' })
  }

  return (
    <div className="min-h-screen bg-[#060c1a]">

      {/* Header */}
      <div className="bg-[#0d1526] border-b border-[#1e2d45] px-4 md:px-8 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-red-600 rounded flex items-center justify-center">
              <Car size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-base">AutoLocation</h1>
              <p className="text-gray-500 text-xs">Location de véhicules</p>
            </div>
          </div>
          
          <a
            href="/login"
            className="text-gray-400 hover:text-white text-xs border border-[#1e2d45] px-3 py-1.5 rounded transition-colors"
          >
            Admin
          </a>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0d1526] to-[#1a2745] px-4 md:px-8 py-12 text-center">
        <h2 className="text-white text-2xl md:text-4xl font-bold mb-3">
          Louez votre véhicule idéal
        </h2>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Choisissez parmi notre flotte de véhicules disponibles et réservez en quelques clics.
        </p>
      </div>

      {/* Success message */}
      {success && (
        <div className="max-w-6xl mx-auto px-4 mt-6">
          <div className="bg-green-900/30 border border-green-700/50 rounded-lg px-5 py-4 text-green-400 text-sm text-center">
            ✅ Votre réservation a été envoyée avec succès ! Nous vous contacterons bientôt.
            <button onClick={() => setSuccess(false)} className="ml-3 underline text-xs">Fermer</button>
          </div>
        </div>
      )}

      {/* Véhicules */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <h3 className="text-white font-bold text-lg mb-6">
          Véhicules disponibles ({vehicules.length})
        </h3>

        {loading ? (
          <div className="text-center text-gray-600 py-20">Chargement…</div>
        ) : vehicules.length === 0 ? (
          <div className="text-center text-gray-600 py-20">
            Aucun véhicule disponible pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {vehicules.map((v) => (
              <div key={v.id} className="bg-[#111e35] border border-[#1e2d45] rounded-lg overflow-hidden hover:border-blue-600/50 transition-colors">
                <div className="h-44 bg-[#1a2745] flex items-center justify-center overflow-hidden">
                  {v.photo_url ? (
                    <img src={v.photo_url} alt={v.marque} className="w-full h-full object-cover" />
                  ) : (
                    <Car size={48} className="text-gray-600" />
                  )}
                </div>
                <div className="p-4">
                  <h4 className="text-white font-bold text-base mb-1">{v.marque} {v.modele}</h4>
                  <p className="text-gray-500 text-xs mb-3">{v.annee} — {v.immatriculation}</p>
                  {v.description && (
                    <p className="text-gray-400 text-xs mb-3 leading-relaxed">{v.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-green-400 font-bold text-lg">
                      {v.tarif_journalier}£
                      <span className="text-gray-500 text-xs font-normal">/jour</span>
                    </span>
                    <button
                      onClick={() => setSelected(v)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Réserver
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal réservation */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#111e35] border border-[#1e2d45] rounded-lg w-full max-w-md shadow-2xl">
            <div className="px-5 py-4 border-b border-[#1e2d45]">
              <h2 className="text-white font-semibold">
                Réserver — {selected.marque} {selected.modele}
              </h2>
              <p className="text-gray-500 text-xs mt-1">{selected.tarif_journalier}£/jour</p>
            </div>
            <div className="px-5 py-4 flex flex-col gap-3">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Nom complet *</label>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  placeholder="Mohamed Dupont"
                  className="w-full bg-[#0d1526] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Téléphone *</label>
                <input
                  type="tel"
                  value={form.telephone}
                  onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                  placeholder="+33 6 00 00 00 00"
                  className="w-full bg-[#0d1526] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@exemple.com"
                  className="w-full bg-[#0d1526] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Date début *</label>
                  <input
                    type="date"
                    value={form.date_debut}
                    onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
                    className="w-full bg-[#0d1526] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 text-xs mb-1">Date fin *</label>
                  <input
                    type="date"
                    value={form.date_fin}
                    onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
                    className="w-full bg-[#0d1526] border border-[#1e2d45] rounded px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {form.date_debut && form.date_fin && (
                <div className="bg-[#0d1526] rounded p-3 text-center">
                  <p className="text-gray-400 text-xs">Montant estimé</p>
                  <p className="text-green-400 font-bold text-xl">
                    {Math.max(1, Math.ceil((new Date(form.date_fin) - new Date(form.date_debut)) / (1000 * 60 * 60 * 24))) * selected.tarif_journalier}£
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3 justify-end px-5 py-4 border-t border-[#1e2d45]">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleReserver}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors disabled:opacity-50"
              >
                {saving ? 'Envoi…' : 'Confirmer la réservation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-[#0d1526] border-t border-[#1e2d45] px-4 py-6 text-center mt-8">
        <p className="text-gray-600 text-xs">© 2026 AutoLocation — Tous droits réservés</p>
      </div>
    </div>
  )
}