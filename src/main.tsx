import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { seedData } from './utils/seedData'

// Expose seed function for development
declare global {
  interface Window {
    seedData: () => void;
    pendo: any;
  }
}
window.seedData = seedData;

// Initialize Pendo with anonymous visitor ID
// Generate or retrieve a persistent anonymous ID from localStorage
const getAnonymousVisitorId = (): string => {
  const storageKey = 'pendo_anonymous_visitor_id';
  let visitorId = localStorage.getItem(storageKey);

  if (!visitorId) {
    // Generate a new anonymous visitor ID
    visitorId = `anonymous_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(storageKey, visitorId);
  }

  return visitorId;
};

// Initialize Pendo when the script loads
if (window.pendo) {
  window.pendo.initialize({
    visitor: {
      id: getAnonymousVisitorId()
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
