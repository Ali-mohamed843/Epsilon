import { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';

const useSocketEvent = (eventName, callback, deps = []) => {
  const { subscribe } = useSocket();

  useEffect(() => {
    if (!eventName || !callback) return;
    const unsubscribe = subscribe(eventName, callback);
    return unsubscribe;
  }, [eventName, ...deps]);
};

export default useSocketEvent;