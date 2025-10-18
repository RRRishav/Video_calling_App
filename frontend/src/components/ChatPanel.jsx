import React, { useRef, useEffect } from 'react';

export default function ChatPanel({ messages, onSend, value, setValue }) {
  const ref = useRef();
  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [messages]);
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-2">Chat</h3>
      <div ref={ref} className="flex-1 overflow-auto p-2 bg-gray-50 rounded">
        {messages.map((m, i) => (
          <div key={i} className="mb-1">
            <strong className="mr-2">{m.userName}:</strong>
            <span>{m.message}</span>
          </div>
        ))}
      </div>
      <form onSubmit={onSend} className="mt-2 flex gap-2">
        <input value={value} onChange={e => setValue(e.target.value)} className="flex-1 px-2 py-1 border rounded" placeholder="Type a message" />
        <button className="px-3 py-1 bg-blue-600 text-white rounded">Send</button>
      </form>
    </div>
  );
}
