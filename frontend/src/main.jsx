import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
