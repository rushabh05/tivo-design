import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import useStore from '../store/useStore'

const APPROVED_EMAILS = (import.meta.env.VITE_APPROVED_EMAILS || '').split(',').map(e => e.trim().toLowerCase())

export function useAuth() {
  const { user, session, loading, setUser, setSession, setLoading } = useStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const isApproved = (email) => {
    if (!APPROVED_EMAILS.length || APPROVED_EMAILS[0] === '') return true // dev mode
    return APPROVED_EMAILS.includes(email?.toLowerCase())
  }

  return { user, session, loading, signInWithGoogle, signOut, isApproved }
}
