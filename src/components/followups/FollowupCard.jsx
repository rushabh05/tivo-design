import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Clock, Phone, MessageCircle, Calendar } from 'lucide-react'
import { format, parseISO, isToday, isPast } from 'date-fns'
import { PriorityBadge, StageBadge } from '../ui/Badge'
import useStore from '../../store/useStore'
import toast from 'react-hot-toast'

export function FollowupCard({ lead, followup }) {
  const { markFollowupDone } = useStore()
  const [marking, setMarking] = useState(false)

  const date = parseISO(followup.date)
  const isOverdue = isPast(date) && !isToday(date) && followup.status === 'pending'
  const isTodayFollowup = isToday(date) && followup.status === 'pending'

  const handleDone = async (e) => {
    e.preventDefault()
    setMarking(true)
    try {
      await markFollowupDone(followup.id, lead.id)
      toast.success('Follow-up marked as done!')
    } catch {
      toast.error('Failed to mark done')
    } finally {
      setMarking(false)
    }
  }

  const openCall = (e) => {
    e.preventDefault()
    window.open(`tel:${lead.mobile_number}`, '_self')
  }

  const openWA = (e) => {
    e.preventDefault()
    const num = (lead.whatsapp_number || lead.mobile_number || '').replace(/\D/g, '')
    window.open(`https://wa.me/${num}`, '_blank')
  }

  return (
    <div className={`card transition-all duration-200 ${isOverdue ? 'ring-2 ring-red-300 bg-red-50/30' : ''} ${isTodayFollowup ? 'ring-2 ring-amber-300 bg-amber-50/20' : ''}`}>
      {/* Overdue/Today badge */}
      {(isOverdue || isTodayFollowup) && (
        <div className={`text-xs font-semibold mb-2 px-2 py-1 rounded-lg inline-block
          ${isOverdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
          {isOverdue ? '⚠️ Overdue' : '📅 Today'}
        </div>
      )}

      <Link to={`/leads/${lead.id}`} className="block">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="font-display font-semibold text-warm-800">{lead.client_name}</h3>
            <p className="text-xs text-warm-400 mt-0.5">
              {lead.property_type} · {lead.location}
            </p>
          </div>
          <PriorityBadge priority={lead.lead_priority} />
        </div>

        <div className="flex items-center gap-3 text-xs text-warm-500 mb-3">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {format(date, 'dd MMM yyyy')}
          </span>
          {followup.time && (
            <span className="flex items-center gap-1">
              <Clock size={11} /> {followup.time}
            </span>
          )}
          <span className="bg-warm-100 px-2 py-0.5 rounded-full">{followup.type}</span>
        </div>

        <StageBadge stage={lead.current_stage} />
        {followup.notes && <p className="text-xs text-warm-400 mt-2 line-clamp-2">{followup.notes}</p>}
      </Link>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-warm-100">
        <button onClick={openCall} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 text-teal-700 text-xs font-medium hover:bg-teal-100 transition-colors">
          <Phone size={12} /> Call
        </button>
        <button onClick={openWA} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors">
          <MessageCircle size={12} /> WhatsApp
        </button>
        {followup.status === 'pending' && (
          <button onClick={handleDone} disabled={marking}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-warm-600 text-xs font-medium border border-warm-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors ml-auto disabled:opacity-50">
            <CheckCircle2 size={12} />
            {marking ? 'Marking...' : 'Done'}
          </button>
        )}
      </div>
    </div>
  )
}
