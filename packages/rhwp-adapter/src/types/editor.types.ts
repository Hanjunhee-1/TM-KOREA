import type { LoadDocumentResult, SourceFormat } from './document.types.ts'

export type AdapterCapabilities = {
  readOnly: false
  nativeDirtyEvents: false
  exportHwp: true
  exportHwpx: true
}

export const RHWP_ADAPTER_CAPABILITIES: AdapterCapabilities = {
  readOnly: false,
  nativeDirtyEvents: false,
  exportHwp: true,
  exportHwpx: true,
}

export type RendererBackend = 'auto' | 'canvas2d' | 'canvaskit'

export type CreateRhwpEditorOptions = {
  studioUrl?: string
  /**
   * Renderer requested from the studio. rhwp defaults to canvas2d; 'auto' lets
   * the studio run its own preflight and fall back.
   */
  renderer?: RendererBackend
  /**
   * Host-level viewer intent. @rhwp/editor 0.8.4 has no native readOnly option.
   * The adapter records the flag but does not block editing in the iframe.
   */
  readOnly?: boolean
  /**
   * Native dirty events are not available. This fires when the user interacts
   * with the editor iframe, which only means the document may have changed.
   */
  onPossiblyModified?: () => void
}

export type NotifySavedResult = {
  wasDirty: boolean
}

/**
 * Narrowed view of the studio's renderer-diagnostics-v1 payload. Kept small so
 * rhwp response types do not leak into feature code.
 */
export type RendererDiagnostics = {
  available: boolean
  initialized: boolean | null
  effectiveBackend: string | null
  initializationError: string | null
  backendFallbackReason: string | null
  selectionError: string | null
  readinessBlockers: string[]
  lastRenderError: string | null
  unavailableReason: string | null
}

export interface RhwpEditorHandle {
  load(bytes: Uint8Array, fileName: string): Promise<LoadDocumentResult>
  exportHwp(): Promise<Uint8Array>
  exportHwpx(): Promise<Uint8Array>
  notifySaved(fileName?: string): Promise<NotifySavedResult>
  getSourceFormat(): Promise<SourceFormat>
  getPageCount(): number
  getPageSvg(page?: number): Promise<string>
  getRendererDiagnostics(page?: number): Promise<RendererDiagnostics>
  /**
   * Forces the studio to re-measure its viewport and repaint. Needed because
   * rhwp only repaints on its own resize/scroll events.
   */
  refreshLayout(): void
  destroy(): void
  readonly capabilities: AdapterCapabilities
  readonly requestedReadOnly: boolean
}
