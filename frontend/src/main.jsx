import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ── Progressive Web App: Service Worker Registration ──────────────────────────
// Only register in production to avoid stale cache issues during development
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[BharatSeva] Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.warn('[BharatSeva] Service Worker registration failed:', error);
      });
  });
}
