import React from 'react';

interface LoginScreenProps {
  inProgress: string;
  onLogin: () => void;
}

export function LoginScreen({ inProgress, onLogin }: LoginScreenProps) {
  return (
    <div 
      className="animate-fade-in" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh', 
        width: '100vw' 
      }}
    >
      <div 
        className="glass-panel" 
        style={{ 
          padding: '50px 40px', 
          textAlign: 'center', 
          maxWidth: '420px', 
          width: '90%' 
        }}
      >
        <div style={{ 
          width: '60px', 
          height: '60px', 
          background: 'var(--accent-gradient)', 
          borderRadius: '12px', 
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)'
        }}>
          {/* A simple placeholder logo icon */}
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        
        <h1 style={{ marginBottom: '12px', fontSize: '2rem' }}>HiViz Portal</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.5' }}>
          Secure, role-based access for customer contracts and service calls.
        </p>
        
        <button 
          className="btn primary-btn" 
          onClick={onLogin} 
          disabled={inProgress !== 'none'}
          style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
        >
          {inProgress !== 'none' ? 'Authenticating...' : 'Sign In with Microsoft'}
        </button>
      </div>
    </div>
  );
}
