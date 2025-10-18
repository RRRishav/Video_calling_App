export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export async function createMeeting(title) {
  const res = await fetch(`${API_BASE}/api/meetings/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  });
  return res.json();
}

export async function getMeeting(id) {
  const res = await fetch(`${API_BASE}/api/meetings/${id}`);
  return res.json();
}
