export type DocumentStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'possibly-modified'
  | 'saving'
  | 'saved'
  | 'error'

export type DocumentEditorMode = 'editor' | 'viewer'

export type HostPersistKind = 'mock-storage' | 'download'

export const USER_ERROR_MESSAGES = {
  INVALID_FILE: '문서를 열 수 없습니다. 파일 형식을 확인해주세요.',
  UNSUPPORTED_FORMAT: '지원하지 않는 파일 형식입니다.',
  PARSE_FAILED: '문서를 열 수 없습니다. 파일이 손상되었거나 지원하지 않는 형식일 수 있습니다.',
  EDITOR_INITIALIZATION_FAILED: '편집기를 시작할 수 없습니다.',
  EXPORT_FAILED: '문서를 내보낼 수 없습니다.',
  WASM_INITIALIZATION_FAILED: '편집기를 시작할 수 없습니다.',
  FILE_TOO_LARGE: '파일이 너무 큽니다. 50MB 이하 파일만 열 수 있습니다.',
} as const
