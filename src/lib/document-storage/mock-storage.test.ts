import { describe, expect, it } from 'vitest'
import { MockStorage } from './mock-storage.ts'

describe('MockStorage', () => {
  it('uploads and downloads the same bytes', async () => {
    const storage = new MockStorage()
    const bytes = new Uint8Array([9, 8, 7])

    await storage.upload('doc-1', bytes, 'sample.hwp')
    const stored = await storage.download('doc-1')

    expect(stored.fileName).toBe('sample.hwp')
    expect(stored.bytes).toEqual(bytes)
  })
})
