// Thin fetch wrapper for the thing-tracker backend. Every call attaches the
// caller's Clerk session token as a Bearer credential; the server verifies it
// and scopes all data to that user.

async function request(getToken, path, options = {}) {
  const token = await getToken()
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })
  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.error) message = body.error
    } catch {
      // non-JSON error body — keep the status message
    }
    throw new Error(message)
  }
  return res.json()
}

export function fetchTrackers(getToken) {
  return request(getToken, '/trackers')
}

export function createTracker(getToken, name) {
  return request(getToken, '/trackers', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export function deleteTracker(getToken, name) {
  return request(getToken, `/trackers/${encodeURIComponent(name)}`, {
    method: 'DELETE',
  })
}

export function fetchRequests(getToken, tracker, filter = 'open') {
  const qs = new URLSearchParams({ tracker, filter }).toString()
  return request(getToken, `/requests?${qs}`)
}

export function createRequest(getToken, { description, person, tracker, dueDate }) {
  return request(getToken, '/requests', {
    method: 'POST',
    body: JSON.stringify({ description, person, tracker, dueDate }),
  })
}

export function updateRequest(getToken, id, updates) {
  return request(getToken, `/requests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  })
}
