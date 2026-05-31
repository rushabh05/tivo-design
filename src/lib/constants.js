export const LEAD_STAGES = [
  'New Lead', 'First Call Done', 'Interested', 'BOQ Shared',
  'Follow-up Required', 'Site Visit Scheduled', 'Design Meeting Scheduled',
  'Negotiation', 'Converted', 'Lost'
]

export const LEAD_SOURCES = [
  'Google Ads', 'Instagram', 'Referral', 'Website', 'Walk-in', 'Other'
]

export const PROPERTY_TYPES = [
  '1BHK', '2BHK', '3BHK', 'Villa', 'Office', 'Retail', 'Other'
]

export const SCOPE_OPTIONS = [
  'Design only', 'Design + Execution', 'Turnkey Interior', 'Renovation'
]

export const FOLLOW_UP_TYPES = [
  'Call', 'WhatsApp', 'Meeting', 'BOQ Reminder', 'Site Visit'
]

export const REMINDER_FREQUENCIES = [
  'One time', 'Daily', 'Alternate day', 'Weekly', 'Custom'
]

export const PRIORITY_COLORS = {
  Hot: 'badge-hot',
  Warm: 'badge-warm',
  Cold: 'badge-cold',
}

export const STAGE_COLORS = {
  'New Lead': 'bg-blue-100 text-blue-700',
  'First Call Done': 'bg-indigo-100 text-indigo-700',
  'Interested': 'bg-violet-100 text-violet-700',
  'BOQ Shared': 'bg-purple-100 text-purple-700',
  'Follow-up Required': 'bg-amber-100 text-amber-700',
  'Site Visit Scheduled': 'bg-orange-100 text-orange-700',
  'Design Meeting Scheduled': 'bg-teal-100 text-teal-700',
  'Negotiation': 'bg-yellow-100 text-yellow-700',
  'Converted': 'bg-green-100 text-green-700',
  'Lost': 'bg-red-100 text-red-700',
}

export const WHATSAPP_TEMPLATES = [
  {
    id: 'first_followup',
    name: 'First Follow-up After Enquiry',
    icon: '👋',
    template: (lead) =>
      `Hello ${lead.client_name}, this is Videsh from Tivo Design. Thank you for reaching out to us! I wanted to follow up regarding your ${lead.property_type || 'property'} interior requirement. Could you please let me know a convenient time to discuss further? We'd love to help create your dream space. 🏠✨`,
  },
  {
    id: 'boq_followup',
    name: 'BOQ Shared Follow-up',
    icon: '📋',
    template: (lead) =>
      `Hello ${lead.client_name}, this is Videsh from Tivo Design. I hope you had a chance to review the BOQ we shared for your ${lead.property_type || 'property'} project. Do you have any questions or would you like to discuss any revisions? We're here to tailor it perfectly to your needs.`,
  },
  {
    id: 'gentle_reminder',
    name: 'Gentle Reminder',
    icon: '🔔',
    template: (lead) =>
      `Hello ${lead.client_name}, just a gentle reminder from Tivo Design! We haven't heard back from you regarding your interior project. We're excited about the possibilities and would love to connect at your convenience. Please feel free to reach out whenever you're ready. 😊`,
  },
  {
    id: 'site_visit',
    name: 'Site Visit Scheduling',
    icon: '📍',
    template: (lead) =>
      `Hello ${lead.client_name}, this is Videsh from Tivo Design. I'd love to schedule a site visit for your ${lead.property_type || 'property'} at ${lead.location || 'your location'}. This will help us understand the space better and give you a more accurate proposal. When would be a good time for you?`,
  },
  {
    id: 'budget_discussion',
    name: 'Budget Discussion',
    icon: '💰',
    template: (lead) =>
      `Hello ${lead.client_name}, greetings from Tivo Design! I wanted to discuss the budget and scope for your ${lead.property_type || 'property'} interior project. We have flexible packages that can be customized to suit your requirements and budget. Shall we schedule a call to explore the options?`,
  },
  {
    id: 'no_response',
    name: 'No Response Follow-up',
    icon: '📲',
    template: (lead) =>
      `Hello ${lead.client_name}, this is Videsh from Tivo Design. I've been trying to reach you regarding your interior project inquiry. I understand you must be busy — please don't hesitate to get back to us whenever convenient. Our team is always here to assist you. Have a great day! 🌟`,
  },
]
