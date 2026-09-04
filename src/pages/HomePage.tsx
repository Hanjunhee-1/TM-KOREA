import { useCallback, useEffect, useState } from 'react'
import {
  OpenInNew as OpenInNewIcon,
  School as SchoolIcon,
} from '@mui/icons-material'
import {
  AppBar,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import { openEditorWindow } from '../routes.ts'

type HealthResponse = {
  status: string
  service: string
}

export default function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [healthError, setHealthError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/health')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        return (await response.json()) as HealthResponse
      })
      .then(setHealth)
      .catch((err: unknown) => {
        setHealthError(err instanceof Error ? err.message : '연결에 실패했습니다.')
      })
  }, [])

  const handleOpenEditor = useCallback(() => {
    openEditorWindow()
  }, [])

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <AppBar position="static">
        <Toolbar>
          <SchoolIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            TM-KOREA 학원관리
          </Typography>
          {health ? (
            <Chip
              size="small"
              color="success"
              label={`API ${health.status}`}
              sx={{ bgcolor: 'success.light' }}
            />
          ) : (
            <Chip
              size="small"
              color={healthError ? 'warning' : 'default'}
              label={healthError ? 'API 미연결' : 'API 확인 중'}
            />
          )}
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Paper variant="outlined" sx={{ p: 4, maxWidth: 480, width: '100%' }}>
          <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
            <Typography variant="h5" component="h2">
              HWP 문서 편집
            </Typography>
            <Typography variant="body2" color="text.secondary">
              편집기는 별도 페이지에서 실행됩니다. 새 탭이 열리면 그곳에서 HWP /
              HWPX 파일을 열고 편집한 뒤 저장하거나 내려받을 수 있습니다.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<OpenInNewIcon />}
              onClick={handleOpenEditor}
            >
              rhwp 편집기 열기
            </Button>
            <Typography variant="caption" color="text.secondary">
              프로토타입 단계입니다. 저장한 문서는 서버에 보관되지 않습니다.
            </Typography>
          </Stack>
        </Paper>
      </Box>
    </Box>
  )
}
