import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function useSocket() {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const instance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
    });

    setSocket(instance);

    instance.on('connect', () => setConnected(true));
    instance.on('disconnect', () => setConnected(false));

    return () => {
      instance.disconnect();
    };
  }, []);

  return { socket, connected };
}

export function getDmRoomId(userId1, userId2) {
  return ['dm', ...[userId1, userId2].sort()].join('_');
}
