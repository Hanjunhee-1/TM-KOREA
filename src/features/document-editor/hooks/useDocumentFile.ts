import { RhwpErrorCode } from 'rhwp-adapter'
import { USER_ERROR_MESSAGES } from '../types/document-editor.types.ts'

export const MAX_DOCUMENT_BYTES = 50 * 1024 * 1024

const HWP_OLE_MAGIC = [0xd0, 0xcf, 0x11, 0xe0]
const ZIP_MAGIC = [0x50, 0x4b]

export type FileValidationResult =
  | { ok: true; fileName: string; bytes: Uint8Array }
  | { ok: false; code: keyof typeof USER_ERROR_MESSAGES }

function hasPrefix(bytes: Uint8Array, prefix: number[]): boolean {
  if (bytes.length < prefix.length) {
    return false
  }
  return prefix.every((value, index) => bytes[index] === value)
}

function extensionOf(fileName: string): string {
  const index = fileName.lastIndexOf('.')
  return index >= 0 ? fileName.slice(index).toLowerCase() : ''
}

async function readFileBytes(file: File): Promise<Uint8Array> {
  if (typeof file.arrayBuffer === 'function') {
    return new Uint8Array(await file.arrayBuffer())
  }

  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      resolve(new Uint8Array(reader.result as ArrayBuffer))
    }
    reader.onerror = () => {
      reject(reader.error ?? new Error('Failed to read file'))
    }
    reader.readAsArrayBuffer(file)
  })
}

export async function readAndValidateDocumentFile(
  file: File,
): Promise<FileValidationResult> {
  const fileName = file.name
  const extension = extensionOf(fileName)

  if (extension !== '.hwp' && extension !== '.hwpx') {
    return { ok: false, code: RhwpErrorCode.UNSUPPORTED_FORMAT }
  }

  if (file.size > MAX_DOCUMENT_BYTES) {
    return { ok: false, code: 'FILE_TOO_LARGE' }
  }

  const bytes = await readFileBytes(file)

  if (extension === '.hwp' && !hasPrefix(bytes, HWP_OLE_MAGIC)) {
    return { ok: false, code: RhwpErrorCode.INVALID_FILE }
  }

  if (extension === '.hwpx' && !hasPrefix(bytes, ZIP_MAGIC)) {
    return { ok: false, code: RhwpErrorCode.INVALID_FILE }
  }

  return { ok: true, fileName, bytes }
}
