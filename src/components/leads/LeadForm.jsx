import { useState } from 'react'
import { ChevronDown, Calendar, Clock } from 'lucide-react'
import {
  LEAD_STAGES, LEAD_SOURCES, PROPERTY_TYPES, SCOPE_OPTIONS,
  FOLLOW_UP_TYPES, REMINDER_FREQUENCIES
} from '../../lib/constants'

const defaultForm = {
  client_name: '',
  mobile_number: '',
  whatsapp_number: '',
  email: '',
  lead_source: '',
  property_type: '',
  location: '',
  scope: '',
  approx_budget: '',
  requirement_description: '',
  current_stage: 'New Lead',
  lead_priority: 'Warm',
  assigned_to: '',
  notes: '',
  next_followup_date: '',
  next_followup_time: '',
  followup_type: 'Call',
  reminder_frequency: 'One time',
  last_contacted_date: '',
  status_remarks: '',
  boq_shared: false,
  boq_shared_date: '',
  boq_amount: '',
  boq_client_feedback: '',
  boq_revision_required: false,
  next_boq_followup_date: '',
}

function FormSection({ title, children }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-teal-600 border-b border-warm-100 pb-2">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

function SelectField({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select value={value} onChange={onChange} className="select-field pr-10">
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 pointer-events-none" />
    </div>
  )
}

export function LeadForm({ initialData = {}, onSubmit, onCancel, isLoading = false }) {
  const [form, setForm] = useState({ ...defaultForm, ...initialData })

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))
  const handle = (field) => (e) => set(field, e.target.value)
  const handleCheck = (field) => (e) => set(field, e.target.checked)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Client Info */}
      <FormSection title="Client Information">
        <div className="grid grid-cols-1 gap-4">
          <Field label="Client Name *">
            <input className="input-field" placeholder="Full name" required value={form.client_name} onChange={handle('client_name')} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Mobile Number *">
              <input className="input-field" placeholder="+91 XXXXX XXXXX" required value={form.mobile_number} onChange={handle('mobile_number')} />
            </Field>
            <Field label="WhatsApp Number">
              <input className="input-field" placeholder="+91 XXXXX XXXXX" value={form.whatsapp_number} onChange={handle('whatsapp_number')} />
            </Field>
          </div>
          <Field label="Email">
            <input className="input-field" type="email" placeholder="client@email.com" value={form.email} onChange={handle('email')} />
          </Field>
        </div>
      </FormSection>

      {/* Property Details */}
      <FormSection title="Property Details">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Lead Source">
            <SelectField value={form.lead_source} onChange={handle('lead_source')} options={LEAD_SOURCES} placeholder="Select source" />
          </Field>
          <Field label="Property Type">
            <SelectField value={form.property_type} onChange={handle('property_type')} options={PROPERTY_TYPES} placeholder="Select type" />
          </Field>
        </div>
        <Field label="Location">
          <input className="input-field" placeholder="Area, City" value={form.location} onChange={handle('location')} />
        </Field>
        <Field label="Scope of Work">
          <SelectField value={form.scope} onChange={handle('scope')} options={SCOPE_OPTIONS} placeholder="Select scope" />
        </Field>
        <Field label="Approx Budget (₹)">
          <input className="input-field" placeholder="e.g. 15,00,000" value={form.approx_budget} onChange={handle('approx_budget')} />
        </Field>
        <Field label="Requirement Description">
          <textarea className="textarea-field" rows={3} placeholder="Describe the client's requirements..." value={form.requirement_description} onChange={handle('requirement_description')} />
        </Field>
      </FormSection>

      {/* Lead Status */}
      <FormSection title="Lead Status">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Current Stage">
            <SelectField value={form.current_stage} onChange={handle('current_stage')} options={LEAD_STAGES} />
          </Field>
          <Field label="Lead Priority">
            <SelectField value={form.lead_priority} onChange={handle('lead_priority')} options={['Hot', 'Warm', 'Cold']} />
          </Field>
        </div>
        <Field label="Assigned To">
          <input className="input-field" placeholder="Team member name" value={form.assigned_to} onChange={handle('assigned_to')} />
        </Field>
        <Field label="Notes">
          <textarea className="textarea-field" rows={3} placeholder="Internal notes..." value={form.notes} onChange={handle('notes')} />
        </Field>
        <Field label="Status Remarks">
          <input className="input-field" placeholder="Brief status note..." value={form.status_remarks} onChange={handle('status_remarks')} />
        </Field>
        <Field label="Last Contacted Date">
          <input className="input-field" type="date" value={form.last_contacted_date} onChange={handle('last_contacted_date')} />
        </Field>
      </FormSection>

      {/* Follow-up */}
      <FormSection title="Follow-up Schedule">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Next Follow-up Date">
            <div className="relative">
              <input className="input-field pr-10" type="date" value={form.next_followup_date} onChange={handle('next_followup_date')} />
              <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 pointer-events-none" />
            </div>
          </Field>
          <Field label="Follow-up Time">
            <div className="relative">
              <input className="input-field pr-10" type="time" value={form.next_followup_time} onChange={handle('next_followup_time')} />
              <Clock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-400 pointer-events-none" />
            </div>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Follow-up Type">
            <SelectField value={form.followup_type} onChange={handle('followup_type')} options={FOLLOW_UP_TYPES} />
          </Field>
          <Field label="Reminder Frequency">
            <SelectField value={form.reminder_frequency} onChange={handle('reminder_frequency')} options={REMINDER_FREQUENCIES} />
          </Field>
        </div>
      </FormSection>

      {/* BOQ Tracking */}
      <FormSection title="BOQ Tracking">
        <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-xl border border-warm-100">
          <input type="checkbox" id="boq_shared" checked={form.boq_shared} onChange={handleCheck('boq_shared')} className="w-4 h-4 rounded accent-teal-500" />
          <label htmlFor="boq_shared" className="text-sm font-medium text-warm-700">BOQ has been shared with client</label>
        </div>
        {form.boq_shared && (
          <div className="space-y-3 animate-fade-up">
            <div className="grid grid-cols-2 gap-3">
              <Field label="BOQ Shared Date">
                <input className="input-field" type="date" value={form.boq_shared_date} onChange={handle('boq_shared_date')} />
              </Field>
              <Field label="BOQ Amount (₹)">
                <input className="input-field" placeholder="Total amount" value={form.boq_amount} onChange={handle('boq_amount')} />
              </Field>
            </div>
            <Field label="Client Feedback on BOQ">
              <textarea className="textarea-field" rows={2} placeholder="Feedback notes..." value={form.boq_client_feedback} onChange={handle('boq_client_feedback')} />
            </Field>
            <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-xl border border-warm-100">
              <input type="checkbox" id="boq_revision" checked={form.boq_revision_required} onChange={handleCheck('boq_revision_required')} className="w-4 h-4 rounded accent-teal-500" />
              <label htmlFor="boq_revision" className="text-sm font-medium text-warm-700">Revision required</label>
            </div>
            <Field label="Next BOQ Follow-up Date">
              <input className="input-field" type="date" value={form.next_boq_followup_date} onChange={handle('next_boq_followup_date')} />
            </Field>
          </div>
        )}
      </FormSection>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary flex-1">
            Cancel
          </button>
        )}
        <button type="submit" disabled={isLoading} className="btn-primary flex-1">
          {isLoading ? 'Saving...' : (initialData.id ? 'Save Changes' : 'Add Lead')}
        </button>
      </div>
    </form>
  )
}
