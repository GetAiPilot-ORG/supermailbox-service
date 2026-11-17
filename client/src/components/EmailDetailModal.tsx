import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Copy, 
  Check, 
  Mail, 
  ShieldCheck, 
  ExternalLink,
  Server,
  FileCode
} from 'lucide-react';
import { ApiService, type EmailDetail } from '../services/api';

interface EmailDetailModalProps {
  emailId: string | null;
  initialData?: {
    recipient?: string;
    type?: string;
    provider?: string;
    status?: string;
    timestamp?: string;
  };
  onClose: () => void;
}

export const EmailDetailModal: React.FC<EmailDetailModalProps> = ({ emailId, initialData, onClose }) => {
  const [email, setEmail] = useState<EmailDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'info' | 'original'>('preview');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (!emailId) return;

    let isMounted = true;
    setLoading(true);

    const load = async () => {
      const data = await ApiService.getEmailDetails(emailId);
      if (isMounted) {
        if (data) {
          setEmail(data);
        } else if (initialData) {
          // Fallback if full detail retrieval fails
          setEmail({
            id: emailId,
            type: initialData.type || 'Transactional',
            status: initialData.status || 'Delivered',
            provider: initialData.provider || 'ZeptoMail (.IN API)',
            attempts: 1,
            createdAt: initialData.timestamp || new Date().toISOString(),
            recipient: initialData.recipient || 'unknown@recipient.com',
            senderName: 'GETAIPILOT Team',
            senderEmail: 'support@getaipilot.com',
            subject: 'GetAiPilot Notification',
            html: '<div style="padding: 24px; font-family: sans-serif;"><h3>Email Details</h3><p>Recipient: ' + (initialData.recipient || '') + '</p></div>',
            events: []
          });
        }
        setLoading(false);
      }
    };

    load();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      isMounted = false;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [emailId]);

  if (!emailId) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadEml = () => {
    if (!email) return;
    const emlContent = [
      `From: ${email.senderName} <${email.senderEmail}>`,
      `To: ${email.recipient}`,
      `Subject: ${email.subject}`,
      `Date: ${new Date(email.createdAt).toUTCString()}`,
      `Message-ID: <${email.providerMessageId || email.id}@getaipilot.com>`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      '',
      email.html
    ].join('\r\n');

    const blob = new Blob([emlContent], { type: 'message/rfc822' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeSubject = (email.subject || 'email').replace(/[^a-zA-Z0-9_-]/g, '_');
    a.download = `${safeSubject}.eml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const senderInitial = (email?.senderName || 'GT').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'GT';

  return (
    <div 
      className="email-modal-backdrop" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div 
        className="email-modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(980px, 95vw)',
          height: 'min(860px, 90vh)',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Top Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
            <button 
              onClick={onClose} 
              style={{ 
                border: 'none', 
                background: 'transparent', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center',
                color: '#64748b',
                padding: '4px',
                borderRadius: '6px'
              }}
              title="Back"
            >
              <ChevronLeft size={20} />
            </button>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Subject "{email?.subject || 'Email Details'}"
            </span>
          </div>

          <button 
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              cursor: 'pointer',
              display: 'grid',
              placeItems: 'center',
              color: '#64748b'
            }}
            title="Close (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div style={{
          padding: '0 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <button
              onClick={() => setActiveTab('info')}
              style={{
                padding: '14px 4px',
                fontSize: '0.88rem',
                fontWeight: activeTab === 'info' ? 600 : 500,
                color: activeTab === 'info' ? '#2563eb' : '#64748b',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === 'info' ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Email Info
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              style={{
                padding: '14px 4px',
                fontSize: '0.88rem',
                fontWeight: activeTab === 'preview' ? 600 : 500,
                color: activeTab === 'preview' ? '#2563eb' : '#64748b',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === 'preview' ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Content Preview
            </button>
            <button
              onClick={() => setActiveTab('original')}
              style={{
                padding: '14px 4px',
                fontSize: '0.88rem',
                fontWeight: activeTab === 'original' ? 600 : 500,
                color: activeTab === 'original' ? '#2563eb' : '#64748b',
                border: 'none',
                background: 'transparent',
                borderBottom: activeTab === 'original' ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Original Message
            </button>
          </div>

          <button
            onClick={handleDownloadEml}
            disabled={!email}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#2563eb',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 10px',
              borderRadius: '6px'
            }}
          >
            <Download size={14} />
            Download EML
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', padding: '24px' }}>
          {loading ? (
            <div style={{ display: 'grid', placeItems: 'center', height: '100%', minHeight: '300px' }}>
              <div style={{ textAlign: 'center' }}>
                <div className="spin-loader" style={{ margin: '0 auto 12px' }} />
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Retrieving full email dispatch record...</p>
              </div>
            </div>
          ) : !email ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b' }}>
              <AlertCircle size={36} color="#ef4444" style={{ margin: '0 auto 12px' }} />
              <h4>Unable to load email details</h4>
              <p style={{ fontSize: '0.85rem' }}>The record may have expired or is not yet indexed.</p>
            </div>
          ) : (
            <>
              {/* TAB 1: CONTENT PREVIEW */}
              {activeTab === 'preview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Message Header Card */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '20px 24px'
                  }}>
                    <h3 style={{ margin: '0 0 16px', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                      {email.subject}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#6366f1',
                        color: '#ffffff',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 700,
                        fontSize: '0.88rem',
                        flexShrink: 0
                      }}>
                        {senderInitial}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>
                            {email.senderName} <span style={{ fontWeight: 400, color: '#64748b' }}>&lt;{email.senderEmail}&gt;</span>
                          </span>
                          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                            {new Date(email.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                          to <strong style={{ color: '#0f172a' }}>{email.recipientName || email.recipient.split('@')[0]}</strong> &lt;{email.recipient}&gt;
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rendered HTML Preview Container */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    minHeight: '480px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                  }}>
                    <iframe
                      srcDoc={email.html}
                      title="Email Content Preview"
                      sandbox="allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                      style={{
                        width: '100%',
                        height: '540px',
                        border: 'none',
                        display: 'block',
                        background: '#ffffff'
                      }}
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: EMAIL INFO */}
              {activeTab === 'info' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Status Banner */}
                  <div style={{
                    background: email.status === 'Delivered' || email.status === 'Sent' ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${email.status === 'Delivered' || email.status === 'Sent' ? '#bbf7d0' : '#fecaca'}`,
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {email.status === 'Delivered' || email.status === 'Sent' ? (
                        <CheckCircle2 size={24} color="#16a34a" />
                      ) : (
                        <AlertCircle size={24} color="#dc2626" />
                      )}
                      <div>
                        <strong style={{ fontSize: '1rem', color: email.status === 'Delivered' || email.status === 'Sent' ? '#166534' : '#991b1b' }}>
                          Dispatch Status: {email.status}
                        </strong>
                        <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: email.status === 'Delivered' || email.status === 'Sent' ? '#15803d' : '#b91c1c' }}>
                          Delivered via {email.provider}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      background: email.status === 'Delivered' || email.status === 'Sent' ? '#dcfce7' : '#fee2e2',
                      color: email.status === 'Delivered' || email.status === 'Sent' ? '#15803d' : '#b91c1c'
                    }}>
                      {email.status}
                    </span>
                  </div>

                  {/* Metadata Grid */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '24px',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '20px'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Recipient</span>
                      <p style={{ margin: '4px 0 0', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{email.recipient}</p>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Sender</span>
                      <p style={{ margin: '4px 0 0', fontSize: '0.95rem', color: '#0f172a' }}>{email.senderName} &lt;{email.senderEmail}&gt;</p>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Provider Message ID</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <code style={{ fontSize: '0.85rem', background: '#f1f5f9', padding: '3px 8px', borderRadius: '4px', color: '#334155' }}>
                          {email.providerMessageId || 'N/A'}
                        </code>
                        {email.providerMessageId && (
                          <button
                            onClick={() => handleCopy(email.providerMessageId!, 'msgId')}
                            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b', padding: '2px' }}
                            title="Copy Message ID"
                          >
                            {copiedField === 'msgId' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Source Stream / Product</span>
                      <p style={{ margin: '4px 0 0', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a' }}>{email.productName || 'GetAiPilot Core Platform'}</p>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Delivery Provider</span>
                      <p style={{ margin: '4px 0 0', fontSize: '0.95rem', color: '#0f172a' }}>{email.provider}</p>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Dispatched At</span>
                      <p style={{ margin: '4px 0 0', fontSize: '0.95rem', color: '#0f172a' }}>{new Date(email.createdAt).toLocaleString()}</p>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Template Key</span>
                      <p style={{ margin: '4px 0 0', fontSize: '0.95rem', fontFamily: 'monospace', color: '#0f172a' }}>{email.templateKey || 'transactional_default'}</p>
                    </div>

                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Delivery Attempts</span>
                      <p style={{ margin: '4px 0 0', fontSize: '0.95rem', color: '#0f172a' }}>{email.attempts} attempt(s)</p>
                    </div>
                  </div>

                  {/* Delivery Timeline / Events */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '24px'
                  }}>
                    <h4 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Delivery Timeline &amp; Events</h4>
                    {email.events.length === 0 ? (
                      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>No granular gateway event logs recorded for this message.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {email.events.map((ev, i) => (
                          <div key={ev.id || i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: '#f0fdf4',
                              color: '#16a34a',
                              display: 'grid',
                              placeItems: 'center',
                              flexShrink: 0,
                              marginTop: '2px'
                            }}>
                              <CheckCircle2 size={16} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <strong style={{ fontSize: '0.88rem', textTransform: 'capitalize', color: '#0f172a' }}>{ev.eventType}</strong>
                                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(ev.occurredAt).toLocaleTimeString()}</span>
                              </div>
                              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                                Provider: {ev.data?.provider || email.provider} &bull; ID: {ev.data?.messageId || 'confirmed'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: ORIGINAL MESSAGE / RAW DATA */}
              {activeTab === 'original' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '20px 24px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>Raw Job &amp; Metadata Record</h4>
                      <button
                        onClick={() => handleCopy(JSON.stringify(email, null, 2), 'rawJson')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.8rem',
                          color: '#2563eb',
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        {copiedField === 'rawJson' ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                        Copy JSON
                      </button>
                    </div>

                    <pre style={{
                      background: '#0f172a',
                      color: '#e2e8f0',
                      padding: '16px',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      overflowX: 'auto',
                      maxHeight: '400px'
                    }}>
                      {JSON.stringify(email, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Bottom Status Bar */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: '#64748b'
        }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span><kbd style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 6px' }}>Esc</kbd> Close</span>
          </div>

          <span>SuperMail Dedicated Email Inspector</span>
        </div>
      </div>
    </div>
  );
};

