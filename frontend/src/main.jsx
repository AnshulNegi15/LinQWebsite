import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const path = window.location.pathname
const root = createRoot(document.getElementById('root'))

if (/^\/admin(?:\/|$)/.test(path)) {
  const { default: Admin } = await import('./admin/Admin.jsx')
  root.render(<StrictMode><Admin /></StrictMode>)
} else {
  const isTerms = /^\/terms(?:\/|$)/.test(path)
  const [{ default: LegalPage }, { default: policy }] = await Promise.all([
    import('./legal/LegalPage.jsx'),
    isTerms ? import('./legal/terms.json') : import('./legal/privacy.json'),
  ])

  root.render(<StrictMode><LegalPage policy={policy} isTerms={isTerms} /></StrictMode>)
}
