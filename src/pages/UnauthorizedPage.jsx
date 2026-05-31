import { useAuth } from '../hooks/useAuth'
import { LogOut, ShieldX } from 'lucide-react'

export default function UnauthorizedPage() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-6">
        <ShieldX size={28} className="text-red-500" />
      </div>
      <h1 className="font-display text-2xl font-bold text-warm-800 mb-2">Access Restricted</h1>
      <p className="text-warm-500 text-sm mb-2">
        Your account <strong className="text-warm-700">{user?.email}</strong> is not authorized to access Tivo Design CRM.
      </p>
      <p className="text-warm-400 text-xs mb-8">Please contact the team administrator to get access.</p>
      <button onClick={signOut}
        className="flex items-center gap-2 btn-secondary">
        <LogOut size={16} /> Sign Out
      </button>
    </div>
  )
}
