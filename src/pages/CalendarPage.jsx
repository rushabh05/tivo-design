import { useEffect, useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, addMonths, subMonths, isToday } from 'date-fns'
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import useStore from '../store/useStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  ensureGoogleCalendarAccess,
  hasGoogleCalendarAccess,
  isGoogleCalendarConfigured,
  listGoogleCalendarEvents,
  restoreGoogleCalendarAccess,
} from '../lib/googleCalendar'

function getGoogleEventDate(event) {
  if (event.start?.date) return event.start.date
  if (event.start?.dateTime) return format(new Date(event.start.dateTime), 'yyyy-MM-dd')
  return ''
}

function getGoogleEventTime(event) {
  if (!event.start?.dateTime) return ''
  return format(new Date(event.start.dateTime), 'HH:mm')
}

export default function CalendarPage() {
  const { leads } = useStore()
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selected, setSelected] = useState(new Date())
  const [calendarConnected, setCalendarConnected] = useState(hasGoogleCalendarAccess())
  const [connecting, setConnecting] = useState(false)
  const [googleEvents, setGoogleEvents] = useState([])
  const [googleEventsLoading, setGoogleEventsLoading] = useState(false)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getFollowupsForDay = (day) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    return leads.flatMap(lead =>
      (lead.followups || [])
        .filter(f => f.date === dayStr && f.status === 'pending')
        .map(f => ({ lead, followup: f }))
    )
  }

  const getGoogleEventsForDay = (day) => {
    const dayStr = format(day, 'yyyy-MM-dd')
    const syncedEventIds = new Set(
      getFollowupsForDay(day)
        .map(({ followup }) => followup.google_event_id)
        .filter(Boolean)
    )

    return googleEvents.filter(event =>
      getGoogleEventDate(event) === dayStr && !syncedEventIds.has(event.id)
    )
  }

  const selectedFollowups = getFollowupsForDay(selected)
  const selectedGoogleEvents = getGoogleEventsForDay(selected)
  const startDay = monthStart.getDay()
  const emptyCells = Array(startDay).fill(null)
  const calendarConfigured = isGoogleCalendarConfigured()
  const syncedCount = leads.reduce(
    (count, lead) => count + (lead.followups || []).filter(f => f.google_event_id).length,
    0
  )

  useEffect(() => {
    let cancelled = false

    const restoreCalendar = async () => {
      const restored = await restoreGoogleCalendarAccess()
      if (!cancelled) setCalendarConnected(restored)
    }

    restoreCalendar()
    return () => { cancelled = true }
  }, [])

  const loadGoogleEvents = async () => {
    if (!calendarConnected) return

    setGoogleEventsLoading(true)
    const rangeEnd = new Date(monthEnd)
    rangeEnd.setDate(rangeEnd.getDate() + 1)
    const events = await listGoogleCalendarEvents({
      timeMin: monthStart,
      timeMax: rangeEnd,
    })
    setGoogleEvents(events)
    setGoogleEventsLoading(false)
  }

  useEffect(() => {
    loadGoogleEvents()
  }, [calendarConnected, currentDate])

  const handleConnectCalendar = async () => {
    setConnecting(true)
    const connected = await ensureGoogleCalendarAccess()
    setCalendarConnected(connected)
    setConnecting(false)

    if (connected) {
      toast.success('Google Calendar connected')
    }
    else toast.error('Could not connect Google Calendar. Check OAuth test users and credentials.')
  }

  return (
    <div className="page-container">
      <div className="bg-white border-b border-warm-100 sticky top-0 z-30">
        <div className="px-4 py-4 flex items-center justify-between">
          <h1 className="font-display font-semibold text-warm-800 text-lg">Calendar</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="w-8 h-8 rounded-xl hover:bg-warm-100 flex items-center justify-center transition-colors">
              <ChevronLeft size={16} className="text-warm-600" />
            </button>
            <span className="text-sm font-medium text-warm-700 w-28 text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="w-8 h-8 rounded-xl hover:bg-warm-100 flex items-center justify-center transition-colors">
              <ChevronRight size={16} className="text-warm-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        <div className="card bg-teal-50/60 border-teal-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-warm-800">Google Calendar</p>
              <p className="text-xs text-warm-500 mt-1">
                {calendarConnected
                  ? `${syncedCount} Tivo follow-up${syncedCount === 1 ? '' : 's'} synced. ${googleEvents.length} Google event${googleEvents.length === 1 ? '' : 's'} loaded for this month.`
                  : calendarConfigured
                    ? 'Connect once. The app will remember this browser until Google access expires or is revoked.'
                    : 'Add Google OAuth client ID and Calendar API key in .env, then restart the app.'}
              </p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap ${
              calendarConnected ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {calendarConnected ? 'Connected' : 'Not connected'}
            </span>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleConnectCalendar}
              disabled={!calendarConfigured || connecting}
              className="btn-primary !px-4 !py-2 disabled:opacity-50">
              {connecting ? 'Connecting...' : calendarConnected ? 'Reconnect' : 'Connect Calendar'}
            </button>
            <button
              onClick={() => window.open('https://calendar.google.com/calendar/u/0/r', '_blank')}
              className="btn-secondary !px-4 !py-2 flex items-center gap-1.5">
              Open Google <ExternalLink size={13} />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {['S','M','T','W','T','F','S'].map((d, i) => (
            <div key={i} className="text-center text-xs font-semibold text-warm-400 py-2">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 mb-6">
          {emptyCells.map((_, i) => <div key={`e-${i}`} />)}
          {days.map(day => {
            const dayFollowups = getFollowupsForDay(day)
            const dayGoogleEvents = getGoogleEventsForDay(day)
            const isSelected = isSameDay(day, selected)
            const isTodayDay = isToday(day)
            const today = format(new Date(), 'yyyy-MM-dd')
            const hasOverdue = dayFollowups.some(({ followup: f }) => f.date < today)
            const hasEvents = dayFollowups.length > 0 || dayGoogleEvents.length > 0

            return (
              <button key={day.toISOString()} onClick={() => setSelected(day)}
                className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all
                  ${isSelected ? 'bg-teal-500 text-white shadow-sm' :
                    isTodayDay ? 'bg-teal-50 text-teal-700 ring-2 ring-teal-200' :
                    'hover:bg-warm-100 text-warm-700'}`}>
                {format(day, 'd')}
                {hasEvents && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    {dayFollowups.length > 0 && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : hasOverdue ? 'bg-red-400' : 'bg-teal-400'}`} />
                    )}
                    {dayGoogleEvents.length > 0 && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white/70' : 'bg-blue-400'}`} />
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Selected day */}
        <div>
          <h3 className="text-xs font-semibold text-warm-600 uppercase tracking-wider mb-3">
            {isToday(selected) ? "Today's" : format(selected, 'dd MMM')} Calendar
          </h3>

          {googleEventsLoading ? (
            <div className="text-center py-8">
              <p className="text-sm text-warm-400">Loading Google Calendar events...</p>
            </div>
          ) : selectedFollowups.length === 0 && selectedGoogleEvents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">📅</p>
              <p className="text-sm text-warm-400">No follow-ups or Google Calendar events for this day</p>
            </div>
          ) : (
            <div className="space-y-2">
              {selectedFollowups.map(({ lead, followup }) => (
                <div key={followup.id} onClick={() => navigate(`/leads/${lead.id}`)}
                  className="card cursor-pointer hover:shadow-card transition-all flex items-center justify-between">
                  <div>
                    <p className="font-medium text-warm-800 text-sm">{lead.client_name}</p>
                    <p className="text-xs text-warm-400 mt-0.5">{followup.type} · {lead.property_type} · {lead.location}</p>
                    {followup.google_event_id && (
                      <p className="text-[10px] text-green-600 font-semibold mt-1">Google Calendar synced</p>
                    )}
                  </div>
                  {followup.time && (
                    <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">
                      {followup.time}
                    </span>
                  )}
                </div>
              ))}
              {selectedGoogleEvents.map(event => (
                <div key={event.id}
                  className="card border-blue-100 bg-blue-50/30 hover:shadow-card transition-all">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-warm-800 text-sm truncate">{event.summary || 'Untitled Google event'}</p>
                      <p className="text-xs text-warm-400 mt-0.5">Google Calendar event</p>
                      {event.location && (
                        <p className="text-xs text-warm-400 mt-1 truncate">{event.location}</p>
                      )}
                    </div>
                    {getGoogleEventTime(event) ? (
                      <span className="text-xs font-medium text-blue-600 bg-white px-2 py-1 rounded-lg">
                        {getGoogleEventTime(event)}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-blue-600 bg-white px-2 py-1 rounded-lg">
                        All day
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
