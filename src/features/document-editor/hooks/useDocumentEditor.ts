import { useCallback, useRef, useState } from 'react'
import {
  isRhwpAdapterError,
  type RhwpEditorHandle,
} from 'rhwp-adapter'
import type { DocumentStatus } from '../types/document-editor.types.ts'
import { USER_ERROR_MESSAGES } from '../types/document-editor.types.ts'

export function toUserErrorMessage(error: unknown): string {
  if (isRhwpAdapterError(error) && error.code in USER_ERROR_MESSAGES) {
    return USER_ERROR_MESSAGES[error.code]
  }
  return USER_ERROR_MESSAGES.PARSE_FAILED
}

export function useDocumentEditorState() {
  const handleRef = useRef<RhwpEditorHandle | null>(null)
  const [status, setStatus] = useState<DocumentStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [editorReady, setEditorReady] = useState(false)
  const [diagnosticsText, setDiagnosticsText] = useState<string | null>(null)

  const assignHandle = useCallback((handle: RhwpEditorHandle | null) => {
    handleRef.current = handle
    setEditorReady(handle !== null)
  }, [])

  const markPossiblyModified = useCallback(() => {
    setStatus((current) => {
      if (current === 'ready' || current === 'saved') {
        return 'possibly-modified'
      }
      return current
    })
  }, [])

  const loadDocument = useCallback(async (bytes: Uint8Array, nextFileName: string) => {
    const handle = handleRef.current
    if (!handle) {
      setStatus('error')
      setErrorMessage(USER_ERROR_MESSAGES.EDITOR_INITIALIZATION_FAILED)
      return
    }

    setStatus('loading')
    setErrorMessage(null)
    setDiagnosticsText(null)

    try {
      const result = await handle.load(bytes, nextFileName)
      setFileName(nextFileName)
      setPageCount(result.pageCount)
      setStatus('ready')
    } catch (error) {
      console.error('Failed to load document', error)
      setStatus('error')
      setErrorMessage(toUserErrorMessage(error))
    }
  }, [])

  const persistAfterExport = useCallback(
    async (
      persist: (bytes: Uint8Array) => Promise<void>,
      format: 'hwp' | 'hwpx',
    ) => {
      const handle = handleRef.current
      if (!handle) {
        setStatus('error')
        setErrorMessage(USER_ERROR_MESSAGES.EDITOR_INITIALIZATION_FAILED)
        return
      }

      setStatus('saving')
      setErrorMessage(null)

      try {
        const bytes =
          format === 'hwp' ? await handle.exportHwp() : await handle.exportHwpx()
        await persist(bytes)
        try {
          await handle.notifySaved(fileName ?? undefined)
        } catch (notifyError) {
          console.error(
            'Host persist succeeded, but notifySaved failed. This is not a server save.',
            notifyError,
          )
        }
        setPageCount(handle.getPageCount())
        setStatus('saved')
      } catch (error) {
        console.error('Failed to export or persist document', error)
        setStatus('error')
        setErrorMessage(toUserErrorMessage(error))
      }
    },
    [fileName],
  )

  const runDiagnostics = useCallback(async () => {
    const handle = handleRef.current
    if (!handle) {
      setDiagnosticsText('편집기가 아직 준비되지 않았습니다.')
      return
    }

    const diagnostics = await handle.getRendererDiagnostics(0)
    let svgLength = -1
    let svgError: string | null = null
    try {
      svgLength = (await handle.getPageSvg(0)).length
    } catch (error) {
      svgError = error instanceof Error ? error.message : String(error)
    }

    console.info('rhwp renderer diagnostics', {
      diagnostics,
      pageCount: handle.getPageCount(),
      svgLength,
      svgError,
    })

    const summary = diagnostics.available
      ? [
          `backend=${diagnostics.effectiveBackend ?? 'unknown'}`,
          `initialized=${String(diagnostics.initialized)}`,
          diagnostics.initializationError
            ? `initError=${diagnostics.initializationError}`
            : null,
          diagnostics.backendFallbackReason
            ? `fallback=${diagnostics.backendFallbackReason}`
            : null,
          diagnostics.lastRenderError
            ? `renderError=${diagnostics.lastRenderError}`
            : null,
          diagnostics.readinessBlockers.length
            ? `blockers=${diagnostics.readinessBlockers.join(',')}`
            : null,
        ]
          .filter(Boolean)
          .join(' · ')
      : `renderer-diagnostics 사용 불가: ${diagnostics.unavailableReason ?? 'unknown'}`

    setDiagnosticsText(
      `pages=${handle.getPageCount()} · svgLength=${svgLength}${
        svgError ? ` (svgError=${svgError})` : ''
      } · ${summary}`,
    )

    handle.refreshLayout()
  }, [])

  return {
    handleRef,
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
  }
}
