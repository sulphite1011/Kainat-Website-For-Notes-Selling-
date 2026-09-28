import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClerkProvider, useUser, useClerk, SignedIn, SignedOut } from '@clerk/clerk-react';
import { StudentUser } from '../types';
import { getStoredSettings, saveStoredSettings, saveStoredStudent, getStoredStudent } from '../services/apiClient';

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
  children: React.ReactNode;
  onStudentSync?: (student: StudentUser | null) => void;
}

/**
 * Inner component that watches Clerk auth state and syncs the logged-in
 * Google/Gmail student into the app's student state.
 */
const ClerkStudentSync: React.FC<{ onStudentSync?: (student: StudentUser | null) => void }> = ({ onStudentSync }) => {
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      const email = user.primaryEmailAddress?.emailAddress;
      if (email) {
        const studentObj: StudentUser = {
          email: email.trim().toLowerCase(),
          name: user.fullName || user.firstName || email.split('@')[0],
          phone: user.phoneNumbers?.[0]?.phoneNumber || '',
          verifiedAt: new Date().toISOString(),
          deviceId: `clerk_${user.id}`,
          imageUrl: user.imageUrl || '',
        };
        saveStoredStudent(studentObj);
        if (onStudentSync) {
          onStudentSync(studentObj);
        }
      }
    }
  }, [isLoaded, isSignedIn, user]);

  return null;
};

export const ClerkAuthProvider: React.FC<ClerkAuthProviderProps> = ({ children, onStudentSync }) => {
  const [publishableKey, setPublishableKey] = useState<string>(() => {
    // 1. Env variable
    const envKey = (import.meta as any).env?.VITE_CLERK_PUBLISHABLE_KEY;
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
    const interval = setInterval(checkKey, 1500);
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

      // Persist to server if online
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

  // If a valid publishable key starting with pk_ is provided, mount ClerkProvider
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

  // Fallback if key is not yet set: render children directly so app never crashes
  return (
    <ClerkContext.Provider value={contextValue}>
      {children}
    </ClerkContext.Provider>
  );
};
