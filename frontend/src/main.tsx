import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PublicClientApplication, EventType } from '@azure/msal-browser';
import type { AccountInfo } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { msalConfig } from './authConfig';
import App from './App.tsx';
import './index.css';

// Create MSAL instance
const msalInstance = new PublicClientApplication(msalConfig);

// Initialize MSAL before rendering React
msalInstance.initialize().then(async () => {
  // Handle redirect response if returning from Microsoft login redirect
  try {
    const redirectResponse = await msalInstance.handleRedirectPromise();
    if (redirectResponse?.account) {
      msalInstance.setActiveAccount(redirectResponse.account);
    }
  } catch (error) {
    console.error("Redirect error:", error);
  }

  // Automatically select the active account if already signed in
  const accounts = msalInstance.getAllAccounts();
  if (!msalInstance.getActiveAccount() && accounts.length > 0) {
    msalInstance.setActiveAccount(accounts[0]);
  }

  // Listen for login events and set the active account
  msalInstance.addEventCallback((event: any) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload?.account) {
      msalInstance.setActiveAccount(event.payload.account as AccountInfo);
    }
  });

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </StrictMode>,
  );
});
