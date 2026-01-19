import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { NotificationProvider } from './contexts/NotificationContext'
import { AuthProvider } from './contexts/AuthContext'
import { registerServiceWorker } from './services/notifications'
import './index.css'

// Register service worker on app load
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerServiceWorker().catch(console.error);
  });
}

// Prevent browser navigation gestures (swipe left/right to go back/forward)
if (typeof window !== 'undefined') {
  // Prevent horizontal swipe gestures that trigger browser navigation
  let touchStartX = 0;
  let touchStartY = 0;
  
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  
  document.addEventListener('touchmove', (e) => {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // If horizontal swipe is more significant than vertical, prevent default
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
      e.preventDefault();
    }
  }, { passive: false });
  
  // Prevent mouse drag gestures that trigger browser navigation
  let isDragging = false;
  let dragStartX = 0;
  
  document.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.clientX;
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const diffX = Math.abs(e.clientX - dragStartX);
    // If dragging horizontally more than 10px, prevent default
    if (diffX > 10) {
      e.preventDefault();
    }
  });
  
  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

