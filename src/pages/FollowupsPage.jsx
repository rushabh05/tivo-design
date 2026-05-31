import { useEffect, useState } from 'react'
import { format, parseISO, isToday, isPast, isFuture } from 'date-fns'
import useStore from '../store/useStore'
import { FollowupCard } from '../components/followups/FollowupCard'
import { EmptyState } from '../components/ui/EmptyState'
import { Spinner } from '../components/ui/Spinner'

const TABS = ['All', 'Today', 'Overdue', 'Upcoming']

export default function FollowupsPage() {
  const { leads, leadsLoading, fetchLeads } = useStore()
  const [activeTab, setActiveTab] = useState('Today')

  useEffect(() => { fetchLeads() }, [])

  const today = new Date().toISOString().split('T')[0]

  // Flatten all pending followups with their lead
  const allFollowups = leads.flatMap(lead =>
    (lead.followups || [])
      .filter(f => f.status === 'pending')
      .map(f => ({ lead, followup: f }))
  )

  const filtered = allFollowups.filter(({ followup: f }) => {
    if (activeTab === 'Today') return f.date === today
    if (activeTab === 'Overdue') return f.date < today
    if (activeTab === 'Upcoming') return f.date > today
    return true
  }).sort((a, b) => a.followup.date.localeCompare(b.followup.date) || (a.followup.time || '').localeCompare(b.followup.time || ''))

  const counts = {
    All: allFollowups.length,
    Today: allFollowups.filter(({ followup: f }) => f.date === today).length,
    Overdue: allFollowups.filter(({ followup: f }) => f.date < today).length,
    Upcoming: allFollowups.filter(({ followup: f }) => f.date > today).length,
  }

  return (
    <div className="page-container">
      <div className="bg-white border-b border-warm-100 sticky top-0 z-30">
        <div className="px-4 py-4">
          <h1 className="font-display font-semibold text-warm-800 text-lg">Follow-ups</h1>
          <p className="text-xs text-warm-400">
            {counts.Overdue > 0 && <span className="text-red-500 font-medium">{counts.Overdue} overdue · </span>}
            {counts.Today} today
          </p>
        </div>

        <div className="flex px-4 border-t border-warm-100">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`py-2.5 px-3 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5
                ${activeTab === tab ? 'border-teal-500 text-teal-600' : 'border-transparent text-warm-400 hover:text-warm-600'}`}>
              {tab}
              {counts[tab] > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                  ${tab === 'Overdue' ? 'bg-red-100 text-red-700' :
                    tab === 'Today' ? 'bg-amber-100 text-amber-700' :
                    'bg-warm-100 text-warm-600'}`}>
                  {counts[tab]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-2">
        {leadsLoading ? (
          <div className="flex justify-center py-16"><Spinner size="xl" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={activeTab === 'Today' ? '✅' : activeTab === 'Overdue' ? '🎉' : '📅'}
            title={activeTab === 'Today' ? 'No follow-ups today' : activeTab === 'Overdue' ? 'All caught up!' : 'No upcoming follow-ups'}
            description={activeTab === 'Today' ? "You're all clear for today" : "Schedule follow-ups from individual lead pages"}
          />
        ) : (
          filtered.map(({ lead, followup }) => (
            <FollowupCard key={followup.id} lead={lead} followup={followup} />
          ))
        )}
      </div>
    </div>
  )
}
