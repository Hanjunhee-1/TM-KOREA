import { useEffect, useState } from 'react'
import { School as SchoolIcon } from '@mui/icons-material'
import {
  AppBar,
  Box,
  Chip,
  Container,
  Paper,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'

type HealthResponse = {
  status: string
  service: string
}

function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

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
        setError(err instanceof Error ? err.message : '연결에 실패했습니다.')
      })
  }, [])

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky">
        <Toolbar>
          <SchoolIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" component="h1">
            TM-KOREA 학원관리
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 6 }}>
        <Paper sx={{ p: 4 }}>
          <Stack spacing={2}>
            <Typography variant="h5" component="h2">
              프로젝트 초기 세팅이 완료되었습니다
            </Typography>
            <Typography color="text.secondary">
              프론트엔드는 React + MUI, 백엔드는 NestJS(`backend`)로 구성되어
              있습니다. 백엔드 서버를 실행한 뒤 아래 연결 상태를 확인하세요.
            </Typography>
            {health ? (
              <Chip
                color="success"
                label={`백엔드 연결됨 · ${health.service} (${health.status})`}
              />
            ) : (
              <Chip
                color={error ? 'warning' : 'default'}
                label={
                  error
                    ? `백엔드 미연결 · ${error}`
                    : '백엔드 연결 확인 중...'
                }
              />
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}

export default App
