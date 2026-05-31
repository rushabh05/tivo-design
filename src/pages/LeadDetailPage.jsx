import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit2, Phone, MessageCircle, Calendar, Clock, Plus, CheckCircle2, Activity, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import useStore from '../store/useStore'
import { LeadForm } from '../components/leads/LeadForm'
import { WhatsAppTemplates } from '../components/whatsapp/WhatsAppTemplates'
import { PriorityBadge, StageBadge, FollowupStatusBadge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Spinner } from '../components/ui/Spinner'
import { STAGE_COLORS, LEAD_STAGES } from '../lib/constants'
import toast from 'react-hot-toast'
import { createGoogleCalendarEvent } from '../lib/googleCalendar'

const TABS = ['Overview', 'Follow-ups', 'WhatsApp', 'Timeline', 'BOQ']

export default function LeadDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { leads, updateLead, deleteLead, addFollowup, addNote, fetchActivityLogs } = useStore()
  const [activeTab, setActiveTab] = useState('Overview')
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showFollowupModal, setShowFollowupModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [followupForm, setFollowupForm] = useState({ date: '', time: '', type: 'Call', notes: '' })
  const [activityLogs, setActivityLogs] = useState([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [noteInput, setNoteInput] = useState('')

  const lead = leads.find(l => l.id === id)

  useEffect(() => {
    if (activeTab === 'Timeline') loadLogs()
  }, [activeTab, id])

  const loadLogs = async () => {
    setLogsLoading(true)
    try {
      const logs = await fetchActivityLogs(id)
      setActivityLogs(logs)
    } catch { }
    setLogsLoading(false)
  }

  if (!lead) return (
    <div className="page-container flex items-center justify-center">
      <div className="text-center">
        <Spinner size="xl" className="mx-auto mb-4" />
        <p className="text-warm-400">Loading lead...</p>
      </div>
    </div>
  )

  const pendingFollowups = (lead.followups || []).filter(f => f.status === 'pending')
    .sort((a, b) => a.date.localeCompare(b.date))
  const doneFollowups = (lead.followups || []).filter(f => f.status === 'done')
    .sort((a, b) => b.date.localeCompare(a.date))

  const handleUpdate = async (formData) => {
    setIsUpdating(true)
    try {
      await updateLead(id, formData)
      setIsEditing(false)
      toast.success('Lead updated!')
    } catch (err) {
      toast.error('Failed to update lead')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStageChange = async (stage) => {
    try {
      await updateLead(id, { current_stage: stage })
      toast.success(`Stage updated to: ${stage}`)
    } catch {
      toast.error('Failed to update stage')
    }
  }

  const handleAddFollowup = async () => {
    if (!followupForm.date) return toast.error('Please set a follow-up date')
    try {
      let calendarEvent = null
      try {
        calendarEvent = await createGoogleCalendarEvent(lead, followupForm)
      } catch {
        calendarEvent = null
      }

      await addFollowup(id, {
        ...followupForm,
        google_event_id: calendarEvent?.id || null,
      })

      toast.success(calendarEvent ? 'Follow-up scheduled + Calendar updated!' : 'Follow-up scheduled!')
      setShowFollowupModal(false)
      setFollowupForm({ date: '', time: '', type: 'Call', notes: '' })
    } catch {
      toast.error('Failed to schedule follow-up')
    }
  }

  const handleAddNote = async () => {
    if (!noteInput.trim()) return
    try {
      await addNote(id, noteInput.trim())
      setNoteInput('')
      toast.success('Note added!')
      if (activeTab === 'Timeline') loadLogs()
    } catch {
      toast.error('Failed to add note')
    }
  }

  const handleDeleteLead = async () => {
    setIsDeleting(true)
    try {
      await deleteLead(id)
      toast.success('Lead deleted')
      navigate('/leads', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Failed to delete lead')
    } finally {
      setIsDeleting(false)
    }
  }

  const openCall = () => window.open(`tel:${lead.mobile_number}`, '_self')
  const openWA = () => {
    const num = (lead.whatsapp_number || lead.mobile_number || '').replace(/\D/g, '')
    window.open(`https://wa.me/${num}`, '_blank')
  }

  if (isEditing) {
    return (
      <div className="page-container">
        <div className="bg-white border-b border-warm-100 sticky top-0 z-30">
          <div className="px-4 py-4 flex items-center gap-3">
            <button onClick={() => setIsEditing(false)} className="w-8 h-8 rounded-xl hover:bg-warm-100 flex items-center justify-center transition-colors">
              <ArrowLeft size={18} className="text-warm-600" />
            </button>
            <h1 className="font-display font-semibold text-warm-800">Edit Lead</h1>
          </div>
        </div>
        <div className="px-4 py-5 max-w-2xl mx-auto">
          <LeadForm initialData={lead} onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} isLoading={isUpdating} />
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="bg-white border-b border-warm-100 sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl hover:bg-warm-100 flex items-center justify-center transition-colors">
            <ArrowLeft size={18} className="text-warm-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-semibold text-warm-800 truncate">{lead.client_name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <StageBadge stage={lead.current_stage} />
              <PriorityBadge priority={lead.lead_priority} />
            </div>
          </div>
          <button onClick={() => setIsEditing(true)} className="w-8 h-8 rounded-xl hover:bg-warm-100 flex items-center justify-center transition-colors">
            <Edit2 size={16} className="text-warm-600" />
          </button>
          <button onClick={() => setShowDeleteModal(true)} className="w-8 h-8 rounded-xl hover:bg-red-50 flex items-center justify-center transition-colors">
            <Trash2 size={16} className="text-red-500" />
          </button>
        </div>

        {/* Quick actions */}
        <div className="px-4 pb-3 flex items-center gap-2">
          <button onClick={openCall} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-50 text-teal-700 text-xs font-medium hover:bg-teal-100 transition-colors">
            <Phone size={13} /> Call
          </button>
          <button onClick={openWA} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors">
            <MessageCircle size={13} /> WhatsApp
          </button>
          <button onClick={() => setShowFollowupModal(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 text-amber-700 text-xs font-medium hover:bg-amber-100 transition-colors ml-auto">
            <Calendar size={13} /> Schedule Follow-up
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-t border-warm-100 px-4">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`py-2.5 px-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors
                ${activeTab === tab ? 'border-teal-500 text-teal-600' : 'border-transparent text-warm-400 hover:text-warm-600'}`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 max-w-2xl mx-auto">
        {/* OVERVIEW TAB */}
        {activeTab === 'Overview' && (
          <div className="space-y-4 animate-fade-up">
            {/* Contact Info */}
            <div className="card space-y-3">
              <h3 className="text-xs font-semibold text-teal-600 uppercase tracking-wider">Contact</h3>
              {[
                ['📱 Mobile', lead.mobile_number],
                ['💬 WhatsApp', lead.whatsapp_number],
                ['📧 Email', lead.email],
              ].map(([label, value]) => value ? (
                <div key={label} className="flex items-center justify-between text-sm">
                  <span className="text-warm-400">{label}</span>
                  <span className="font-medium text-warm-700">{value}</span>
                </div>
              ) : null)}
            </div>

            {/* Property */}
            <div className="card space-y-3">
              <h3 className="text-xs font-semibold text-teal-600 uppercase tracking-wider">Property</h3>
              {[
                ['Type', lead.property_type],
                ['Location', lead.location],
                ['Scope', lead.scope],
                ['Budget', lead.approx_budget ? `₹${lead.approx_budget}` : null],
                ['Source', lead.lead_source],
                ['Assigned to', lead.assigned_to],
              ].map(([label, value]) => value ? (
                <div key={label} className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-warm-400 flex-shrink-0">{label}</span>
                  <span className="font-medium text-warm-700 text-right">{value}</span>
                </div>
              ) : null)}

              {lead.requirement_description && (
                <div>
                  <p className="text-xs text-warm-400 mb-1">Requirement</p>
                  <p className="text-sm text-warm-700 bg-cream-50 rounded-xl p-3 leading-relaxed">{lead.requirement_description}</p>
                </div>
              )}
            </div>

            {/* Notes */}
            {lead.notes && (
              <div className="card">
                <h3 className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-2">Notes</h3>
                <p className="text-sm text-warm-700 leading-relaxed">{lead.notes}</p>
              </div>
            )}

            {/* Stage change quick buttons */}
            <div className="card">
              <h3 className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-3">Update Stage</h3>
              <div className="flex flex-wrap gap-2">
                {LEAD_STAGES.map(stage => (
                  <button key={stage} onClick={() => handleStageChange(stage)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                      ${lead.current_stage === stage
                        ? 'bg-teal-500 text-white'
                        : 'bg-warm-100 text-warm-600 hover:bg-warm-200'}`}>
                    {stage}
                  </button>
                ))}
              </div>
            </div>

            {/* Add note */}
            <div className="card">
              <h3 className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-3">Quick Note</h3>
              <div className="flex gap-2">
                <input
                  className="input-field flex-1"
                  placeholder="Add a note or update..."
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddNote()}
                />
                <button onClick={handleAddNote} className="btn-primary !px-4">
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FOLLOW-UPS TAB */}
        {activeTab === 'Follow-ups' && (
          <div className="space-y-4 animate-fade-up">
            <button onClick={() => setShowFollowupModal(true)}
              className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-teal-300 rounded-2xl text-teal-600 text-sm font-medium hover:bg-teal-50 transition-colors">
              <Plus size={16} /> Schedule New Follow-up
            </button>

            {pendingFollowups.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-warm-600 uppercase tracking-wider mb-2">Pending</h3>
                <div className="space-y-2">
                  {pendingFollowups.map(f => {
                    const today = new Date().toISOString().split('T')[0]
                    const isOverdue = f.date < today
                    return (
                      <div key={f.id} className={`card ${isOverdue ? 'ring-2 ring-red-200' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-warm-600 bg-warm-100 px-2 py-1 rounded-lg">{f.type}</span>
                            <FollowupStatusBadge date={f.date} status={f.status} />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-warm-500">
                          <span className="flex items-center gap-1"><Calendar size={11} />{format(parseISO(f.date), 'EEE, dd MMM yyyy')}</span>
                          {f.time && <span className="flex items-center gap-1"><Clock size={11} />{f.time}</span>}
                        </div>
                        {f.notes && <p className="text-xs text-warm-400 mt-2">{f.notes}</p>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {doneFollowups.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-warm-600 uppercase tracking-wider mb-2">Completed</h3>
                <div className="space-y-2 opacity-70">
                  {doneFollowups.map(f => (
                    <div key={f.id} className="card">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 size={14} className="text-green-500" />
                        <span className="text-xs font-medium text-warm-600">{f.type}</span>
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Done</span>
                      </div>
                      <p className="text-xs text-warm-400">{format(parseISO(f.date), 'EEE, dd MMM yyyy')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(lead.followups || []).length === 0 && (
              <div className="text-center py-10 text-warm-400">
                <Calendar size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No follow-ups scheduled</p>
              </div>
            )}
          </div>
        )}

        {/* WHATSAPP TAB */}
        {activeTab === 'WhatsApp' && (
          <div className="animate-fade-up">
            <WhatsAppTemplates lead={lead} />
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'Timeline' && (
          <div className="space-y-4 animate-fade-up">
            {logsLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : activityLogs.length === 0 ? (
              <div className="text-center py-10 text-warm-400">
                <Activity size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">No activity yet</p>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-warm-200" />
                <div className="space-y-4 pl-10">
                  {activityLogs.map((log, i) => (
                    <div key={log.id || i} className="relative">
                      <div className="absolute -left-6 top-0 w-3 h-3 rounded-full bg-teal-400 border-2 border-white" />
                      <div className="card p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-warm-700">{log.action}</span>
                          <span className="text-xs text-warm-300">{format(parseISO(log.created_at), 'dd MMM, HH:mm')}</span>
                        </div>
                        <p className="text-xs text-warm-500">{log.details}</p>
                        <p className="text-xs text-warm-300 mt-1">{log.user_email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* BOQ TAB */}
        {activeTab === 'BOQ' && (
          <div className="space-y-4 animate-fade-up">
            <div className="card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-teal-600 uppercase tracking-wider">BOQ Status</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${lead.boq_shared ? 'bg-green-100 text-green-700' : 'bg-warm-100 text-warm-500'}`}>
                  {lead.boq_shared ? '✓ Shared' : 'Not Shared'}
                </span>
              </div>

              {[
                ['Shared Date', lead.boq_shared_date && format(parseISO(lead.boq_shared_date), 'dd MMM yyyy')],
                ['BOQ Amount', lead.boq_amount && `₹${lead.boq_amount}`],
                ['Client Feedback', lead.boq_client_feedback],
                ['Revision Required', lead.boq_revision_required ? 'Yes' : lead.boq_revision_required === false ? 'No' : null],
                ['Next BOQ Follow-up', lead.next_boq_followup_date && format(parseISO(lead.next_boq_followup_date), 'dd MMM yyyy')],
              ].map(([label, value]) => value ? (
                <div key={label} className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-warm-400 flex-shrink-0">{label}</span>
                  <span className="font-medium text-warm-700 text-right">{value}</span>
                </div>
              ) : null)}

              {!lead.boq_shared && (
                <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700">
                  💡 BOQ not yet shared with this client. Edit the lead to update BOQ details.
                </div>
              )}
            </div>

            <button onClick={() => setIsEditing(true)} className="btn-secondary w-full">
              <Edit2 size={14} className="inline mr-1.5" /> Edit BOQ Details
            </button>
          </div>
        )}
      </div>

      {/* Follow-up Modal */}
      <Modal isOpen={showFollowupModal} onClose={() => setShowFollowupModal(false)} title="Schedule Follow-up">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date *</label>
              <input className="input-field" type="date" value={followupForm.date}
                onChange={e => setFollowupForm(p => ({ ...p, date: e.target.value }))} />
            </div>
            <div>
              <label className="label">Time</label>
              <input className="input-field" type="time" value={followupForm.time}
                onChange={e => setFollowupForm(p => ({ ...p, time: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="label">Type</label>
            <select className="select-field" value={followupForm.type}
              onChange={e => setFollowupForm(p => ({ ...p, type: e.target.value }))}>
              {['Call', 'WhatsApp', 'Meeting', 'BOQ Reminder', 'Site Visit'].map(t =>
                <option key={t} value={t}>{t}</option>
              )}
            </select>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="textarea-field" rows={3} placeholder="What to discuss..."
              value={followupForm.notes}
              onChange={e => setFollowupForm(p => ({ ...p, notes: e.target.value }))} />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowFollowupModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleAddFollowup} className="btn-primary flex-1">
              <Calendar size={14} className="inline mr-1.5" /> Schedule
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Lead" size="sm">
        <div className="space-y-4">
          <div className="rounded-2xl bg-red-50 border border-red-100 p-4">
            <p className="text-sm font-semibold text-red-800">Delete {lead.client_name}?</p>
            <p className="text-xs text-red-600 mt-1">
              This will permanently remove the lead, follow-ups, notes, and activity history.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowDeleteModal(false)} disabled={isDeleting} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={handleDeleteLead}
              disabled={isDeleting}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium px-5 py-2.5 rounded-xl transition-all duration-200 text-sm disabled:opacity-50">
              {isDeleting ? 'Deleting...' : 'Delete Lead'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
