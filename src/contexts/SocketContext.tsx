import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
}

const SocketContext = createContext<SocketContextType>({ socket: null, connected: false });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Removed early exit so anonymous users can receive global broadcasts like marginUpdate

    const rawApiUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || apiClient.defaults.baseURL || 'https://smmstable.com';
    const socketUrl = rawApiUrl.replace(/\/api\/?$/, '');

    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['polling', 'websocket'],
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    newSocket.on('connect', () => {
      setConnected(true);
      if (user) {
        newSocket.emit('joinUserRoom', user.id);
      }
    });

    newSocket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    newSocket.on('disconnect', () => {
      setConnected(false);
    });

    // Real-time events
    newSocket.on('notification_created', (notification: any) => {
      toast({
        title: notification.title,
        description: notification.message,
      });
      // Optionally trigger a query refresh here
    });

    newSocket.on('ticket_updated', (ticket: any) => {
      toast({
        title: 'Ticket Updated',
        description: `Status of ticket "${ticket.subject}" is now ${ticket.status}.`,
      });
      // Optionally trigger a query refresh here
    });

    newSocket.on('balance_updated', (data: any) => {
      if (data.type === 'CREDIT') {
        toast({
          title: 'Balance Added',
          description: `Your balance was credited by $${data.amount.toFixed(2)}.`,
        });
      } else {
        toast({
          title: 'Balance Updated',
          description: `Your balance is now $${data.balance.toFixed(2)}.`,
        });
      }
      // Re-fetch user or update auth context
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    });

    newSocket.on('order_updated', (data: any) => {
      toast({
        title: 'Order Status Updated',
        description: `Order #${data.id} is now ${data.status}.`,
      });
      // Re-fetch orders
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    });

    newSocket.on('marginUpdate', (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['smm-services'] });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
