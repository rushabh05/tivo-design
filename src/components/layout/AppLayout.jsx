import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import useStore from '../../store/useStore'

export function AppLayout() {
  const { fetchLeads } = useStore()

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  return (
    <div className="min-h-screen bg-cream-100">
      <Sidebar />
      <main className="md:ml-64">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
