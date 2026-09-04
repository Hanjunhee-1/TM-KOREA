export type StoredDocument = {
  id: string
  fileName: string
  bytes: Uint8Array
  savedAt: string
}

export interface DocumentStorage {
  upload(id: string, bytes: Uint8Array, fileName: string): Promise<StoredDocument>
  download(id: string): Promise<StoredDocument>
  delete(id: string): Promise<void>
}
