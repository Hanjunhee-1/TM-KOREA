import DocumentEditorPage from './pages/DocumentEditorPage.tsx'
import HomePage from './pages/HomePage.tsx'
import { isEditorRoute, useHashRoute } from './routes.ts'

function App() {
  const hash = useHashRoute()

  if (isEditorRoute(hash)) {
    return <DocumentEditorPage />
  }

  return <HomePage />
}

export default App
