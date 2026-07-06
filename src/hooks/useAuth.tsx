import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiClient } from "@/lib/apiClient";

export interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

export interface Profile {
  username: string;
  balance: number;
  tier: string;
  email: string;
  currency?: string;
}

interface AuthContextType {
  user: User | null;
  session: any | null; // For backward compatibility with the old session object, though we rely on HTTP cookies
  loading: boolean;
  isAdmin: boolean;
  profile: Profile | null;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  profile: null,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/auth/me');
      const data = response.data;
      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          username: data.username,
          role: data.role,
        });
        setSession({ user: data }); // Mock session for backward compatibility
        setProfile({
          username: data.username || "",
          balance: Number(data.balance || 0),
          tier: data.loyalty || "bronze",
          email: data.email || "",
          currency: data.currency || "USD",
        });
        setIsAdmin(data.role === 'ADMIN');
      }
    } catch (error) {
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      await fetchProfile();
      setLoading(false);
    };

    initAuth();

    const handleUnauthorized = () => {
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, []);

  const signOut = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error(error);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setIsAdmin(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, profile, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
