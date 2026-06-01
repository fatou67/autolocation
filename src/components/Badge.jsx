const variants = {
  success: 'bg-green-900/50 text-green-400 border border-green-700/50',
  warning: 'bg-orange-900/50 text-orange-400 border border-orange-700/50',
  info: 'bg-blue-900/50 text-blue-400 border border-blue-700/50',
  danger: 'bg-red-900/50 text-red-400 border border-red-700/50',
  gray: 'bg-gray-800 text-gray-400 border border-gray-700',
}

export default function Badge({ label, variant = 'gray' }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${variants[variant]}`}>
      {label}
    </span>
  )
}