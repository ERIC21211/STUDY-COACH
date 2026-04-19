"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { UserRole } from "@/types";

export default function Home() {
  const router = useRouter();
  const { login } = useApp();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [level, setLevel] = useState(4);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    login({
      id: Math.random().toString(36).slice(2, 11),
      name: fullName,
      email: email,
      role,
      level: level,
      completedTopicIds: [],
      xp: 0,
      lives: 5
    });

    router.push("/dashboard");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-slate-950 text-white relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-teal-900/20 to-transparent pointer-events-none z-0" />
      
      <div className="z-10 max-w-md w-full items-center justify-between font-mono text-sm lg:flex-col">
        <h1 className="text-4xl font-bold mb-8 text-center text-white drop-shadow-lg">
          Study Coach
        </h1>
        
        <form onSubmit={handleLogin} className="bg-slate-900/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-slate-800 w-full space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-slate-400 mb-2 font-medium">Full Name</label>
            <input 
              id="fullName"
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-600 transition-all"
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-slate-400 mb-2 font-medium">Email Address</label>
            <input 
              id="email"
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500 placeholder-slate-600 transition-all"
              placeholder="e.g. john@university.edu"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-2 font-medium">Role</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 p-3 rounded-xl border transition duration-300 font-medium ${role === 'student' ? 'bg-teal-600 border-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]' : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400'}`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('lecturer')}
                className={`flex-1 p-3 rounded-xl border transition duration-300 font-medium ${role === 'lecturer' ? 'bg-teal-600 border-teal-500 text-white shadow-[0_0_15px_rgba(20,184,166,0.4)]' : 'border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400'}`}
              >
                Lecturer
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="levelCourse" className="block text-slate-400 mb-2 font-medium">Level / Course</label>
            <select 
              id="levelCourse"
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value={4}>Level 4 (Software Development)</option>
              <option value={5}>Level 5 (Advanced Programming)</option>
              <option value={6}>Level 6 (Mobile Distributed System)</option>
            </select>
          </div>

          <button 
            type="submit"
            className="w-full p-4 rounded-xl font-bold text-lg hover:opacity-90 transition duration-300 bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40"
          >
            {role === 'lecturer' ? 'Lecturer Sign In' : 'Start Learning'}
          </button>
        </form>
      </div>
    </main>
  );
}
