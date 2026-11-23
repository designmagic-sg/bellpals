import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { preloadSprites } from './components/BellPalArt';
import './styles/page.css';
import './styles/app.css';

preloadSprites();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
