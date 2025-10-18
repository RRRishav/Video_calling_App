import React from 'react';
import { Link } from 'react-router-dom';
import { Video, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">EduConnect</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Professional Video Conferencing for Education
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with students and colleagues seamlessly. Host virtual classes, meetings, and collaborative sessions with ease.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Link to="/create" className="group">
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-8 border-2 border-transparent hover:border-indigo-500">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                <Video className="w-8 h-8 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Meeting</h3>
              <p className="text-gray-600 mb-4">
                Start a new video conference session and invite participants with a unique room ID or shareable link.
              </p>
              <div className="inline-flex items-center text-indigo-600 font-semibold group-hover:gap-2 transition-all">
                Get Started
                <span className="ml-1 group-hover:ml-2 transition-all">→</span>
              </div>
            </div>
          </Link>

          <Link to="/join" className="group">
            <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-8 border-2 border-transparent hover:border-green-500">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
                <Users className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Join Meeting</h3>
              <p className="text-gray-600 mb-4">
                Enter a room ID to join an existing meeting. Perfect for students joining scheduled classes or sessions.
              </p>
              <div className="inline-flex items-center text-green-600 font-semibold group-hover:gap-2 transition-all">
                Join Now
                <span className="ml-1 group-hover:ml-2 transition-all">→</span>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
