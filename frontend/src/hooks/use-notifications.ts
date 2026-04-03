"use client";

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { useAuth } from './use-auth';

export const useNotifications = () => {
  const { user, token } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user || !token) return;

    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    socketRef.current = io(`${socketUrl}/notifications`, {
      auth: { token },
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to notifications');
    });

    socketRef.current.on('notification', (data: any) => {
      toast(data.title || 'New Notification', {
        description: data.message,
        action: data.action ? {
          label: 'View',
          onClick: () => window.location.href = data.action
        } : undefined,
      });
    });

    socketRef.current.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, token]);

  return socketRef.current;
};
