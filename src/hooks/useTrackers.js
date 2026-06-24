import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { fetchTrackers, createTracker, deleteTracker } from '../lib/api'

// Per-user tracker list, backed by the API. Replaces the old localStorage
// config — a new user is seeded with Personal/Work on first fetch (server-side).
export function useTrackers() {
  const { getToken } = useAuth()
  const [trackers, setTrackers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setTrackers(await fetchTrackers(getToken))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => { load() }, [load])

  async function addTracker(name) {
    setTrackers(await createTracker(getToken, name))
  }

  async function removeTracker(name) {
    setTrackers(await deleteTracker(getToken, name))
  }

  return { trackers, loading, error, addTracker, removeTracker }
}
