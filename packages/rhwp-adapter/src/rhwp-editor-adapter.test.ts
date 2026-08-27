import { createEditor } from '@rhwp/editor'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { attachPossiblyModifiedEstimator } from './change-detection.ts'
import { RhwpErrorCode } from './errors/rhwp-errors.ts'
import { createRhwpEditor } from './rhwp-editor-adapter.ts'

vi.mock('@rhwp/editor', () => ({
  createEditor: vi.fn(),
}))

type MockEditor = {
  loadFile: ReturnType<typeof vi.fn>
  exportHwp: ReturnType<typeof vi.fn>
  exportHwpx: ReturnType<typeof vi.fn>
  notifySaved: ReturnType<typeof vi.fn>
  getHmlSaveState: ReturnType<typeof vi.fn>
  getPageSvg: ReturnType<typeof vi.fn>
  getRendererDiagnostics: ReturnType<typeof vi.fn>
  pageCount: ReturnType<typeof vi.fn>
  destroy: ReturnType<typeof vi.fn>
  element: HTMLIFrameElement
}

function createMockEditor(overrides: Partial<MockEditor> = {}): MockEditor {
  return {
    loadFile: vi.fn().mockResolvedValue({ pageCount: 4 }),
    exportHwp: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    exportHwpx: vi.fn().mockResolvedValue(new Uint8Array([4, 5, 6])),
    notifySaved: vi.fn().mockResolvedValue({ ok: true, wasDirty: true }),
    getHmlSaveState: vi.fn().mockResolvedValue({
      sourceFormat: 'hwp',
      hmlSavable: false,
      blockers: [],
    }),
    getPageSvg: vi.fn().mockResolvedValue('<svg></svg>'),
    getRendererDiagnostics: vi.fn().mockResolvedValue({
      schemaVersion: 1,
      initialized: true,
      initializationError: null,
      effectiveBackend: 'canvas2d',
      backendFallbackReason: null,
      request: null,
      page: { index: 0, canvaskit: null },
    }),
    pageCount: vi.fn().mockResolvedValue(4),
    destroy: vi.fn(),
    element: document.createElement('iframe'),
    ...overrides,
  }
}

const mockedCreateEditor = vi.mocked(createEditor)

describe('createRhwpEditor', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('loads a document and caches pageCount', async () => {
    mockedCreateEditor.mockResolvedValue(createMockEditor() as never)
    const handle = await createRhwpEditor(document.createElement('div'))
    const bytes = new Uint8Array([0xd0, 0xcf])

    expect(handle.getPageCount()).toBe(0)

    const result = await handle.load(bytes, 'sample.hwp')

    expect(result.pageCount).toBe(4)
    expect(handle.getPageCount()).toBe(4)
  })

  it('exports HWP bytes', async () => {
    const mock = createMockEditor()
    mockedCreateEditor.mockResolvedValue(mock as never)
    const handle = await createRhwpEditor(document.createElement('div'))

    await expect(handle.exportHwp()).resolves.toEqual(new Uint8Array([1, 2, 3]))
    expect(mock.exportHwp).toHaveBeenCalledTimes(1)
  })

  it('maps load failures to PARSE_FAILED', async () => {
    const mock = createMockEditor({
      loadFile: vi.fn().mockRejectedValue(new Error('broken file')),
    })
    mockedCreateEditor.mockResolvedValue(mock as never)
    const handle = await createRhwpEditor(document.createElement('div'))

    await expect(handle.load(new Uint8Array([1]), 'bad.hwp')).rejects.toMatchObject({
      code: RhwpErrorCode.PARSE_FAILED,
    })
  })

  it('maps createEditor failures to EDITOR_INITIALIZATION_FAILED', async () => {
    mockedCreateEditor.mockRejectedValue(new Error('iframe failed'))

    await expect(
      createRhwpEditor(document.createElement('div')),
    ).rejects.toMatchObject({
      code: RhwpErrorCode.EDITOR_INITIALIZATION_FAILED,
    })
  })

  it('maps wasm handshake failures to WASM_INITIALIZATION_FAILED', async () => {
    mockedCreateEditor.mockRejectedValue(new Error('WASM handshake timeout'))

    await expect(
      createRhwpEditor(document.createElement('div')),
    ).rejects.toMatchObject({
      code: RhwpErrorCode.WASM_INITIALIZATION_FAILED,
    })
  })

  it('maps export failures to EXPORT_FAILED', async () => {
    const mock = createMockEditor({
      exportHwp: vi.fn().mockRejectedValue(new Error('serialize failed')),
    })
    mockedCreateEditor.mockResolvedValue(mock as never)
    const handle = await createRhwpEditor(document.createElement('div'))

    await expect(handle.exportHwp()).rejects.toMatchObject({
      code: RhwpErrorCode.EXPORT_FAILED,
    })
  })

  it('returns wasDirty from notifySaved', async () => {
    mockedCreateEditor.mockResolvedValue(createMockEditor() as never)
    const handle = await createRhwpEditor(document.createElement('div'))

    await expect(handle.notifySaved('saved.hwp')).resolves.toEqual({
      wasDirty: true,
    })
  })

  it('destroys the underlying editor', async () => {
    const mock = createMockEditor()
    mockedCreateEditor.mockResolvedValue(mock as never)
    const handle = await createRhwpEditor(document.createElement('div'))

    handle.destroy()

    expect(mock.destroy).toHaveBeenCalledTimes(1)
  })

  it('nudges the iframe box after load so the studio repaints', async () => {
    const mock = createMockEditor()
    mock.element.style.height = '100%'
    mockedCreateEditor.mockResolvedValue(mock as never)
    const handle = await createRhwpEditor(document.createElement('div'))

    await handle.load(new Uint8Array([0xd0, 0xcf]), 'sample.hwp')

    expect(mock.element.style.height).toBe('calc(100% - 1px)')

    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)))

    expect(mock.element.style.height).toBe('100%')
  })

  it('maps renderer diagnostics to a narrow shape', async () => {
    mockedCreateEditor.mockResolvedValue(createMockEditor() as never)
    const handle = await createRhwpEditor(document.createElement('div'))

    await expect(handle.getRendererDiagnostics(0)).resolves.toMatchObject({
      available: true,
      initialized: true,
      effectiveBackend: 'canvas2d',
      readinessBlockers: [],
    })
  })

  it('reports diagnostics as unavailable when the studio lacks the capability', async () => {
    const mock = createMockEditor({
      getRendererDiagnostics: vi
        .fn()
        .mockRejectedValue(new Error('renderer-diagnostics-v1 not negotiated')),
    })
    mockedCreateEditor.mockResolvedValue(mock as never)
    const handle = await createRhwpEditor(document.createElement('div'))

    const diagnostics = await handle.getRendererDiagnostics()

    expect(diagnostics.available).toBe(false)
    expect(diagnostics.unavailableReason).toContain('renderer-diagnostics-v1')
  })

  it('exposes page SVG for render verification', async () => {
    mockedCreateEditor.mockResolvedValue(createMockEditor() as never)
    const handle = await createRhwpEditor(document.createElement('div'))

    await expect(handle.getPageSvg(0)).resolves.toBe('<svg></svg>')
  })

  it('does not claim native dirty events', async () => {
    mockedCreateEditor.mockResolvedValue(createMockEditor() as never)
    const handle = await createRhwpEditor(document.createElement('div'))

    expect(handle.capabilities.nativeDirtyEvents).toBe(false)
  })
})

describe('attachPossiblyModifiedEstimator', () => {
  it('notifies on iframe interaction without calling that native dirty', () => {
    const iframe = document.createElement('iframe')
    const onPossiblyModified = vi.fn()
    const detach = attachPossiblyModifiedEstimator(iframe, onPossiblyModified)

    iframe.dispatchEvent(new Event('pointerdown'))

    expect(onPossiblyModified).toHaveBeenCalledTimes(1)
    detach()
    iframe.dispatchEvent(new Event('pointerdown'))
    expect(onPossiblyModified).toHaveBeenCalledTimes(1)
  })
})
