import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { ApiService } from '../services/api';

interface LoginPageProps {
  onLogin: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    
    setError('');
    setLoading(true);

    const success = await ApiService.login(password);
    if (success) {
      onLogin();
    } else {
      setError('Invalid admin password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#F5F1EC',
      color: '#0F172A',
      fontFamily: 'Inter, sans-serif',
      padding: '24px'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.05)'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#F1F5F9',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <Shield size={32} color="#0D4F3C" />
          </div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: 700, color: '#0F172A' }}>Admin Access</h1>
          <p style={{ margin: 0, color: '#64748B', fontSize: '14px', textAlign: 'center' }}>
            Enter your administrative password to access the Supermailbox control panel.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }}>
                <Lock size={18} />
              </div>
              <input
                type="password"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '12px',
                  padding: '14px 16px 14px 44px',
                  color: '#0F172A',
                  fontSize: '15px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0D4F3C'}
                onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              background: '#0D4F3C',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              padding: '14px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading || !password ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'transform 0.1s, opacity 0.2s',
              opacity: loading || !password ? 0.7 : 1,
            }}
            onMouseDown={(e) => !loading && password && (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {loading ? (
              <Loader2 size={18} className="spin-loader" style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <>
                Continue to Dashboard
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
