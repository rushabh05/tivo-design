import { useEffect } from 'react'
import { format } from 'date-fns'
import useStore from '../store/useStore'

export function useNotifications() {
  const { leads } = useStore()

  useEffect(() => {
    if (!('Notification' in window)) return

    const checkFollowups = () => {
      const now = new Date()
      const today = format(now, 'yyyy-MM-dd')
      const currentTime = format(now, 'HH:mm')

      leads.forEach(lead => {
        (lead.followups || []).forEach(f => {
          if (f.status === 'pending' && f.date === today && f.time) {
            const [h, m] = f.time.split(':')
            const followupTime = `${h.padStart(2,'0')}:${m.padStart(2,'0')}`
            // Notify 5 minutes before
            const notifyTime = new Date(now)
            notifyTime.setHours(parseInt(h), parseInt(m) - 5, 0)
            const diff = notifyTime - now
            if (diff > 0 && diff < 60000) { // within next minute
              if (Notification.permission === 'granted') {
                new Notification('Tivo Design — Follow-up Reminder', {
                  body: `${f.type} with ${lead.client_name} in 5 minutes`,
                  icon: '/pwa-192x192.png',
                })
              }
            }
          }
        })
      })
    }

    const interval = setInterval(checkFollowups, 60000)
    return () => clearInterval(interval)
  }, [leads])

  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  return { requestPermission }
}
