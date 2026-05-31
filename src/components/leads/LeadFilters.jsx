import { Search, X, SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { LEAD_STAGES } from '../../lib/constants'
import useStore from '../../store/useStore'

export function LeadFilters() {
  const { filters, setFilters, clearFilters } = useStore()
  const [showAdvanced, setShowAdvanced] = useState(false)

  const activeCount = [
    filters.stage, filters.assignedTo, filters.priority,
    filters.todayFollowup, filters.overdue, filters.boqShared
  ].filter(Boolean).length

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
        <input
          className="input-field pl-10 pr-10"
          placeholder="Search by name, mobile, location..."
          value={filters.search}
          onChange={e => setFilters({ search: e.target.value })}
        />
        {filters.search && (
          <button onClick={() => setFilters({ search: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 hover:text-warm-600">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Quick filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors
            ${showAdvanced ? 'bg-teal-500 text-white' : 'bg-white border border-warm-200 text-warm-600'}`}>
          <SlidersHorizontal size={12} />
          Filters {activeCount > 0 && `(${activeCount})`}
        </button>

        {[
          { label: '🔥 Today', key: 'todayFollowup' },
          { label: '⚠️ Overdue', key: 'overdue' },
          { label: '🌡️ Hot', onClick: () => setFilters({ priority: filters.priority === 'Hot' ? '' : 'Hot' }), active: filters.priority === 'Hot' },
          { label: '📋 BOQ', key: 'boqShared' },
        ].map(({ label, key, onClick, active }) => (
          <button key={label}
            onClick={onClick || (() => setFilters({ [key]: !filters[key] }))}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors
              ${(active !== undefined ? active : filters[key]) ? 'bg-teal-500 text-white' : 'bg-white border border-warm-200 text-warm-600'}`}>
            {label}
          </button>
        ))}

        {activeCount > 0 && (
          <button onClick={clearFilters} className="px-3 py-1.5 rounded-xl text-xs font-medium text-red-500 bg-red-50 border border-red-100 whitespace-nowrap">
            Clear all
          </button>
        )}
      </div>

      {/* Advanced */}
      {showAdvanced && (
        <div className="card space-y-3 animate-fade-up">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Stage</label>
              <select className="select-field" value={filters.stage} onChange={e => setFilters({ stage: e.target.value })}>
                <option value="">All Stages</option>
                {LEAD_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="select-field" value={filters.priority} onChange={e => setFilters({ priority: e.target.value })}>
                <option value="">All</option>
                {['Hot','Warm','Cold'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Assigned To</label>
            <input className="input-field" placeholder="Filter by assignee..." value={filters.assignedTo} onChange={e => setFilters({ assignedTo: e.target.value })} />
          </div>
        </div>
      )}
    </div>
  )
}
