import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { supabase } from '../lib/supabase'

const articles = [
  {
    id: 1,
    title: 'Nouveaux véhicules disponibles',
    desc: 'De nouveaux modèles récents rejoignent notre flotte afin de vous offrir plus de confort et de sécurité.',
    date: '10 juin 2026',
  },
  {
    id: 2,
    title: 'Mise à jour conditions de location',
    desc: 'Consultez les nouvelles modalités d\'assurance et de caution pour toutes les catégories de véhicules.',
    date: '5 juin 2026',
  },
  {
    id: 3,
    title: 'Offre spéciale été 2026',
    desc: 'Profitez de tarifs préférentiels sur les locations longue durée du 15 juin au 15 septembre.',
    date: '1 juin 2026',
  },
]

const reviews = [
  { id: 1, initial: 'A', color: 'bg-blue-600', text: 'L\'application est très intuitive. J\'apprécie particulièrement la clarté du tableau de bord.' },
  { id: 2, initial: 'F', color: 'bg-green-600', text: 'Interface moderne et agréable. La gestion des locations est simple et efficace.' },
  { id: 3, initial: 'I', color: 'bg-purple-600', text: 'Très bonne expérience utilisateur. Tout est centralisé et sécurisé. Je recommande sans hésiter.' },
]

export default function Home() {
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState({ vehicules: 0, clients: 0, locations: 0, revenus: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [{ count: vCount }, { count: cCount }, { count: lCount }, { data: revData }] = await Promise.all([
          supabase.from('vehicules').select('*', { count: 'exact', head: true }),
          supabase.from('clients').select('*', { count: 'exact', head: true }).eq('actif', true),
          supabase.from('locations').select('*', { count: 'exact', head: true }),
          supabase.from('locations').select('montant_total'),
        ])
        const totalRevenu = revData?.reduce((sum, r) => sum + (r.montant_total || 0), 0) || 0
        setStats({ vehicules: vCount || 0, clients: cCount || 0, locations: lCount || 0, revenus: totalRevenu })
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero */}
      <div className="px-4 md:px-8 pt-6 pb-5 border-b border-[#1e2d45]">
        <h1 className="text-white text-2xl md:text-3xl font-bold mb-3">Accueil</h1>
        <p className="text-gray-400 text-xs leading-relaxed mb-4">
          Bienvenue sur votre tableau de bord AutoLocation.<br />
          Ici, gérez vos réservations en un clin d'œil,<br />
          consultez l'état de vos locations et accédez à vos documents en toute sécurité.<br />
          Prenez le volant de votre expérience, tout est sous contrôle.
        </p>
        <div className="flex w-full max-w-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search"
            className="flex-1 bg-white text-gray-800 px-3 py-2 text-sm outline-none rounded-l"
          />
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r transition-colors">
            <Search size={16} className="text-white" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4">
        <div className="bg-blue-600 p-4 md:p-5 flex flex-col gap-1">
          <p className="text-white/80 text-xs md:text-sm font-medium">Véhicules</p>
          <p className="text-white text-3xl md:text-4xl font-bold">{loading ? '…' : stats.vehicules}</p>
          <p className="text-white/60 text-xs">Flotte totale</p>
        </div>
        <div className="bg-green-700 p-4 md:p-5 flex flex-col gap-1">
          <p className="text-white/80 text-xs md:text-sm font-medium">Clients</p>
          <p className="text-white text-3xl md:text-4xl font-bold">{loading ? '…' : stats.clients}</p>
          <p className="text-white/60 text-xs">Clients actifs</p>
        </div>
        <div className="bg-orange-600 p-4 md:p-5 flex flex-col gap-1">
          <p className="text-white/80 text-xs md:text-sm font-medium">Locations</p>
          <p className="text-white text-3xl md:text-4xl font-bold">{loading ? '…' : stats.locations}</p>
          <p className="text-white/60 text-xs">Contrats</p>
        </div>
        <div className="bg-gray-900 p-4 md:p-5 flex flex-col gap-1">
          <p className="text-white/80 text-xs md:text-sm font-medium">Revenus</p>
          <p className="text-white text-3xl md:text-4xl font-bold">{loading ? '…' : `${stats.revenus}£`}</p>
        </div>
      </div>

      {/* Contenu */}
      <div className="px-4 md:px-8 py-6 flex flex-col gap-8">

        {/* Vue d'ensemble */}
        <div>
          <h2 className="text-white text-lg md:text-xl font-bold text-center mb-2">
            Vue d'ensemble en temps réel
          </h2>
          <p className="text-gray-400 text-xs text-center max-w-lg mx-auto leading-relaxed mb-5">
            Consultez l'état de vos réservations et vos statistiques personnelles dans une interface épurée et transparente. Toutes vos informations essentielles, présentées avec clarté.
          </p>

          {/* Image voitures */}
          <div className="w-full h-48 md:h-64 rounded-lg overflow-hidden border border-[#1e2d45]">
            <img
              src="/hero-image.jpg"
              alt="Flotte de véhicules"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.parentElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;gap:40px;background:#1a2745"><span style="font-size:70px">🚙</span><span style="font-size:80px">🚗</span><span style="font-size:70px">🏎️</span></div>'
              }}
            />
          </div>
        </div>

        {/* Articles */}
        <div>
          <h3 className="text-white font-bold text-base text-center mb-1">
            Articles & actualités
          </h3>
          <p className="text-gray-400 text-xs text-center mb-5">
            Découvrez les dernières informations, conseils et annonces pour optimiser votre expérience avec AutoLocation.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {articles.map((a) => (
              <div
                key={a.id}
                className="bg-[#1a2745] border border-[#1e2d45] rounded-lg p-4 hover:border-blue-600/50 cursor-pointer transition-colors"
              >
                <p className="text-gray-200 text-xs font-semibold mb-2 leading-snug">{a.title}</p>
                <p className="text-gray-500 text-xs leading-relaxed mb-3">{a.desc}</p>
                <p className="text-gray-600 text-[10px]">Publié le {a.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Avis */}
        <div className="mb-6">
          <h3 className="text-white font-bold text-base text-center mb-1">
            Avis & retours utilisateurs
          </h3>
          <p className="text-gray-400 text-xs text-center mb-5">
            Ils utilisent AutoLocation au quotidien. Voici ce qu'ils pensent de leur expérience.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="bg-[#1a2745] border border-[#1e2d45] rounded-lg p-4">
                <div className={`w-8 h-8 rounded-full ${r.color} flex items-center justify-center text-white text-xs font-bold mb-3`}>
                  {r.initial}
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">{r.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}