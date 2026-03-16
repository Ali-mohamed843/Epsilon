import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  connectSocket,
  joinPages,
  disconnectSocket,
  isConnected,
  getSocket,
} from '@/services/socketService';

const SocketContext = createContext(null);

const SOCKET_EVENTS = {
  COMMENT_ADD: 'comment_add',
  COMMENT_ASSIGNED_UPDATE: 'comment_assigned_update',
  COMMENT_UPDATE: 'comment_update',
  NEW_MENTION: 'new_mention',
  NEW_MESSAGE: 'new_message',
  IG_NEW_MESSAGE: 'ig_new_message',
  IG_MESSAGE_DELETED: 'ig_message_deleted',
  POST_ADD: 'post_add',
  POST_DELETE: 'post_delete',
  POST_UPDATE: 'post_update',
};

export const SocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const listenersRef = useRef({});

  useEffect(() => {
    connectSocket();

    const checkSocket = setInterval(() => {
      const socket = getSocket();
      if (!socket) return;

      clearInterval(checkSocket);

      console.log('>>>>>> SOCKET SETUP: Socket found, registering listeners');
      console.log('>>>>>> SOCKET ID:', socket.id);
      console.log('>>>>>> SOCKET CONNECTED:', socket.connected);

      socket.onAny((eventName, ...args) => {
        console.log('>>>>>> GLOBAL SOCKET EVENT:', eventName);
        console.log('>>>>>> DATA:', JSON.stringify(args).substring(0, 500));
      });

      socket.on('connect', () => {
        console.log('>>>>>> SOCKET CONNECTED:', socket.id);
        setConnected(true);
      });

      socket.on('disconnect', (reason) => {
        console.log('>>>>>> SOCKET DISCONNECTED:', reason);
        setConnected(false);
      });

      Object.values(SOCKET_EVENTS).forEach((event) => {
        socket.on(event, (data) => {
          console.log(`>>>>>> Socket event [${event}]:`, JSON.stringify(data).substring(0, 300));
          const callbacks = listenersRef.current[event];
          if (callbacks) {
            callbacks.forEach((cb) => cb(data));
          }
        });
      });

      if (socket.connected) {
        setConnected(true);
      }
    }, 100);

    return () => {
      clearInterval(checkSocket);
      const socket = getSocket();
      if (socket) {
        socket.offAny();
        Object.values(SOCKET_EVENTS).forEach((event) => {
          socket.removeAllListeners(event);
        });
      }
      disconnectSocket();
    };
  }, []);

  const subscribe = useCallback((eventName, callback) => {
    if (!listenersRef.current[eventName]) {
      listenersRef.current[eventName] = new Set();
    }
    listenersRef.current[eventName].add(callback);

    return () => {
      listenersRef.current[eventName]?.delete(callback);
    };
  }, []);

  const joinPageRooms = useCallback((pageIds) => {
    joinPages(pageIds);
  }, []);

  return (
    <SocketContext.Provider value={{ connected, subscribe, joinPageRooms, SOCKET_EVENTS }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};

export { SOCKET_EVENTS };