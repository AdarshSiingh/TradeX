import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [prices, setPrices] = useState({});

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL);

    socket.on('priceUpdate', ({ ticker, price }) => {
      setPrices((prev) => ({ ...prev, [ticker]: price }));
    });

    return () => socket.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={{ prices }}>
      {children}
    </SocketContext.Provider>
  );
};