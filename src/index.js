import React from 'react';
import ReactDOM from 'react-dom/client';
import 'simplebar-react/dist/simplebar.min.css';
import './index.css';

import axios from 'axios';

import App from './App';
import { withActor } from './Api/apiActor';
import reportWebVitals from './reportWebVitals';

// Firefox has no ::-webkit-scrollbar support and cannot size scrollbars in px.
// Tagging <html> lets the thin-scrollbar fallback in index.css target it
// without leaking into Chrome/Edge, where scrollbar-width would win over the
// 5px webkit rule and make the bar bigger.
if (typeof navigator !== 'undefined' && navigator.userAgent.indexOf('Firefox') > -1) {
  document.documentElement.classList.add('is-firefox');
}

// Every screen that imports axios directly now sends the acting user's roll number,
// which the API's feature-permission layer needs to answer with data instead of
// "…RollNumber is required for feature permission validation". See Api/apiActor.js.
withActor(axios);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
reportWebVitals();
