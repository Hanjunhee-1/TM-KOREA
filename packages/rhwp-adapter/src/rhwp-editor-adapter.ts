import { createEditor, type RhwpEditor } from '@rhwp/editor'
import { attachPossiblyModifiedEstimator } from './change-detection.ts'
import {
  mapRhwpError,
  RhwpAdapterError,
  RhwpErrorCode,
} from './errors/rhwp-errors.ts'
import type { LoadDocumentResult, SourceFormat } from './types/document.types.ts'
import {
  RHWP_ADAPTER_CAPABILITIES,
  type CreateRhwpEditorOptions,
  type NotifySavedResult,
  type RendererDiagnostics,
  type RhwpEditorHandle,
} from './types/editor.types.ts'

function toSourceFormat(value: string | undefined): SourceFormat {
  if (value === 'hwp' || value === 'hwpx' || value === 'hml') {
    return value
  }
  return 'unknown'
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

class RhwpEditorAdapter implements RhwpEditorHandle {
  readonly capabilities = RHWP_ADAPTER_CAPABILITIES
  readonly requestedReadOnly: boolean

  private editor: RhwpEditor
  private pageCount = 0
  private detachEstimator: (() => void) | undefined
  private layoutTimers = new Set<ReturnType<typeof setTimeout>>()

  constructor(editor: RhwpEditor, options: CreateRhwpEditorOptions) {
    this.editor = editor
    this.requestedReadOnly = options.readOnly === true

    if (options.onPossiblyModified) {
      this.detachEstimator = attachPossiblyModifiedEstimator(
        editor.element,
        options.onPossiblyModified,
      )
    }
  }

  async load(bytes: Uint8Array, fileName: string): Promise<LoadDocumentResult> {
    try {
      const copy = new Uint8Array(bytes)
      const result = await this.editor.loadFile(copy, fileName, {
        skipUnsavedGuard: true,
        suppressDialogs: true,
      })
      this.pageCount = result.pageCount
      this.refreshLayout()
      // The studio finishes its own post-load rendering asynchronously, so nudge
      // once more in case the first pass ran before it was ready to paint.
      this.scheduleLayoutRefresh(250)
      return { pageCount: result.pageCount }
    } catch (error) {
      throw mapRhwpError(error, RhwpErrorCode.PARSE_FAILED)
    }
  }

  /**
   * The studio paints pages from its own viewport controller, which only
   * recomputes on ResizeObserver/scroll events. Embedded in an iframe the load
   * can finish without such an event, leaving the page area blank. Changing the
   * iframe box by 1px makes the studio re-measure and repaint.
   */
  refreshLayout(): void {
    const element = this.editor.element
    const original = element.style.height || '100%'
    element.style.height = `calc(${original} - 1px)`

    const restore = () => {
      element.style.height = original
    }

    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(restore)
      return
    }
    setTimeout(restore, 0)
  }

  private scheduleLayoutRefresh(delayMs: number): void {
    const timer = setTimeout(() => {
      this.layoutTimers.delete(timer)
      this.refreshLayout()
    }, delayMs)
    this.layoutTimers.add(timer)
  }

  async exportHwp(): Promise<Uint8Array> {
    try {
      return await this.editor.exportHwp()
    } catch (error) {
      throw mapRhwpError(error, RhwpErrorCode.EXPORT_FAILED)
    }
  }

  async exportHwpx(): Promise<Uint8Array> {
    try {
      return await this.editor.exportHwpx()
    } catch (error) {
      throw mapRhwpError(error, RhwpErrorCode.EXPORT_FAILED)
    }
  }

  async notifySaved(fileName?: string): Promise<NotifySavedResult> {
    try {
      const result = await this.editor.notifySaved(fileName)
      return { wasDirty: result.wasDirty }
    } catch (error) {
      throw new RhwpAdapterError(
        RhwpErrorCode.EXPORT_FAILED,
        'Failed to notify the editor that the host persist completed.',
        error,
      )
    }
  }

  async getSourceFormat(): Promise<SourceFormat> {
    try {
      const state = await this.editor.getHmlSaveState()
      return toSourceFormat(state.sourceFormat)
    } catch (error) {
      throw mapRhwpError(error, RhwpErrorCode.PARSE_FAILED)
    }
  }

  getPageCount(): number {
    return this.pageCount
  }

  async getPageSvg(page = 0): Promise<string> {
    try {
      return await this.editor.getPageSvg(page)
    } catch (error) {
      throw mapRhwpError(error, RhwpErrorCode.PARSE_FAILED)
    }
  }

  async getRendererDiagnostics(page = 0): Promise<RendererDiagnostics> {
    try {
      const raw = await this.editor.getRendererDiagnostics(page)
      return {
        available: true,
        initialized: raw.initialized,
        effectiveBackend: raw.effectiveBackend,
        initializationError: raw.initializationError,
        backendFallbackReason: raw.backendFallbackReason,
        selectionError: raw.selection?.selectionError ?? null,
        readinessBlockers: raw.page.canvaskit?.readinessBlockers ?? [],
        lastRenderError: raw.page.canvaskit?.lastRenderError ?? null,
        unavailableReason: null,
      }
    } catch (error) {
      return {
        available: false,
        initialized: null,
        effectiveBackend: null,
        initializationError: null,
        backendFallbackReason: null,
        selectionError: null,
        readinessBlockers: [],
        lastRenderError: null,
        unavailableReason: messageOf(error),
      }
    }
  }

  destroy(): void {
    for (const timer of this.layoutTimers) {
      clearTimeout(timer)
    }
    this.layoutTimers.clear()
    this.detachEstimator?.()
    this.detachEstimator = undefined
    this.editor.destroy()
  }
}

export async function createRhwpEditor(
  container: HTMLElement,
  options: CreateRhwpEditorOptions = {},
): Promise<RhwpEditorHandle> {
  try {
    const editor = await createEditor(container, {
      studioUrl: options.studioUrl,
      renderer: options.renderer,
      width: '100%',
      height: '100%',
    })
    editor.element.style.display = 'block'
    editor.element.style.border = '0'
    return new RhwpEditorAdapter(editor, options)
  } catch (error) {
    throw mapRhwpError(error, RhwpErrorCode.EDITOR_INITIALIZATION_FAILED)
  }
}
