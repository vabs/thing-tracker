import { useState, useEffect, useCallback } from 'react'
import { fetchIssues, createIssue, updateIssue } from '../lib/github'

function sortByDue(items) {
  return [...items].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return a.dueDate.localeCompare(b.dueDate)
  })
}

export function useIssues(owner, repo, tracker, filter) {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!owner || !repo || !tracker) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchIssues(owner, repo, tracker, filter)
      setIssues(sortByDue(data))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [owner, repo, tracker, filter])

  useEffect(() => { load() }, [load])

  async function addItem(item) {
    const created = await createIssue(owner, repo, { ...item, tracker })
    setIssues(prev => sortByDue([...prev, created]))
    return created
  }

  async function patchItem(id, updates) {
    const updated = await updateIssue(owner, repo, id, updates)
    if (filter !== 'all' && updates.isDone !== undefined) {
      setIssues(prev => prev.filter(i => i.id !== id))
    } else {
      setIssues(prev => sortByDue(prev.map(i => i.id === id ? updated : i)))
    }
    return updated
  }

  return { issues, loading, error, addItem, patchItem, reload: load }
}
