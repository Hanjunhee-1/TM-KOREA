import { describe, expect, it } from 'vitest'
import { readAndValidateDocumentFile } from './useDocumentFile.ts'

function fileFromBytes(name: string, bytes: number[]): File {
  const data = new Uint8Array(bytes)
  return {
    name,
    size: data.byteLength,
    arrayBuffer: async () =>
      data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength),
  } as File
}

describe('readAndValidateDocumentFile', () => {
  it('rejects unsupported extensions', async () => {
    const result = await readAndValidateDocumentFile(
      fileFromBytes('notes.txt', [1, 2, 3]),
    )
    expect(result).toEqual({ ok: false, code: 'UNSUPPORTED_FORMAT' })
  })

  it('rejects .hwp files that are not OLE2 compound files', async () => {
    const result = await readAndValidateDocumentFile(
      fileFromBytes('fake.hwp', [0x50, 0x4b, 0x03, 0x04]),
    )
    expect(result).toEqual({ ok: false, code: 'INVALID_FILE' })
  })

  it('accepts OLE2 magic for .hwp', async () => {
    const bytes = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]
    const result = await readAndValidateDocumentFile(fileFromBytes('sample.hwp', bytes))
    expect(result.ok).toBe(true)
  })
})
