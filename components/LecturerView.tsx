import React, { useState } from 'react';
import { User, Module } from '@/types';
import { Mail, MapPin, Building, BookOpen, Edit2, Play, Lock, Zap, Code } from 'lucide-react';

interface LecturerViewProps {
  user: User;
  modules: Module[];
  onSelectModule: (module: Module) => void;
}

export default function LecturerView({ user, modules, onSelectModule }: LecturerViewProps) {
  const [activeTab, setActiveTab] = useState<'about' | 'courses'>('about');

  // Derive profile data from user prop
  const names = user.name.split(' ');
  const firstName = names[0];
  const lastName = names.length > 1 ? names.slice(1).join(' ') : '';

  const profileData = {
    firstName,
    lastName,
    email: user.email,
    department: 'Department of Engineering & Computing',
    country: 'United Kingdom',
    city: 'London'
  };

  const lecturerModules = modules.filter(m => m.creatorId === user.id);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Section 1: Simple Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-teal-600 to-emerald-600 opacity-10"></div>
        
        <div className="relative z-10">
            <div className="w-32 h-32 bg-teal-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-4xl font-bold text-teal-700">{profileData.firstName[0]}{profileData.lastName[0]}</span>
            </div>
        </div>

        <div className="relative z-10 flex-1 text-center md:text-left mt-4 md:mt-2">
            <h2 className="text-2xl font-bold text-gray-900">{profileData.firstName} {profileData.lastName}</h2>
            <p className="text-teal-600 font-medium mb-4">Senior Lecturer</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {profileData.email}
                </div>
                <div className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    {profileData.department}
                </div>
                <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profileData.city}, {profileData.country}
                </div>
            </div>
        </div>
      </div>

      {/* Section 2: Tabbed Interface */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200 px-6 pt-6">
              <div className="flex gap-8">
                  <button 
                      onClick={() => setActiveTab('about')}
                      className={`pb-4 font-medium text-sm transition relative ${
                          activeTab === 'about' 
                              ? 'text-teal-600' 
                              : 'text-gray-500 hover:text-gray-800'
                      }`}
                  >
                      About Me
                      {activeTab === 'about' && (
                          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 rounded-t-full"></div>
                      )}
                  </button>
                  <button 
                      onClick={() => setActiveTab('courses')}
                      className={`pb-4 font-medium text-sm transition relative ${
                          activeTab === 'courses' 
                              ? 'text-teal-600' 
                              : 'text-gray-500 hover:text-gray-800'
                      }`}
                  >
                      Courses
                      {activeTab === 'courses' && (
                          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 rounded-t-full"></div>
                      )}
                  </button>
              </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
              {activeTab === 'about' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex justify-between items-start mb-8">
                          <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
                          <button aria-label="Edit Profile" className="p-2 text-gray-400 hover:text-teal-600 hover:bg-gray-50 rounded-full transition">
                              <Edit2 className="w-5 h-5" />
                          </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                          <div>
                              <label className="block text-sm font-bold text-gray-500 mb-1">First name</label>
                              <p className="text-gray-900 font-medium text-lg">{profileData.firstName}</p>
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-500 mb-1">Last name</label>
                              <p className="text-gray-900 font-medium text-lg">{profileData.lastName}</p>
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-500 mb-1">Email address</label>
                              <p className="text-gray-900 font-medium text-lg">{profileData.email}</p>
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-500 mb-1">Department</label>
                              <p className="text-gray-900 font-medium text-lg">{profileData.department}</p>
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-500 mb-1">Country</label>
                              <p className="text-gray-900 font-medium text-lg">{profileData.country}</p>
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-gray-500 mb-1">City/town</label>
                              <p className="text-gray-900 font-medium text-lg">{profileData.city}</p>
                          </div>
                      </div>
                  </div>
              )}

              {activeTab === 'courses' && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="text-lg font-bold text-gray-800">My Teaching Modules</h3>
                          <span className="text-sm text-gray-500">{lecturerModules.length} Active Courses</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {lecturerModules.map((mod) => (
                            <div 
                                key={mod.id} 
                                onClick={() => onSelectModule(mod)} 
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition group hover:border-teal-200"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">{mod.code}</span>
                                    <div className="p-2 bg-gray-50 rounded-full group-hover:bg-teal-50 transition">
                                        <Play className="w-4 h-4 text-gray-400 group-hover:text-teal-600" />
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-teal-700 transition">{mod.title}</h3>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{mod.description}</p>
                                
                                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-50">
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">Level {mod.minLevel}</span>
                                    <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                                        <BookOpen className="w-3 h-3" /> Manage Content
                                    </span>
                                </div>
                            </div>
                        ))}
                        
                        {lecturerModules.length === 0 && (
                            <div className="col-span-2 py-12 text-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p>No modules created yet.</p>
                                <p className="text-sm mt-1">Click "Add New Module" in the sidebar to get started.</p>
                            </div>
                        )}
                    </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
}
