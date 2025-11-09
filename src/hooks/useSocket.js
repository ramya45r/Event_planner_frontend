import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { API_BASE } from "../utils/constants";

export const useSocket = (roomId, onMessage) => {
  const socketRef = useRef(null);

  // Connect socket once
  useEffect(() => {
    const socket = io(API_BASE, {
      auth: { token: localStorage.getItem("token") },
    });
    socketRef.current = socket;

    socket.on("chatMessage", (msg) => {
      if (onMessage) onMessage(msg);
    });

    return () => {
      socket.disconnect();
    };
  }, [onMessage]);

  // Join/leave room whenever roomId changes
  useEffect(() => {
    if (!roomId || !socketRef.current) return;

    socketRef.current.emit("joinRoom", roomId);

    return () => {
      socketRef.current.emit("leaveRoom", roomId);
    };
  }, [roomId]);

  const send = (message, user) => {
    if (socketRef.current && roomId) {
      socketRef.current.emit("chatMessage", {
        eventId: roomId,
        user,
        message,
      });
    }
  };

  return { send, socket: socketRef.current };
};
