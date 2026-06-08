import styles from './FilterBar.module.css'

export function FilterBar({ filter, onChange }) {
  return (
    <div className={styles.bar}>
      {['open', 'closed', 'all'].map(f => (
        <button
          key={f}
          className={`${styles.btn} ${filter === f ? styles.active : ''}`}
          onClick={() => onChange(f)}
        >
          {f === 'open' ? 'Open' : f === 'closed' ? 'Closed' : 'All'}
        </button>
      ))}
    </div>
  )
}
