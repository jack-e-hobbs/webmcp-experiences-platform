import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initDiscoveryDetection } from './utils/agentDetector'
import './index.css'
import App from './App.tsx'

// Start agent discovery tracking for attribution
initDiscoveryDetection();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
