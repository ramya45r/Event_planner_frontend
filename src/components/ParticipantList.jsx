import React from "react";

const ParticipantList = ({ participants = [] }) => {
  return (
    <ul className="mt-2 space-y-2">
      {participants.length === 0 && <li className="text-sm text-gray-500">No participants yet</li>}
      {participants.map((p) => (
        <li key={p._id} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">{(p.name || p.email || "U").charAt(0)}</div>
          <div>
            <div className="text-sm font-medium">{p.name || p.email}</div>
            <div className="text-xs text-gray-500">{p.role || "Participant"}</div>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default ParticipantList;
