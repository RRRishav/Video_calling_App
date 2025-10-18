import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CreateMeeting from './pages/CreateMeeting';
import JoinMeeting from './pages/JoinMeeting';
import MeetingRoom from './pages/MeetingRoom';

export default function App(){
  return (
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/create" element={<CreateMeeting/>} />
      <Route path="/join" element={<JoinMeeting/>} />
      <Route path="/room/:id" element={<MeetingRoom/>} />
      <Route path="*" element={<Home/>} />
    </Routes>
  );
}
