import { today, getGridCells, formatDate, parseDate } from '../../lib/dateUtils'
import styles from './DateGrid.module.css'

export function DateGridHeader() {
  return (
    <div className={styles.grid}>
      <div className={styles.section}>
        <span className={styles.sectionLabel}>DAYS</span>
        <div className={styles.cells}>
          {[1,2,3,4,5].map(n => (
            <div key={n} className={`${styles.cell} ${styles.headerCell}`}>{n}</div>
          ))}
        </div>
      </div>
      <div className={styles.sep} />
      <div className={styles.section}>
        <span className={styles.sectionLabel}>WEEKS</span>
        <div className={styles.cells}>
          {[1,2,3,4].map(n => (
            <div key={n} className={`${styles.cell} ${styles.headerCell}`}>{n}</div>
          ))}
        </div>
      </div>
      <div className={styles.sep} />
      <div className={styles.section}>
        <span className={styles.sectionLabel}>MONTHS</span>
        <div className={styles.cells}>
          {[1,2,3].map(n => (
            <div key={n} className={`${styles.cell} ${styles.headerCell}`}>{n}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function DateGrid({ askedDate, dueDate, onSelect, isDone }) {
  const base = askedDate ? new Date(askedDate + 'T00:00:00') : today()
  const now = today()
  const due = parseDate(dueDate)
  const dueStr = dueDate || null
  const cells = getGridCells(base)
  const isOverdue = due ? now > due : false

  const dayCells = cells.filter(c => c.type === 'day')
  const weekCells = cells.filter(c => c.type === 'week')
  const monthCells = cells.filter(c => c.type === 'month')

  function renderCell(cell) {
    const cellStr = formatDate(cell.date)
    const isFilled = cell.date <= now
    const isDue = cellStr === dueStr
    const cls = [
      styles.cell,
      isDone ? styles.done : isFilled ? (isOverdue ? styles.red : styles.green) : styles.empty,
      isDue ? styles.due : '',
      onSelect ? styles.clickable : '',
    ].filter(Boolean).join(' ')

    return (
      <button
        key={cell.id}
        className={cls}
        onClick={() => onSelect && onSelect(cellStr)}
        title={cellStr}
        type="button"
      />
    )
  }

  return (
    <div className={styles.grid}>
      <div className={styles.section}>
        <div className={styles.cells}>{dayCells.map(renderCell)}</div>
      </div>
      <div className={styles.sep} />
      <div className={styles.section}>
        <div className={styles.cells}>{weekCells.map(renderCell)}</div>
      </div>
      <div className={styles.sep} />
      <div className={styles.section}>
        <div className={styles.cells}>{monthCells.map(renderCell)}</div>
      </div>
    </div>
  )
}
