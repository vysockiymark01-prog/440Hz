import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { FontScaleProvider } from './contexts/FontScaleContext.jsx'
import PasswordGate from './components/PasswordGate.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PasswordGate>
      <ThemeProvider>
        <FontScaleProvider>
          <HashRouter>
            <App />
          </HashRouter>
        </FontScaleProvider>
      </ThemeProvider>
    </PasswordGate>
  </StrictMode>,
)
