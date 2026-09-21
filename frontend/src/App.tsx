import { useState, useEffect } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { loginRequest, apiRequest, API_BASE_URL } from './authConfig';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import './App.css';

interface ApiResponse {
  endpoint: string;
  status: number;
  statusText: string;
  data: any;
  error?: string;
}

// Helper: Safely decodes JWT payload to inspect Access Token claims & roles
function decodeJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export default function App() {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const activeAccount = instance.getActiveAccount() || accounts[0];

  const [apiResult, setApiResult] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>(['None']);

  // Fetch access token silently on login to extract the backend API roles
  useEffect(() => {
    if (activeAccount) {
      instance
        .acquireTokenSilent({
          ...apiRequest,
          account: activeAccount,
        })
        .then((res) => {
          const decoded = decodeJwt(res.accessToken);
          if (decoded?.roles && decoded.roles.length > 0) {
            setUserRoles(decoded.roles);
          } else if (activeAccount.idTokenClaims?.roles) {
            setUserRoles(activeAccount.idTokenClaims.roles as string[]);
          }
        })
        .catch((err) => {
          console.warn('Could not read roles silently:', err);
        });
    }
  }, [activeAccount?.homeAccountId, instance]);

  // Handle Login with Popup
  const handleLoginPopup = async () => {
    if (inProgress !== 'none') return;
    try {
      await instance.loginPopup(loginRequest);
    } catch (error) {
      console.error('Popup login failed:', error);
    }
  };

  // Handle Login with Redirect
  const handleLoginRedirect = () => {
    if (inProgress !== 'none') return;
    instance.loginRedirect(loginRequest);
  };

  // Handle Logout
  const handleLogout = () => {
    instance.logoutRedirect({
      postLogoutRedirectUri: 'http://localhost:5173',
      account: activeAccount,
    });
  };


  // Function to call our .NET backend with the Microsoft Access Token
  const callApi = async (endpoint: string, requiresAuth: boolean) => {
    setLoading(true);
    setApiResult(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (requiresAuth) {
        // Silently acquire access token for our backend API
        const tokenResponse = await instance.acquireTokenSilent({
          ...apiRequest,
          account: activeAccount,
        });
        headers['Authorization'] = `Bearer ${tokenResponse.accessToken}`;

        // Keep roles in sync from access token
        const decoded = decodeJwt(tokenResponse.accessToken);
        if (decoded?.roles) {
          setUserRoles(decoded.roles);
        }
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: headers,
      });

      // Safely read response text without consuming stream twice
      const responseText = await response.text();
      let responseData: any;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = responseText || response.statusText;
      }

      setApiResult({
        endpoint,
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      });
    } catch (error: any) {
      setApiResult({
        endpoint,
        status: 0,
        statusText: 'Request Failed',
        data: null,
        error: error.message || 'Error communicating with the API',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!isAuthenticated ? (
        <LoginScreen inProgress={inProgress} onLogin={handleLoginRedirect} />
      ) : (
        <Dashboard 
          activeAccount={activeAccount} 
          userRoles={userRoles} 
          onLogout={handleLogout} 
          callApi={callApi} 
          apiResult={apiResult} 
          loading={loading} 
        />
      )}
    </>
  );
}