import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const isAdmin = /^\/admin(?:\/|$)/.test(window.location.pathname)
let Screen
if (isAdmin) {
  Screen = (await import('./admin/Admin.jsx')).default
} else {
  await Promise.all([import('./index.css'), import('./App.css')])
  Screen = (await import('./App.jsx')).default
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Screen />
  </StrictMode>,
)
