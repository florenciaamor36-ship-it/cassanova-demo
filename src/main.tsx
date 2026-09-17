import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import CleopatraApp from './App.tsx';
import BloodCovenantApp from './blood/App.tsx';
import './index.css';

const isBloodCovenant = window.location.pathname.includes('/blood-covenant');
const App = isBloodCovenant ? BloodCovenantApp : CleopatraApp;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
