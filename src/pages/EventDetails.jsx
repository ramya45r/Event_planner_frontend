import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSocket } from "../hooks/useSocket";
import { createGoogleCalendarLink } from "../services/google";
import ParticipantList from "../components/ParticipantList";
import { API_BASE } from "../utils/constants";
import InviteParticipants from "../components/InviteParticipants";
import { useAuth } from "../context/AuthContext";

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [participants, setParticipants] = useState([]);
  const [roomId, setRoomId] = useState(null);

  const { send } = useSocket(roomId, (msg) => setMessages((prev) => [...prev, msg]));
const { user } = useAuth(); // get user info from AuthContext

  // Roles allowed to create events
  const role = user?.role === "Admin" || user?.role === "Organizer";

 
const load = useCallback(async () => {
  try {
    const token = localStorage.getItem("token");

    // 1️⃣ Fetch event details
    const ev = await axios.get(`${API_BASE}/api/events/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const eventData = ev.data.event || ev.data;
    setEvent(eventData);
    setParticipants(eventData.participants || []);

    // 2️⃣ Try to get existing room for this event
    const roomRes = await axios.get(`${API_BASE}/api/rooms/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    let foundRoom = roomRes.data?.[0]; // because backend returns array
    if (foundRoom && foundRoom._id) {
      setRoomId(foundRoom._id);
    } else {
      // 3️⃣ No room found → create one
      const createRes = await axios.post(
        `${API_BASE}/api/rooms`,
        { name: `${eventData.title} Chat`, eventId: id, participants: eventData.participants },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRoomId(createRes.data.room._id);
    }

    // 4️⃣ Fetch chat messages
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

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !roomId) return;

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE}/api/chat/${id}/messages`,
        { text, roomId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      send({ room: roomId, text });
      setText("");
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  if (!event) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 grid lg:grid-cols-3 gap-4">
      {/* Left side — Event details & Chat */}
      <div className="lg:col-span-2 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold">{event.title}</h2>
        <p className="text-sm text-gray-600">{event.description}</p>

        {/* Optional: Add calendar link */}
        <a
          href={createGoogleCalendarLink(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 text-sm mt-2 inline-block"
        >
          ➕ Add to Google Calendar
        </a>

        {/* Chat Room */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Chat Room</h3>
          <div className="border p-3 h-64 overflow-auto bg-gray-50 rounded">
            {messages.length === 0 && (
              <p className="text-gray-400 text-sm">No messages yet.</p>
            )}
          {messages.map((m, i) => {
  const isMe = m.sender?._id === JSON.parse(localStorage.getItem("user"))?._id;
  return (
    <div
      key={i}
      className={`flex mb-3 ${isMe ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-xs md:max-w-md p-2 rounded-lg shadow-sm ${
          isMe
            ? "bg-indigo-600 text-white rounded-br-none"
            : "bg-gray-200 text-gray-900 rounded-bl-none"
        }`}
      >
        <p className="text-sm break-words">{m.message}</p>
        <span
          className={`block text-xs mt-1 ${
            isMe ? "text-indigo-100" : "text-gray-500"
          }`}
        >
          {new Date(m.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
})}

          </div>

          {/* Send message */}
          <form onSubmit={sendMessage} className="flex gap-2 mt-3">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 p-2 border rounded"
              placeholder="Type a message…"
            />
            <button
              type="submit"
              className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      {/* Right side — Participants */}
      <aside className="bg-white p-4 rounded shadow">
        <h4 className="font-semibold mb-2">Participants</h4>
        {role &&
          <InviteParticipants eventId={id} reload={load} />
        }
           </aside>
    </div>
  );
};

export default EventDetails;
