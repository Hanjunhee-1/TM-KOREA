import { useEffect, useRef } from 'react'
import { Box } from '@mui/material'
import {
  createRhwpEditor,
  isRhwpAdapterError,
  type RendererBackend,
  type RhwpEditorHandle,
} from 'rhwp-adapter'
import { USER_ERROR_MESSAGES } from '../types/document-editor.types.ts'

type DocumentEditorProps = {
  readOnly?: boolean
  renderer?: RendererBackend
  /**
   * CSS height for the editor surface. Must resolve to a definite value, since
   * the studio lays itself out with 100vh and the iframe uses height: 100%.
   */
  height?: string
  bordered?: boolean
  onReady?: (handle: RhwpEditorHandle) => void
  onPossiblyModified?: () => void
  onChange?: () => void
  onError?: (message: string) => void
  onDestroyed?: () => void
}

export default function DocumentEditor({
  readOnly = false,
  renderer,
  height = '100%',
  bordered = false,
  onReady,
  onPossiblyModified,
  onChange,
  onError,
  onDestroyed,
}: DocumentEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onReadyRef = useRef(onReady)
  const onPossiblyModifiedRef = useRef(onPossiblyModified)
  const onChangeRef = useRef(onChange)
  const onErrorRef = useRef(onError)
  const onDestroyedRef = useRef(onDestroyed)

  useEffect(() => {
    onReadyRef.current = onReady
    onPossiblyModifiedRef.current = onPossiblyModified
    onChangeRef.current = onChange
    onErrorRef.current = onError
    onDestroyedRef.current = onDestroyed
  }, [onChange, onDestroyed, onError, onPossiblyModified, onReady])

  useEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    let cancelled = false
    let handle: RhwpEditorHandle | undefined

    createRhwpEditor(container, {
      readOnly,
      renderer,
      onPossiblyModified: () => {
        onPossiblyModifiedRef.current?.()
        onChangeRef.current?.()
      },
    })
      .then((created) => {
        handle = created
        if (cancelled) {
          created.destroy()
          return
        }
        onReadyRef.current?.(created)
      })
      .catch((error: unknown) => {
        console.error('Failed to initialize rhwp editor', error)
        if (isRhwpAdapterError(error) && error.code in USER_ERROR_MESSAGES) {
          onErrorRef.current?.(USER_ERROR_MESSAGES[error.code])
          return
        }
        onErrorRef.current?.(USER_ERROR_MESSAGES.EDITOR_INITIALIZATION_FAILED)
      })

    return () => {
      cancelled = true
      handle?.destroy()
      // createRhwpEditor mounts the studio iframe before its handshake resolves.
      // Without this, a remount stacks a second iframe and the empty one on top
      // is what the user sees while the document lives in the hidden one.
      container.replaceChildren()
      onDestroyedRef.current?.()
    }
  }, [readOnly, renderer])

  return (
    <Box
      ref={containerRef}
      sx={{
        display: 'flex',
        height,
        width: '100%',
        bgcolor: 'background.paper',
        border: bordered ? 1 : 0,
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    />
  )
}
