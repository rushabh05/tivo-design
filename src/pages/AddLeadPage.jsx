import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import useStore from '../store/useStore'
import { LeadForm } from '../components/leads/LeadForm'
import toast from 'react-hot-toast'
import { createGoogleCalendarEvent } from '../lib/googleCalendar'

export default function AddLeadPage() {
  const { addLead, addFollowup } = useStore()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (formData) => {
    setIsLoading(true)
    try {
      const lead = await addLead(formData)

      if (formData.next_followup_date) {
        let calendarEvent = null
        try {
          calendarEvent = await createGoogleCalendarEvent(lead, {
            date: formData.next_followup_date,
            time: formData.next_followup_time,
            type: formData.followup_type,
          })
        } catch {
          calendarEvent = null
        }

        await addFollowup(lead.id, {
          date: formData.next_followup_date,
          time: formData.next_followup_time || null,
          type: formData.followup_type,
          notes: formData.status_remarks || formData.notes || null,
          reminder_frequency: formData.reminder_frequency,
          google_event_id: calendarEvent?.id || null,
        })

        toast.success(calendarEvent ? 'Lead added + reminder synced to Calendar!' : 'Lead added + in-app reminder created!')
      } else {
        toast.success('Lead added successfully!')
      }

      navigate(`/leads/${lead.id}`)
    } catch (err) {
      toast.error(err.message || 'Failed to add lead')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="bg-white border-b border-warm-100 sticky top-0 z-30">
        <div className="px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-8 h-8 rounded-xl hover:bg-warm-100 flex items-center justify-center transition-colors">
            <ArrowLeft size={18} className="text-warm-600" />
          </button>
          <div>
            <h1 className="font-display font-semibold text-warm-800">Add New Lead</h1>
            <p className="text-xs text-warm-400">Enter client details below</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-5 max-w-2xl mx-auto">
        <LeadForm
          onSubmit={handleSubmit}
          onCancel={() => navigate(-1)}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
