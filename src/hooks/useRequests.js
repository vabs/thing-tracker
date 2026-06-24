import { useState, useCallback, useEffect } from 'react'
import { fetchRequests, createRequest, updateRequest } from '../lib/api'

function sortByDue(items) {
  return [...items].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return a.dueDate.localeCompare(b.dueDate)
  })
}

export function useRequests(tracker, filter, getToken) {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!tracker) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchRequests(getToken, tracker, filter)
      setIssues(sortByDue(data))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [tracker, filter, getToken])

  useEffect(() => { load() }, [load])

  async function addItem(item) {
    const created = await createRequest(getToken, { ...item, tracker })
    setIssues(prev => sortByDue([...prev, created]))
    return created
  }

  async function patchItem(id, updates) {
    const updated = await updateRequest(getToken, id, updates)
    if (filter !== 'all' && updates.isDone !== undefined) {
      setIssues(prev => prev.filter(i => i.id !== id))
    } else {
      setIssues(prev => sortByDue(prev.map(i => i.id === id ? updated : i)))
    }
    return updated
  }

  return { issues, loading, error, addItem, patchItem, reload: load }
}
