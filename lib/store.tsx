"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Module, Topic } from '@/types';
import { initialModules, initialTopics, mockStudents } from './data';

interface AppState {
  currentUser: User | null;
  modules: Module[];
  topics: Topic[];
  students: User[];
  login: (user: User) => void;
  logout: () => void;
  addModule: (module: Module) => void;
  addTopic: (topic: Topic) => void;
  updateTopic: (topic: Topic) => void;
  deleteTopic: (topicId: string) => void;
  markTopicAsCompleted: (topicId: string) => void;
  decrementLives: () => void;
  refillLives: () => void;
  recordAttempt: (topicId: string, success: boolean, timeSpent: number, error?: string) => void;
  updateFeedback: (studentId: string, feedback: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [students, setStudents] = useState<User[]>(mockStudents);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedModules = localStorage.getItem('modules');
    const savedTopics = localStorage.getItem('topics');
    const savedStudents = localStorage.getItem('students');

    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    if (savedModules) setModules(JSON.parse(savedModules));
    if (savedTopics) setTopics(JSON.parse(savedTopics));
    if (savedStudents) setStudents(JSON.parse(savedStudents));
    
    setIsInitialized(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isInitialized) {
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }
  }, [currentUser, isInitialized]);

  useEffect(() => {
    if (isInitialized) localStorage.setItem('modules', JSON.stringify(modules));
  }, [modules, isInitialized]);

  useEffect(() => {
    if (isInitialized) localStorage.setItem('topics', JSON.stringify(topics));
  }, [topics, isInitialized]);

  useEffect(() => {
    if (isInitialized) localStorage.setItem('students', JSON.stringify(students));
  }, [students, isInitialized]);

  const login = (user: User) => setCurrentUser(user);
  const logout = () => {
      setCurrentUser(null);
      localStorage.removeItem('currentUser');
  };

  const addModule = (module: Module) => {
    setModules(prev => [...prev, module]);
  };

  const addTopic = (topic: Topic) => {
    setTopics(prev => [...prev, topic]);
  };

  const updateTopic = (updatedTopic: Topic) => {
    setTopics(prev => prev.map(t => t.id === updatedTopic.id ? updatedTopic : t));
  };

  const deleteTopic = (topicId: string) => {
    setTopics(prev => prev.filter(t => t.id !== topicId));
  };

  const markTopicAsCompleted = (topicId: string) => {
    if (!currentUser) return;
    
    // Check if already completed to avoid double XP
    if (currentUser.completedTopicIds?.includes(topicId)) return;

    const topic = topics.find(t => t.id === topicId);
    const xpGain = topic?.xpReward || 50;

    const updatedUser = { 
      ...currentUser, 
      completedTopicIds: [...(currentUser.completedTopicIds || []), topicId],
      xp: (currentUser.xp || 0) + xpGain
    };
    
    // Ensure uniqueness
    updatedUser.completedTopicIds = Array.from(new Set(updatedUser.completedTopicIds));
    setCurrentUser(updatedUser);
  };

  const recordAttempt = (topicId: string, success: boolean, timeSpent: number, error?: string) => {
    if (!currentUser) return;

    const currentMastery = currentUser.mastery?.[topicId] || {
        topicId,
        score: 0,
        attempts: 0,
        lastAttemptDate: 0,
        timeSpent: 0,
        status: 'novice'
    };

    const newAttempts = currentMastery.attempts + 1;
    // Simple decay + boost logic
    let newScore = currentMastery.score;
    if (success) {
        newScore = Math.min(100, newScore + 20 + (100 / newAttempts)); // Diminishing returns
    } else {
        newScore = Math.max(0, newScore - 10);
    }

    let status: 'novice' | 'competent' | 'mastered' = 'novice';
    if (newScore > 80) status = 'mastered';
    else if (newScore > 40) status = 'competent';

    const updatedUser = {
        ...currentUser,
        mastery: {
            ...(currentUser.mastery || {}),
            [topicId]: {
                topicId,
                score: newScore,
                attempts: newAttempts,
                lastAttemptDate: Date.now(),
                timeSpent: currentMastery.timeSpent + timeSpent,
                status
            }
        },
        recentErrors: error ? [error, ...(currentUser.recentErrors || [])].slice(0, 5) : currentUser.recentErrors
    };

    setCurrentUser(updatedUser);
  };

  const decrementLives = () => {
    if (!currentUser) return;
    const newLives = Math.max(0, (currentUser.lives ?? 5) - 1);
    setCurrentUser({ ...currentUser, lives: newLives });
  };

  const refillLives = () => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, lives: 5 });
  };

  const updateFeedback = (studentId: string, feedback: string) => {
    // Update the specific student in the students list
    setStudents(prev => prev.map(s => 
        s.id === studentId ? { ...s, lecturerFeedback: feedback } : s
    ));
    
    // Also update current user if it's them (though unlikely for lecturer view)
    if (currentUser && currentUser.id === studentId) {
        setCurrentUser({ ...currentUser, lecturerFeedback: feedback });
    }
  };

  // Prevent flash of content or inconsistent state before hydration
  if (!isInitialized) {
      return null; // Or a loading spinner
  }

  return (
    <AppContext.Provider value={{ currentUser, modules, topics, students, login, logout, addModule, addTopic, updateTopic, deleteTopic, markTopicAsCompleted, decrementLives, refillLives, recordAttempt, updateFeedback }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
