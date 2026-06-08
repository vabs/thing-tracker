import { useState } from 'react'
import { useConfig } from '../../hooks/useConfig'
import { Settings } from '../Settings/Settings'
import { TrackerView } from '../TrackerView/TrackerView'
import styles from './App.module.css'

export default function App() {
  const { config, setConfig, isConfigured } = useConfig()
  const [showSettings, setShowSettings] = useState(false)

  function handleSaveConfig(updates) {
    setConfig(updates)
    setShowSettings(false)
  }

  return (
    <div className={styles.app}>
      {(!isConfigured || showSettings) && (
        <Settings
          config={config}
          onSave={handleSaveConfig}
          onClose={isConfigured ? () => setShowSettings(false) : undefined}
          isFirstTime={!isConfigured}
        />
      )}
      {isConfigured && (
        <TrackerView
          config={config}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}
    </div>
  )
}
