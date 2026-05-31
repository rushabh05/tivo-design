import { useState } from 'react'
import { LogOut, Bell, Shield, Smartphone, ExternalLink, ChevronRight, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { ensureGoogleCalendarAccess } from '../lib/googleCalendar'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const hasNotifications = typeof window !== 'undefined' && 'Notification' in window
  const [notifEnabled, setNotifEnabled] = useState(hasNotifications && Notification.permission === 'granted')

  const handleRequestNotif = async () => {
    if (!hasNotifications) return toast.error('Notifications not supported')
    const perm = await Notification.requestPermission()
    setNotifEnabled(perm === 'granted')
    if (perm === 'granted') toast.success('Notifications enabled!')
    else toast.error('Notification permission denied')
  }

  const handleCalendarConnect = async () => {
    const connected = await ensureGoogleCalendarAccess()
    if (connected) toast.success('Google Calendar connected')
    else toast.error('Calendar setup needs valid Google client ID and API key')
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('Signed out')
    } catch {
      toast.error('Sign out failed')
    }
  }

  const sections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          label: 'Profile',
          description: user?.user_metadata?.full_name || user?.email,
          action: null,
        },
      ]
    },
    {
      title: 'Notifications',
      items: [
        {
          icon: Bell,
          label: 'Browser Notifications',
          description: notifEnabled ? 'Enabled' : 'Disabled — tap to enable',
          action: handleRequestNotif,
          badge: notifEnabled ? '✓' : null,
        },
      ]
    },
    {
      title: 'Integrations',
      items: [
        {
          icon: ExternalLink,
          label: 'Google Calendar',
          description: 'Connect to auto-create follow-up events',
          action: handleCalendarConnect,
        },
      ]
    },
    {
      title: 'App',
      items: [
        {
          icon: Smartphone,
          label: 'Install App',
          description: 'Add to home screen for offline access',
          action: () => toast('Open your browser menu → "Add to Home Screen"'),
        },
        {
          icon: Shield,
          label: 'Security',
          description: 'Row-level security via Supabase',
          action: null,
        },
      ]
    },
  ]

  return (
    <div className="page-container">
      <div className="bg-white border-b border-warm-100">
        <div className="px-4 py-4">
          <h1 className="font-display font-semibold text-warm-800 text-lg">Settings</h1>
          <p className="text-xs text-warm-400">Manage your preferences</p>
        </div>
      </div>

      <div className="px-4 py-5 max-w-lg mx-auto space-y-6">
        {/* User card */}
        <div className="card-elevated flex items-center gap-4">
          {user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="" className="w-14 h-14 rounded-2xl object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center text-xl font-display font-bold">
              {user?.email?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-display font-semibold text-warm-800">{user?.user_metadata?.full_name || 'Team Member'}</p>
            <p className="text-sm text-warm-400">{user?.email}</p>
            <p className="text-xs text-teal-600 mt-0.5 font-medium">Tivo Design Team</p>
          </div>
        </div>

        {/* Settings sections */}
        {sections.map(section => (
          <div key={section.title} className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-warm-400 px-1 mb-2">{section.title}</p>
            <div className="card p-0 overflow-hidden divide-y divide-warm-100">
              {section.items.map((item, i) => (
                <button key={i} onClick={item.action}
                  disabled={!item.action}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-cream-50 transition-colors disabled:cursor-default text-left">
                  <div className="w-8 h-8 rounded-xl bg-warm-100 flex items-center justify-center flex-shrink-0">
                    <item.icon size={15} className="text-warm-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-warm-800">{item.label}</p>
                    {item.description && <p className="text-xs text-warm-400 truncate">{item.description}</p>}
                  </div>
                  {item.badge && <span className="text-xs text-green-600 font-semibold">{item.badge}</span>}
                  {item.action && <ChevronRight size={14} className="text-warm-300 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Sign out */}
        <button onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border-2 border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">
          <LogOut size={16} /> Sign Out
        </button>

        <p className="text-center text-xs text-warm-300 pb-4">
          Tivo Design CRM v1.0 · Built with ❤️
        </p>
      </div>
    </div>
  )
}
