import React, { useEffect, useRef } from 'react';

export default function VideoTile({ stream, muted = false, label }) {
  const ref = useRef();
  useEffect(() => {
    if (!ref.current) return;
    const videoEl = ref.current;
    if (stream) {
      videoEl.srcObject = stream;
      // Try to play; some browsers block autoplay for unmuted videos.
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          // If autoplay is blocked, mute and try again to show the video.
          console.warn('Autoplay blocked, muting video to play.', err);
          try {
            videoEl.muted = true;
            videoEl.play().catch(err2 => console.warn('Play after mute failed', err2));
          } catch (err3) { console.warn('Error while attempting to play muted video', err3); }
        });
      }
    } else {
      // detach when no stream
      try { videoEl.srcObject = null; } catch (err) { console.warn('Failed to clear srcObject', err); }
    }
  }, [stream]);

  // derive initials for placeholder
  const initials = (label || '')
    .split(' ')
    .map(s => s[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative">
      {stream ? (
        <video ref={ref} autoPlay playsInline muted={muted} className="w-full h-48 bg-black object-cover rounded-md" />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-md relative">
          <div className="w-16 h-16 rounded-full bg-gray-400 flex items-center justify-center text-white text-lg font-semibold">
            {initials || '👤'}
          </div>
          <div className="absolute right-2 top-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">Connecting...</div>
        </div>
      )}

      {label && (
        <div className="absolute left-2 bottom-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {label}
        </div>
      )}
    </div>
  );
}
