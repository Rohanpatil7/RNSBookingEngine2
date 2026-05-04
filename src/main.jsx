import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// This global variable is injected by your vite.config.js and holds the correct base path.
// eslint-disable-next-line no-undef
const APP_BASE_PATH = _API_BASE_;

ReactDOM.createRoot(document.getElementById('root')).render(
 
    <BrowserRouter basename={APP_BASE_PATH}>
      <App />
    </BrowserRouter>
  
);
