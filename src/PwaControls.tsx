import { useEffect, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { translations, type Language } from './data/translations'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export function PwaControls({ language }: { language: Language }) {
  const copy = translations[language]
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent>()
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallPrompt(event as BeforeInstallPromptEvent)
    }
    function handleAppInstalled() { setInstallPrompt(undefined) }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  async function installApp() {
    if (!installPrompt) return
    await installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(undefined)
  }

  return <div className="pwa-controls">
    {needRefresh ? <section className="update-prompt" role="status" aria-live="polite" aria-atomic="true">
      <p>{copy.updateAvailable}</p>
      <div className="update-prompt__actions">
        <button type="button" onClick={() => setNeedRefresh(false)}>{copy.updateLater}</button>
        <button className="update-prompt__primary" type="button" onClick={() => updateServiceWorker(true)}>{copy.updateNow}</button>
      </div>
    </section> : installPrompt ? <button className="install-button" type="button" onClick={installApp}>{copy.installApp}</button> : null}
  </div>
}
