import React from 'react';

export default function ControlsBar({ muted, videoOff, screenShared, isRecording, onToggleMute, onToggleVideo, onScreenShare, onRecord }) {
  return (
    <div className="flex gap-2">
      <button onClick={onToggleMute} className="px-3 py-1 bg-gray-800 text-white rounded">
        {muted ? 'Unmute' : 'Mute'}
      </button>
      <button onClick={onToggleVideo} className="px-3 py-1 bg-gray-800 text-white rounded">
        {videoOff ? 'Video On' : 'Video Off'}
      </button>
      <button onClick={onScreenShare} className="px-3 py-1 bg-gray-800 text-white rounded">
        {screenShared ? 'Stop Share' : 'Share Screen'}
      </button>
      <button onClick={onRecord} className={`px-3 py-1 rounded ${isRecording ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'}`}>
        {isRecording ? 'Stop Rec' : 'Record'}
      </button>
    </div>
  );
}
