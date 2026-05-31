import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      await signInWithGoogle()
    } catch (err) {
      toast.error('Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col">
      {/* Hero section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Logo */}
        <div className="mb-10 text-center animate-fade-up">
          <div className="w-20 h-20 rounded-3xl bg-teal-500 flex items-center justify-center shadow-elevated mx-auto mb-6">
            <span className="text-white font-display font-bold text-4xl">T</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-warm-800 mb-2">Tivo Design</h1>
          <p className="text-warm-400 text-sm font-medium tracking-wide uppercase">Client Relationship Manager</p>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="card-elevated space-y-6">
            <div className="text-center space-y-1">
              <h2 className="font-display font-semibold text-warm-800 text-xl">Welcome back</h2>
              <p className="text-sm text-warm-400">Sign in with your approved Google account</p>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white border-2 border-warm-200
                         rounded-2xl text-sm font-semibold text-warm-700 hover:border-teal-300 hover:bg-teal-50/30
                         transition-all duration-200 active:scale-[0.98] shadow-soft disabled:opacity-60">
              {loading ? (
                <Loader2 size={18} className="animate-spin text-teal-500" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              {loading ? 'Signing in...' : 'Continue with Google'}
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-warm-200" />
              <span className="text-xs text-warm-300 font-medium">Tivo Design Team Only</span>
              <div className="flex-1 h-px bg-warm-200" />
            </div>

            <div className="bg-teal-50 rounded-xl p-3.5 space-y-1.5">
              {[
                '🔒 Access restricted to approved emails',
                '📱 Install as app for offline use',
                '🔔 Enable notifications for reminders',
              ].map(text => (
                <p key={text} className="text-xs text-teal-700">{text}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-warm-300">
        © 2024 Tivo Design · Interior Excellence
      </div>
    </div>
  )
}
