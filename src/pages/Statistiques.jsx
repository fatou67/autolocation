import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

export default function Statistiques() {
  const [revenusData, setRevenusData] = useState([])
  const [statutsData, setStatutsData] = useState([])
  const [vehiculesData, setVehiculesData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const [{ data: locations }, { data: vehicules }] = await Promise.all([
        supabase.from('locations').select('montant_total, statut, created_at'),
        supabase.from('vehicules').select('statut'),
      ])

      // Revenus par mois
      const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
      const revenusParMois = mois.map((m, i) => ({
        mois: m,
        revenus: locations?.filter((l) => new Date(l.created_at).getMonth() === i)
          .reduce((sum, l) => sum + (l.montant_total || 0), 0) || 0
      }))
      setRevenusData(revenusParMois)

      // Statuts locations
      const statutCount = {}
      locations?.forEach((l) => {
        statutCount[l.statut] = (statutCount[l.statut] || 0) + 1
      })
      setStatutsData(Object.entries(statutCount).map(([name, value]) => ({ name, value })))

      // Statuts véhicules
      const vehCount = {}
      vehicules?.forEach((v) => {
        vehCount[v.statut] = (vehCount[v.statut] || 0) + 1
      })
      setVehiculesData(Object.entries(vehCount).map(([name, value]) => ({ name, value })))

      setLoading(false)
    }
    fetchData()
  }, [])

  const COLORS = ['#2563eb', '#16a34a', '#ea580c', '#dc2626', '#7c3aed']

  const totalRevenus = revenusData.reduce((sum, r) => sum + r.revenus, 0)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-white text-xl font-bold">Statistiques</h1>
        <p className="text-gray-400 text-xs mt-1">Vue d'ensemble des performances</p>
      </div>

      {loading ? (
        <div className="text-center text-gray-600 py-20">Chargement…</div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* Revenus total */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#111e35] border border-[#1e2d45] rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Revenus totaux</p>
              <p className="text-white text-3xl font-bold">{totalRevenus}£</p>
            </div>
            <div className="bg-[#111e35] border border-[#1e2d45] rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Locations ce mois</p>
              <p className="text-white text-3xl font-bold">
                {revenusData[new Date().getMonth()]?.revenus || 0}£
              </p>
            </div>
            <div className="bg-[#111e35] border border-[#1e2d45] rounded-lg p-4">
              <p className="text-gray-400 text-xs mb-1">Meilleur mois</p>
              <p className="text-white text-3xl font-bold">
                {revenusData.reduce((best, r) => r.revenus > best.revenus ? r : best, { revenus: 0, mois: '—' }).mois}
              </p>
            </div>
          </div>

          {/* Courbe revenus */}
          <div className="bg-[#111e35] border border-[#1e2d45] rounded-lg p-5">
            <h2 className="text-white font-semibold text-sm mb-4">Revenus par mois</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                <XAxis dataKey="mois" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#111e35', border: '1px solid #1e2d45', borderRadius: 8 }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#2563eb' }}
                />
                <Line type="monotone" dataKey="revenus" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb' }} name="Revenus (£)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Bar chart + Pie chart */}
          <div className="grid grid-cols-2 gap-4">

            {/* Bar chart locations par statut */}
            <div className="bg-[#111e35] border border-[#1e2d45] rounded-lg p-5">
              <h2 className="text-white font-semibold text-sm mb-4">Locations par statut</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={statutsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e2d45" />
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ background: '#111e35', border: '1px solid #1e2d45', borderRadius: 8 }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" name="Locations">
                    {statutsData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie chart véhicules */}
            <div className="bg-[#111e35] border border-[#1e2d45] rounded-lg p-5">
              <h2 className="text-white font-semibold text-sm mb-4">État de la flotte</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={vehiculesData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {vehiculesData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#111e35', border: '1px solid #1e2d45', borderRadius: 8 }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}