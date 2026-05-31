import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Plus, TrendingUp, LogOut } from 'lucide-react'
import { format } from 'date-fns'
import useStore from '../store/useStore'
import { useAuth } from '../hooks/useAuth'
import { StatCard } from '../components/dashboard/StatCard'
import { LeadCard } from '../components/leads/LeadCard'
import { Spinner } from '../components/ui/Spinner'
import { useNotifications } from '../hooks/useNotifications'

export default function DashboardPage() {
  const { leads, leadsLoading, fetchLeads, getDashboardStats } = useStore()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { requestPermission } = useNotifications()
  const stats = getDashboardStats()

  useEffect(() => {
    fetchLeads()
    requestPermission()
  }, [])

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayLeads = leads.filter(l =>
    (l.followups || []).some(f => f.date === today && f.status === 'pending')
  )
  const overdueLeads = leads.filter(l =>
    (l.followups || []).some(f => f.date < today && f.status === 'pending')
  )
  const recentLeads = [...leads].slice(0, 3)

  const statCards = [
    { label: 'Total Leads', value: stats.total, color: 'teal', icon: '👥', onClick: () => navigate('/leads') },
    { label: 'New Leads', value: stats.newLeads, color: 'blue', icon: '🆕', onClick: () => navigate('/leads') },
    { label: "Today's Follow-ups", value: stats.todayFollowups, color: 'amber', icon: '📅', onClick: () => navigate('/followups'), highlight: stats.todayFollowups > 0 },
    { label: 'Overdue', value: stats.overdueFollowups, color: 'red', icon: '⚠️', onClick: () => navigate('/followups'), highlight: stats.overdueFollowups > 0 },
    { label: 'Hot Leads', value: stats.hotLeads, color: 'red', icon: '🔥', onClick: () => navigate('/leads') },
    { label: 'BOQ Follow-ups', value: stats.boqFollowups, color: 'purple', icon: '📋', onClick: () => navigate('/leads') },
    { label: 'Converted', value: stats.converted, color: 'green', icon: '✅', onClick: () => navigate('/leads') },
    { label: 'Lost', value: stats.lost, color: 'gray', icon: '❌', onClick: () => navigate('/leads') },
  ]

  return (
    <div className="page-container">
      {/* Header */}
      <div className="bg-white border-b border-warm-100 sticky top-0 z-30">
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm">T</span>
              </div>
              <h1 className="font-display font-semibold text-warm-800">Tivo Design</h1>
            </div>
            <p className="text-xs text-warm-400">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/followups')}
              className="relative w-9 h-9 rounded-xl bg-cream-100 flex items-center justify-center hover:bg-warm-200 transition-colors">
              <Bell size={17} className="text-warm-600" />
              {(stats.todayFollowups + stats.overdueFollowups) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {Math.min(stats.todayFollowups + stats.overdueFollowups, 9)}
                </span>
              )}
            </button>
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="" className="w-9 h-9 rounded-xl object-cover cursor-pointer" onClick={signOut} />
            ) : (
              <div onClick={signOut} className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-semibold cursor-pointer">
                {user?.email?.[0]?.toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Greeting */}
        <div className="animate-fade-up">
          <h2 className="font-display text-2xl font-semibold text-warm-800">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="text-teal-600">{user?.user_metadata?.given_name || 'Team'}</span>
          </h2>
          <p className="text-warm-400 text-sm mt-0.5">Here's your lead overview for today</p>
        </div>

        {/* Stats Grid */}
        {leadsLoading ? (
          <div className="flex justify-center py-8"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-2 gap-3 stagger-children">
            {statCards.map(card => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>
        )}

        {/* Overdue alert */}
        {stats.overdueFollowups > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 animate-fade-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-red-800">
                  ⚠️ {stats.overdueFollowups} Overdue Follow-up{stats.overdueFollowups > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-red-600 mt-0.5">These require your immediate attention</p>
              </div>
              <button onClick={() => navigate('/followups')}
                className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-red-600 transition-colors">
                View
              </button>
            </div>
          </div>
        )}

        {/* Today's Follow-ups */}
        {todayLeads.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="section-title flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse" />
                Today's Follow-ups
              </h3>
              <button onClick={() => navigate('/followups')} className="text-xs text-teal-600 font-medium">See all →</button>
            </div>
            <div className="space-y-2">
              {todayLeads.slice(0, 3).map(lead => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          </div>
        )}

        {/* Recent Leads */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="section-title flex items-center gap-2">
              <TrendingUp size={16} className="text-teal-500" />
              Recent Leads
            </h3>
            <button onClick={() => navigate('/leads')} className="text-xs text-teal-600 font-medium">All leads →</button>
          </div>
          {leadsLoading ? (
            <div className="flex justify-center py-6"><Spinner /></div>
          ) : recentLeads.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-4xl mb-3">🏠</p>
              <p className="font-display font-medium text-warm-700 mb-1">No leads yet</p>
              <p className="text-sm text-warm-400 mb-4">Start by adding your first client lead</p>
              <button onClick={() => navigate('/leads/new')} className="btn-primary">
                <Plus size={14} className="inline mr-1" /> Add First Lead
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recentLeads.map(lead => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* FAB on mobile */}
      <button onClick={() => navigate('/leads/new')}
        className="md:hidden fixed bottom-24 right-4 w-14 h-14 rounded-2xl bg-teal-500 shadow-elevated flex items-center justify-center z-30 hover:bg-teal-600 active:scale-95 transition-all">
        <Plus size={24} className="text-white" />
      </button>
    </div>
  )
}
