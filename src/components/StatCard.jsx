export default function StatCard({ label, value, sub, color }) {
  const colors = {
    blue: 'bg-blue-600',
    green: 'bg-green-700',
    orange: 'bg-orange-600',
    dark: 'bg-gray-900',
  }
  return (
    <div className={`${colors[color] || colors.dark} p-5 flex flex-col gap-1 min-h-[110px]`}>
      <p className="text-white/80 text-sm font-medium">{label}</p>
      <p className="text-white text-4xl font-bold leading-none">{value}</p>
      {sub && <p className="text-white/60 text-xs mt-1">{sub}</p>}
    </div>
  )
}