import { useState } from 'react'
import { FilterBar } from '../FilterBar/FilterBar'
import { TrackerTable } from '../TrackerTable/TrackerTable'
import { useIssues } from '../../hooks/useIssues'
import styles from './TrackerView.module.css'

export function TrackerView({ config, onOpenSettings }) {
  const { owner, repo, trackers } = config
  const [activeTracker, setActiveTracker] = useState(trackers[0] || 'Personal')
  const [filter, setFilter] = useState('open')

  const { issues, loading, error, addItem, patchItem } = useIssues(owner, repo, activeTracker, filter)

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
        <button className={styles.settingsBtn} onClick={onOpenSettings} title="Settings">
          ⚙
        </button>
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
