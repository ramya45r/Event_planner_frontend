import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../utils/constants";

export const useSocket = (roomId, onMessage) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io(SOCKET_URL, { transports: ["websocket"], autoConnect: false });
    setSocket(s);
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.connect();
    if (roomId) socket.emit("joinRoom", roomId);
    socket.on("chatMessage", onMessage);
    return () => {
      if (roomId) socket.emit("leaveRoom", roomId);
      socket.off("chatMessage", onMessage);
    };
  }, [socket, roomId, onMessage]);

  const send = (payload) => socket?.emit("chatMessage", payload);
  return { socket, send };
};
