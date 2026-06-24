import { useState, useEffect } from 'react'
import { useTrackers } from '../../hooks/useTrackers'
import styles from './Settings.module.css'

export function Settings({ onClose }) {
  const { trackers, addTracker, removeTracker, error } = useTrackers()
  const [newTracker, setNewTracker] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  async function handleAdd() {
    const name = newTracker.trim()
    if (!name || trackers.includes(name)) return
    setBusy(true)
    try {
      await addTracker(name)
      setNewTracker('')
    } finally {
      setBusy(false)
    }
  }

  async function handleRemove(name) {
    setBusy(true)
    try {
      await removeTracker(name)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={e => e.stopPropagation()}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Settings</h1>
          <button type="button" className={styles.closeBtn} onClick={onClose} title="Close">✕</button>
        </div>

        <div className={styles.label}>
          Trackers
          <div className={styles.trackerList}>
            {trackers.map(t => (
              <div key={t} className={styles.trackerItem}>
                <span>{t}</span>
                {trackers.length > 1 && (
                  <button
                    type="button"
                    className={styles.removeBtn}
                    onClick={() => handleRemove(t)}
                    disabled={busy}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <div className={styles.addTracker}>
              <input
                className={styles.input}
                placeholder="New tracker name…"
                value={newTracker}
                onChange={e => setNewTracker(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
                disabled={busy}
              />
              <button type="button" className={styles.addTrackerBtn} onClick={handleAdd} disabled={busy}>
                Add
              </button>
            </div>
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  )
}
