import React from 'react';
import ReactDOM from 'react-dom/client';
import LangProvider from './LangProvider';
import Docs from './pages/Docs';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LangProvider>
      <Docs />
    </LangProvider>
  </React.StrictMode>
);
