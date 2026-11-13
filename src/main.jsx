import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { startSmoothScroll } from './lib/smoothScroll.js'
import './index.css'
import App from './App.jsx'

startSmoothScroll()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* basename: "" locally, "/WEBSITE" on GitHub Pages */}
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
