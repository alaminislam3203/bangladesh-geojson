import React from 'react';
import ReactDOM from 'react-dom/client';
import LangProvider from './LangProvider';
import Demo from './pages/Demo';
import './index.css';
import 'maplibre-gl/dist/maplibre-gl.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LangProvider>
      <Demo />
    </LangProvider>
  </React.StrictMode>
);
