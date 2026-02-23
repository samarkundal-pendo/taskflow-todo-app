import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { seedData } from './utils/seedData'

// Expose seed function for development
declare global {
  interface Window {
    seedData: () => void;
  }
}
window.seedData = seedData;

// Initialize Pendo with anonymous visitor ID on load
const VISITOR_ID_KEY = 'pendo_visitor_id';
let visitorId = localStorage.getItem(VISITOR_ID_KEY);
if (!visitorId) {
  visitorId = 'visitor-' + crypto.randomUUID();
  localStorage.setItem(VISITOR_ID_KEY, visitorId);
}
pendo.initialize({
  visitor: {
    id: visitorId,
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
