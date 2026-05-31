export function StatCard({ label, value, color = 'teal', icon, onClick, highlight = false }) {
  const colors = {
    teal: 'bg-teal-50 text-teal-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    gray: 'bg-warm-50 text-warm-600',
  }
  return (
    <div
      onClick={onClick}
      className={`card flex flex-col gap-3 cursor-pointer hover:shadow-card transition-all duration-200 active:scale-[0.98]
        ${highlight ? 'ring-2 ring-red-400 ring-offset-1' : ''}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-display font-bold text-warm-800">{value}</div>
        <div className="text-xs text-warm-400 font-medium mt-0.5">{label}</div>
      </div>
    </div>
  )
}
