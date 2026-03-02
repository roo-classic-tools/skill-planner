import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { TranslationProvider } from './hooks/useTranslation';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <TranslationProvider>
        <App />
      </TranslationProvider>
    </BrowserRouter>
  </React.StrictMode>
);
