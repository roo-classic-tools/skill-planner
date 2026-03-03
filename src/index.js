import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { TranslationProvider } from './hooks/useTranslation';
import { SettingsProvider } from './hooks/useSettings';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <TranslationProvider>
          <App />
        </TranslationProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
