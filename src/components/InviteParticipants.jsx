import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../utils/constants";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const InviteParticipants = ({ eventId, reload }) => {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [invited, setInvited] = useState([]);
  const { user, token } = useAuth();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const [usersRes, eventRes] = await Promise.all([
          axios.get(`${API_BASE}/api/auth/all`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE}/api/events/${eventId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const allUsers = usersRes.data;
        const eventData = eventRes.data;

        const eventParticipants = eventData.participants || [];
        const participantNames = eventParticipants.map((p) => {
          const user = allUsers.find((u) => u._id === p._id);
          return {
            ...p,
            name: user?.name || "Unknown",
            email: user?.email || "Unknown",
          };
        });

        const availableUsers = allUsers.filter(
          (u) => !eventParticipants.some((p) => p._id === u._id)
        );

        setInvited(participantNames);
        setUsers(availableUsers);
      } catch (err) {
        console.error("Error loading data:", err);
      }
    };

    loadUsers();
  }, [token, eventId]);

  const handleInvite = async () => {
    if (selected.length === 0) {
      toast.warning("Please select at least one participant");
      return;
    }

    try {
      await axios.put(
        `${API_BASE}/api/events/${eventId}/invite`,
        { participants: selected },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Participants invited successfully!");
      setSelected([]);
      reload();

      const newlyInvited = users
        .filter((u) => selected.includes(u._id))
        .map((u) => ({ ...u, status: "invited" })); 

      setInvited((prev) => [...prev, ...newlyInvited]);
      setUsers((prev) => prev.filter((u) => !selected.includes(u._id)));
    } catch (err) {
      console.error("Error inviting:", err);
      toast.error("Failed to invite participants");
    }
  };
const handleRejectParticipant = async (participantId) => {
  try {
     await axios.post(
        `${API_BASE}/api/events/${eventId}/rsvp`,
        { status: "declined", userId: user?.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

    toast.success("Participant rejected");

    
    
  } catch (err) {
    console.error(err);
    toast.error("Failed to reject participant");
  }
};

  return (
    <div className="mt-4 p-6 bg-white rounded-2xl shadow-lg flex flex-col gap-6">
      <h3 className="text-xl font-bold text-gray-800 border-b pb-2">
        Invite Participants
      </h3>

      {/* Available Users */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">Available to Invite</h4>
        <div className="border rounded-xl p-3 max-h-60 overflow-y-auto space-y-2">
          {users.length === 0 ? (
            <p className="text-gray-400 text-sm">No users available to invite.</p>
          ) : (
            users.map((u) => (
              <label
                key={u._id}
                className="flex items-center justify-between bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={u._id}
                    checked={selected.includes(u._id)}
                    onChange={(e) => {
                      const { checked, value } = e.target;
                      setSelected((prev) =>
                        checked
                          ? [...prev, value]
                          : prev.filter((id) => id !== value)
                      );
                    }}
                    className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <span className="text-gray-700">{u.name}</span>
                </div>
                <span className="text-gray-400 text-sm">{u.email}</span>
              </label>
            ))
          )}
        </div>

        <button
          onClick={handleInvite}
          className="mt-4 w-full py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition"
        >
          Invite Selected
        </button>
      </div>

      {/* Already Invited */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-2">Already Invited</h4>
        {invited.length === 0 ? (
          <p className="text-gray-400 text-sm">No participants invited yet.</p>
        ) : (
      <ul className="space-y-1">
  {invited.map((p) => (
    <li
      key={p._id}
      className="flex items-center justify-between bg-gray-100 p-2 rounded-md shadow-sm hover:bg-gray-200 transition"
    >
      <div>
        {p.name} <span className="text-gray-500 text-xs">({p.email})</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-medium ${
            p.status === "accepted"
              ? "text-green-600"
              : p.status === "declined"
              ? "text-red-600"
              : "text-indigo-600"
          }`}
        >
          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
        </span>
        {(user.role === "Admin" || user.role === "Organizer") && p.status !== "declined" && (
          <button
            className="text-red-600 text-xs font-semibold hover:underline"
            onClick={() => handleRejectParticipant(p._id)}
          >
            Reject
          </button>
        )}
      </div>
    </li>
  ))}
</ul>

        )}
      </div>
    </div>
  );
};

export default InviteParticipants;
