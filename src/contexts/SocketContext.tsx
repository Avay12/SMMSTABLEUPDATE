import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

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
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const newSocket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      setConnected(true);
      newSocket.emit('joinUserRoom', user.id);
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
