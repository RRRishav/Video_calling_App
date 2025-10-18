import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function JoinMeeting(){
  const [id, setId] = useState('');
  const navigate = useNavigate();

  const join = e => {
    e.preventDefault();
    if (!id) { alert('Enter meeting ID'); return; }
    navigate(`/room/${id}`);
  };

  return (
    <div className="max-w-2xl mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Join Meeting</h2>
      <form onSubmit={join} className="flex gap-2">
        <input value={id} onChange={e => setId(e.target.value)} placeholder="Meeting ID" className="flex-1 px-2 py-1 border rounded" />
        <button className="px-4 py-1 bg-green-600 text-white rounded">Join</button>
      </form>
    </div>
  );
}
