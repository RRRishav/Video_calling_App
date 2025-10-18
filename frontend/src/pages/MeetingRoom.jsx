// frontend/src/pages/MeetingRoom.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import SimplePeer from 'simple-peer';
import VideoTile from '../components/VideoTile';
import ChatPanel from '../components/ChatPanel';
import ControlsBar from '../components/ControlsBar';
import { API_BASE } from '../api';

const SIGNAL_SERVER = API_BASE.replace('/api', '');

export default function MeetingRoom(){
  const { id: roomId } = useParams();
  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef({}); // { socketId: SimplePeer }
  const [peers, setPeers] = useState({}); // { socketId: { stream, label } }
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [screenShared, setScreenShared] = useState(false);
  const screenTrackRef = useRef(null);

  // recording
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false);

  // chat
  const [chat, setChat] = useState([]);
  const [message, setMessage] = useState('');

  // small beep
  const audioCtxRef = useRef(null);
  function playBeep(){
    try{
      if(!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtxRef.current.createOscillator();
      const g = audioCtxRef.current.createGain();
      o.type = 'sine'; o.frequency.value = 700;
      o.connect(g); g.connect(audioCtxRef.current.destination);
      g.gain.setValueAtTime(0.0001, audioCtxRef.current.currentTime);
      g.gain.exponentialRampToValueAtTime(0.2, audioCtxRef.current.currentTime + 0.01);
      o.start(); setTimeout(()=> o.stop(), 120);
    } catch(err){ console.warn('playBeep error', err); }
  }

  useEffect(() => {
    const userName = prompt('Enter display name') || 'Guest';
    socketRef.current = io(SIGNAL_SERVER);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        socketRef.current.emit('join-room', { roomId, userName, userId: socketRef.current.id });

        socketRef.current.on('all-participants', participants => {
          console.log('all-participants received', participants);
          // add placeholder tiles immediately so users appear right away
          setPeers(prev => {
            const next = { ...prev };
            participants.forEach(pid => { if (!next[pid]) next[pid] = { stream: null, label: 'Participant' }; });
            return next;
          });

          participants.forEach(pid => {
            const peer = createPeer(pid, socketRef.current.id, stream);
            peersRef.current[pid] = peer;
          });
        });

        socketRef.current.on('user-joined', ({ socketId, userName }) => {
          console.log('user-joined event:', socketId, userName);
          playBeep();
          // show placeholder
          setPeers(prev => ({ ...prev, [socketId]: { stream: null, label: userName || 'Participant' } }));
          const peer = addPeer(socketId, stream, userName);
          peersRef.current[socketId] = peer;
        });

        socketRef.current.on('signal', ({ from, signal }) => {
          const p = peersRef.current[from];
          if (p) p.signal(signal);
        });

        socketRef.current.on('user-left', ({ socketId }) => {
          playBeep();
          if (peersRef.current[socketId]) {
            try { peersRef.current[socketId].destroy(); } catch(err){ console.warn('Failed to destroy peer', err); }
            delete peersRef.current[socketId];
          }
          setPeers(prev => { const cp = { ...prev }; delete cp[socketId]; return cp; });
        });

        socketRef.current.on('chat-message', data => {
          setChat(c => [...c, data]);
          playBeep();
        });
      })
      .catch(err => {
        console.error('getUserMedia failed', err);
        alert('Please allow camera and microphone access.');
      });

    // copy refs to local variables for safe cleanup
    const peersSnapshot = peersRef.current;
    return () => {
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
      Object.values(peersSnapshot).forEach(p => { try{ p.destroy(); } catch(err){ console.warn('Error destroying peer during cleanup', err); } });
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [roomId]);

  function createPeer(userToSignal, callerId, stream){
    const peer = new SimplePeer({ initiator: true, trickle: false, stream });
    peer.on('signal', signal => {
      socketRef.current.emit('signal', { to: userToSignal, from: callerId, signal });
    });
    peer.on('stream', remoteStream => {
      setPeers(prev => ({ ...prev, [userToSignal]: { stream: remoteStream, label: 'Participant' } }));
    });
    peer.on('close', () => {
      setPeers(prev => { const cp = { ...prev }; delete cp[userToSignal]; return cp; });
    });
    return peer;
  }

  function addPeer(incomingSocketId, stream, userName = 'Participant'){
    const peer = new SimplePeer({ initiator: false, trickle: false, stream });
    peer.on('signal', signal => {
      socketRef.current.emit('signal', { to: incomingSocketId, from: socketRef.current.id, signal });
    });
    peer.on('stream', remoteStream => {
      // default label if not provided by signaling
      setPeers(prev => ({ ...prev, [incomingSocketId]: { stream: remoteStream, label: userName || 'Participant' } }));
    });
    peer.on('close', () => {
      setPeers(prev => { const cp = { ...prev }; delete cp[incomingSocketId]; return cp; });
    });
    return peer;
  }

  function toggleMute(){
    if (!localStreamRef.current) return;
    const audio = localStreamRef.current.getAudioTracks();
    if (audio.length) {
      audio[0].enabled = !audio[0].enabled;
      setMuted(!audio[0].enabled);
    }
  }

  function toggleVideo(){
    if (!localStreamRef.current) return;
    const video = localStreamRef.current.getVideoTracks();
    if (video.length) {
      video[0].enabled = !video[0].enabled;
      setVideoOff(!video[0].enabled);
    }
  }

  async function handleScreenShare(){
    if (screenShared) return stopScreenShare();
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getTracks()[0];
      screenTrackRef.current = screenTrack;

      Object.values(peersRef.current).forEach(peer => {
        try {
          const sender = peer._pc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(screenTrack);
        } catch (err) { console.warn('Failed to replace track for screen share', err); }
      });

      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
      setScreenShared(true);

      screenTrack.onended = () => stopScreenShare();
    } catch (err) {
      console.error('Screen share failed', err);
    }
  }

  async function stopScreenShare(){
    if (!screenShared) return;
    try {
      const cameraTrack = localStreamRef.current.getVideoTracks()[0];
      Object.values(peersRef.current).forEach(peer => {
        try {
          const sender = peer._pc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) sender.replaceTrack(cameraTrack);
        } catch(err){ console.warn('Failed to replace track to camera', err); }
      });

      if (screenTrackRef.current) {
        try { screenTrackRef.current.stop(); } catch(err){ console.warn('Failed to stop screen track', err); }
        screenTrackRef.current = null;
      }
      if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
      setScreenShared(false);
    } catch (err) {
      console.error(err);
    }
  }

  function sendMessage(e){
    e.preventDefault();
    if (!message || !socketRef.current) return;
    socketRef.current.emit('chat-message', { roomId, message, userName: 'Me' });
    setChat(c => [...c, { message, userName: 'Me', time: Date.now() }]);
    setMessage('');
  }

  function startRecording(){
    if (isRecording) return;
    try {
      const mixed = new MediaStream();
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => mixed.addTrack(t));
      Object.values(peers).forEach(p => {
        if (p.stream) p.stream.getTracks().forEach(t => {
          try { mixed.addTrack(t.clone ? t.clone() : t); } catch(err){ console.warn('Failed to add remote track to recording stream', err); }
        });
      });

      recordedChunksRef.current = [];
      const options = { mimeType: 'video/webm; codecs=vp9,opus' };
      const mr = new MediaRecorder(mixed, options);
      mediaRecorderRef.current = mr;
      mr.ondataavailable = e => { if (e.data.size) recordedChunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `recording-${Date.now()}.webm`; document.body.appendChild(a); a.click();
        setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 1000);
      };
      mr.start(1000);
      setIsRecording(true);
    } catch (err) {
      console.error('Recording error', err);
      alert('Recording not supported or failed. Try Chrome/Edge.');
    }
  }

  function stopRecording(){
    if (!isRecording) return;
  try { mediaRecorderRef.current.stop(); } catch(err){ console.warn('Failed to stop media recorder', err); }
    setIsRecording(false);
  }

  function handleRecordToggle(){
    if (isRecording) stopRecording(); else startRecording();
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between p-4 bg-white border-b">
        <div className="text-lg font-semibold">Room: {roomId}</div>
        <div>
          <ControlsBar
            muted={muted}
            videoOff={videoOff}
            screenShared={screenShared}
            isRecording={isRecording}
            onToggleMute={toggleMute}
            onToggleVideo={toggleVideo}
            onScreenShare={handleScreenShare}
            onRecord={handleRecordToggle}
          />
        </div>
      </div>

      <div className="flex flex-1 gap-4 p-4">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-auto">
          <div>
            <video ref={localVideoRef} autoPlay muted playsInline className="w-full h-64 bg-black object-cover rounded" />
            <div className="mt-2 text-sm text-gray-600">You</div>
          </div>

          {Object.keys(peers).map(pid => (
            <div key={pid}>
              <VideoTile stream={peers[pid].stream} label={peers[pid].label} />
            </div>
          ))}
        </div>

        <aside className="w-80 bg-white p-3 rounded shadow flex flex-col">
          <ChatPanel messages={chat} onSend={sendMessage} value={message} setValue={setMessage} />
          <div className="text-sm text-gray-500 mt-2">Participants: {1 + Object.keys(peers).length}</div>
        </aside>
      </div>
    </div>
  );
}
