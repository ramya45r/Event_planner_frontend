import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../hooks/useSocket";
import { createGoogleCalendarLink } from "../services/google";
import InviteParticipants from "../components/InviteParticipants";
import { API_BASE } from "../utils/constants";
import { useAuth } from "../context/AuthContext";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [roomId, setRoomId] = useState(null);
  const { user } = useAuth();
  const role = user?.role === "Admin" || user?.role === "Organizer";

  // ✅ Socket setup
  const { send, socket } = useSocket(roomId, (msg) => {
    if (!msg.createdAt) msg.createdAt = new Date().toISOString();
    setMessages((prev) => [...prev, msg]);
  });

  // ✅ Load event, room, and chat messages
  const load = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch event details
      const ev = await axios.get(`${API_BASE}/api/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const eventData = ev.data.event || ev.data;
      setEvent(eventData);

      // Fetch or create chat room
      const roomRes = await axios.get(`${API_BASE}/api/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let foundRoom = roomRes.data?.[0];
      let rid;

      if (foundRoom?._id) {
        rid = foundRoom._id;
      } else {
        const createRes = await axios.post(
          `${API_BASE}/api/rooms`,
          {
            name: `${eventData.title} Chat`,
            eventId: id,
            participants: eventData.participants,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        rid = createRes.data.room._id;
      }

      setRoomId(rid);

      // Fetch existing chat messages
      const msgs = await axios.get(`${API_BASE}/api/chat/${id}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessages(msgs.data.messages || msgs.data || []);
    } catch (err) {
      console.error("Error loading event:", err);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // ✅ Send Message Function
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !roomId) return;

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${API_BASE}/api/chat/${id}/messages`,
        { text, roomId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const savedMessage = res.data.message || res.data;

      const finalMsg = {
        ...savedMessage,
        text: savedMessage.text || text,
        sender: savedMessage.sender || { _id: user.id, name: user.name },
        createdAt: savedMessage.createdAt || new Date().toISOString(),
        room: roomId,
      };

      // Add to UI immediately
      setMessages((prev) => [...prev, finalMsg]);

      // Emit via socket
      send(finalMsg);

      setText("");
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  if (!event) return <div className="p-6 text-gray-500">Loading event...</div>;

  return (
    <div className="p-6 grid lg:grid-cols-3 gap-6">
      {/* Event & Chat */}
      <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold text-indigo-600">{event.title}</h2>
          <p className="text-gray-700 mt-2">{event.description}</p>
          <a
            href={createGoogleCalendarLink(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-500 text-sm mt-2 inline-block hover:underline"
          >
            ➕ Add to Google Calendar
          </a>
        </div>

        {/* Chat Room */}
        <div className="flex flex-col flex-1">
          <h3 className="font-semibold text-gray-800 mb-3">Chat Room</h3>

          <div className="flex-1 overflow-auto p-4 rounded-xl bg-gray-50 shadow-inner flex flex-col gap-3">
            {messages.length === 0 && (
              <p className="text-gray-400 text-sm text-center mt-4">No messages yet</p>
            )}

            {messages.map((m, i) => {
              const isMe = m.sender?._id === user.id;
              const messageDate = new Date(m.createdAt).toDateString();
              const prevMessageDate =
                i > 0 ? new Date(messages[i - 1].createdAt).toDateString() : null;
              const showDate = messageDate !== prevMessageDate;

              return (
                <React.Fragment key={m._id || i}>
                  {showDate && (
                    <div className="text-center text-gray-500 text-xs my-2">{messageDate}</div>
                  )}
                  <div className={`flex ${isMe ? "justify-end" : "justify-start"} mb-2`}>
                    <div
                      className={`max-w-xs md:max-w-md p-3 rounded-xl shadow break-words ${
                        isMe
                          ? "bg-indigo-600 text-white rounded-tr-none"
                          : "bg-gray-200 text-gray-900 rounded-tl-none"
                      }`}
                    >
                      <p className="text-sm">{m.text || m.message}</p>
                      <span
                        className={`block text-xs mt-1 ${
                          isMe ? "text-indigo-100" : "text-gray-500"
                        }`}
                      >
                        {m.createdAt
                          ? new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="flex gap-3 mt-3 items-center">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Type your message…"
            />
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      <aside className="bg-white p-6 rounded-xl shadow-lg flex flex-col gap-4">
        <h4 className="font-semibold text-gray-800">Participants</h4>
        {role && <InviteParticipants eventId={id} reload={load} />}
      </aside>
    </div>
  );
};

export default EventDetails;
