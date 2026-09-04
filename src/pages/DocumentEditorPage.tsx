import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Box } from '@mui/material'
import type { RendererBackend } from 'rhwp-adapter'
import { DocumentEditor } from '../features/document-editor/index.ts'

function configuredRenderer(): RendererBackend | undefined {
  const value = import.meta.env.VITE_RHWP_RENDERER as string | undefined
  if (value === 'auto' || value === 'canvas2d' || value === 'canvaskit') {
    return value
  }
  return undefined
}

export default function DocumentEditorPage() {
  const renderer = useMemo(() => configuredRenderer(), [])
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'TM-KOREA 문서 편집기'
  }, [])

  const handleError = useCallback((message: string) => {
    setInitError(message)
  }, [])

  return (
    <Box
      sx={{
        // The editor owns the whole tab, so a fixed viewport box gives it the
        // definite height the studio needs and leaves no host chrome.
        position: 'fixed',
        inset: 0,
        display: 'flex',
        bgcolor: 'background.default',
      }}
    >
      <DocumentEditor renderer={renderer} onError={handleError} />

      {initError ? (
        <Alert
          severity="error"
          sx={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {initError}
        </Alert>
      ) : null}
    </Box>
  )
}
