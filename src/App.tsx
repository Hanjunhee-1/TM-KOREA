import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import { School as SchoolIcon } from '@mui/icons-material'
import {
  AppBar,
  Box,
  Chip,
  Container,
  Toolbar,
  Typography,
} from '@mui/material'
import type { RendererBackend, RhwpEditorHandle } from 'rhwp-adapter'
import {
  DocumentEditor,
  DocumentStatusBar,
  DocumentToolbar,
  readAndValidateDocumentFile,
  useDocumentEditorState,
} from './features/document-editor/index.ts'
import {
  downloadBytes,
  exportFileName,
  mimeTypeForFileName,
} from './features/document-editor/download.ts'
import { USER_ERROR_MESSAGES } from './features/document-editor/types/document-editor.types.ts'
import { MockStorage } from './lib/document-storage/index.ts'

type HealthResponse = {
  status: string
  service: string
}

function configuredRenderer(): RendererBackend | undefined {
  const value = import.meta.env.VITE_RHWP_RENDERER as string | undefined
  if (value === 'auto' || value === 'canvas2d' || value === 'canvaskit') {
    return value
  }
  return undefined
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [healthError, setHealthError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const storage = useMemo(() => new MockStorage(), [])
  const renderer = useMemo(() => configuredRenderer(), [])
  const {
    status,
    errorMessage,
    fileName,
    pageCount,
    editorReady,
    diagnosticsText,
    assignHandle,
    markPossiblyModified,
    loadDocument,
    persistAfterExport,
    runDiagnostics,
    setErrorMessage,
    setStatus,
  } = useDocumentEditorState()

  useEffect(() => {
    fetch('/api/health')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        return (await response.json()) as HealthResponse
      })
      .then(setHealth)
      .catch((err: unknown) => {
        setHealthError(err instanceof Error ? err.message : '연결에 실패했습니다.')
      })
  }, [])

  const handleReady = useCallback(
    (handle: RhwpEditorHandle) => {
      assignHandle(handle)
    },
    [assignHandle],
  )

  const handleEditorError = useCallback(
    (message: string) => {
      setStatus('error')
      setErrorMessage(message)
    },
    [setErrorMessage, setStatus],
  )

  const handleDestroyed = useCallback(() => {
    assignHandle(null)
  }, [assignHandle])

  const handleOpenClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      event.target.value = ''
      if (!file) {
        return
      }

      const validated = await readAndValidateDocumentFile(file)
      if (!validated.ok) {
        setStatus('error')
        setErrorMessage(USER_ERROR_MESSAGES[validated.code])
        return
      }

      await loadDocument(validated.bytes, validated.fileName)
    },
    [loadDocument, setErrorMessage, setStatus],
  )

  const persistFormat = fileName?.toLowerCase().endsWith('.hwpx') ? 'hwpx' : 'hwp'

  const handleSaveClick = useCallback(() => {
    void persistAfterExport(async (bytes) => {
      const id = fileName ?? 'document'
      await storage.upload(id, bytes, exportFileName(fileName, persistFormat))
    }, persistFormat)
  }, [fileName, persistAfterExport, persistFormat, storage])

  const handleDownloadClick = useCallback(() => {
    void persistAfterExport(async (bytes) => {
      const nextName = exportFileName(fileName, persistFormat)
      downloadBytes(bytes, nextName, mimeTypeForFileName(nextName))
    }, persistFormat)
  }, [fileName, persistAfterExport, persistFormat])

  const handleDiagnosticsClick = useCallback(() => {
    void runDiagnostics()
  }, [runDiagnostics])

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AppBar position="sticky">
        <Toolbar>
          <SchoolIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            TM-KOREA 문서 편집
          </Typography>
          {health ? (
            <Chip
              size="small"
              color="success"
              label={`API ${health.status}`}
              sx={{ bgcolor: 'success.light' }}
            />
          ) : (
            <Chip
              size="small"
              color={healthError ? 'warning' : 'default'}
              label={healthError ? 'API 미연결' : 'API 확인 중'}
            />
          )}
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="xl"
        sx={{ py: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <DocumentToolbar
          status={status}
          editorReady={editorReady}
          hasDocument={Boolean(fileName)}
          onOpenClick={handleOpenClick}
          onSaveClick={handleSaveClick}
          onDownloadClick={handleDownloadClick}
          onDiagnosticsClick={
            import.meta.env.DEV ? handleDiagnosticsClick : undefined
          }
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".hwp,.hwpx,application/x-hwp,application/vnd.hancom.hwpx"
          hidden
          onChange={handleFileChange}
        />

        <DocumentEditor
          readOnly={false}
          renderer={renderer}
          onReady={handleReady}
          onPossiblyModified={markPossiblyModified}
          onChange={markPossiblyModified}
          onError={handleEditorError}
          onDestroyed={handleDestroyed}
        />

        <DocumentStatusBar
          status={status}
          fileName={fileName}
          pageCount={pageCount}
          errorMessage={errorMessage}
          diagnosticsText={diagnosticsText}
          readOnly={false}
          nativeReadOnlySupported={false}
        />
      </Container>
    </Box>
  )
}

export default App
