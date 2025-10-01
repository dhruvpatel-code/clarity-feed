import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Add loading indicator while app initializes
const root = document.getElementById('root');

// Show loading state immediately
root.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui"><div style="text-align:center"><div style="width:40px;height:40px;border:4px solid #e5e7eb;border-top-color:#2563eb;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px"></div><p style="color:#6b7280">Loading FeedbackPulse...</p></div></div><style>@keyframes spin{to{transform:rotate(360deg)}}</style>';

// Render app
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)