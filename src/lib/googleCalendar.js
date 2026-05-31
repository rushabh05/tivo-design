const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events'
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'
const GOOGLE_API_SCRIPT = 'https://apis.google.com/js/api.js'
const GOOGLE_IDENTITY_SCRIPT = 'https://accounts.google.com/gsi/client'
const TOKEN_STORAGE_KEY = 'tivo_google_calendar_token'
const TOKEN_EXPIRY_BUFFER_MS = 60 * 1000

let gapiClientReady = false
let tokenClient = null

export const isGoogleCalendarConfigured = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  return Boolean(
    apiKey &&
    clientId &&
    apiKey !== 'your_google_calendar_api_key' &&
    clientId !== 'your_google_oauth_client_id' &&
    !apiKey.includes('BEGIN PRIVATE KEY')
  )
}

export const hasGoogleCalendarAccess = () => Boolean(window.gapi?.client?.getToken()?.access_token)

function getStoredToken() {
  try {
    const raw = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!raw) return null

    const token = JSON.parse(raw)
    if (!token.access_token || !token.expires_at) return null
    if (Date.now() > token.expires_at - TOKEN_EXPIRY_BUFFER_MS) {
      localStorage.removeItem(TOKEN_STORAGE_KEY)
      return null
    }

    return token
  } catch {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    return null
  }
}

function saveToken(response) {
  if (!response?.access_token) return

  const expiresInMs = Number(response.expires_in || 3600) * 1000
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({
    access_token: response.access_token,
    expires_at: Date.now() + expiresInMs,
  }))
}

function restoreStoredToken() {
  const token = getStoredToken()
  if (!token || !window.gapi?.client) return false

  window.gapi.client.setToken({ access_token: token.access_token })
  return true
}

function loadScript(src, id) {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(id)
    if (existing) {
      existing.addEventListener('load', resolve, { once: true })
      existing.addEventListener('error', reject, { once: true })
      if (existing.dataset.loaded === 'true') resolve()
      return
    }

    const script = document.createElement('script')
    script.id = id
    script.src = src
    script.async = true
    script.defer = true
    script.onload = () => {
      script.dataset.loaded = 'true'
      resolve()
    }
    script.onerror = reject
    document.body.appendChild(script)
  })
}

export const initGoogleCalendar = async () => {
  if (!isGoogleCalendarConfigured()) {
    console.warn('Google Calendar needs a browser API key and OAuth client ID.')
    return false
  }

  const apiKey = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  try {
    await Promise.all([
      loadScript(GOOGLE_API_SCRIPT, 'google-api-script'),
      loadScript(GOOGLE_IDENTITY_SCRIPT, 'google-identity-script'),
    ])

    if (!gapiClientReady) {
      await new Promise((resolve) => window.gapi.load('client', resolve))
      await window.gapi.client.init({
        apiKey,
        discoveryDocs: [DISCOVERY_DOC],
      })
      gapiClientReady = true
    }

    restoreStoredToken()

    if (!tokenClient) {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: CALENDAR_SCOPE,
        callback: () => {},
      })
    }

    return true
  } catch (error) {
    console.error('Google Calendar initialization failed:', error)
    return false
  }
}

export const ensureGoogleCalendarAccess = async () => {
  const ready = await initGoogleCalendar()
  if (!ready || !tokenClient) return false

  if (hasGoogleCalendarAccess()) return true
  if (restoreStoredToken()) return true

  return new Promise((resolve) => {
    tokenClient.callback = (response) => {
      if (response?.error) {
        console.error('Google Calendar authorization failed:', response)
        resolve(false)
        return
      }
      saveToken(response)
      window.gapi.client.setToken({ access_token: response.access_token })
      resolve(Boolean(window.gapi.client.getToken()?.access_token))
    }
    tokenClient.requestAccessToken({ prompt: 'consent' })
  })
}

export const restoreGoogleCalendarAccess = async () => {
  const ready = await initGoogleCalendar()
  if (!ready) return false
  return hasGoogleCalendarAccess() || restoreStoredToken()
}

export const disconnectGoogleCalendar = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  window.gapi?.client?.setToken(null)
}

export const createGoogleCalendarEvent = async (lead, followup) => {
  const hasAccess = await ensureGoogleCalendarAccess()
  if (!hasAccess) return null

  const startDateTime = new Date(`${followup.date}T${followup.time || '10:00'}`)
  const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000) // 1 hour

  const event = {
    summary: `Call ${lead.client_name} - ${lead.property_type || 'Interior'} Follow-up`,
    description: `
TIVO DESIGN - CLIENT FOLLOW-UP

Client: ${lead.client_name}
Phone: ${lead.mobile_number}
WhatsApp: ${lead.whatsapp_number || lead.mobile_number}
Email: ${lead.email || 'N/A'}

Property: ${lead.property_type || 'N/A'} at ${lead.location || 'N/A'}
Scope: ${lead.scope || 'N/A'}
Budget: ${lead.approx_budget ? '₹' + lead.approx_budget : 'N/A'}

Current Stage: ${lead.current_stage}
Priority: ${lead.lead_priority}

Requirement:
${lead.requirement_description || 'N/A'}

Notes:
${lead.notes || 'N/A'}

Follow-up Type: ${followup.type}
    `.trim(),
    start: {
      dateTime: startDateTime.toISOString(),
      timeZone: 'Asia/Kolkata',
    },
    end: {
      dateTime: endDateTime.toISOString(),
      timeZone: 'Asia/Kolkata',
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'email', minutes: 60 },
      ],
    },
  }

  try {
    const response = await window.gapi.client.calendar.events.insert({
      calendarId: 'primary',
      resource: event,
    })
    return response.result
  } catch (err) {
    console.error('Calendar event creation failed:', err)
    return null
  }
}

export const listGoogleCalendarEvents = async ({ timeMin, timeMax }) => {
  const hasAccess = await ensureGoogleCalendarAccess()
  if (!hasAccess) return []

  try {
    const response = await window.gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250,
    })

    return response.result.items || []
  } catch (err) {
    console.error('Calendar event fetch failed:', err)
    return []
  }
}
