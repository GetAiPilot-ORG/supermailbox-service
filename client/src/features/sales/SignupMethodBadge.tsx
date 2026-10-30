import React from 'react';
import { Smartphone, User } from 'lucide-react';
import type { SignupMethod } from './types';

export const SignupMethodBadge: React.FC<{
  method?: SignupMethod;
  size?: 'xs' | 'sm';
  showIcon?: boolean;
}> = ({ method = 'unknown', size = 'sm' }) => {
  const isXs = size === 'xs';
  const imgDim = isXs ? '14px' : '16px';

  if (method === 'google') {
    return (
      <img
        src="/Google.webp"
        alt="Google"
        title="Google (1-Click Google OAuth Signup)"
        style={{
          width: imgDim,
          height: imgDim,
          objectFit: 'contain',
          verticalAlign: 'middle',
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
    );
  }

  if (method === 'email') {
    return (
      <img
        src="/Gmail.webp"
        alt="Email"
        title="Email (Email OTP Code Signup)"
        style={{
          width: imgDim,
          height: imgDim,
          objectFit: 'contain',
          verticalAlign: 'middle',
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
    );
  }

  if (method === 'truecaller') {
    return (
      <img
        src="/trucaller.png"
        alt="Truecaller"
        title="Truecaller (1-Tap Mobile Verified Signup)"
        style={{
          width: imgDim,
          height: imgDim,
          objectFit: 'contain',
          verticalAlign: 'middle',
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
    );
  }

  if (method === 'phone') {
    return (
      <span title="Mobile OTP Signup" style={{ display: 'inline-flex', alignItems: 'center' }}>
        <Smartphone
          size={isXs ? 13 : 15}
          style={{ color: '#059669', verticalAlign: 'middle', flexShrink: 0 }}
        />
      </span>
    );
  }

  if (method === 'unknown') {
    return (
      <span title="Direct Signup" style={{ display: 'inline-flex', alignItems: 'center' }}>
        <User
          size={isXs ? 13 : 15}
          style={{ color: '#94a3b8', verticalAlign: 'middle', flexShrink: 0 }}
        />
      </span>
    );
  }

  return null;
};
