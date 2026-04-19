import React, { useState, useEffect } from 'react';
import { Award, Code, Play, XCircle, CheckCircle, RefreshCw, FileText, ArrowRight } from 'lucide-react';
import { Module, Topic, User } from '@/types';
import Editor from '@monaco-editor/react';

interface LessonViewProps {
  selectedTopic: Topic;
  selectedModule: Module;
  currentUser: User;
  onClose: () => void;
  onOpenChat: () => void;
  onComplete: (topicId: string) => void;
  onFail: () => void;
  onAttempt: (topicId: string, success: boolean, timeSpent: number, error?: string) => void;
}

export default function LessonView({ 
  selectedTopic, 
  selectedModule, 
  currentUser, 
  onClose, 
  onOpenChat, 
  onComplete,
  onFail,
  onAttempt
}: LessonViewProps) {
  const [userCode, setUserCode] = useState(selectedTopic.initialCode || '');
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<'success' | 'error' | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const startTimeRef = React.useRef(Date.now());

  // Reset state when topic changes
  useEffect(() => {
    setUserCode(selectedTopic.initialCode || '');
    setCheckResult(null);
    setFeedbackMessage('');
    startTimeRef.current = Date.now();
  }, [selectedTopic]);

  const recordMetric = (success: boolean, error?: string) => {
      const timeSpent = (Date.now() - startTimeRef.current) / 1000;
      onAttempt(selectedTopic.id, success, timeSpent, error);
  };

  const checkCode = async () => {
    if (!userCode) return;
    setIsChecking(true);
    setCheckResult(null);

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [
                    { role: 'system', content: 'You are a Java code execution engine. Simulate the execution of the code. If there are errors, output the compiler errors. If it runs successfully, output the logs/return values. ALSO, on the last line, strictly output [CORRECT] if the code solves the task: \'' + selectedTopic.practicalTask + '\', or [INCORRECT] if it does not.' },
                    { role: 'user', content: `Task: ${selectedTopic.practicalTask}\n\nCode:\n${userCode}\n\nSimulate execution and verify.` }
                ],
                context: {
                    moduleTitle: selectedModule?.title,
                    practicalTask: selectedTopic.practicalTask
                }
            })
        });
        const data = await response.json();
        
        if (data.error) {
            setCheckResult('error');
            setFeedbackMessage(data.error);
            recordMetric(false, data.error);
            handleFailure();
        } else if (data.content && (data.content.includes('[CORRECT]') || data.content.includes('[MASTERY_ACHIEVED]'))) {
            setCheckResult('success');
            // Remove the status tag from the visible output
            const output = data.content.replace('[CORRECT]', '').replace('[MASTERY_ACHIEVED]', '').trim();
            setFeedbackMessage(output || "Execution successful.");
            recordMetric(true);
            onComplete(selectedTopic.id);
        } else {
            setCheckResult('error');
            // Remove the status tag if present
            const output = data.content ? data.content.replace('[INCORRECT]', '').trim() : "Code verification failed.";
            setFeedbackMessage(output);
            recordMetric(false, "Verification failed");
            handleFailure();
        }
    } catch (e) {
        setCheckResult('error');
        setFeedbackMessage("Connection failed. Try again.");
        recordMetric(false, "Connection failed");
        handleFailure();
    } finally {
        setIsChecking(false);
    }
  };

  const handleFailure = () => {
      onFail();
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col animate-in fade-in duration-200">
        {/* 1. Top Navigation Bar */}
        <header className="h-16 border-b border-slate-800 flex items-center px-4 bg-slate-900 shrink-0 justify-between shadow-sm">
            <button 
                onClick={onClose} 
                aria-label="Close lesson"
                className="p-2 hover:bg-slate-800 rounded-full transition text-slate-400 hover:text-white"
            >
                <XCircle className="w-6 h-6" />
            </button>
            
            <div className="flex-1 max-w-xl mx-4">
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-teal-600 to-teal-400 w-1/3 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]"></div>
                </div>
            </div>
        </header>

        {/* 2. Split Screen Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Panel: Instruction & Theory */}
            <div className="w-full h-1/3 md:h-full md:w-1/3 md:min-w-[350px] border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950 flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 md:p-8">
                    <span className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-2 block bg-teal-500/10 w-fit px-2 py-1 rounded border border-teal-500/20">{selectedModule.title}</span>
                    <h2 className="text-2xl font-bold text-white mb-6 leading-tight">{selectedTopic.title}</h2>
                    
                    <div className="prose prose-sm prose-invert text-slate-300 leading-relaxed mb-8">
                        <p className="whitespace-pre-wrap">{selectedTopic.content}</p>
                    </div>

                    {selectedTopic.practicalTask && (
                        <div className="bg-teal-900/20 p-5 rounded-xl border border-teal-500/20 text-teal-200 text-sm font-medium mb-6 shadow-inner">
                            <h4 className="flex items-center gap-2 font-bold mb-3 text-teal-400">
                                <Code className="w-5 h-5" /> Mission Objective
                            </h4>
                            {selectedTopic.practicalTask}
                        </div>
                    )}

                    {/* Embedded AI Hint Button */}
                    <button 
                        onClick={onOpenChat}
                        className="flex items-center gap-3 text-sm text-teal-400 font-bold hover:text-teal-300 transition group w-full p-4 rounded-xl border border-dashed border-slate-700 hover:border-teal-500/50 hover:bg-slate-900/50"
                    >
                        <div className="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center group-hover:bg-teal-500/20 transition">?</div>
                        <span>Stuck? Ask Profs for a hint</span>
                    </button>
                </div>
            </div>

            {/* Right Panel: Workspace (Editor or Quiz) */}
            <div className="flex-1 bg-slate-900 flex flex-col relative border-l border-slate-800">
                {selectedTopic.type === 'practical' ? (
                    // Code Editor Mode
                    <div className="flex-1 flex flex-col h-full">
                        {/* Editor Header */}
                        <div className="bg-slate-950 text-slate-400 text-xs px-4 py-2 flex justify-between items-center border-b border-slate-800 font-mono shrink-0 h-12">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-2"><FileText className="w-3 h-3" /> Main.java</span>
                                <span className="uppercase text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">Java</span>
                            </div>
                            <button 
                                onClick={checkCode}
                                disabled={isChecking}
                                className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded text-xs font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isChecking ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                                Run Code
                            </button>
                        </div>
                        
                        {/* Editor Area */}
                        <div className="flex-1 relative min-h-[300px]">
                             <Editor
                                height="100%"
                                defaultLanguage="java"
                                theme="vs-dark"
                                value={userCode}
                                onChange={(value) => setUserCode(value || '')}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    padding: { top: 16 }
                                }}
                             />
                        </div>

                        {/* Console / Output Area */}
                        <div className="h-48 bg-slate-950 border-t border-slate-800 flex flex-col shrink-0">
                            <div className="px-4 py-2 border-b border-slate-900 flex justify-between items-center bg-slate-900/50">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Code className="w-3 h-3" /> Console Output
                                </span>
                                {checkResult && (
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${checkResult === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                        {checkResult === 'success' ? 'Passed' : 'Failed'}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1 p-4 font-mono text-sm overflow-y-auto">
                                {!checkResult && !isChecking && (
                                    <div className="text-slate-600 italic">
                                        {/* Ready to execute. Click &quot;Run Code&quot; to compile and verify. */}
                                    </div>
                                )}
                                
                                {isChecking && (
                                    <div className="flex items-center gap-2 text-teal-400">
                                        <RefreshCw className="w-3 h-3 animate-spin" />
                                        <span>Compiling contract...</span>
                                        <span>Verifying logic...</span>
                                    </div>
                                )}

                                {checkResult && (
                                    <div className={`space-y-2 ${checkResult === 'success' ? 'text-green-300' : 'text-red-300'}`}>
                                        <p className="font-bold">
                                            {checkResult === 'success' ? '> Compilation successful.' : '> Compilation/Verification error:'}
                                        </p>
                                        <p className="whitespace-pre-wrap">{feedbackMessage}</p>
                                        
                                        {checkResult === 'success' && (
                                            <div className="mt-4 pt-2 border-t border-green-900/30">
                                                <p className="text-green-400 font-bold flex items-center gap-2">
                                                    <Award className="w-4 h-4" /> Mastery Achieved
                                                </p>
                                                <button 
                                                    onClick={() => onComplete(selectedTopic.id)}
                                                    className="mt-2 text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded transition"
                                                >
                                                    Next Lesson &rarr;
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    // Quiz Mode
                    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-slate-900">
                        <div className="max-w-2xl w-full bg-slate-950 p-8 rounded-3xl shadow-2xl border border-slate-800">
                            <h3 className="text-xl md:text-2xl font-bold text-center text-white mb-8 leading-relaxed">{selectedTopic.quizQuestion || selectedTopic.title}</h3>
                            
                            <div className="grid grid-cols-1 gap-4">
                                {(selectedTopic.options || ['Option A', 'Option B', 'Option C', 'Option D']).map((option, idx) => (
                                    <button 
                                        key={idx}
                                        disabled={checkResult === 'success'}
                                        onClick={() => {
                                            const isCorrect = idx === (selectedTopic.correctOptionIndex ?? 0);
                                            if (isCorrect) {
                                                setCheckResult('success');
                                                setFeedbackMessage("That's correct! Well done.");
                                                recordMetric(true);
                                            } else {
                                                setCheckResult('error');
                                                setFeedbackMessage("Not quite. Try again!");
                                                recordMetric(false, "Wrong Answer in Quiz");
                                                handleFailure();
                                            }
                                        }} 
                                        className={`p-4 border border-slate-800 rounded-xl bg-slate-900 hover:bg-slate-800 hover:border-teal-500/50 hover:text-teal-400 font-medium transition text-left flex items-center gap-4 group disabled:opacity-50 disabled:cursor-not-allowed ${checkResult === 'success' && idx === (selectedTopic.correctOptionIndex ?? 0) ? '!border-green-500 !bg-green-900/20 !text-green-400' : ''}`}
                                    >
                                        <span className={`w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-teal-500/20 flex items-center justify-center font-bold text-slate-400 group-hover:text-teal-400 text-sm transition ${checkResult === 'success' && idx === (selectedTopic.correctOptionIndex ?? 0) ? '!bg-green-500/20 !text-green-400' : ''}`}>{String.fromCharCode(65 + idx)}</span>
                                        <span className={`text-slate-300 group-hover:text-white transition ${checkResult === 'success' && idx === (selectedTopic.correctOptionIndex ?? 0) ? '!text-green-100' : ''}`}>{option}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Quiz Feedback Area */}
                            {checkResult && (
                                <div className={`mt-8 p-6 rounded-2xl text-center animate-in fade-in slide-in-from-bottom-4 border ${checkResult === 'success' ? 'bg-green-950/40 border-green-500/30' : 'bg-red-950/40 border-red-500/30'}`}>
                                    <div className="flex flex-col items-center gap-3">
                                        {checkResult === 'success' ? (
                                            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                                                <CheckCircle className="w-6 h-6 text-green-400" />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
                                                <XCircle className="w-6 h-6 text-red-400" />
                                            </div>
                                        )}
                                        
                                        <h4 className={`font-bold text-xl ${checkResult === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                            {checkResult === 'success' ? 'Correct Answer!' : 'Incorrect'}
                                        </h4>
                                        <p className={`text-base ${checkResult === 'success' ? 'text-green-200' : 'text-red-200'}`}>
                                            {feedbackMessage}
                                        </p>
                                        
                                        {checkResult === 'success' && (
                                            <button 
                                                onClick={() => onComplete(selectedTopic.id)}
                                                className="mt-4 px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 duration-200"
                                            >
                                                Continue to Next Lesson <ArrowRight className="w-5 h-5" />
                                            </button>
                                        )}
                                        
                                        {checkResult === 'error' && (
                                            <button 
                                                onClick={() => setCheckResult(null)}
                                                className="mt-2 text-sm text-red-400 hover:text-red-300 underline underline-offset-4"
                                            >
                                                Try Again
                                            </button>
                                        )}
                                    </div>
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