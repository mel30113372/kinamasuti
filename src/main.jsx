import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

/* If something breaks (e.g. a typo in languageData.js), show a friendly screen instead of a blank page. */
class ErrorBoundary extends React.Component {
  constructor(p) { super(p); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, fontFamily: 'Nunito, sans-serif', background: '#FAF9F6', color: '#1E293B', textAlign: 'center' }}>
        <div style={{ maxWidth: 360 }}>
          <p style={{ fontSize: 40, fontWeight: 900, color: '#1C523C' }}>Kwe'!</p>
          <p style={{ fontWeight: 800 }}>Something went wrong loading the app.</p>
          <p style={{ fontSize: 14, color: '#475569' }}>If you just edited languageData.js, check for a missing quote or comma.</p>
          <button onClick={() => location.reload()} style={{ marginTop: 16, minHeight: 52, padding: '0 24px', borderRadius: 16, border: 0, borderBottom: '4px solid #0F2E22', background: '#2E7D57', color: '#fff', fontWeight: 800, fontSize: 16 }}>Try again</button>
        </div>
      </div>
    );
  }
}

createRoot(document.getElementById('root')).render(<ErrorBoundary><App /></ErrorBoundary>);

// Make the app installable and usable offline when it's hosted on a website.
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && window.top === window.self) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => {}); });
}
