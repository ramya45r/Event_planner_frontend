import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../utils/constants";
import { toast } from "react-toastify";

const InviteParticipants = ({ eventId, reload }) => {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const token = localStorage.getItem("token");

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

        const eventParticipants = eventRes.data.participants.map((p) => p._id);
        const availableUsers = usersRes.data.filter(
          (user) => !eventParticipants.includes(user._id)
        );

        setUsers(availableUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    loadUsers();
  }, [token, eventId]);

  // Invite selected users
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
      reload(); // refresh event participants list
    } catch (err) {
      console.error("Error inviting:", err);
      toast.error("Failed to invite participants");
    }
  };

  return (
    <div className="mt-4">
      <h4 className="font-semibold mb-2">Invite Participants</h4>

      <div className="border rounded p-3 max-h-60 overflow-y-auto">
        {users.length === 0 ? (
          <p className="text-gray-500 text-sm">No users available to invite.</p>
        ) : (
          users.map((u) => (
            <label key={u._id} className="flex items-center space-x-2 mb-2">
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
              />
              <span>
                {u.name} ({u.email})
              </span>
            </label>
          ))
        )}
      </div>

      <button
        onClick={handleInvite}
        className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Invite
      </button>
    </div>
  );
};

export default InviteParticipants;
