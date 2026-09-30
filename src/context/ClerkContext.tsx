import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ClerkProvider, useUser } from '@clerk/clerk-react';
import { StudentUser } from '../types';

declare const __CLERK_KEY__: string | undefined;

interface ClerkContextValue {
  publishableKey: string;
  isConfigured: boolean;
}

const ClerkContext = createContext<ClerkContextValue>({
  publishableKey: '',
  isConfigured: false,
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
        // Retrieve Google avatar reliably from user.imageUrl or Google external account
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

function resolveClerkKey(): string {
  // 1. Injected at Vite build time (__CLERK_KEY__)
  try {
    if (typeof __CLERK_KEY__ !== 'undefined' && __CLERK_KEY__) {
      const k = __CLERK_KEY__.trim();
      if (k.startsWith('pk_')) return k;
    }
  } catch {}

  // 2. Vite environment variables
  try {
    const envMeta = (import.meta as any).env;
    const k = (
      envMeta?.VITE_CLERK_PUBLISHABLE_KEY ||
      envMeta?.CLERK_PUBLISHABLE_KEY ||
      ''
    ).trim();
    if (k.startsWith('pk_')) return k;
  } catch {}

  // 3. Node process.env (server or build context)
  try {
    if (typeof process !== 'undefined' && process.env) {
      const k = (
        process.env.VITE_CLERK_PUBLISHABLE_KEY ||
        process.env.CLERK_PUBLISHABLE_KEY ||
        ''
      ).trim();
      if (k.startsWith('pk_')) return k;
    }
  } catch {}

  return '';
}

export const ClerkAuthProvider: React.FC<ClerkAuthProviderProps> = ({ children, onStudentSync }) => {
  const [publishableKey, setPublishableKey] = useState<string>(resolveClerkKey);

  useEffect(() => {
    // If not found in client bundle, check server endpoint if available
    if (!publishableKey || !publishableKey.startsWith('pk_')) {
      fetch('/api/clerk-key')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.clerkPublishableKey && data.clerkPublishableKey.trim().startsWith('pk_')) {
            setPublishableKey(data.clerkPublishableKey.trim());
          }
        })
        .catch(() => {});
    }
  }, [publishableKey]);

  const isConfigured = Boolean(publishableKey && publishableKey.trim().startsWith('pk_'));

  const contextValue: ClerkContextValue = {
    publishableKey,
    isConfigured,
  };

  return (
    <ClerkContext.Provider value={contextValue}>
      {isConfigured ? (
        <ClerkProvider publishableKey={publishableKey}>
          <ClerkStudentSync onStudentSync={onStudentSync} />
          {children}
        </ClerkProvider>
      ) : (
        children
      )}
    </ClerkContext.Provider>
  );
};
