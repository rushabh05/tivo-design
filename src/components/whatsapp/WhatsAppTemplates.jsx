import { MessageCircle, ExternalLink } from 'lucide-react'
import { WHATSAPP_TEMPLATES } from '../../lib/constants'

function openWhatsApp(number, message) {
  const cleaned = (number || '').replace(/\D/g, '')
  const encoded = encodeURIComponent(message)
  window.open(`https://wa.me/${cleaned}?text=${encoded}`, '_blank')
}

export function WhatsAppTemplates({ lead }) {
  const number = lead.whatsapp_number || lead.mobile_number

  return (
    <div className="space-y-3">
      <p className="text-xs text-warm-400">
        Tap any template to open WhatsApp with a pre-filled message for{' '}
        <span className="font-medium text-warm-600">{lead.client_name}</span>
      </p>

      <div className="space-y-2">
        {WHATSAPP_TEMPLATES.map(({ id, name, icon, template }) => {
          const message = template(lead)
          return (
            <div key={id} className="p-3 bg-cream-50 rounded-xl border border-warm-100 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{icon}</span>
                  <span className="text-xs font-semibold text-warm-700">{name}</span>
                </div>
                <button
                  onClick={() => openWhatsApp(number, message)}
                  disabled={!number}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <MessageCircle size={12} />
                  Send
                  <ExternalLink size={10} />
                </button>
              </div>
              <p className="text-xs text-warm-500 leading-relaxed bg-white rounded-lg p-2.5 border border-warm-100">
                {message}
              </p>
            </div>
          )
        })}
      </div>

      {!number && (
        <p className="text-xs text-red-500 bg-red-50 p-3 rounded-xl">
          ⚠️ No WhatsApp/mobile number saved for this client.
        </p>
      )}
    </div>
  )
}
