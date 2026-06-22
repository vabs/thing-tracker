import { SignInButton, SignUpButton } from '@clerk/clerk-react'
import styles from './Landing.module.css'

const features = [
  {
    title: 'Log the ask',
    body: 'Capture what you asked for, who you asked, and the day you asked it — in one row, not buried in a chat thread.',
  },
  {
    title: 'See the timeline',
    body: 'A 5-day / 4-week / 3-month grid shows each request at a glance: green when on track, red when overdue.',
  },
  {
    title: 'Yours alone',
    body: 'Everything is private to your account and grouped into trackers like Personal, Work, or Side Projects.',
  },
]

export function Landing() {
  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <span className={styles.brand}>Thing Tracker</span>
        <div className={styles.navActions}>
          <SignInButton mode="modal">
            <button className={styles.ghostBtn}>Sign in</button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className={styles.primaryBtn}>Get started</button>
          </SignUpButton>
        </div>
      </header>

      <main className={styles.hero}>
        <h1 className={styles.title}>Thing Tracker</h1>
        <p className={styles.tagline}>
          Tell the person what you want and when you want it.
          <em> The clearer you can be, the easier it is for everyone.</em>
        </p>
        <p className={styles.sub}>
          Track the things you've asked other people to do — who owes you what, when you
          asked, and when you need it by — on a visual timeline that shows what's on track
          and what's slipping.
        </p>
        <div className={styles.cta}>
          <SignUpButton mode="modal">
            <button className={styles.primaryBtn}>Get started — it's free</button>
          </SignUpButton>
          <SignInButton mode="modal">
            <button className={styles.ghostBtn}>I already have an account</button>
          </SignInButton>
        </div>
      </main>

      <section className={styles.features}>
        {features.map(f => (
          <div key={f.title} className={styles.card}>
            <h2 className={styles.cardTitle}>{f.title}</h2>
            <p className={styles.cardBody}>{f.body}</p>
          </div>
        ))}
      </section>

      <footer className={styles.footer}>
        Your data lives in your own account. Nothing is shared.
      </footer>
    </div>
  )
}
