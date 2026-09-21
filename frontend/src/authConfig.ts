import type { Configuration, PopupRequest } from "@azure/msal-browser";

// 1. MSAL configuration: Identifies your frontend and Microsoft tenant
export const msalConfig: Configuration = {
  auth: {
    clientId: "d06aee3d-e32d-4382-a1ef-5f50c65fd7ca", // Frontend Client ID
    authority: "https://login.microsoftonline.com/ceda07a7-193a-4464-aaa8-2b7b88bf1243", // Tenant ID
    redirectUri: "http://localhost:5173",
    postLogoutRedirectUri: "http://localhost:5173"
  },
  cache: {
    cacheLocation: "sessionStorage" // Stores tokens securely in session storage
  }
};

// 2. Scopes requested when logging in
export const loginRequest: PopupRequest = {
  scopes: ["openid", "profile", "email"]
};

// 3. Scopes required to call your .NET backend API
export const apiRequest = {
  scopes: ["api://00aaf6bf-cda5-4db6-b131-97becd443299/access_as_user"]
};

// 4. URL of your .NET backend API
export const API_BASE_URL = "http://localhost:5256";