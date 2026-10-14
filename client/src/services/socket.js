import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (token) => {
  if (socket) {
    if (socket.connected) return socket;
    socket.disconnect();
  }

  socket = io(window.location.origin, {
    auth: { token },
    query: { token },
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected to WeDate real-time engine:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket Connection Error]:', err.message);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
