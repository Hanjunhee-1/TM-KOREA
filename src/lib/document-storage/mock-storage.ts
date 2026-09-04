import type { DocumentStorage, StoredDocument } from './types.ts'

export class MockStorage implements DocumentStorage {
  private readonly documents = new Map<string, StoredDocument>()

  async upload(
    id: string,
    bytes: Uint8Array,
    fileName: string,
  ): Promise<StoredDocument> {
    const document: StoredDocument = {
      id,
      fileName,
      bytes: new Uint8Array(bytes),
      savedAt: new Date().toISOString(),
    }
    this.documents.set(id, document)
    return document
  }

  async download(id: string): Promise<StoredDocument> {
    const document = this.documents.get(id)
    if (!document) {
      throw new Error(`Document not found: ${id}`)
    }
    return document
  }

  async delete(id: string): Promise<void> {
    this.documents.delete(id)
  }
}
