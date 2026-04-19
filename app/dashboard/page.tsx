"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { Module, Topic } from '@/types';
import ChatInterface from '@/components/ChatInterface';
import LessonView from '@/components/LessonView';
import StudentProfile from '@/components/StudentProfile';
import LecturerView from '@/components/LecturerView';
import { Plus, BookOpen, User as UserIcon, LogOut, Check, Lock, Play, Zap, Code, RefreshCw, Pencil, Trash2, Award, Menu, X, Search, Home, Folder, Flag, FileText } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const { currentUser, modules, topics, logout, addModule, addTopic, updateTopic, deleteTopic, markTopicAsCompleted, decrementLives, recordAttempt } = useApp();
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [showAddModule, setShowAddModule] = useState(false);
  const [showModuleCompleteModal, setShowModuleCompleteModal] = useState(false);
  const [completedModuleTitle, setCompletedModuleTitle] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [newModuleCode, setNewModuleCode] = useState('');
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');
  const [newModuleLevel, setNewModuleLevel] = useState(4);

  // Topic Form State
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newTopicType, setNewTopicType] = useState<'theory' | 'quiz' | 'practical'>('quiz');
  const [newTopicOptions, setNewTopicOptions] = useState<string[]>(['', '', '', '']);
  const [newTopicCorrectIndex, setNewTopicCorrectIndex] = useState(0);
  const [newPracticalTask, setNewPracticalTask] = useState('');
  const [newInitialCode, setNewInitialCode] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editModuleId, setEditModuleId] = useState('');
  
  const [isEditingTopic, setIsEditingTopic] = useState(false);
  const [editTopicId, setEditTopicId] = useState('');

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  if (!currentUser) return null;

  const availableModules = modules.filter(m => 
    m.minLevel === currentUser.level || (currentUser.role === 'lecturer' && m.creatorId === currentUser.id)
  );

  const handleEditModule = (module: Module) => {
    setEditModuleId(module.id);
    setNewModuleCode(module.code);
    setNewModuleTitle(module.title);
    setNewModuleDesc(module.description);
    setNewModuleLevel(module.minLevel);
    setShowAddModule(true);
    setIsEditing(true);
  };

  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.role !== 'lecturer') return;
    
    if (isEditing) {
        // Edit logic would normally go here (need to update store to support editing)
        // For now, we will just close the form as we need to update the store context first
        console.log("Editing not fully implemented in store yet");
    } else {
        addModule({
            id: Math.random().toString(36).slice(2, 11),
            code: newModuleCode,
            title: newModuleTitle,
            description: newModuleDesc,
            minLevel: newModuleLevel,
            creatorId: currentUser.id
        });
    }
    setShowAddModule(false);
    setIsEditing(false);
    // Reset form
    setNewModuleCode('');
    setNewModuleTitle('');
    setNewModuleDesc('');
  };

  const handleEditTopic = (topic: Topic) => {
    setEditTopicId(topic.id);
    setNewTopicTitle(topic.title);
    setNewTopicContent(topic.content);
    setNewTopicType(topic.type);
    if (topic.options) {
        setNewTopicOptions([...topic.options]);
    } else {
        setNewTopicOptions(['', '', '', '']);
    }
    setNewTopicCorrectIndex(topic.correctOptionIndex || 0);
    setNewPracticalTask(topic.practicalTask || '');
    setNewInitialCode(topic.initialCode || '');
    setIsEditingTopic(true);
    setShowAddTopic(true);
  };

  const handleDeleteTopic = (topicId: string) => {
    if (confirm('Are you sure you want to delete this topic? This action cannot be undone.')) {
        deleteTopic(topicId);
        // If we were editing this topic, close the form
        if (isEditingTopic && editTopicId === topicId) {
            setShowAddTopic(false);
            setIsEditingTopic(false);
            setEditTopicId('');
            setNewTopicTitle('');
            setNewTopicContent('');
        }
    }
  };

  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedModule || currentUser.role !== 'lecturer') return;
    
    setIsGenerating(true);

    try {
        const fileDataList: { data: string; type: string }[] = [];
        let generatedData = {};

        // Process Files if exist
        if (selectedFiles.length > 0) {
            for (const file of selectedFiles) {
                const reader = new FileReader();
                const data = await new Promise<string>((resolve) => {
                    reader.onload = (e) => resolve(e.target?.result as string);
                    reader.readAsDataURL(file);
                });
                fileDataList.push({ data, type: file.type });
            }
        }

        // Only generate if we need AI assistance (e.g. files uploaded, or theory/practical type where content is needed)
        // If it's a manual quiz with no files, skip generation to preserve user's exact inputs
        const isManualQuiz = newTopicType === 'quiz' && selectedFiles.length === 0;
        const isManualPractical = newTopicType === 'practical' && selectedFiles.length === 0 && newPracticalTask;

        if ((!isEditingTopic || selectedFiles.length > 0) && !isManualQuiz && !isManualPractical) {
             // AI Content Generation
            const res = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    title: newTopicTitle, 
                    content: newTopicContent,
                    moduleTitle: selectedModule.title,
                    files: fileDataList
                })
            });
            generatedData = await res.json();
        }

        if (isEditingTopic) {
            const existingTopic = topics.find(t => t.id === editTopicId);
            if (existingTopic) {
                updateTopic({
                    ...existingTopic,
                    title: newTopicTitle,
                    content: newTopicContent,
                    type: newTopicType,
                    // Manual override or AI generated
                    // For quiz, ALWAYS prefer the manual options if type is quiz, unless it was AI generated from files just now
                    options: (newTopicType === 'quiz' && !((generatedData as any).options)) ? newTopicOptions : ((generatedData as any).options || existingTopic.options),
                    correctOptionIndex: (newTopicType === 'quiz' && (generatedData as any).correctOptionIndex === undefined) ? newTopicCorrectIndex : ((generatedData as any).correctOptionIndex || existingTopic.correctOptionIndex),
                    // Only update generated fields if they were re-generated
                    quizQuestion: (generatedData as any).quizQuestion || (newTopicType === 'quiz' ? newTopicTitle : existingTopic.quizQuestion),
                    practicalTask: (newTopicType === 'practical' && newPracticalTask) ? newPracticalTask : ((generatedData as any).practicalTask || existingTopic.practicalTask),
                    initialCode: (newTopicType === 'practical' && newInitialCode) ? newInitialCode : ((generatedData as any).initialCode || existingTopic.initialCode),
                    xpReward: (generatedData as any).xpReward || existingTopic.xpReward
                });
            }
        } else {
            addTopic({
                id: Math.random().toString(36).slice(2, 9),
                moduleId: selectedModule.id,
                title: newTopicTitle,
                content: newTopicContent,
                type: (generatedData as any).type || newTopicType, // Use generated type if available, else selected
                order: topics.filter(t => t.moduleId === selectedModule.id).length + 1,
                // Apply Generated Content
                quizQuestion: (generatedData as any).quizQuestion || (newTopicType === 'quiz' ? newTopicTitle : undefined),
                options: (generatedData as any).options || (newTopicType === 'quiz' ? newTopicOptions : undefined),
                correctOptionIndex: (generatedData as any).correctOptionIndex ?? (newTopicType === 'quiz' ? newTopicCorrectIndex : undefined),
                practicalTask: (newTopicType === 'practical' && newPracticalTask) ? newPracticalTask : (generatedData as any).practicalTask,
                initialCode: (newTopicType === 'practical' && newInitialCode) ? newInitialCode : (generatedData as any).initialCode,
                xpReward: (generatedData as any).xpReward
            });
        }

        setShowAddTopic(false);
        setNewTopicTitle('');
        setNewTopicContent('');
        setNewTopicType('quiz');
        setNewTopicOptions(['', '', '', '']);
        setNewTopicCorrectIndex(0);
        setNewPracticalTask('');
        setNewInitialCode('');
        setSelectedFiles([]);
        setIsEditingTopic(false);
        setEditTopicId('');
    } catch (err) {
        console.error("Operation failed", err);
        // Fallback for add only
        if (!isEditingTopic) {
             addTopic({
                id: Math.random().toString(36).slice(2, 9),
                moduleId: selectedModule.id,
                title: newTopicTitle,
                content: newTopicContent,
                type: newTopicType,
                order: topics.filter(t => t.moduleId === selectedModule.id).length + 1,
                xpReward: 50, // Default
                options: newTopicType === 'quiz' ? newTopicOptions : undefined,
                correctOptionIndex: newTopicType === 'quiz' ? newTopicCorrectIndex : undefined,
                practicalTask: newTopicType === 'practical' ? newPracticalTask : undefined,
                initialCode: newTopicType === 'practical' ? newInitialCode : undefined
            });
        }
        setShowAddTopic(false);
        setNewTopicTitle('');
        setNewTopicContent('');
        setNewTopicType('quiz');
        setNewTopicOptions(['', '', '', '']);
        setNewTopicCorrectIndex(0);
        setNewPracticalTask('');
        setNewInitialCode('');
        setSelectedFiles([]);
        setIsEditingTopic(false);
        setEditTopicId('');
    } finally {
        setIsGenerating(false);
    }
  };

  const moduleTopics = selectedModule 
    ? topics.filter(t => t.moduleId === selectedModule.id).sort((a, b) => a.order - b.order)
    : [];

  const getNextTopic = (moduleId: string) => {
    const modTopics = topics.filter(t => t.moduleId === moduleId).sort((a, b) => a.order - b.order);
    return modTopics.find(t => !currentUser.completedTopicIds?.includes(t.id));
  };

  const activeTopic = selectedModule ? getNextTopic(selectedModule.id) : undefined;

  const isTopicLocked = (topic: Topic, index: number) => {
    if (index === 0) return false;
    const prevTopic = moduleTopics[index - 1];
    return !currentUser.completedTopicIds?.includes(prevTopic.id);
  };

  const isTopicCompleted = (topicId: string) => {
    return currentUser.completedTopicIds?.includes(topicId);
  };

  const isModuleCompleted = (moduleId: string) => {
    const modTopics = topics.filter(t => t.moduleId === moduleId);
    if (modTopics.length === 0) return false;
    return modTopics.every(t => isTopicCompleted(t.id));
  };

  const isModuleLocked = (index: number) => {
    if (currentUser.role === 'lecturer') return false;
    if (index === 0) return false;
    // Module is locked if the previous module is NOT completed
    const prevModule = availableModules[index - 1];
    return !isModuleCompleted(prevModule.id);
  };

  const handleTopicComplete = (topicId: string) => {
      markTopicAsCompleted(topicId);
      setSelectedTopic(null); // Close the lesson view to return to the topics list
      
      // Check if this was the last topic in the module
      if (selectedModule) {
          const modTopics = topics.filter(t => t.moduleId === selectedModule.id);
          const otherTopics = modTopics.filter(t => t.id !== topicId);
          const allOthersCompleted = otherTopics.every(t => currentUser.completedTopicIds?.includes(t.id));
          
          if (allOthersCompleted) {
              setCompletedModuleTitle(selectedModule.title);
              setShowModuleCompleteModal(true);
          }
      }
  };

  const getCourseName = (level: number) => {
    switch (level) {
        case 4: return "Software Development";
        case 5: return "Advanced Programming";
        case 6: return "Mobile Distributed Systems";
        default: return "General Studies";
    }
  };

  const getRecommendedResources = (moduleTitle: string) => {
      const lowerTitle = moduleTitle.toLowerCase();
      if (lowerTitle.includes('blockchain') || lowerTitle.includes('dapp')) {
          return [
              { title: 'Ethereum Whitepaper', color: 'bg-green-400' },
              { title: 'Solidity Docs', color: 'bg-blue-400' },
              { title: 'Web3.js Guide', color: 'bg-purple-400' }
          ];
      } else if (lowerTitle.includes('mobile') || lowerTitle.includes('android') || lowerTitle.includes('ios')) {
          return [
              { title: 'React Native Docs', color: 'bg-blue-400' },
              { title: 'Flutter Dev Guide', color: 'bg-cyan-400' },
              { title: 'Mobile UX Principles', color: 'bg-pink-400' }
          ];
      } else if (lowerTitle.includes('data') || lowerTitle.includes('analytics') || lowerTitle.includes('ai')) {
          return [
              { title: 'Pandas Documentation', color: 'bg-yellow-400' },
              { title: 'Kaggle Datasets', color: 'bg-blue-400' },
              { title: 'Scikit-Learn Guide', color: 'bg-orange-400' }
          ];
      } else if (lowerTitle.includes('security') || lowerTitle.includes('cyber')) {
          return [
              { title: 'OWASP Top 10', color: 'bg-red-400' },
              { title: 'NIST Framework', color: 'bg-blue-800' },
              { title: 'Kali Linux Tools', color: 'bg-gray-800' }
          ];
      } else {
          // Default CS Resources
          return [
              { title: 'Clean Code (Robert Martin)', color: 'bg-gray-400' },
              { title: 'Design Patterns', color: 'bg-indigo-400' },
              { title: 'Stack Overflow', color: 'bg-orange-400' }
          ];
      }
  };

  // Mock Student for Lecturer View
  const mockStudent = {
    id: 'student-demo',
    name: 'John Doe',
    email: 'john.doe@university.edu',
    role: 'student' as const,
    level: 4,
    completedTopicIds: topics.slice(0, 8).map(t => t.id), // Simulate some progress
    xp: 2450,
    lives: 5,
    recentErrors: ['Base case omission', 'Infinite loop detected', 'Null pointer exception'],
    mastery: {} // Will be calculated in profile
  };

  const calculateOverallProgress = () => {
    // 1. Get all available module IDs
    const availableModuleIds = availableModules.map(m => m.id);

    // 2. Filter topics that belong to these modules
    const relevantTopics = topics.filter(t => availableModuleIds.includes(t.moduleId));

    if (relevantTopics.length === 0) return 0;

    // 3. Count how many of these topics are completed
    const completedCount = relevantTopics.filter(t => currentUser.completedTopicIds?.includes(t.id)).length;

    // 4. Calculate percentage
    return Math.round((completedCount / relevantTopics.length) * 100);
  };

  const overallProgress = calculateOverallProgress();

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row text-gray-800 relative">
      {/* Mobile Header */}
      <div className="md:hidden bg-black text-white p-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2">
           <BookOpen className="w-6 h-6 text-teal-400" />
           <span className="font-bold text-lg">Study Coach</span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} aria-label="Open menu" className="text-white">
            <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-black text-white p-6 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="mb-8 flex items-center justify-between">
           <div className="flex items-center gap-2">
               <BookOpen className="w-6 h-6 text-teal-400" />
               <div>
                   <h1 className="text-lg font-bold leading-tight">Study Coach</h1>
                   <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{getCourseName(currentUser.level)}</p>
               </div>
           </div>
           <button onClick={() => setIsSidebarOpen(false)} aria-label="Close menu" className="md:hidden text-gray-400 hover:text-white">
               <X className="w-5 h-5" />
           </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="mb-6">
              <div className="mb-2 text-gray-400 uppercase text-xs font-semibold tracking-wider">Menu</div>
              <ul className="space-y-2">
                  <li 
                      onClick={() => { setShowProfile(false); setSelectedModule(null); setShowAddModule(false); setIsSidebarOpen(false); }}
                      className={`p-3 rounded-lg transition text-sm flex items-center gap-2 cursor-pointer ${!showProfile && !selectedModule && !showAddModule ? 'bg-teal-600 text-white shadow-md' : 'hover:bg-gray-800 text-gray-300'}`}
                  >
                      <BookOpen className="w-4 h-4" /> Dashboard
                  </li>
                  <li 
                      onClick={() => { setShowProfile(true); setSelectedModule(null); setShowAddModule(false); setIsSidebarOpen(false); }}
                      className={`p-3 rounded-lg transition text-sm flex items-center gap-2 cursor-pointer ${showProfile ? 'bg-teal-600 text-white shadow-md' : 'hover:bg-gray-800 text-gray-300'}`}
                  >
                      <UserIcon className="w-4 h-4" /> {currentUser.role === 'lecturer' ? 'Student Analysis' : 'My Analysis'}
                  </li>
              </ul>
          </div>

          <div className="mb-4 text-gray-400 uppercase text-xs font-semibold tracking-wider">
            {currentUser.role === 'lecturer' ? 'All Modules' : 'My Curriculum'}
          </div>
          <ul className="space-y-2">
            {availableModules.map((module, index) => {
              const locked = isModuleLocked(index);
              
              return (
              <li 
                key={module.id}
                onClick={() => {
                    if (!locked) {
                        setSelectedModule(module);
                        setShowAddModule(false);
                        setShowProfile(false);
                    }
                }}
                className={`p-3 rounded-lg transition text-sm flex items-center justify-between group 
                    ${locked ? 'opacity-50 cursor-not-allowed text-gray-600' : 'cursor-pointer'} 
                    ${!locked && selectedModule?.id === module.id ? 'bg-teal-600 text-white shadow-md' : ''}
                    ${!locked && selectedModule?.id !== module.id ? 'hover:bg-gray-800 text-gray-300' : ''}
                `}
              >
                <span className="flex items-center gap-2">
                    {locked && <Lock className="w-3 h-3" />}
                    {module.title}
                </span>
                <div className="flex items-center gap-2">
                    {currentUser.role === 'lecturer' && <span className="text-xs bg-gray-700 px-1 rounded">L{module.minLevel}</span>}
                    {currentUser.role === 'lecturer' && (
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditModule(module);
                            }}
                            aria-label="Edit module"
                            className="p-1 hover:bg-gray-600 rounded opacity-0 group-hover:opacity-100 transition"
                        >
                            <RefreshCw className="w-3 h-3" />
                        </button>
                    )}
                </div>
              </li>
            )})}
          </ul>
          
          {currentUser.role === 'lecturer' && (
            <button 
              type="button"
              onClick={() => {
                  setShowAddModule(true);
                  setSelectedModule(null);
              }}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-teal-600 p-3 rounded-lg hover:bg-teal-500 transition duration-300 hover:shadow-[0_0_15px_rgba(20,184,166,0.5)] text-sm font-semibold"
            >
              <Plus className="w-4 h-4" /> Add New Module
            </button>
          )}
        </div>

        <div className="pt-6 border-t border-gray-800 mt-4">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center font-bold">
                    {currentUser.name[0]}
                </div>
                <div className="text-sm">
                    <p className="font-semibold">{currentUser.name}</p>
                    <p className="text-gray-400 text-xs capitalize">{currentUser.role} {currentUser.role === 'student' && `(Lvl ${currentUser.level})`}</p>
                </div>
            </div>
            <button type="button" onClick={logout} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
                <LogOut className="w-4 h-4" /> Sign Out
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {showProfile ? (
            <StudentProfile user={currentUser.role === 'lecturer' ? mockStudent : currentUser} topics={topics} modules={modules} />
        ) : showAddModule ? (
             <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold mb-6">Create New Module</h2>
                <form onSubmit={handleAddModule} className="space-y-6">
                    <div>
                        <label htmlFor="moduleCode" className="block text-sm font-medium text-gray-700 mb-1">Module Code</label>
                        <input id="moduleCode" type="text" required value={newModuleCode} onChange={e => setNewModuleCode(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. CS305" />
                    </div>
                    <div>
                        <label htmlFor="moduleTitle" className="block text-sm font-medium text-gray-700 mb-1">Module Title</label>
                        <input id="moduleTitle" type="text" required value={newModuleTitle} onChange={e => setNewModuleTitle(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. Advanced DApps" />
                    </div>
                    <div>
                        <label htmlFor="moduleDesc" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea id="moduleDesc" required value={newModuleDesc} onChange={e => setNewModuleDesc(e.target.value)} className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none" rows={3} />
                    </div>
                    <div>
                        <label htmlFor="moduleLevel" className="block text-sm font-medium text-gray-700 mb-1">Minimum Level</label>
                        <select id="moduleLevel" value={newModuleLevel} onChange={e => setNewModuleLevel(Number(e.target.value))} className="w-full p-2 border rounded focus:ring-2 focus:ring-teal-500 outline-none">
                            <option value={4}>Level 4</option>
                            <option value={5}>Level 5</option>
                            <option value={6}>Level 6</option>
                        </select>
                    </div>
                    <button type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium">Create Module</button>
                </form>
             </div>
        ) : selectedModule ? (
          <div className="max-w-5xl mx-auto">
            <header className="mb-8">
              <div className="flex justify-between items-start">
                  <div>
                    <span className="text-teal-600 font-bold tracking-wide text-sm">{selectedModule.code}</span>
                    <h2 className="text-3xl font-bold text-gray-900 mt-1">{selectedModule.title}</h2>
                    <p className="text-gray-500 mt-2 max-w-2xl">{selectedModule.description}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsChatOpen(true)}
                    className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition transform hover:-translate-y-1 font-semibold flex items-center gap-2"
                  >
                    <UserIcon className="w-5 h-5" />
                    Talk to Coach
                  </button>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h3 className="text-lg font-bold text-gray-800">Module Topics</h3>
                    {currentUser.role === 'lecturer' && (
                        <button 
                            type="button"
                            onClick={() => {
                                setShowAddTopic(!showAddTopic);
                                setIsEditingTopic(false);
                                setEditTopicId('');
                                setNewTopicTitle('');
                                setNewTopicContent('');
                                setNewTopicOptions(['', '', '', '']);
                                setNewTopicCorrectIndex(0);
                                setSelectedFiles([]);
                            }}
                            className="text-teal-600 text-sm font-medium hover:underline"
                        >
                            {showAddTopic ? 'Cancel' : '+ Add Topic'}
                        </button>
                    )}
                  </div>
                  
                  {showAddTopic && (
                      <div className="p-6 bg-teal-50 border-b border-teal-100">
                          <h4 className="font-bold text-teal-800 mb-4">{isEditingTopic ? 'Edit Topic' : 'Add New Topic'}</h4>
                          <form onSubmit={handleAddTopic} className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                  <div>
                                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Activity Type</label>
                                      <select 
                                          aria-label="Activity Type"
                                          value={newTopicType} 
                                          onChange={e => setNewTopicType(e.target.value as any)} 
                                          className="w-full p-2 border rounded bg-white"
                                      >
                                          <option value="quiz">Multiple Choice Quiz</option>
                                          <option value="practical">Practical Coding</option>
                                          <option value="theory">Theory / Reading</option>
                                      </select>
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                                      <input aria-label="Topic Title" type="text" required placeholder="Topic Title" value={newTopicTitle} onChange={e => setNewTopicTitle(e.target.value)} className="w-full p-2 border rounded" />
                                  </div>
                              </div>
                              <textarea aria-label="Topic Content" required placeholder="Content summary or notes..." value={newTopicContent} onChange={e => setNewTopicContent(e.target.value)} className="w-full p-2 border rounded" rows={2} />
                              
                              {newTopicType === 'practical' && (
                                  <div className="bg-white p-4 rounded border border-gray-200 space-y-4">
                                      <div>
                                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Practical Task / Question</label>
                                          <textarea 
                                              value={newPracticalTask}
                                              onChange={e => setNewPracticalTask(e.target.value)}
                                              className="w-full p-2 border rounded text-sm font-mono"
                                              placeholder="E.g. Create a function that calculates the factorial of a number..."
                                              rows={3}
                                          />
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Initial Code (Optional)</label>
                                          <textarea 
                                              value={newInitialCode}
                                              onChange={e => setNewInitialCode(e.target.value)}
                                              className="w-full p-2 border rounded text-sm font-mono bg-gray-50"
                                              placeholder="// Start typing your Solidity code here..."
                                              rows={4}
                                          />
                                      </div>
                                  </div>
                              )}

                              {newTopicType === 'quiz' && (
                                  <div className="bg-white p-4 rounded border border-gray-200 space-y-3">
                                      <label className="block text-xs font-bold text-gray-500 uppercase">Quiz Options (Select Correct Answer)</label>
                                      {newTopicOptions.map((opt, idx) => (
                                          <div key={idx} className="flex items-center gap-2">
                                              <input 
                                                  aria-label={`Select Option ${idx + 1} as correct`}
                                                  type="radio" 
                                                  name="correctOption" 
                                                  checked={newTopicCorrectIndex === idx} 
                                                  onChange={() => setNewTopicCorrectIndex(idx)}
                                                  className="w-4 h-4 text-teal-600 focus:ring-teal-500"
                                              />
                                              <input 
                                                  type="text" 
                                                  placeholder={`Option ${idx + 1}`} 
                                                  value={opt} 
                                                  onChange={e => {
                                                      const newOpts = [...newTopicOptions];
                                                      newOpts[idx] = e.target.value;
                                                      setNewTopicOptions(newOpts);
                                                  }}
                                                  className="flex-1 p-2 border rounded text-sm"
                                                  required
                                              />
                                          </div>
                                      ))}
                                  </div>
                              )}

                              <div className="border-2 border-dashed border-teal-200 rounded-lg p-4 bg-teal-50/50 text-center">
                                  <label htmlFor="file-upload" className="cursor-pointer block">
                                      <div className="flex flex-col items-center gap-2 text-teal-500">
                                          <div className="p-2 bg-teal-100 rounded-full">
                                              <RefreshCw className={`w-5 h-5 ${selectedFiles.length > 0 ? 'text-green-500' : ''}`} />
                                          </div>
                                          <span className="text-sm font-medium">
                                              {selectedFiles.length > 0 ? `${selectedFiles.length} file(s) selected` : (isEditingTopic ? "Upload to Regenerate Content (Optional)" : "Upload PDF or Image for AI Analysis")}
                                          </span>
                                          <span className="text-xs text-teal-400">Supported: .pdf, .png, .jpg</span>
                                      </div>
                                      <input 
                                          id="file-upload" 
                                          type="file" 
                                          multiple
                                          accept=".pdf,image/*"
                                          className="hidden"
                                          onChange={(e) => {
                                              if (e.target.files) {
                                                  setSelectedFiles(Array.from(e.target.files));
                                              }
                                          }}
                                      />
                                  </label>
                              </div>

                              <button 
                                type="submit"  
                                disabled={isGenerating}
                                className="bg-teal-600 text-white px-4 py-2 rounded text-sm disabled:opacity-70 flex items-center gap-2"
                              >
                                {isGenerating ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" /> 
                                        {isEditingTopic ? 'Updating...' : 'Auto-Generating Activities...'}
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4" /> 
                                        {isEditingTopic ? 'Update Topic' : 'Generate & Save'}
                                    </>
                                )}
                              </button>
                          </form>
                      </div>
                  )}

                  <div className="divide-y divide-gray-100">
                    {moduleTopics.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 italic">No topics added yet.</div>
                    ) : (
                        moduleTopics.map((topic, idx) => {
                            const locked = isTopicLocked(topic, idx);
                            const completed = isTopicCompleted(topic.id);
                            
                            return (
                                <div 
                                    key={topic.id} 
                                    onClick={() => !locked && setSelectedTopic(topic)}
                                    className={`p-6 transition group ${locked ? 'opacity-50 bg-gray-50' : 'hover:bg-gray-50 cursor-pointer'}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition
                                            ${completed ? 'bg-green-100 text-green-600' : locked ? 'bg-gray-200 text-gray-400' : 'bg-teal-100 text-teal-600'}
                                        `}>
                                            {completed ? <Check className="w-4 h-4" /> : locked ? <Lock className="w-4 h-4" /> : idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className={`font-semibold transition ${completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>{topic.title}</h4>
                                                <div className="flex gap-2 items-center">
                                                    {!locked && !completed && <span className="text-xs bg-teal-100 text-teal-600 px-2 py-1 rounded-full font-bold">Current</span>}
                                                    {currentUser.role === 'lecturer' && (
                                                        <>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditTopic(topic);
                                                                }}
                                                                aria-label="Edit Topic"
                                                                className="p-1 hover:bg-gray-200 rounded text-gray-400 hover:text-teal-600 transition"
                                                            >
                                                                <Pencil className="w-3 h-3" />
                                                            </button>
                                                            <button 
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteTopic(topic.id);
                                                                }}
                                                                aria-label="Delete Topic"
                                                                className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-600 transition"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-gray-500 text-sm mt-1">{topic.content}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-8">
                    <h3 className="font-bold text-gray-800 mb-4">Recommended Resources</h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                        {selectedModule && getRecommendedResources(selectedModule.title).map((res, idx) => (
                            <li key={idx} className="flex items-center gap-2 hover:text-teal-600 cursor-pointer">
                                <span className={`w-2 h-2 ${res.color} rounded-full`}></span>
                                {res.title}
                            </li>
                        ))}
                    </ul>
                 </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
             <div className="mb-10">
                <header className="mb-8 border-b border-gray-200 pb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back, {currentUser.name}</h1>
                    <p className="text-gray-500 mt-2">Level {currentUser.level} • {getCourseName(currentUser.level)}</p>
                </header>

                {/* Progress Section - Student Only */}
                {currentUser.role === 'student' && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                      <div className="flex justify-between items-center mb-4">
                          <h2 className="text-lg font-bold text-gray-800">Overall Progress</h2>
                          <span className="text-teal-600 font-bold">{overallProgress}% Mastery</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3 mb-6">
                          <div className="bg-teal-500 h-3 rounded-full transition-all duration-1000 w-[var(--overall-progress)]" style={{ '--overall-progress': `${overallProgress}%` } as React.CSSProperties}></div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                              <div className="flex items-center gap-2 mb-2 text-green-700 font-bold">
                                  <Zap className="w-4 h-4" />
                                  <h3>Skills Improving</h3>
                              </div>
                              <p className="text-sm text-green-800">Interfaces & Lambda Expressions</p>
                          </div>
                          
                          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                              <div className="flex items-center gap-2 mb-2 text-red-700 font-bold">
                                  <Flag className="w-4 h-4" />
                                  <h3>Weak Areas</h3>
                              </div>
                              <p className="text-sm text-red-800">Exceptions, Collection Classes</p>
                          </div>
                      </div>
                  </div>
                )}

                {/* Lecturer Dashboard View */}
                {currentUser.role === 'lecturer' && (
                    <LecturerView 
                        user={currentUser} 
                        modules={modules} 
                        onSelectModule={(mod) => {
                            setSelectedModule(mod);
                            setShowAddModule(false);
                            setShowProfile(false);
                        }} 
                    />
                )}

                {/* Active Missions (Student Only) */}
                {currentUser.role === 'student' && (
                    <>
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500 fill-current" />
                            Active Missions
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {availableModules.map((mod, index) => {
                                const nextTopic = getNextTopic(mod.id);
                                const isLocked = isModuleLocked(index);
                                const modTopics = topics.filter(t => t.moduleId === mod.id);
                                const progress = modTopics.length > 0 
                                    ? (modTopics.filter(t => currentUser.completedTopicIds?.includes(t.id)).length / modTopics.length) * 100 
                                    : 0;
                                
                                // If locked, show locked state
                                if (isLocked) {
                                    return (
                                        <div key={mod.id} className="bg-gray-50 p-6 rounded-xl border border-gray-200 opacity-75 relative overflow-hidden">
                                            <div className="absolute top-4 right-4 text-gray-400">
                                                <Lock className="w-6 h-6" />
                                            </div>
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded">{mod.code}</span>
                                            </div>
                                            <h3 className="font-bold text-gray-600 mb-2">{mod.title}</h3>
                                            <p className="text-sm text-gray-400 mb-4">Complete previous module to unlock.</p>
                                        </div>
                                    );
                                }

                                if (!nextTopic) {
                                    // Module Completed State
                                    return (
                                        <div key={mod.id} onClick={() => setSelectedModule(mod)} className="bg-green-50 p-6 rounded-xl border border-green-200 cursor-pointer hover:shadow-md transition group relative">
                                            <div className="absolute top-4 right-4 text-green-500">
                                                <Check className="w-6 h-6" />
                                            </div>
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">{mod.code}</span>
                                            </div>
                                            <h3 className="font-bold text-green-900 mb-1">{mod.title}</h3>
                                            <p className="text-sm text-green-700 mb-4">Module Completed!</p>
                                            <div className="w-full bg-green-200 rounded-full h-2">
                                                <div className="bg-green-500 h-2 rounded-full w-full"></div>
                                            </div>
                                            <p className="text-xs text-green-600 text-right mt-2">100% Complete</p>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={mod.id} onClick={() => setSelectedModule(mod)} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition group">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded">{mod.code}</span>
                                            <Play className="w-5 h-5 text-gray-300 group-hover:text-teal-500" />
                                        </div>
                                        <h3 className="font-bold text-gray-900 mb-1">{nextTopic.title}</h3>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                                <Zap className="w-3 h-3" /> {nextTopic.xpReward || 50} XP
                                            </span>
                                            {nextTopic.practicalTask && (
                                                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                                    <Code className="w-3 h-3" /> Practical
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{nextTopic.content}</p>
                                        
                                        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                                            <div className="bg-teal-500 h-2 rounded-full transition-all duration-500 w-[var(--progress)]" style={{ '--progress': `${progress}%` } as React.CSSProperties}></div>
                                        </div>
                                        <p className="text-xs text-gray-400 text-right">{Math.round(progress)}% Complete</p>
                                    </div>
                                );
                            })}
                            {availableModules.every(m => !getNextTopic(m.id)) && (
                                <div className="col-span-2 p-8 text-center bg-green-50 rounded-xl border border-green-100 text-green-700">
                                    <Check className="w-8 h-8 mx-auto mb-2" />
                                    <p className="font-bold">All missions completed! Great job.</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
             </div>
             
             <div className="h-48 flex flex-col items-center justify-center text-gray-400 border-t border-gray-100 mt-8 pt-8">
                <BookOpen className="w-12 h-12 mb-4 text-gray-200" />
                <p>Select a module from the sidebar to view details.</p>
             </div>
          </div>
        )}

        {/* Lesson View Overlay - Mimo Style */}
        {selectedTopic && selectedModule && (
            <LessonView
                selectedTopic={selectedTopic}
                selectedModule={selectedModule}
                currentUser={currentUser}
                onClose={() => setSelectedTopic(null)}
                onOpenChat={() => setIsChatOpen(true)}
                onComplete={handleTopicComplete}
                onFail={decrementLives}
                onAttempt={recordAttempt}
            />
        )}

        {isChatOpen && selectedModule && (
          <ChatInterface 
            module={selectedModule} 
            currentTopic={selectedTopic || activeTopic}
            onClose={() => {
                setIsChatOpen(false);
                setSelectedTopic(null);
            }} 
          />
        )}

        {/* Module Completion Modal */}
        {showModuleCompleteModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
                <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl transform transition-all scale-100">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Award className="w-10 h-10 text-yellow-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Mission Accomplished!</h2>
                    <p className="text-gray-600 mb-6">
                        Congratulations! You have completed all topics in <span className="font-bold text-teal-600">{completedModuleTitle}</span>.
                    </p>
                    <div className="bg-teal-50 p-4 rounded-xl mb-6">
                        <p className="text-sm text-teal-800 font-medium">The next module is now unlocked!</p>
                    </div>
                    <button 
                        onClick={() => setShowModuleCompleteModal(false)}
                        className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition duration-300 hover:shadow-[0_0_20px_rgba(20,184,166,0.6)]"
                    >
                        Continue Journey
                    </button>
                </div>
            </div>
        )}
      </main>
    </div>
  );
}
