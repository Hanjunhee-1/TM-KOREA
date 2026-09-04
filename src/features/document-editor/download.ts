export function downloadBytes(
  bytes: Uint8Array,
  fileName: string,
  mimeType: string,
): void {
  const blob = new Blob([new Uint8Array(bytes)], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export function mimeTypeForFileName(fileName: string): string {
  return fileName.toLowerCase().endsWith('.hwpx')
    ? 'application/vnd.hancom.hwpx'
    : 'application/x-hwp'
}

export function exportFileName(fileName: string | null, format: 'hwp' | 'hwpx'): string {
  const base = fileName?.replace(/\.(hwp|hwpx)$/i, '') || 'document'
  return `${base}.${format}`
}
