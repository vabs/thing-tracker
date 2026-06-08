import { useState, useEffect } from 'react'
import { initOctokit, verifyAccess, createTrackerLabel } from '../../lib/github'
import styles from './Settings.module.css'

export function Settings({ config, onSave, onClose, isFirstTime }) {
  const [pat, setPat] = useState(config.pat)
  const [owner, setOwner] = useState(config.owner)
  const [repo, setRepo] = useState(config.repo)
  const [trackers, setTrackers] = useState(config.trackers)
  const [newTracker, setNewTracker] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!onClose || isFirstTime) return
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose, isFirstTime])

  async function handleSave(e) {
    e.preventDefault()
    if (!pat.trim() || !owner.trim() || !repo.trim()) return
    setSaving(true)
    setError(null)
    try {
      initOctokit(pat.trim())
      await verifyAccess(owner.trim(), repo.trim())
      for (const t of trackers) {
        await createTrackerLabel(owner.trim(), repo.trim(), t)
      }
      onSave({ pat: pat.trim(), owner: owner.trim(), repo: repo.trim(), trackers })
    } catch (e) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  function addTracker() {
    const name = newTracker.trim()
    if (!name || trackers.includes(name)) return
    setTrackers(prev => [...prev, name])
    setNewTracker('')
  }

  function removeTracker(name) {
    setTrackers(prev => prev.filter(t => t !== name))
  }

  return (
    <div
      className={styles.overlay}
      onClick={!isFirstTime && onClose ? onClose : undefined}
    >
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{isFirstTime ? 'Set up Thing Tracker' : 'Settings'}</h1>
          {!isFirstTime && onClose && (
            <button type="button" className={styles.closeBtn} onClick={onClose} title="Close">✕</button>
          )}
        </div>
        {isFirstTime && (
          <p className={styles.subtitle}>
            This app uses GitHub Issues as storage. Fork the repo, then configure it here.
          </p>
        )}

        <form onSubmit={handleSave} className={styles.form}>
          <label className={styles.label}>
            GitHub Personal Access Token
            <input
              className={styles.input}
              type="password"
              placeholder="ghp_..."
              value={pat}
              onChange={e => setPat(e.target.value)}
              autoFocus={isFirstTime}
            />
            <span className={styles.hint}>
              Needs <code>repo</code> scope.{' '}
              <a href="https://github.com/settings/tokens/new?scopes=repo" target="_blank" rel="noreferrer">
                Create one →
              </a>
            </span>
          </label>

          <div className={styles.row}>
            <label className={styles.label}>
              GitHub Username
              <input
                className={styles.input}
                placeholder="username"
                value={owner}
                onChange={e => setOwner(e.target.value)}
              />
            </label>
            <label className={styles.label}>
              Repository Name
              <input
                className={styles.input}
                placeholder="thing-tracker"
                value={repo}
                onChange={e => setRepo(e.target.value)}
              />
            </label>
          </div>

          <div className={styles.label}>
            Trackers
            <div className={styles.trackerList}>
              {trackers.map(t => (
                <div key={t} className={styles.trackerItem}>
                  <span>{t}</span>
                  {trackers.length > 1 && (
                    <button type="button" className={styles.removeBtn} onClick={() => removeTracker(t)}>✕</button>
                  )}
                </div>
              ))}
              <div className={styles.addTracker}>
                <input
                  className={styles.input}
                  placeholder="New tracker name…"
                  value={newTracker}
                  onChange={e => setNewTracker(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTracker())}
                />
                <button type="button" className={styles.addTrackerBtn} onClick={addTracker}>
                  Add
                </button>
              </div>
            </div>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={styles.saveBtn}
            disabled={!pat.trim() || !owner.trim() || !repo.trim() || saving}
          >
            {saving ? 'Verifying…' : 'Save & continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
