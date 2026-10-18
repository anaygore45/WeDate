import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (token) => {
  const authToken = token || localStorage.getItem('wedate_token');
  if (!authToken) return null;

  if (socket) {
    if (socket.connected) return socket;
    socket.disconnect();
  }

  const socketUrl =
    import.meta.env.VITE_SERVER_URL ||
    (window.location.port === '5173' ? 'http://localhost:5000' : window.location.origin);

  socket = io(socketUrl, {
    auth: { token: authToken },
    query: { token: authToken },
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: 8,
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
