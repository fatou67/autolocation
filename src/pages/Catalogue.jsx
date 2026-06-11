import { FaWhatsapp } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Car, X } from 'lucide-react'
import { envoyerEmailReservation } from '../lib/email'

export default function Catalogue() {
  const [vehicules, setVehicules] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ nom: '', telephone: '', email: '', date_debut: '', date_fin: '' })
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const [prixMax, setPrixMax] = useState(1000)
  const [search, setSearch] = useState('')
  const [avis, setAvis] = useState([])
  const [formAvis, setFormAvis] = useState({ nom: '', note: 5, commentaire: '' })
  const [showAvisForm, setShowAvisForm] = useState(null)
  const [photosGalerie, setPhotosGalerie] = useState({})

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

  useEffect(() => {
    async function fetchAvis() {
      const { data } = await supabase
        .from('avis')
        .select('*')
        .order('created_at', { ascending: false })
      setAvis(data || [])
    }
    fetchAvis()
  }, [])

  useEffect(() => {
    async function fetchPhotosGalerie() {
      const { data } = await supabase
        .from('photos_vehicules')
        .select('*')
      const grouped = {}
      data?.forEach((p) => {
        if (!grouped[p.vehicule_id]) grouped[p.vehicule_id] = []
        grouped[p.vehicule_id].push(p)
      })
      setPhotosGalerie(grouped)
    }
    fetchPhotosGalerie()
  }, [])

  const vehiculesFiltres = vehicules.filter((v) => {
    const matchSearch = `${v.marque} ${v.modele}`.toLowerCase().includes(search.toLowerCase())
    const matchPrix = v.tarif_journalier <= prixMax
    return matchSearch && matchPrix
  })

  const handleReserver = async () => {
    if (!form.nom || !form.telephone || !form.date_debut || !form.date_fin) {
      alert('Veuillez remplir tous les champs obligatoires !')
      return
    }
    setSaving(true)

    // 1. Chercher ou créer le client
    let clientId = null
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('telephone', form.telephone)
      .maybeSingle()

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

    // 2. Calculer montant
    const days = Math.max(1, Math.ceil(
      (new Date(form.date_fin) - new Date(form.date_debut)) / (1000 * 60 * 60 * 24)
    ))
    const montant = days * (selected.tarif_journalier || 0)

    // 3. Créer la location
    await supabase.from('locations').insert({
      client_id: clientId,
      vehicule_id: selected.id,
      date_debut: form.date_debut,
      date_fin: form.date_fin,
      montant_total: montant,
      statut: 'reservee',
      notes: `Réservation en ligne — ${form.nom}`,
    })

    // 4. Envoyer email notification
    await envoyerEmailReservation({
      client: {
        nom: form.nom,
        telephone: form.telephone,
        email: form.email,
      },
      vehicule: {
        marque: selected.marque,
        modele: selected.modele,
        immatriculation: selected.immatriculation,
      },
      location: {
        date_debut: form.date_debut,
        date_fin: form.date_fin,
        montant: montant,
      },
    })

    setSaving(false)
    setSuccess(true)
    setSelected(null)
    setForm({ nom: '', telephone: '', email: '', date_debut: '', date_fin: '' })
  }

  const handleAvis = async (vehiculeId) => {
    if (!formAvis.nom || !formAvis.commentaire) {
      alert('Veuillez remplir tous les champs !')
      return
    }
    await supabase.from('avis').insert({
      vehicule_id: vehiculeId,
      nom: formAvis.nom,
      note: formAvis.note,
      commentaire: formAvis.commentaire,
    })
    const { data } = await supabase.from('avis').select('*').order('created_at', { ascending: false })
    setAvis(data || [])
    setShowAvisForm(null)
    setFormAvis({ nom: '', note: 5, commentaire: '' })
  }

  const getMoyenne = (vehiculeId) => {
    const avisDuVehicule = avis.filter(a => a.vehicule_id === vehiculeId)
    if (avisDuVehicule.length === 0) return 0
    return avisDuVehicule.reduce((sum, a) => sum + a.note, 0) / avisDuVehicule.length
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
          
             <a href="/login"
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs px-4 py-2 rounded transition-colors font-medium"
          >
            Connexion
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

      {/* Filtres */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-5">
        <div className="bg-[#111e35] border border-[#1e2d45] rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="🔍 Rechercher une voiture..."
              className="w-full bg-[#0d1526] border border-[#1e2d45] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-600"
            />
          </div>
          <div className="flex flex-col gap-1 w-full md:w-64">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Prix max</span>
              <span className="text-green-400 font-bold">{prixMax}£/jour</span>
            </div>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={prixMax}
              onChange={(e) => setPrixMax(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>10£</span>
              <span>1000£</span>
            </div>
          </div>
          <button
            onClick={() => { setSearch(''); setPrixMax(1000) }}
            className="text-gray-400 hover:text-white text-xs border border-[#1e2d45] px-3 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Success message */}
      {success && (
        <div className="max-w-6xl mx-auto px-4 mt-2">
          <div className="bg-green-900/30 border border-green-700/50 rounded-lg px-5 py-4 text-green-400 text-sm text-center">
            ✅ Votre réservation a été envoyée avec succès ! Nous vous contacterons bientôt.
            <button onClick={() => setSuccess(false)} className="ml-3 underline text-xs">Fermer</button>
          </div>
        </div>
      )}

      {/* Véhicules */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <h3 className="text-white font-bold text-lg mb-6">
          Véhicules disponibles ({vehiculesFiltres.length})
        </h3>

        {loading ? (
          <div className="text-center text-gray-600 py-20">Chargement…</div>
        ) : vehiculesFiltres.length === 0 ? (
          <div className="text-center text-gray-600 py-20">
            Aucun véhicule trouvé avec ces critères.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {vehiculesFiltres.map((v) => {
              const moyenne = getMoyenne(v.id)
              const avisDuVehicule = avis.filter(a => a.vehicule_id === v.id)
              const galerie = photosGalerie[v.id] || []
              return (
                <div key={v.id} className="bg-[#111e35] border border-[#1e2d45] rounded-xl overflow-hidden hover:border-blue-600/50 hover:shadow-lg transition-all">
                  <div className="h-44 bg-[#1a2745] overflow-hidden relative">
                    {galerie.length > 0 ? (
                      <div className="flex h-full">
                        {galerie.slice(0, 3).map((p) => (
                          <img
                            key={p.id}
                            src={p.url}
                            alt={v.marque}
                            className="h-full object-cover"
                            style={{ width: `${100 / Math.min(galerie.length, 3)}%` }}
                          />
                        ))}
                      </div>
                    ) : v.photo_url ? (
                      <img src={v.photo_url} alt={v.marque} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Car size={48} className="text-gray-600" />
                      </div>
                    )}
                    {galerie.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                        {galerie.length} photos
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h4 className="text-white font-bold text-base mb-1">{v.marque} {v.modele}</h4>
                    <p className="text-gray-500 text-xs mb-2">{v.annee} — {v.immatriculation}</p>
                    <div className="flex items-center gap-1 mb-3">
                      {[1,2,3,4,5].map((star) => (
                        <span key={star} className={star <= Math.round(moyenne) ? 'text-yellow-400 text-sm' : 'text-gray-600 text-sm'}>★</span>
                      ))}
                      <span className="text-gray-500 text-xs ml-1">({avisDuVehicule.length} avis)</span>
                    </div>
                    {v.description && (
                      <p className="text-gray-400 text-xs mb-3 leading-relaxed">{v.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-green-400 font-bold text-lg">
                        {v.tarif_journalier}£
                        <span className="text-gray-500 text-xs font-normal">/jour</span>
                      </span>
                      <button
                        onClick={() => setSelected(v)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Réserver
                      </button>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#1e2d45]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-xs font-medium">Avis clients</span>
                        <button
                          onClick={() => setShowAvisForm(showAvisForm === v.id ? null : v.id)}
                          className="text-blue-400 hover:text-blue-300 text-xs transition-colors"
                        >
                          + Laisser un avis
                        </button>
                      </div>
                      {avisDuVehicule.slice(0, 2).map((a) => (
                        <div key={a.id} className="bg-[#0d1526] rounded p-2 mb-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white text-xs font-medium">{a.nom}</span>
                            <span className="text-yellow-400 text-xs">{'★'.repeat(a.note)}</span>
                          </div>
                          <p className="text-gray-400 text-xs">{a.commentaire}</p>
                        </div>
                      ))}
                      {showAvisForm === v.id && (
                        <div className="bg-[#0d1526] rounded p-3 mt-2">
                          <input
                            type="text"
                            value={formAvis.nom}
                            onChange={(e) => setFormAvis({ ...formAvis, nom: e.target.value })}
                            placeholder="Votre nom"
                            className="w-full bg-[#111e35] border border-[#1e2d45] rounded px-2 py-1.5 text-white text-xs outline-none focus:border-blue-600 mb-2"
                          />
                          <div className="flex items-center gap-1 mb-2">
                            <span className="text-gray-400 text-xs">Note :</span>
                            {[1,2,3,4,5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setFormAvis({ ...formAvis, note: star })}
                                className={star <= formAvis.note ? 'text-yellow-400 text-lg' : 'text-gray-600 text-lg'}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={formAvis.commentaire}
                            onChange={(e) => setFormAvis({ ...formAvis, commentaire: e.target.value })}
                            placeholder="Votre commentaire..."
                            rows={2}
                            className="w-full bg-[#111e35] border border-[#1e2d45] rounded px-2 py-1.5 text-white text-xs outline-none focus:border-blue-600 resize-none mb-2"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAvis(v.id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors"
                            >
                              Publier
                            </button>
                            <button
                              onClick={() => setShowAvisForm(null)}
                              className="text-gray-400 hover:text-white text-xs transition-colors"
                            >
                              Annuler
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal réservation */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#111e35] border border-[#1e2d45] rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e2d45]">
              <div>
                <h2 className="text-white font-semibold">
                  Réserver — {selected.marque} {selected.modele}
                </h2>
                <p className="text-gray-500 text-xs mt-0.5">{selected.tarif_journalier}£/jour</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
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

      {/* Bouton WhatsApp flottant */}
      
      <a href="https://wa.me/783047941"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-xl transition-colors"
      >
        <FaWhatsapp size={26} />
      </a>
    </div>
  )
}