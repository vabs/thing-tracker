import { useState, useEffect } from 'react'
import { initOctokit } from '../lib/github'

const STORAGE_KEY = 'thing-tracker-config'

const defaults = {
  pat: '',
  owner: '',
  repo: '',
  trackers: ['Personal', 'Work'],
}

export function useConfig() {
  const [config, setConfigState] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      const c = { ...defaults, ...saved }
      if (c.pat) initOctokit(c.pat)
      return c
    } catch {
      return { ...defaults }
    }
  })

  function setConfig(updates) {
    setConfigState(prev => {
      const next = { ...prev, ...updates }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      if (updates.pat) initOctokit(updates.pat)
      return next
    })
  }

  const isConfigured = !!(config.pat && config.owner && config.repo)

  return { config, setConfig, isConfigured }
}
