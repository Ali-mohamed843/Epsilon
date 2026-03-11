import { io } from 'socket.io-client';

const SOCKET_URL = 'https://webhook1.epsilonfinder.com/fbpages';

let socket = null;
let joinedIds = [];

export const connectSocket = () => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    if (joinedIds.length > 0) {
      socket.emit('join', { ids: joinedIds });
      console.log('Re-joined pages:', joinedIds);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.log('Socket connection error:', error.message);
  });

  return socket;
};

export const joinPages = (pageIds) => {
  if (!Array.isArray(pageIds) || pageIds.length === 0) return;
  joinedIds = pageIds;
  if (socket?.connected) {
    socket.emit('join', { ids: pageIds });
    console.log('Joined pages:', pageIds);
  }
};

export const onSocketEvent = (eventName, callback) => {
  if (!socket) return () => {};
  socket.on(eventName, callback);
  return () => socket.off(eventName, callback);
};

export const emitSocketEvent = (eventName, data) => {
  if (socket?.connected) {
    socket.emit(eventName, data);
    console.log('Emitted:', eventName, data);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    joinedIds = [];
    console.log('Socket disconnected manually');
  }
};

export const getSocket = () => socket;

export const isConnected = () => socket?.connected ?? false;