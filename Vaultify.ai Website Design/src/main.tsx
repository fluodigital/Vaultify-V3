
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { config } from './lib/config';

const globalScope = globalThis as typeof globalThis & {
  __vaultfyApiLogged?: boolean;
};

if (!globalScope.__vaultfyApiLogged) {
  globalScope.__vaultfyApiLogged = true;
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('[fb]', {
      projectId: config.firebase.projectId,
      appId: config.firebase.appId,
      authDomain: config.firebase.authDomain,
      functionsRegion: 'us-central1',
    });
  }
}

createRoot(document.getElementById('root') as HTMLElement).render(<App />);
  