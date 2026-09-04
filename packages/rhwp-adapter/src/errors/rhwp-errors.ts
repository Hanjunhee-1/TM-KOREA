export const RhwpErrorCode = {
  INVALID_FILE: 'INVALID_FILE',
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
  PARSE_FAILED: 'PARSE_FAILED',
  EDITOR_INITIALIZATION_FAILED: 'EDITOR_INITIALIZATION_FAILED',
  EXPORT_FAILED: 'EXPORT_FAILED',
  WASM_INITIALIZATION_FAILED: 'WASM_INITIALIZATION_FAILED',
} as const

export type RhwpErrorCode =
  (typeof RhwpErrorCode)[keyof typeof RhwpErrorCode]

export class RhwpAdapterError extends Error {
  readonly code: RhwpErrorCode
  readonly cause: unknown

  constructor(code: RhwpErrorCode, message: string, cause?: unknown) {
    super(message)
    this.name = 'RhwpAdapterError'
    this.code = code
    this.cause = cause
  }
}

export function isRhwpAdapterError(error: unknown): error is RhwpAdapterError {
  return error instanceof RhwpAdapterError
}

function errorText(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name} ${error.message}`.toLowerCase()
  }
  return String(error).toLowerCase()
}

export function mapRhwpError(
  error: unknown,
  fallback: RhwpErrorCode,
): RhwpAdapterError {
  if (isRhwpAdapterError(error)) {
    return error
  }

  const text = errorText(error)

  if (
    text.includes('wasm') ||
    text.includes('handshake') ||
    text.includes('webassembly')
  ) {
    return new RhwpAdapterError(
      RhwpErrorCode.WASM_INITIALIZATION_FAILED,
      'Failed to initialize the rhwp runtime.',
      error,
    )
  }

  if (fallback === RhwpErrorCode.EDITOR_INITIALIZATION_FAILED) {
    return new RhwpAdapterError(
      RhwpErrorCode.EDITOR_INITIALIZATION_FAILED,
      'Failed to initialize the rhwp editor.',
      error,
    )
  }

  if (fallback === RhwpErrorCode.EXPORT_FAILED) {
    return new RhwpAdapterError(
      RhwpErrorCode.EXPORT_FAILED,
      'Failed to export the document.',
      error,
    )
  }

  return new RhwpAdapterError(
    fallback,
    'Failed to process the document.',
    error,
  )
}
