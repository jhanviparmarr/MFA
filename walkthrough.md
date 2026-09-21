# Project Handoff & Technical Summary: HiViz Authentication & Authorization

This document provides a complete summary of the project, including client requirements, cloud architecture, implemented code, and pending verification steps. Use this to resume work seamlessly on a new machine.

---

## 1. Project Requirements & Architecture

### Business Context
- **Application Name**: HiViz
- **Core Focus**: **Authentication & Authorization ONLY**. No extra business logic, maps, or SharePoint documents.
- **User Demographics**: ~95% external customer accounts, ~5% internal corporate staff.
- **Identity Provider**: Microsoft Entra ID (Free tier, 50,000 MAU included).
- **MFA Requirement**: Microsoft Multi-Factor Authentication (Security Defaults / Authenticator / SMS/Email OTP).
- **Role-Based Access Control (RBAC)**:
  - **`Admin`**: Full administrative access (can manage users).
  - **`User`**: Standard access (view customer data).
- **Tech Stack**:
  - **Backend**: ASP.NET Core (.NET 8 Minimal Web API).
  - **Frontend**: React (Vite + TypeScript) using `@azure/msal-browser` and `@azure/msal-react`.

---

## 2. Microsoft Entra ID Configuration (Cloud Assets)

All cloud resources are created and configured under the free directory:
- **Tenant ID**: `ceda07a7-193a-4464-aaa8-2b7b88bf1243`
- **Tenant Domain**: `jhanvipdevgmail.onmicrosoft.com`

### A. Backend API Registration (`HiViz.Api`)
- **Application (client) ID**: `00aaf6bf-cda5-4db6-b131-97becd443299`
- **Application ID URI**: `api://00aaf6bf-cda5-4db6-b131-97becd443299`
- **Exposed Scope**: `access_as_user`
- **App Roles Defined**:
  - `Admin` (Value: `Admin`, Member type: Users/Groups)
  - `User` (Value: `User`, Member type: Users/Groups)

### B. Frontend SPA Registration (`HiViz.Spa`)
- **Application (client) ID**: `d06aee3d-e32d-4382-a1ef-5f50c65fd7ca`
- **Platform**: Single-Page Application (SPA)
- **Redirect URI**: `http://localhost:5173`
- **API Permissions**: `HiViz.Api` -> `access_as_user` (Admin consent granted).

### C. Test Accounts (Dummy Users)
Two test users exist in the directory with permanent passwords:
1. **`dummy-user@jhanvipdevgmail.onmicrosoft.com`**
   - Assigned Role: **`User`** (under Enterprise Applications -> `HiViz.Api` -> Users and groups).
2. **`dummy-admin@jhanvipdevgmail.onmicrosoft.com`**
   - Assigned Role: **`Admin`** (under Enterprise Applications -> `HiViz.Api` -> Users and groups).

---

## 3. Implementation Details

### Backend (`backend/`)
- **Framework**: .NET 8 (`net8.0`)
- **Key Packages**:
  - `Microsoft.AspNetCore.Authentication.JwtBearer`
  - `Microsoft.Identity.Web`
- **Config ([backend/appsettings.json](file:///c:/Users/jhanv/OneDrive/Desktop/MFA/backend/appsettings.json))**:
  ```json
  {
    "AzureAd": {
      "Instance": "https://login.microsoftonline.com/",
      "TenantId": "ceda07a7-193a-4464-aaa8-2b7b88bf1243",
      "ClientId": "00aaf6bf-cda5-4db6-b131-97becd443299",
      "Audience": "api://00aaf6bf-cda5-4db6-b131-97becd443299"
    }
  }
  ```
- **Security Logic ([backend/Program.cs](file:///c:/Users/jhanv/OneDrive/Desktop/MFA/backend/Program.cs))**:
  - `RoleClaimType = "roles"` (reads App Roles from JWT).
  - Accepts both v1.0 and v2.0 audiences (`api://00aaf6bf...` and GUID) and issuers.
  - CORS enabled for `http://localhost:5173`.
  - Endpoints:
    - `GET /`: Health check.
    - `GET /api/public`: Unauthenticated (Returns 200).
    - `GET /api/user-data`: Protected with `Roles = "User,Admin"` (Returns 200 for user/admin, 403 for others).
    - `GET /api/admin-data`: Protected with `Roles = "Admin"` (Returns 200 for admin, 403 for others).
    - `GET /api/me`: Diagnostic endpoint dumping all claims in the caller's token.
- **Port**: Runs on `http://localhost:5256` via `dotnet run --launch-profile http`.

### Frontend (`frontend/`)
- **Framework**: React 19 + Vite + TypeScript.
- **Key Packages**:
  - `@azure/msal-browser` (`^5.22.0`)
  - `@azure/msal-react` (`^5.7.1`)
- **Config ([frontend/src/authConfig.ts](file:///c:/Users/jhanv/OneDrive/Desktop/MFA/frontend/src/authConfig.ts))**:
  - Points to `HiViz.Spa` Client ID, Tenant ID authority, and requests scope `api://00aaf6bf.../access_as_user`.
  - Base API URL: `http://localhost:5256`.
- **UI & Auth Logic ([frontend/src/App.tsx](file:///c:/Users/jhanv/OneDrive/Desktop/MFA/frontend/src/App.tsx))**:
  - Supports both **Popup** and **Redirect** login.
  - Automatically fetches Access Token on login, decodes the JWT, and extracts the `roles` claim to display the role badge (**`USER`** or **`ADMIN`**).
  - Test buttons for Public, User, and Admin endpoints.
  - Visual response card showing HTTP status code, permission explanations, and raw JSON payloads.

---

## 4. Current Status: What is Completed vs. What is Remaining

| Task | Status | Notes |
| :--- | :---: | :--- |
| Project Scaffolding (.NET 8 & Vite React) | Completed | Compiles cleanly with zero errors. |
| Microsoft Entra Tenant & App Registrations | Completed | Tenant, scopes, roles, and dummy users fully configured. |
| Frontend MSAL Provider & Redirect Handling | Completed | Supports redirect flow without popup blocker issues. |
| Cross-Origin Communication (CORS) | Completed | Verified via `GET /api/public` (200 OK). |
| User Authentication Flow | Completed | Successfully signed in as `dummy-user@jhanvipdevgmail.onmicrosoft.com`. |
| **Token Acquisition & Endpoint Authorization** | **In Progress / Next Step** | Verify `dummy-user` receives `200 OK` on `/api/user-data` and `403 Forbidden` on `/api/admin-data`. |
| **Admin Role Authorization** | **Next Step** | Verify `dummy-admin` receives `200 OK` on `/api/admin-data`. |

---

## 5. How to Run on a New Machine

1. **Prerequisites**:
   - .NET 8 SDK (`dotnet --version` >= 8.0).
   - Node.js 20+ (`node -v`).
2. **Setup Code**:
   - Copy or clone the project folder (`MFA/` containing `backend/` and `frontend/`).
   - In `backend`: run `dotnet restore`.
   - In `frontend`: run `npm install`.
3. **Run Both Services**:
   - **Terminal 1 (Backend)**:
     ```powershell
     cd backend
     dotnet run --launch-profile http
     ```
     *(Listens on `http://localhost:5256`)*
   - **Terminal 2 (Frontend)**:
     ```powershell
     cd frontend
     npm run dev
     ```
     *(Listens on `http://localhost:5173`)*
4. **Test**:
   - Open `http://localhost:5173`.
   - Sign in as `dummy-user@jhanvipdevgmail.onmicrosoft.com` or `dummy-admin@jhanvipdevgmail.onmicrosoft.com`.
   - Click the test buttons to verify role enforcement.
