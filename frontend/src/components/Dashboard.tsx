import React from 'react';
import type { AccountInfo } from '@azure/msal-browser';

interface ApiResponse {
  endpoint: string;
  status: number;
  statusText: string;
  data: any;
  error?: string;
}

interface DashboardProps {
  activeAccount: AccountInfo | null;
  userRoles: string[];
  onLogout: () => void;
  callApi: (endpoint: string, requiresAuth: boolean) => void;
  apiResult: ApiResponse | null;
  loading: boolean;
}

export function Dashboard({ activeAccount, userRoles, onLogout, callApi, apiResult, loading }: DashboardProps) {
  const isAdmin = userRoles.includes('Admin');
  
  return (
    <div className="animate-fade-in" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Top Navigation */}
      <nav className="glass-panel" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '16px 24px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '40px', height: '40px', background: 'var(--accent-gradient)', 
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }}>HiViz</h2>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 600 }}>{activeAccount?.name || 'User'}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{activeAccount?.username}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {userRoles.map((role) => (
              <span key={role} style={{
                padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase',
                background: role === 'Admin' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                color: role === 'Admin' ? '#c4b5fd' : '#93c5fd',
                border: `1px solid ${role === 'Admin' ? 'rgba(139, 92, 246, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`
              }}>
                {role}
              </span>
            ))}
          </div>
          <button className="btn outline-btn" onClick={onLogout} style={{ padding: '8px 16px' }}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
        
        {/* Sidebar Controls */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
            Actions
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              className="btn outline-btn" 
              onClick={() => callApi('/api/user-data', true)}
              disabled={loading}
              style={{ justifyContent: 'flex-start' }}
            >
              🔄 Fetch Customer Data
            </button>
            
            {isAdmin && (
              <button 
                className="btn primary-btn" 
                onClick={() => callApi('/api/admin-data', true)}
                disabled={loading}
                style={{ justifyContent: 'flex-start' }}
              >
                ⚙️ Admin Control Panel
              </button>
            )}
          </div>
        </div>

        {/* Data Display */}
        <div className="glass-panel" style={{ padding: '24px', minHeight: '400px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--primary)' }}>
              <h3>Loading data...</h3>
            </div>
          ) : !apiResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--text-muted)' }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: 0.5 }}>
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3" y1="9" x2="21" y2="9"/>
                <line x1="9" y1="21" x2="9" y2="9"/>
              </svg>
              <p>Select an action from the sidebar to view data.</p>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>API Response</h3>
                <span style={{ 
                  padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold',
                  background: apiResult.status === 200 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: apiResult.status === 200 ? 'var(--success)' : 'var(--danger)'
                }}>
                  {apiResult.status} {apiResult.statusText}
                </span>
              </div>
              
              <div style={{ 
                background: 'rgba(0, 0, 0, 0.4)', 
                padding: '20px', 
                borderRadius: '8px', 
                border: '1px solid var(--glass-border)',
                overflowX: 'auto',
                fontFamily: 'monospace',
                color: '#6ee7b7'
              }}>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(apiResult.data || apiResult.error, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
