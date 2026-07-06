import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { apiClient } from '../lib/apiClient';
import { io, Socket } from 'socket.io-client';
import { toast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  balance: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    const handleUnauthorized = () => {
      setUser(null);
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, []);

  // Socket logic
  useEffect(() => {
    if (user?.id) {
      if (!socketRef.current) {
        const baseUrl = apiClient.defaults.baseURL || '';
        const socketUrl = baseUrl.replace('/api', '');
        
        socketRef.current = io(socketUrl || window.location.origin, {
          path: '/socket.io/',
          transports: ['websocket', 'polling'],
          withCredentials: true,
        });

        socketRef.current.on('connect', () => {
          socketRef.current?.emit('joinUserRoom', user.id);
        });

        socketRef.current.on('balance_updated', (data: any) => {
          if (data && typeof data.balance === 'number') {
            setUser((prev) => prev ? { ...prev, balance: data.balance } : prev);
            if (data.type === 'CREDIT') {
              toast({ title: "Balance Added", description: `Your balance was credited by $${data.amount.toFixed(2)}` });
            }
          }
        });

        socketRef.current.on('order_updated', (data: any) => {
          toast({ title: "Order Updated", description: `Order #${data.id} status is now ${data.status}` });
          // Dispatch custom event so pages like AdminOrders or UserOrders can refetch
          window.dispatchEvent(new CustomEvent('socket-order-updated', { detail: data }));
        });

        socketRef.current.on('ticket_updated', (ticket: any) => {
          toast({ title: "Ticket Updated", description: `Status of ticket "${ticket.subject}" is now ${ticket.status}.` });
          window.dispatchEvent(new CustomEvent('socket-ticket-updated', { detail: ticket }));
        });

        socketRef.current.on('notification_created', (notif: any) => {
          toast({ title: notif.title, description: notif.message });
        });
      }
    } else {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?.id]);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.error(e);
    } finally {
      setUser(null);
    }
  };

  const updateBalance = (newBalance: number) => {
    setUser((prev) => prev ? { ...prev, balance: newBalance } : prev);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: fetchUser, updateBalance }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
