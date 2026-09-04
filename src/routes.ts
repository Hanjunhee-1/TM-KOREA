import { useEffect, useState } from 'react'

/**
 * Hash routing keeps the editor on its own URL without a server-side rewrite,
 * so a deep link works in dev, preview, and any static host. Swap this for a
 * router once the app needs more than the prototype's two pages.
 */
export const EDITOR_ROUTE = '#/editor'

export function useHashRoute(): string {
  const [hash, setHash] = useState(() => window.location.hash)

  useEffect(() => {
    const syncHash = () => {
      setHash(window.location.hash)
    }
    window.addEventListener('hashchange', syncHash)
    return () => {
      window.removeEventListener('hashchange', syncHash)
    }
  }, [])

  return hash
}

export function isEditorRoute(hash: string): boolean {
  return hash === EDITOR_ROUTE || hash.startsWith(`${EDITOR_ROUTE}/`)
}

export function openEditorWindow(): void {
  window.open(
    `${window.location.pathname}${EDITOR_ROUTE}`,
    '_blank',
    'noopener,noreferrer',
  )
}
