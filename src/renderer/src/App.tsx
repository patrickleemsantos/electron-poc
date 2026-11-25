import { useEffect, useState } from 'react'

type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error'

interface Entry {
  name: string
  email: string
}

function App(): JSX.Element {
  const [version, setVersion] = useState('')
  const [status, setStatus] = useState<UpdateStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [newVersion, setNewVersion] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [entries, setEntries] = useState<Entry[]>([])

  useEffect(() => {
    window.updater.getVersion().then(setVersion)

    window.updater.onChecking(() => setStatus('checking'))
    window.updater.onAvailable((info) => {
      setStatus('available')
      setNewVersion((info as { version?: string })?.version ?? null)
    })
    window.updater.onNotAvailable(() => setStatus('not-available'))
    window.updater.onError((message) => {
      setStatus('error')
      setErrorMessage(message)
    })
    window.updater.onProgress((p) => {
      setStatus('downloading')
      setProgress(Math.round((p as { percent?: number })?.percent ?? 0))
    })
    window.updater.onDownloaded(() => setStatus('downloaded'))
  }, [])

  function handleSubmit(e: React.FormEvent): void {
    e.preventDefault()
    if (!name || !email) return
    setEntries((prev) => [...prev, { name, email }])
    setName('')
    setEmail('')
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 24, maxWidth: 560 }}>
      <h1>Electron POC 🚀 (updated!)</h1>
      <p>
        Current version: <strong>{version}</strong>
      </p>

      <section style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16, marginBottom: 24 }}>
        <h2>Updates</h2>
        <p>Status: {status}</p>
        {status === 'available' && <p>New version available: {newVersion}</p>}
        {status === 'downloading' && <p>Downloading... {progress}%</p>}
        {status === 'error' && <p style={{ color: 'red' }}>Error: {errorMessage}</p>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => window.updater.checkForUpdates()}>Check for Updates</button>
          {status === 'available' && (
            <button onClick={() => window.updater.downloadUpdate()}>Download Update</button>
          )}
          {status === 'downloaded' && (
            <button onClick={() => window.updater.installUpdate()}>Restart &amp; Install</button>
          )}
        </div>
      </section>

      <section style={{ border: '1px solid #ccc', borderRadius: 8, padding: 16 }}>
        <h2>Sample Form</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <button type="submit">Add</button>
        </form>
        <ul>
          {entries.map((entry, i) => (
            <li key={i}>
              {entry.name} — {entry.email}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default App
