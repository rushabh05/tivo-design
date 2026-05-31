import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'

const nullableDateTimeFields = new Set([
  'last_contacted_date',
  'next_followup_date',
  'next_followup_time',
  'boq_shared_date',
  'next_boq_followup_date',
  'date',
  'time',
])

const leadFields = new Set([
  'client_name',
  'mobile_number',
  'whatsapp_number',
  'email',
  'lead_source',
  'property_type',
  'location',
  'scope',
  'approx_budget',
  'requirement_description',
  'current_stage',
  'lead_priority',
  'assigned_to',
  'notes',
  'status_remarks',
  'last_contacted_date',
  'next_followup_date',
  'next_followup_time',
  'followup_type',
  'reminder_frequency',
  'boq_shared',
  'boq_shared_date',
  'boq_amount',
  'boq_client_feedback',
  'boq_revision_required',
  'next_boq_followup_date',
])

function nullEmptyDateTimeFields(data) {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      nullableDateTimeFields.has(key) && value === '' ? null : value,
    ])
  )
}

function pickLeadFields(data) {
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => leadFields.has(key))
  )
}

const useStore = create((set, get) => ({
  // Auth
  user: null,
  session: null,
  loading: true,

  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  setLoading: (loading) => set({ loading }),

  // Leads
  leads: [],
  leadsLoading: false,
  filters: {
    search: '',
    stage: '',
    assignedTo: '',
    priority: '',
    todayFollowup: false,
    overdue: false,
    boqShared: false,
  },

  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  clearFilters: () => set({ filters: { search: '', stage: '', assignedTo: '', priority: '', todayFollowup: false, overdue: false, boqShared: false } }),

  fetchLeads: async () => {
    set({ leadsLoading: true })
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          followups (id, date, time, type, status, notes, google_event_id),
          lead_notes (id, note, created_at, user_email, action_type)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      set({ leads: data || [] })
    } catch (err) {
      console.error('fetchLeads error:', err)
    } finally {
      set({ leadsLoading: false })
    }
  },

  addLead: async (leadData) => {
    const { user } = get()
    const cleanLeadData = nullEmptyDateTimeFields(pickLeadFields(leadData))
    const { data, error } = await supabase
      .from('leads')
      .insert([{ ...cleanLeadData, created_by: user?.email, workspace: 'tivo_design' }])
      .select()
      .single()

    if (error) throw error

    // Log activity
    await supabase.from('activity_logs').insert([{
      lead_id: data.id,
      user_email: user?.email,
      action: 'Lead Created',
      details: `New lead added: ${leadData.client_name}`,
    }])

    await get().fetchLeads()
    return data
  },

  updateLead: async (id, updates) => {
    const { user } = get()
    const cleanUpdates = nullEmptyDateTimeFields(pickLeadFields(updates))
    const { data, error } = await supabase
      .from('leads')
      .update({ ...cleanUpdates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Log stage change
    if (updates.current_stage) {
      await supabase.from('activity_logs').insert([{
        lead_id: id,
        user_email: user?.email,
        action: 'Stage Changed',
        details: `Stage updated to: ${updates.current_stage}`,
      }])
    }

    await get().fetchLeads()
    return data
  },

  deleteLead: async (id) => {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)

    if (error) throw error

    set((state) => ({
      leads: state.leads.filter((lead) => lead.id !== id),
    }))
  },

  // Follow-ups
  addFollowup: async (leadId, followupData) => {
    const { user } = get()
    const cleanFollowupData = nullEmptyDateTimeFields(followupData)
    const { data, error } = await supabase
      .from('followups')
      .insert([{ ...cleanFollowupData, lead_id: leadId, created_by: user?.email, status: 'pending' }])
      .select()
      .single()

    if (error) throw error

    // Log activity
    await supabase.from('activity_logs').insert([{
      lead_id: leadId,
      user_email: user?.email,
      action: 'Follow-up Scheduled',
      details: `${followupData.type} scheduled for ${followupData.date} at ${followupData.time || '—'}`,
    }])

    await get().fetchLeads()
    return data
  },

  markFollowupDone: async (followupId, leadId) => {
    const { user } = get()
    await supabase.from('followups').update({ status: 'done', completed_at: new Date().toISOString() }).eq('id', followupId)
    await supabase.from('activity_logs').insert([{
      lead_id: leadId,
      user_email: user?.email,
      action: 'Follow-up Completed',
      details: 'Follow-up marked as done',
    }])
    await get().fetchLeads()
  },

  // Notes
  addNote: async (leadId, note, actionType = 'Note') => {
    const { user } = get()
    const { error } = await supabase.from('lead_notes').insert([{
      lead_id: leadId,
      note,
      action_type: actionType,
      user_email: user?.email,
    }])
    if (error) throw error

    await supabase.from('activity_logs').insert([{
      lead_id: leadId,
      user_email: user?.email,
      action: actionType === 'Note' ? 'Notes Added' : actionType,
      details: note,
    }])

    await get().fetchLeads()
  },

  // Activity logs
  fetchActivityLogs: async (leadId) => {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  // Computed: filtered leads
  getFilteredLeads: () => {
    const { leads, filters } = get()
    const today = format(new Date(), 'yyyy-MM-dd')

    return leads.filter((lead) => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const match = [lead.client_name, lead.mobile_number, lead.location, lead.email]
          .filter(Boolean).some(v => v.toLowerCase().includes(q))
        if (!match) return false
      }
      if (filters.stage && lead.current_stage !== filters.stage) return false
      if (filters.assignedTo && lead.assigned_to !== filters.assignedTo) return false
      if (filters.priority && lead.lead_priority !== filters.priority) return false
      if (filters.boqShared && lead.boq_shared !== true) return false

      if (filters.todayFollowup) {
        const hasToday = (lead.followups || []).some(
          f => f.date === today && f.status === 'pending'
        )
        if (!hasToday) return false
      }

      if (filters.overdue) {
        const hasOverdue = (lead.followups || []).some(
          f => f.date < today && f.status === 'pending'
        )
        if (!hasOverdue) return false
      }

      return true
    })
  },

  // Dashboard stats
  getDashboardStats: () => {
    const { leads } = get()
    const today = format(new Date(), 'yyyy-MM-dd')

    return {
      total: leads.length,
      newLeads: leads.filter(l => l.current_stage === 'New Lead').length,
      todayFollowups: leads.filter(l =>
        (l.followups || []).some(f => f.date === today && f.status === 'pending')
      ).length,
      overdueFollowups: leads.filter(l =>
        (l.followups || []).some(f => f.date < today && f.status === 'pending')
      ).length,
      hotLeads: leads.filter(l => l.lead_priority === 'Hot').length,
      boqFollowups: leads.filter(l => l.current_stage === 'BOQ Shared').length,
      converted: leads.filter(l => l.current_stage === 'Converted').length,
      lost: leads.filter(l => l.current_stage === 'Lost').length,
    }
  },
}))

export default useStore
