import { useState } from 'react'
import { DateGrid } from '../DateGrid/DateGrid'
import { displayDate } from '../../lib/dateUtils'
import styles from './TrackerRow.module.css'

export function TrackerRow({ item, index, onUpdate }) {
  const [editingDesc, setEditingDesc] = useState(false)
  const [editingPerson, setEditingPerson] = useState(false)
  const [descVal, setDescVal] = useState(item.description)
  const [personVal, setPersonVal] = useState(item.person)
  const [saving, setSaving] = useState(false)

  async function save(updates) {
    setSaving(true)
    try {
      await onUpdate(item.id, updates)
    } finally {
      setSaving(false)
    }
  }

  function commitDesc() {
    setEditingDesc(false)
    if (descVal.trim() && descVal !== item.description) {
      save({ description: descVal.trim() })
    } else {
      setDescVal(item.description)
    }
  }

  function commitPerson() {
    setEditingPerson(false)
    if (personVal.trim() && personVal !== item.person) {
      save({ person: personVal.trim() })
    } else {
      setPersonVal(item.person)
    }
  }

  function handleDueSelect(dateStr) {
    save({ dueDate: dateStr })
  }

  function toggleDone() {
    save({ isDone: !item.isDone })
  }

  return (
    <div className={`${styles.row} ${item.isDone ? styles.done : ''} ${saving ? styles.saving : ''}`}>
      <div className={styles.index}>{index}</div>
      <div className={styles.desc}>
        {editingDesc ? (
          <input
            className={styles.input}
            value={descVal}
            onChange={e => setDescVal(e.target.value)}
            onBlur={commitDesc}
            onKeyDown={e => { if (e.key === 'Enter') commitDesc(); if (e.key === 'Escape') { setDescVal(item.description); setEditingDesc(false) } }}
            autoFocus
          />
        ) : (
          <span className={styles.cell} onClick={() => setEditingDesc(true)}>{item.description}</span>
        )}
      </div>

      <div className={styles.who}>
        {editingPerson ? (
          <input
            className={styles.input}
            value={personVal}
            onChange={e => setPersonVal(e.target.value)}
            onBlur={commitPerson}
            onKeyDown={e => { if (e.key === 'Enter') commitPerson(); if (e.key === 'Escape') { setPersonVal(item.person); setEditingPerson(false) } }}
            autoFocus
          />
        ) : (
          <span className={styles.cell} onClick={() => setEditingPerson(true)}>{item.person || '—'}</span>
        )}
      </div>

      <div className={styles.date}>{displayDate(item.askedDate)}</div>
      <div className={styles.date}>{displayDate(item.dueDate)}</div>

      <div className={styles.gridWrap}>
        <DateGrid
          askedDate={item.askedDate}
          dueDate={item.dueDate}
          onSelect={handleDueSelect}
          isDone={item.isDone}
        />
      </div>

      <button
        className={`${styles.doneBtn} ${item.isDone ? styles.doneBtnActive : ''}`}
        onClick={toggleDone}
        title={item.isDone ? 'Reopen' : 'Mark done'}
      >
        {item.isDone ? '↩' : '✓'}
      </button>
    </div>
  )
}
