import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { authApi } from '../api';

export type Role = 'admin' | 'staff' | 'user';

export type AuthUser = {
  name: string;
  email: string;
  role: Role;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const USER_STORAGE_KEY = 'paypay-auth-user';
const TOKEN_STORAGE_KEY = 'paypay-auth-token';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  const raw = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

function clearStoredSession() {
  window.localStorage.removeItem(USER_STORAGE_KEY);
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    const storedUser = readStoredUser();

    async function hydrateSession() {
      if (!storedToken) {
        if (isMounted) {
          setIsReady(true);
        }
        return;
      }

      if (isMounted) {
        setToken(storedToken);
        setUser(storedUser);
      }

      try {
        const freshUser = await authApi.me(storedToken);
        if (isMounted) {
          setUser(freshUser);
          window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(freshUser));
        }
      } catch {
        clearStoredSession();
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsReady(true);
        }
      }
    }

    hydrateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user),
      login: async (email: string, password: string) => {
        const session = await authApi.login(email.trim(), password);

        if (session.user.role !== 'admin') {
          throw new Error('Only admin accounts can access this console.');
        }

        window.localStorage.setItem(TOKEN_STORAGE_KEY, session.token);
        window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user));
        setToken(session.token);
        setUser(session.user);
      },
      logout: async () => {
        const activeToken = token;
        clearStoredSession();
        setToken(null);
        setUser(null);

        if (activeToken) {
          try {
            await authApi.logout(activeToken);
          } catch {
            // The local session is already cleared, so a failed remote logout is non-blocking.
          }
        }
      },
    }),
    [token, user],
  );

  if (!isReady) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}
