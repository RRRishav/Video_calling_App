import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMeeting } from '../api';

export default function CreateMeeting(){
  const [title, setTitle] = useState('');
  const navigate = useNavigate();

  async function handleCreate(e){
    e.preventDefault();
    const res = await createMeeting(title);
    if (res.meetingId) navigate(`/room/${res.meetingId}`);
  }

  return (
    <div className="max-w-2xl mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Create Meeting</h2>
      <form onSubmit={handleCreate} className="flex gap-2">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title (optional)" className="flex-1 px-2 py-1 border rounded" />
        <button className="px-4 py-1 bg-blue-600 text-white rounded">Create</button>
      </form>
    </div>
  );
}
