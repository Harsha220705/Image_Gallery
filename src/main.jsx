// MAIN ENTRY POINT - Application Bootstrap
// This is the first file that runs when your React app starts
// It sets up the React application and renders the main App component

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
