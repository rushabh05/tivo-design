import { Link } from 'react-router-dom'
import { Phone, MapPin, Calendar, ChevronRight, MessageCircle } from 'lucide-react'
import { PriorityBadge, StageBadge, FollowupStatusBadge } from '../ui/Badge'
import { format, parseISO } from 'date-fns'

export function LeadCard({ lead }) {
  const today = new Date().toISOString().split('T')[0]

  const pendingFollowups = (lead.followups || []).filter(f => f.status === 'pending')
  const nextFollowup = pendingFollowups.sort((a, b) => a.date.localeCompare(b.date))[0]

  const openWhatsApp = (e) => {
    e.preventDefault()
    const num = (lead.whatsapp_number || lead.mobile_number || '').replace(/\D/g, '')
    if (num) window.open(`https://wa.me/${num}`, '_blank')
  }

  const openCall = (e) => {
    e.preventDefault()
    const num = lead.mobile_number || ''
    if (num) window.open(`tel:${num}`, '_self')
  }

  return (
    <Link to={`/leads/${lead.id}`}
      className="card hover:shadow-card transition-all duration-200 active:scale-[0.99] block animate-slide-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <h3 className="font-display font-semibold text-warm-800 text-base truncate">{lead.client_name}</h3>
            <PriorityBadge priority={lead.lead_priority} />
          </div>

          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-warm-400 mb-3">
            {lead.mobile_number && (
              <span className="flex items-center gap-1">
                <Phone size={11} /> {lead.mobile_number}
              </span>
            )}
            {lead.location && (
              <span className="flex items-center gap-1">
                <MapPin size={11} /> {lead.location}
              </span>
            )}
            {lead.property_type && (
              <span className="flex items-center gap-1">🏠 {lead.property_type}</span>
            )}
            {lead.approx_budget && (
              <span className="flex items-center gap-1">💰 ₹{lead.approx_budget}</span>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <StageBadge stage={lead.current_stage} />
            {nextFollowup && (
              <div className="flex items-center gap-1.5">
                <Calendar size={11} className="text-warm-400" />
                <FollowupStatusBadge date={nextFollowup.date} status={nextFollowup.status} />
                <span className="text-xs text-warm-400">
                  {format(parseISO(nextFollowup.date), 'dd MMM')}
                  {nextFollowup.time && ` • ${nextFollowup.time}`}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <ChevronRight size={16} className="text-warm-300" />
          <div className="flex items-center gap-1.5 mt-2">
            <button onClick={openCall}
              className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-100 transition-colors">
              <Phone size={14} />
            </button>
            <button onClick={openWhatsApp}
              className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors">
              <MessageCircle size={14} />
            </button>
          </div>
        </div>
      </div>

      {lead.assigned_to && (
        <div className="mt-3 pt-3 border-t border-warm-100 flex items-center justify-between">
          <span className="text-xs text-warm-400">
            Assigned to <span className="font-medium text-warm-600">{lead.assigned_to}</span>
          </span>
          {lead.boq_shared && (
            <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">BOQ Shared</span>
          )}
        </div>
      )}
    </Link>
  )
}
