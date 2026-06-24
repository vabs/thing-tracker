import { useState } from 'react'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import { Landing } from '../Landing/Landing'
import { Settings } from '../Settings/Settings'
import { TrackerView } from '../TrackerView/TrackerView'
import styles from './App.module.css'

export default function App() {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className={styles.app}>
      <SignedOut>
        <Landing />
      </SignedOut>

      <SignedIn>
        <TrackerView onOpenSettings={() => setShowSettings(true)} />
        {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      </SignedIn>
    </div>
  )
}
