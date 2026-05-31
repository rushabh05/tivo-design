import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ArrowLeft } from 'lucide-react'
import useStore from '../store/useStore'
import { LeadCard } from '../components/leads/LeadCard'
import { LeadFilters } from '../components/leads/LeadFilters'
import { EmptyState } from '../components/ui/EmptyState'
import { Spinner } from '../components/ui/Spinner'

export default function LeadsPage() {
  const { leadsLoading, fetchLeads, getFilteredLeads } = useStore()
  const navigate = useNavigate()
  const filteredLeads = getFilteredLeads()

  useEffect(() => { fetchLeads() }, [])

  return (
    <div className="page-container">
      {/* Header */}
      <div className="bg-white border-b border-warm-100 sticky top-0 z-30">
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display font-semibold text-warm-800 text-lg">All Leads</h1>
            <p className="text-xs text-warm-400">{filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''} found</p>
          </div>
          <button onClick={() => navigate('/leads/new')} className="btn-primary flex items-center gap-1.5 !px-4 !py-2">
            <Plus size={15} /> Add Lead
          </button>
        </div>
        <div className="px-4 pb-4">
          <LeadFilters />
        </div>
      </div>

      <div className="px-4 py-4">
        {leadsLoading ? (
          <div className="flex justify-center py-16"><Spinner size="xl" /></div>
        ) : filteredLeads.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No leads found"
            description="Try adjusting your filters or add a new lead"
            action={
              <button onClick={() => navigate('/leads/new')} className="btn-primary">
                <Plus size={14} className="inline mr-1" /> Add Lead
              </button>
            }
          />
        ) : (
          <div className="space-y-2">
            {filteredLeads.map(lead => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
