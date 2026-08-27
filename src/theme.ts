import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1565c0',
    },
    secondary: {
      main: '#00838f',
    },
    background: {
      default: '#f5f7fb',
    },
  },
  typography: {
    fontFamily:
      '"Pretendard Variable", Pretendard, "Noto Sans KR", system-ui, -apple-system, sans-serif',
  },
  shape: {
    borderRadius: 10,
  },
})

export default theme
