import { useState } from 'react'
import { DateGrid } from '../DateGrid/DateGrid'
import { formatDate, today } from '../../lib/dateUtils'
import styles from './NewRow.module.css'

export function NewRow({ index, onAdd, onCancel }) {
  const [description, setDescription] = useState('')
  const [person, setPerson] = useState('')
  const [dueDate, setDueDate] = useState(null)
  const [saving, setSaving] = useState(false)

  const askedDate = formatDate(today())

  async function handleSubmit(e) {
    e.preventDefault()
    if (!description.trim()) return
    setSaving(true)
    try {
      await onAdd({ description: description.trim(), person: person.trim(), dueDate })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className={`${styles.row} ${saving ? styles.saving : ''}`} onSubmit={handleSubmit}>
      <div className={styles.index}>{index}</div>
      <div className={styles.desc}>
        <input
          className={styles.input}
          placeholder="What did you ask for?"
          value={description}
          onChange={e => setDescription(e.target.value)}
          autoFocus
          disabled={saving}
          onKeyDown={e => e.key === 'Escape' && onCancel()}
        />
      </div>

      <div className={styles.who}>
        <input
          className={styles.input}
          placeholder="Who?"
          value={person}
          onChange={e => setPerson(e.target.value)}
          disabled={saving}
          onKeyDown={e => e.key === 'Escape' && onCancel()}
        />
      </div>

      <div className={styles.date}>{askedDate}</div>
      <div className={styles.date}>{dueDate || '—'}</div>

      <div className={styles.gridWrap}>
        <DateGrid
          askedDate={askedDate}
          dueDate={dueDate}
          onSelect={d => setDueDate(d)}
        />
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.saveBtn} disabled={!description.trim() || saving}>
          {saving ? '…' : '↵'}
        </button>
        <button type="button" className={styles.cancelBtn} onClick={onCancel} disabled={saving}>
          ✕
        </button>
      </div>
    </form>
  )
}
