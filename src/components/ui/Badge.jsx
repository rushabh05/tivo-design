import { PRIORITY_COLORS, STAGE_COLORS } from '../../lib/constants'

export function PriorityBadge({ priority }) {
  return <span className={PRIORITY_COLORS[priority] || 'badge-cold'}>{priority}</span>
}

export function StageBadge({ stage }) {
  const color = STAGE_COLORS[stage] || 'bg-gray-100 text-gray-700'
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${color}`}>
      {stage}
    </span>
  )
}

export function FollowupStatusBadge({ date, status }) {
  const today = new Date().toISOString().split('T')[0]
  if (status === 'done') return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">Done</span>
  if (date < today) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Overdue</span>
  if (date === today) return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Today</span>
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Upcoming</span>
}
