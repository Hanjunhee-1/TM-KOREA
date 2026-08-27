import {
  Alert,
  Chip,
  Stack,
  Typography,
} from '@mui/material'
import type { DocumentStatus } from '../types/document-editor.types.ts'

type DocumentStatusBarProps = {
  status: DocumentStatus
  fileName: string | null
  pageCount: number
  errorMessage: string | null
  diagnosticsText?: string | null
  readOnly: boolean
  nativeReadOnlySupported: boolean
}

function statusLabel(status: DocumentStatus): string {
  switch (status) {
    case 'idle':
      return '대기'
    case 'loading':
      return '불러오는 중'
    case 'ready':
      return '준비됨'
    case 'possibly-modified':
      return '편집 중 (변경 가능)'
    case 'saving':
      return '저장 중'
    case 'saved':
      return '저장됨 (로컬)'
    case 'error':
      return '오류'
  }
}

function statusColor(
  status: DocumentStatus,
): 'default' | 'info' | 'success' | 'warning' | 'error' {
  switch (status) {
    case 'loading':
    case 'saving':
      return 'info'
    case 'ready':
    case 'saved':
      return 'success'
    case 'possibly-modified':
      return 'warning'
    case 'error':
      return 'error'
    default:
      return 'default'
  }
}

export default function DocumentStatusBar({
  status,
  fileName,
  pageCount,
  errorMessage,
  diagnosticsText,
  readOnly,
  nativeReadOnlySupported,
}: DocumentStatusBarProps) {
  return (
    <Stack spacing={1}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', flexWrap: 'wrap' }}
      >
        <Typography variant="body2" color="text.secondary">
          상태
        </Typography>
        <Chip size="small" color={statusColor(status)} label={statusLabel(status)} />
        {fileName ? (
          <Typography variant="body2" color="text.secondary">
            {fileName}
          </Typography>
        ) : null}
        {pageCount > 0 ? (
          <Typography variant="body2" color="text.secondary">
            {pageCount}페이지
          </Typography>
        ) : null}
      </Stack>
      {status === 'possibly-modified' ? (
        <Typography variant="caption" color="text.secondary">
          native dirty event가 없어 현재는 변경 가능 상태를 추정합니다. 문서가
          실제로 수정되었는지는 rhwp가 알려주지 않습니다.
        </Typography>
      ) : null}
      {readOnly && !nativeReadOnlySupported ? (
        <Alert severity="info">
          읽기 전용(viewer) 모드는 요청되었지만 @rhwp/editor 0.8.4에는 native
          readOnly가 없습니다. 편집 UI는 그대로 표시됩니다.
        </Alert>
      ) : null}
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      {diagnosticsText ? (
        <Alert severity="info" sx={{ wordBreak: 'break-all' }}>
          {diagnosticsText}
        </Alert>
      ) : null}
    </Stack>
  )
}
