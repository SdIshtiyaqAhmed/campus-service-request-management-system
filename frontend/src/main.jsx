import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import './components/UI.css';
import App from './App';
import { AuthProvider } from './context/AuthContext.jsx';
import siteConfig from './config/siteConfig';

const root = document.documentElement;

root.style.setProperty(
    '--primary',
    siteConfig.branding.colors.primary
);

root.style.setProperty(
    '--primary-hover',
    siteConfig.branding.colors.primaryHover
);

root.style.setProperty(
    '--primary-light',
    siteConfig.branding.colors.primaryLight
);

root.style.setProperty(
    '--secondary',
    siteConfig.branding.colors.secondary
);

root.style.setProperty(
    '--bg',
    siteConfig.branding.colors.background
);

root.style.setProperty(
    '--surface',
    siteConfig.branding.colors.surface
);

root.style.setProperty(
    '--text',
    siteConfig.branding.colors.text
);

root.style.setProperty(
    '--text-secondary',
    siteConfig.branding.colors.textSecondary
);

document.title = siteConfig.application.name;

const favicon = document.querySelector('link[rel="icon"]');

if (favicon) {
    favicon.href = siteConfig.branding.favicon;
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
);

