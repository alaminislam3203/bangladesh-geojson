import React from 'react';
import ReactDOM from 'react-dom/client';
import LangProvider from './LangProvider';
import Landing from './pages/Landing';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LangProvider>
      <Landing />
    </LangProvider>
  </React.StrictMode>
);
