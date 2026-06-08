import { useState } from 'react'
import { TrackerRow } from '../TrackerRow/TrackerRow'
import { NewRow } from '../NewRow/NewRow'
import { DateGridHeader } from '../DateGrid/DateGrid'
import styles from './TrackerTable.module.css'

export function TrackerTable({ issues, loading, error, filter, onAdd, onUpdate }) {
  const [showNew, setShowNew] = useState(false)

  async function handleAdd(item) {
    await onAdd(item)
    setShowNew(false)
  }

  if (error) {
    return <div className={styles.error}>GitHub API error: {error}</div>
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.indexCol}>#</div>
        <div className={styles.descCol}>THE ASK</div>
        <div className={styles.whoCol}>WHO</div>
        <div className={styles.dateCol}>ASKED</div>
        <div className={styles.dateCol}>NEED BY</div>
        <div className={styles.gridCol}>
          <DateGridHeader />
        </div>
        <div className={styles.actionCol} />
      </div>

      <div className={styles.body}>
        {loading && <div className={styles.loading}>Loading…</div>}

        {!loading && issues.length === 0 && !showNew && (
          <div className={styles.empty}>No items. Add one below.</div>
        )}

        {issues.map((issue, i) => (
          <TrackerRow key={issue.id} item={issue} index={i + 1} onUpdate={onUpdate} />
        ))}

        {showNew && (
          <NewRow
            index={issues.length + 1}
            onAdd={handleAdd}
            onCancel={() => setShowNew(false)}
          />
        )}
      </div>

      {filter === 'open' && !showNew && (
        <button className={styles.addBtn} onClick={() => setShowNew(true)}>
          + Add
        </button>
      )}
    </div>
  )
}
