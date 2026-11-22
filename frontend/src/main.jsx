import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const path = window.location.pathname
const isAdmin = /^\/admin(?:\/|$)/.test(path)
const goHome = () => window.location.assign('/')
let Screen
if (isAdmin) {
  Screen = (await import('./admin/Admin.jsx')).default
} else {
  const legalPage = /^\/terms(?:\/|$)/.test(path)
    ? import('./components/TermsOfUse.jsx')
    : import('./components/PrivacyPolicy.jsx')
  const [legalModule] = await Promise.all([legalPage, import('./index.css'), import('./App.css')])
  Screen = legalModule.default
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdmin ? <Screen /> : <main><Screen onBack={goHome} /></main>}
  </StrictMode>,
)
