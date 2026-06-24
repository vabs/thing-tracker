import { useState, useEffect } from 'react'
import { useAuth, UserButton } from '@clerk/clerk-react'
import { FilterBar } from '../FilterBar/FilterBar'
import { TrackerTable } from '../TrackerTable/TrackerTable'
import { useTrackers } from '../../hooks/useTrackers'
import { useRequests } from '../../hooks/useRequests'
import styles from './TrackerView.module.css'

export function TrackerView({ onOpenSettings }) {
  const { getToken } = useAuth()
  const { trackers } = useTrackers()
  const [activeTracker, setActiveTracker] = useState(null)
  const [filter, setFilter] = useState('open')

  // Default to the first tracker once they load, and stay on a valid one.
  useEffect(() => {
    if (trackers.length && (!activeTracker || !trackers.includes(activeTracker))) {
      setActiveTracker(trackers[0])
    }
  }, [trackers, activeTracker])

  const { issues, loading, error, addItem, patchItem } = useRequests(activeTracker, filter, getToken)

  return (
    <div className={styles.view}>
      <header className={styles.header}>
        <div className={styles.left}>
          <h1 className={styles.title}>Thing Tracker</h1>
          <div className={styles.tagline}>
            Tell the person what you want and when you want it.
            <em> The clearer you can be, the easier it is for everyone.</em>
          </div>
        </div>
        <div className={styles.actions}>
          <button className={styles.settingsBtn} onClick={onOpenSettings} title="Settings">
            ⚙
          </button>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <div className={styles.toolbar}>
        <nav className={styles.tabs}>
          {trackers.map(t => (
            <button
              key={t}
              className={`${styles.tab} ${activeTracker === t ? styles.activeTab : ''}`}
              onClick={() => setActiveTracker(t)}
            >
              {t}
            </button>
          ))}
        </nav>
        <FilterBar filter={filter} onChange={setFilter} />
      </div>

      <main className={styles.main}>
        <TrackerTable
          issues={issues}
          loading={loading}
          error={error}
          filter={filter}
          onAdd={addItem}
          onUpdate={patchItem}
        />
      </main>
    </div>
  )
}
