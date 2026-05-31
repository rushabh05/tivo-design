import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import { AppLayout } from './components/layout/AppLayout'
import { PageLoader } from './components/ui/Spinner'

import LoginPage from './pages/LoginPage'
import UnauthorizedPage from './pages/UnauthorizedPage'
import DashboardPage from './pages/DashboardPage'
import LeadsPage from './pages/LeadsPage'
import AddLeadPage from './pages/AddLeadPage'
import LeadDetailPage from './pages/LeadDetailPage'
import FollowupsPage from './pages/FollowupsPage'
import CalendarPage from './pages/CalendarPage'
import SettingsPage from './pages/SettingsPage'

function ProtectedRoute({ children }) {
  const { user, loading, isApproved } = useAuth()

  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  if (!isApproved(user.email)) return <UnauthorizedPage />
  return children
}

function PublicRoute({ children }) {
  const { user, loading, isApproved } = useAuth()

  if (loading) return <PageLoader />
  if (user && isApproved(user.email)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          <PublicRoute><LoginPage /></PublicRoute>
        } />

        <Route element={
          <ProtectedRoute><AppLayout /></ProtectedRoute>
        }>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/leads/new" element={<AddLeadPage />} />
          <Route path="/leads/:id" element={<LeadDetailPage />} />
          <Route path="/followups" element={<FollowupsPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#fff',
            color: '#1C1C1C',
            borderRadius: '12px',
            border: '1px solid #E8E4DB',
            fontSize: '14px',
            fontFamily: "'DM Sans', sans-serif",
          },
          success: { iconTheme: { primary: '#2ea3a3', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  )
}
