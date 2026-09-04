import { Button, Stack } from '@mui/material'
import type { DocumentStatus } from '../types/document-editor.types.ts'

type DocumentToolbarProps = {
  status: DocumentStatus
  editorReady: boolean
  hasDocument: boolean
  onOpenClick: () => void
  onSaveClick: () => void
  onDownloadClick: () => void
  onDiagnosticsClick?: () => void
}

export default function DocumentToolbar({
  status,
  editorReady,
  hasDocument,
  onOpenClick,
  onSaveClick,
  onDownloadClick,
  onDiagnosticsClick,
}: DocumentToolbarProps) {
  const busy = status === 'loading' || status === 'saving'
  const canPersist = editorReady && hasDocument && !busy && status !== 'idle'

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
      <Button variant="contained" onClick={onOpenClick} disabled={!editorReady || busy}>
        파일 열기
      </Button>
      <Button variant="outlined" onClick={onSaveClick} disabled={!canPersist}>
        저장
      </Button>
      <Button variant="outlined" onClick={onDownloadClick} disabled={!canPersist}>
        다운로드
      </Button>
      {onDiagnosticsClick ? (
        <Button
          variant="text"
          color="inherit"
          onClick={onDiagnosticsClick}
          disabled={!editorReady || busy}
        >
          렌더 진단
        </Button>
      ) : null}
    </Stack>
  )
}
