import React from 'react';
import ReactDOM from 'react-dom/client';
import 'simplebar-react/dist/simplebar.min.css';
import './index.css';

import App from './App';
import reportWebVitals from './reportWebVitals';

// Firefox has no ::-webkit-scrollbar support and cannot size scrollbars in px.
// Tagging <html> lets the thin-scrollbar fallback in index.css target it
// without leaking into Chrome/Edge, where scrollbar-width would win over the
// 5px webkit rule and make the bar bigger.
if (typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Firefox') > -1) {
  document.documentElement.classList.add('is-firefox');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
reportWebVitals();
