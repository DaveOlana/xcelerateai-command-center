import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { EvidenceProvider } from './context/EvidenceContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <EvidenceProvider>
        <App />
      </EvidenceProvider>
    </AuthProvider>
  </React.StrictMode>,
)
