import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { initSentry, SentryErrorBoundary } from './services/sentry.js'

// Initialize Sentry error monitoring
initSentry();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SentryErrorBoundary fallback={<div>Something went wrong. Please refresh the page.</div>}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </SentryErrorBoundary>
  </StrictMode>,
)
