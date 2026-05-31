import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Users, Plus, Bell, Settings, LogOut, Calendar } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import useStore from '../../store/useStore'
import { format } from 'date-fns'

export function Sidebar() {
  const location = useLocation()
  const { user, signOut } = useAuth()
  const { leads } = useStore()
  const today = format(new Date(), 'yyyy-MM-dd')

  const alertCount = leads.filter(l =>
    (l.followups || []).some(f =>
      (f.date <= today) && f.status === 'pending'
    )
  ).length

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/leads', icon: Users, label: 'All Leads' },
    { to: '/leads/new', icon: Plus, label: 'Add Lead' },
    { to: '/followups', icon: Bell, label: 'Follow-ups', badge: alertCount },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-white border-r border-warm-100 fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-warm-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center shadow-sm">
            <span className="text-white font-display font-bold text-lg">T</span>
          </div>
          <div>
            <h1 className="font-display font-semibold text-warm-800">Tivo Design</h1>
            <p className="text-xs text-warm-400">CRM Portal</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.to ||
            (item.to !== '/' && location.pathname.startsWith(item.to))
          return (
            <Link key={item.to} to={item.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium relative
                ${isActive ? 'bg-teal-50 text-teal-700' : 'text-warm-500 hover:bg-warm-50 hover:text-warm-700'}`}>
              <item.icon size={18} />
              {item.label}
              {item.badge > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-warm-100">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          {user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-sm font-semibold">
              {user?.email?.[0]?.toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-warm-700 truncate">
              {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
            </p>
            <p className="text-xs text-warm-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={signOut}
          className="flex items-center gap-2 w-full px-4 py-2 rounded-xl text-sm text-warm-500 hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  )
}
