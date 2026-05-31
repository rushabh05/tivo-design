import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Plus, Bell, Settings } from 'lucide-react'
import useStore from '../../store/useStore'
import { format } from 'date-fns'

export function BottomNav() {
  const location = useLocation()
  const { leads } = useStore()
  const today = format(new Date(), 'yyyy-MM-dd')

  const overdueCount = leads.filter(l =>
    (l.followups || []).some(f => f.date < today && f.status === 'pending')
  ).length

  const todayCount = leads.filter(l =>
    (l.followups || []).some(f => f.date === today && f.status === 'pending')
  ).length

  const alertCount = overdueCount + todayCount

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/leads', icon: Users, label: 'Leads' },
    { to: '/leads/new', icon: null, label: 'Add' },
    { to: '/followups', icon: Bell, label: 'Follow-ups', badge: alertCount },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-warm-100 safe-bottom md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          if (!item.icon) {
            return (
              <Link key={item.to} to={item.to}
                className="flex flex-col items-center -mt-5">
                <div className="w-14 h-14 rounded-2xl bg-teal-500 shadow-elevated flex items-center justify-center">
                  <Plus size={24} className="text-white" />
                </div>
                <span className="text-xs text-warm-400 mt-1">Add</span>
              </Link>
            )
          }
          const isActive = location.pathname === item.to ||
            (item.to !== '/' && location.pathname.startsWith(item.to))
          return (
            <Link key={item.to} to={item.to}
              className={`nav-item relative ${isActive ? 'active' : ''}`}>
              <div className="relative">
                <item.icon size={20} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
