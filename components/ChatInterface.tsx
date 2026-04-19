"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Module, Topic, ChatMessage } from '@/types';
import { useApp } from '@/lib/store';
import { Send, X, Bot, User as UserIcon, CheckCircle } from 'lucide-react';

interface ChatInterfaceProps {
  module: Module;
  currentTopic?: Topic;
  onClose: () => void;
}

export default function ChatInterface({ module, currentTopic, onClose }: ChatInterfaceProps) {
  const { currentUser, markTopicAsCompleted } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    // Initialize chat with greeting
    const topicContext = currentTopic ? ` We are focusing on topic: **${currentTopic.title}**.` : '';
    
    let initialContent = `Hello ${currentUser?.name || 'Student'}! I'm Profs. We are looking at **${module.title}**.${topicContext} What's on your mind?`;

    if (currentTopic?.practicalTask) {
        initialContent = `I see you're ready for the practical exercise: **${currentTopic.title}**. \n\n**Task**: ${currentTopic.practicalTask}\n\nPlease paste your code solution below.`;
    } else if (currentTopic?.quizQuestion) {
        initialContent = `I see you've reviewed **${currentTopic.title}**. Ready for a challenge? ${currentTopic.quizQuestion}`;
    }

    setMessages([
      { 
        id: 'init', 
        role: 'assistant', 
        content: initialContent,
        timestamp: Date.now()
      }
    ]);
  }, [currentUser, module.title, currentTopic]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: 'user', 
      content: input,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          context: {
            moduleTitle: module.title,
            currentTopicId: currentTopic?.id,
            level: currentUser?.level,
            mastery: currentUser?.mastery,
            recentErrors: currentUser?.recentErrors,
            quizQuestion: currentTopic?.quizQuestion,
            practicalTask: currentTopic?.practicalTask,
            initialCode: currentTopic?.initialCode
          }
        })
      });

      const data = await response.json();
      
      let aiContent = data.content;
      
      // Check for Mastery
      if (aiContent.includes('[MASTERY_ACHIEVED]')) {
        aiContent = aiContent.replace('[MASTERY_ACHIEVED]', '').trim();
        if (currentTopic) {
           markTopicAsCompleted(currentTopic.id);
           setShowCelebration(true);
        }
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent,
        timestamp: Date.now()
      }]);
    } catch (error) {
      console.error('Error fetching AI response', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to the network right now. Please try again.",
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed z-50 bg-slate-900 shadow-2xl flex flex-col border border-slate-800 font-sans bottom-0 right-0 w-full h-full md:bottom-4 md:right-4 md:w-96 md:h-[600px] md:rounded-xl overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 text-white p-4 flex justify-between items-center shadow-lg shrink-0 border-b border-teal-500/30">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-1.5 rounded-full border border-white/20 backdrop-blur-sm">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wide">Profs - AI Coach</h3>
            <p className="text-[10px] text-teal-100 opacity-90 font-medium tracking-wider">{module.code}</p>
          </div>
        </div>
        <button onClick={onClose} type="button" aria-label="Close chat" className="text-teal-200 hover:text-white transition bg-teal-800/20 p-1 rounded-full hover:bg-teal-700/50">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950 relative">
        {showCelebration && (
            <div className="absolute top-4 left-4 right-4 bg-green-900/90 border border-green-500/50 text-white p-4 rounded-xl z-10 animate-bounce shadow-lg shadow-green-900/50 flex items-center gap-3 backdrop-blur-md">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                    <h4 className="font-bold text-sm">Topic Mastered!</h4>
                    <p className="text-xs text-green-100">You&apos;ve completed &quot;{currentTopic?.title}&quot;. Keep it up!</p>
                </div>
                <button onClick={() => setShowCelebration(false)} type="button" aria-label="Close notification" className="ml-auto text-green-300 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-md ${msg.role === 'user' ? 'bg-teal-900/50 text-teal-400 border-teal-800' : 'bg-purple-900/50 text-purple-400 border-purple-800'}`}>
                 {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
               </div>
               <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                 msg.role === 'user' 
                   ? 'bg-teal-600 text-white rounded-tr-none shadow-teal-900/20' 
                   : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none shadow-slate-900/50'
               }`}>
                 {msg.content}
               </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="flex gap-2 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-purple-900/50 border border-purple-800 text-purple-400 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-tl-none text-slate-400 text-sm flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-150"></span>
                </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask a question..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 text-white placeholder-slate-600 transition-all text-sm shadow-inner"
          />
          <button 
            onClick={sendMessage}
            type="button"
            aria-label="Send message"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 p-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-500 disabled:opacity-50 disabled:hover:bg-teal-600 transition duration-300 shadow-lg shadow-teal-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-600 mt-3 font-medium uppercase tracking-wider">AI can make mistakes. Verify important info.</p>
      </div>
    </div>
  );
}
