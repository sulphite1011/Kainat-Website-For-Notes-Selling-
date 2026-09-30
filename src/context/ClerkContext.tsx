import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ClerkProvider, useUser } from '@clerk/clerk-react';
import { StudentUser } from '../types';
import { getStoredSettings, saveStoredSettings } from '../services/apiClient';

declare const __CLERK_KEY__: string | undefined;

interface ClerkContextValue {
  publishableKey: string;
  isConfigured: boolean;
  saveKey: (key: string) => Promise<void>;
  clearKey: () => void;
}

const ClerkContext = createContext<ClerkContextValue>({
  publishableKey: '',
  isConfigured: false,
  saveKey: async () => {},
  clearKey: () => {},
});

export const useClerkConfig = () => useContext(ClerkContext);

interface ClerkAuthProviderProps {
  children: ReactNode;
  onStudentSync?: (student: StudentUser) => void;
}

// Internal component that listens to Clerk sign-in state and syncs student
const ClerkStudentSync: React.FC<{
  onStudentSync?: (student: StudentUser) => void;
}> = ({ onStudentSync }) => {
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const email = user.primaryEmailAddress?.emailAddress;
      if (email) {
        // Retrieve Google avatar reliably from user.imageUrl or externalAccounts
        const googleAvatar =
          user.imageUrl ||
          (user.externalAccounts?.find((a) => a.provider === 'google') as any)?.avatarUrl ||
          user.externalAccounts?.find((a) => a.provider === 'google')?.imageUrl ||
          '';

        const studentObj: StudentUser = {
          id: user.id,
          email: email.toLowerCase().trim(),
          name: user.fullName || user.firstName || 'Student',
          avatarUrl: googleAvatar,
          phone: user.primaryPhoneNumber?.phoneNumber || '',
          verifiedAt: new Date().toISOString(),
        };
        if (onStudentSync) {
          onStudentSync(studentObj);
        }
      }
    }
  }, [isLoaded, isSignedIn, user, onStudentSync]);

  return null;
};

export const ClerkAuthProvider: React.FC<ClerkAuthProviderProps> = ({ children, onStudentSync }) => {
  const [publishableKey, setPublishableKey] = useState<string>(() => {
    // 1. Injected at Vite build time (__CLERK_KEY__, CLERK_PUBLISHABLE_KEY, VITE_CLERK_PUBLISHABLE_KEY)
    let envKey = '';
    try {
      if (typeof __CLERK_KEY__ !== 'undefined' && __CLERK_KEY__) {
        envKey = __CLERK_KEY__;
      }
    } catch {}

    if (!envKey) {
      envKey =
        (import.meta as any).env?.CLERK_PUBLISHABLE_KEY ||
        (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY ||
        (typeof process !== 'undefined'
          ? (process.env as any)?.CLERK_PUBLISHABLE_KEY || (process.env as any)?.VITE_CLERK_PUBLISHABLE_KEY
          : '');
    }

    if (envKey && typeof envKey === 'string' && envKey.trim().startsWith('pk_')) {
      return envKey.trim();
    }
    // 2. Local storage
    try {
      const stored = localStorage.getItem('kainat_clerk_pub_key');
      if (stored && stored.trim().startsWith('pk_')) {
        return stored.trim();
      }
    } catch {
      // ignore
    }
    // 3. Site settings
    try {
      const settings = getStoredSettings();
      if (settings.clerkPublishableKey && settings.clerkPublishableKey.trim().startsWith('pk_')) {
        return settings.clerkPublishableKey.trim();
      }
    } catch {
      // ignore
    }
    return '';
  });

  const isConfigured = Boolean(publishableKey && publishableKey.trim().startsWith('pk_'));

  useEffect(() => {
    // 1. Fetch public Clerk Key from server immediately on boot (crucial for new browsers/incognito)
    fetch('/api/clerk-key')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.clerkPublishableKey && data.clerkPublishableKey.trim().startsWith('pk_')) {
          const key = data.clerkPublishableKey.trim();
          setPublishableKey((prev) => (prev !== key ? key : prev));
          try {
            localStorage.setItem('kainat_clerk_pub_key', key);
            const settings = getStoredSettings();
            settings.clerkPublishableKey = key;
            saveStoredSettings(settings);
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {});

    // 2. Listener & Poll for instant sync across tabs
    const checkKey = () => {
      try {
        const stored = localStorage.getItem('kainat_clerk_pub_key');
        if (stored && stored.trim().startsWith('pk_') && stored.trim() !== publishableKey) {
          setPublishableKey(stored.trim());
          return;
        }
        const settings = getStoredSettings();
        if (settings.clerkPublishableKey && settings.clerkPublishableKey.trim().startsWith('pk_') && settings.clerkPublishableKey.trim() !== publishableKey) {
          setPublishableKey(settings.clerkPublishableKey.trim());
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('storage', checkKey);
    const interval = setInterval(checkKey, 2000);
    return () => {
      window.removeEventListener('storage', checkKey);
      clearInterval(interval);
    };
  }, [publishableKey]);

  const saveKey = async (newKey: string) => {
    const trimmed = newKey.trim();
    setPublishableKey(trimmed);
    try {
      localStorage.setItem('kainat_clerk_pub_key', trimmed);
      const settings = getStoredSettings();
      settings.clerkPublishableKey = trimmed;
      saveStoredSettings(settings);

      // Persist to server
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clerkPublishableKey: trimmed }),
      }).catch(() => {});
    } catch (e) {
      console.warn('Error saving Clerk key:', e);
    }
  };

  const clearKey = () => {
    setPublishableKey('');
    try {
      localStorage.removeItem('kainat_clerk_pub_key');
      const settings = getStoredSettings();
      settings.clerkPublishableKey = '';
      saveStoredSettings(settings);
    } catch {
      // ignore
    }
  };

  const contextValue: ClerkContextValue = {
    publishableKey,
    isConfigured,
    saveKey,
    clearKey,
  };

  if (isConfigured) {
    return (
      <ClerkContext.Provider value={contextValue}>
        <ClerkProvider publishableKey={publishableKey}>
          <ClerkStudentSync onStudentSync={onStudentSync} />
          {children}
        </ClerkProvider>
      </ClerkContext.Provider>
    );
  }

  return (
    <ClerkContext.Provider value={contextValue}>
      {children}
    </ClerkContext.Provider>
  );
};
