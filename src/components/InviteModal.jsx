import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../utils/constants";
import { toast } from "react-toastify";

const InviteModal = ({ eventId, reload, isOpen, onClose }) => {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!isOpen) return; // Only load when modal is open
    const loadUsers = async () => {
      try {
        setLoading(true);
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
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [isOpen, token, eventId]);

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
      onClose();
    } catch (err) {
      console.error("Error inviting:", err);
      toast.error("Failed to invite participants");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-xl"
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center">Invite Participants</h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading users...</p>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-500">No available users to invite</p>
        ) : (
          <>
            <select
              multiple
              value={selected}
              onChange={(e) =>
                setSelected([...e.target.selectedOptions].map((opt) => opt.value))
              }
              className="w-full border rounded-lg p-2 h-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>

            <button
              onClick={handleInvite}
              className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Invite Selected
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default InviteModal;
