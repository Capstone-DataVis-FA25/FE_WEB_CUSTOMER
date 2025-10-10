import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import '@/i18n/i18n';
import { ThemeProvider } from './theme/ThemeProvider';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider defaultTheme="system">
    <App />
  </ThemeProvider>
);
