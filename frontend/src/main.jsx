import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import './index.css'
import App from './app.jsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)