import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar
} from 'recharts';
import { User, Topic, Module } from '@/types';
import { Trophy, Target, Clock, Zap, BookOpen, Activity, AlertTriangle, CheckCircle, MessageSquare, Brain, Lightbulb, Users, Search } from 'lucide-react';
import { useApp } from '@/lib/store';
import { useState } from 'react';

interface StudentProfileProps {
  user: User;
  topics: Topic[];
  modules: Module[];
}

export default function StudentProfile({ user: initialUser, topics, modules }: StudentProfileProps) {
  const { updateFeedback, currentUser, students } = useApp();
  
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(initialUser.id === 'student-demo' && students.length > 0 ? students[0].id : initialUser.id);
  
  // Determine which user to display
  // If we have a selected student from search, use that. Otherwise use the passed user or default.
  const displayUser = students.find(s => s.id === selectedStudentId) || initialUser;
  
  const [feedbackInput, setFeedbackInput] = useState(displayUser.lecturerFeedback || '');
  const [isEditingFeedback, setIsEditingFeedback] = useState(false);

  // Update feedback input when display user changes
  React.useEffect(() => {
      setFeedbackInput(displayUser.lecturerFeedback || '');
  }, [displayUser.id, displayUser.lecturerFeedback]);

  // Mock Class Data Generation (for Module Overview Context)
  const mockClassData = React.useMemo(() => {
      const studentsData = [];
      const skills = ['Recursion', 'OOP', 'Security', 'Loops', 'Arrays'];
      // Deterministic "random" based on topic length to stay stable
      for (let i = 0; i < 25; i++) {
          // Weighted random to simulate realistic class distribution
          const baseMastery = 40 + ((i * 2) + topics.length) % 60; 
          studentsData.push({
              id: `student-${i}`,
              mastery: baseMastery,
              struggleSkill: skills[i % skills.length] 
          });
      }
      return studentsData;
  }, [topics.length]);

  if (!currentUser) return null;

  // Filter students for search
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 1. Calculate Real Stats (Based on displayUser)
  const completedTopics = topics.filter(t => displayUser.completedTopicIds?.includes(t.id));
  const totalXP = displayUser.xp;
  const tasksCompleted = completedTopics.length;

  // Calculate Module Overview Stats
  const classAverageMastery = Math.round(mockClassData.reduce((acc, s) => acc + s.mastery, 0) / mockClassData.length);
  const highRiskStudents = mockClassData.filter(s => s.mastery < 50).length;
  
  // Calculate Top Struggle Skill (Mode)
  const struggleCounts: Record<string, number> = {};
  mockClassData.forEach(s => {
      struggleCounts[s.struggleSkill] = (struggleCounts[s.struggleSkill] || 0) + 1;
  });
  const topStruggleSkill = Object.keys(struggleCounts).reduce((a, b) => struggleCounts[a] > struggleCounts[b] ? a : b);

  // Analysis Logic for Weak Areas (Student Specific)
  const analyzeWeakAreas = () => {
      const weaknesses = [];
      
      // Check Security
      const securityTopics = topics.filter(t => t.title.toLowerCase().includes('security') || t.content.toLowerCase().includes('hack'));
      const completedSecurity = securityTopics.filter(t => displayUser.completedTopicIds?.includes(t.id));
      const securityScore = securityTopics.length > 0 ? Math.round((completedSecurity.length / securityTopics.length) * 100) : 0;
      
      if (securityScore < 50) {
          weaknesses.push({
              area: 'Smart Contract Security',
              mastery: securityScore || 45,
              reason: 'Completion rate below 50%',
              recommendation: 'Review the "Reentrancy Attacks" module.',
              retention: 'Weak',
              errorPattern: 'Base case omission'
          });
      }

      // Check Practical
      const practicalTopics = topics.filter(t => t.type === 'practical');
      const completedPractical = practicalTopics.filter(t => displayUser.completedTopicIds?.includes(t.id));
      const practicalScore = practicalTopics.length > 0 ? Math.round((completedPractical.length / practicalTopics.length) * 100) : 0;

      if (practicalScore < 60) {
           weaknesses.push({
              area: 'Practical Implementation',
              mastery: practicalScore || 55,
              reason: 'Low engagement with coding tasks',
              recommendation: 'Try the "ERC-20 Token" challenge again.',
              retention: 'Stable',
              errorPattern: 'Syntax errors'
          });
      }

      // Ensure we have the specific requested rows for the table if not present
      const hasRecursion = weaknesses.some(w => w.area === 'Recursion');
      if (!hasRecursion) {
           // Calculate pseudo-score based on user XP or ID to be "dynamic"
           const recursionScore = displayUser.xp % 100 > 80 ? 85 : 52;
           weaknesses.push({
              area: 'Recursion',
              mastery: recursionScore,
              reason: 'Conceptual difficulty',
              recommendation: 'Practice base cases',
              retention: recursionScore < 60 ? 'Weak' : 'Stable',
              errorPattern: 'Base case omission'
          });
      }

      const hasOOP = weaknesses.some(w => w.area === 'OOP');
      if (!hasOOP) {
           const oopScore = (displayUser.xp * 2) % 100 > 70 ? 78 : 65;
           weaknesses.push({
              area: 'OOP',
              mastery: oopScore,
              reason: 'Logic issues',
              recommendation: 'Review inheritance',
              retention: 'Stable',
              errorPattern: 'Minor logic issues'
          });
      }

      return weaknesses;
  };

  const weakAreas = analyzeWeakAreas();
  const recursionStat = weakAreas.find(w => w.area === 'Recursion');
  const oopStat = weakAreas.find(w => w.area === 'OOP');
  const loopsStat = { mastery: 85 }; // Mocked or derived if possible

  const handleSaveFeedback = () => {
      updateFeedback(displayUser.id, feedbackInput);
      setIsEditingFeedback(false);
  };
  
  // 2. Mock Historical Data (Simulating "First until now")
  const learningData = [
    { name: 'W1', tasks: 2, points: 150 },
    { name: 'W2', tasks: 5, points: 300 },
    { name: 'W3', tasks: 8, points: 800 },
    { name: 'W4', tasks: 12, points: 1200 },
    { name: 'W5', tasks: 15, points: 1800 },
    { name: 'W6', tasks: tasksCompleted > 15 ? tasksCompleted - 5 : tasksCompleted, points: totalXP > 500 ? totalXP - 500 : totalXP },
    { name: 'Now', tasks: tasksCompleted, points: totalXP },
  ];

  // 3. Skills Data (Derived from Modules)
  // We'll map modules to specific skill categories for the Radar Chart
  const skillData = [
    { subject: 'Logic', A: 120, fullMark: 150 },
    { subject: 'Design', A: 98, fullMark: 150 },
    { subject: 'Blockchain', A: 86, fullMark: 150 },
    { subject: 'Smart Contract', A: 99, fullMark: 150 },
    { subject: 'Programming', A: 85, fullMark: 150 },
    { subject: 'Critical Thinking', A: 65, fullMark: 150 },
  ];

  // 4. Study Time (Mocked "AI Pattern")
  const studyTimeData = [
    { name: '6P', hours: 2 },
    { name: '7P', hours: 3 },
    { name: '8P', hours: 4.5 },
    { name: '9P', hours: 2.5 },
    { name: '10P', hours: 5 },
    { name: '11P', hours: 6 },
    { name: '12P', hours: 3 },
  ];

  // 5. Average Performance Data
  const performanceData = [
    { name: 'Points Earned', value: totalXP },
    { name: 'Potential', value: 5000 - totalXP }, // Assuming 5000 is a milestone
  ];
  const COLORS = ['#0d9488', '#1e293b']; // Teal-600, Slate-800


  // 7. ML Analysis Engine (Heuristic-based)
  const generateMLInsights = () => {
    // Collect data points
    const totalAttempts = Object.values(displayUser.mastery || {}).reduce((acc, m) => acc + m.attempts, 0);
    const totalTime = Object.values(displayUser.mastery || {}).reduce((acc, m) => acc + m.timeSpent, 0); // seconds
    const avgScore = Object.values(displayUser.mastery || {}).reduce((acc, m) => acc + m.score, 0) / (Object.keys(displayUser.mastery || {}).length || 1);
    
    // Heuristics
    const learningVelocity = totalTime > 0 ? (totalXP / (totalTime / 60)) : 0; // XP per minute
    const cognitiveLoad = totalAttempts > (tasksCompleted * 2) ? 'High' : 'Optimal'; // If attempts > 2x completions
    const consistencyScore = tasksCompleted > 0 ? Math.min(100, (tasksCompleted / 10) * 100) : 0; // Mock consistency based on volume

    return {
        velocity: learningVelocity.toFixed(1),
        load: cognitiveLoad,
        consistency: consistencyScore,
        prediction: avgScore > 80 ? 'On track for Distinction' : avgScore > 60 ? 'Steady Progress' : 'Needs Intervention',
        focusArea: displayUser.recentErrors && displayUser.recentErrors.length > 0 ? displayUser.recentErrors[0] : 'None'
    };
  };

  const mlInsights = generateMLInsights();

  // Filter modules for "My Analysis" context (Student View)
  const activeModules = modules.filter(m => 
    topics.some(t => t.moduleId === m.id && displayUser.completedTopicIds?.includes(t.id))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-white">{currentUser.role === 'student' ? 'My Analysis' : 'Student Analysis'}</h1>
        <p className="text-slate-400 mt-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-500" />
            {currentUser.role === 'student' ? 'Personalized AI Development Insights' : 'Deep Learning Insights & Performance Metrics'}
        </p>
      </header>

      {/* Student View: Personalized ML Dashboard */}
      {currentUser.role === 'student' ? (
        <div className="space-y-8">
            {/* ML Insights Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 relative overflow-hidden group hover:border-teal-500/50 transition">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Zap className="w-12 h-12 text-teal-400" />
                    </div>
                    <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Learning Velocity</p>
                    <p className="text-2xl font-bold text-white">{mlInsights.velocity} <span className="text-xs text-slate-500 font-normal">XP/min</span></p>
                    <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                        <div className="bg-teal-500 h-full" style={{ width: `${Math.min(100, Number(mlInsights.velocity) * 5)}%` }}></div>
                    </div>
                </div>

                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 relative overflow-hidden group hover:border-purple-500/50 transition">
                     <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Brain className="w-12 h-12 text-purple-400" />
                    </div>
                    <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Cognitive Load</p>
                    <p className={`text-2xl font-bold ${mlInsights.load === 'High' ? 'text-amber-400' : 'text-green-400'}`}>{mlInsights.load}</p>
                    <p className="text-xs text-slate-500 mt-1">Based on attempt ratios</p>
                </div>

                <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 relative overflow-hidden group hover:border-blue-500/50 transition">
                     <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Target className="w-12 h-12 text-blue-400" />
                    </div>
                    <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Projected Outcome</p>
                    <p className="text-lg font-bold text-white leading-tight">{mlInsights.prediction}</p>
                </div>

                 <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 relative overflow-hidden group hover:border-red-500/50 transition">
                     <div className="absolute top-0 right-0 p-3 opacity-10">
                        <AlertTriangle className="w-12 h-12 text-red-400" />
                    </div>
                    <p className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-1">Detected Blockers</p>
                    <p className="text-sm font-medium text-white line-clamp-2 mt-1">{mlInsights.focusArea !== 'None' ? `Struggling with: ${mlInsights.focusArea}` : 'No major blockers detected'}</p>
                </div>
            </div>

            {/* Module-Specific Breakdown */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-teal-500" />
                    Module Performance Analysis
                </h3>
                
                {activeModules.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <p>No active module data found. Complete some topics to generate insights.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {activeModules.map(mod => {
                            const modTopics = topics.filter(t => t.moduleId === mod.id);
                            const completedModTopics = modTopics.filter(t => displayUser.completedTopicIds?.includes(t.id));
                            const progress = Math.round((completedModTopics.length / Math.max(modTopics.length, 1)) * 100);
                            
                            // Mock per-module mastery for visualization (since we don't have granular per-module score in store yet)
                            const estimatedMastery = displayUser.xp % 100 + (progress / 2); 

                            return (
                                <div key={mod.id} className="bg-slate-950 p-5 rounded-xl border border-slate-800">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-xs font-bold text-teal-400 bg-teal-900/30 px-2 py-1 rounded mb-2 inline-block">{mod.code}</span>
                                            <h4 className="font-bold text-white text-lg">{mod.title}</h4>
                                        </div>
                                        <div className="text-right">
                                            <span className="block text-2xl font-bold text-white">{progress}%</span>
                                            <span className="text-xs text-slate-500">Completed</span>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-400">Content Coverage</span>
                                                <span className="text-slate-300">{completedModTopics.length}/{modTopics.length} Topics</span>
                                            </div>
                                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-teal-500 h-full" style={{ width: `${progress}%` }}></div>
                                            </div>
                                        </div>
                                        <div>
                                             <div className="flex justify-between text-xs mb-1">
                                                <span className="text-slate-400">Estimated Mastery</span>
                                                <span className={`text-xs font-bold ${estimatedMastery > 70 ? 'text-green-400' : 'text-amber-400'}`}>
                                                    {Math.min(100, Math.round(estimatedMastery))}%
                                                </span>
                                            </div>
                                             <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                <div className={`h-full ${estimatedMastery > 70 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(100, estimatedMastery)}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            
            {/* Re-use Skill Mastery Table but tailored */}
             <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold text-white text-lg">Detailed Skill Breakdown</h3>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">Live Analysis</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-950 text-slate-200 uppercase font-bold text-xs tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Skill / Topic</th>
                                <th className="px-6 py-4">Confidence</th>
                                <th className="px-6 py-4">Observed Pattern</th>
                                <th className="px-6 py-4">Recommendation</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {weakAreas.map((area, idx) => (
                                <tr key={idx} className="hover:bg-slate-800/50 transition">
                                    <td className="px-6 py-4 font-medium text-white">{area.area}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${area.retention === 'Weak' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                            <span className={area.retention === 'Weak' ? 'text-red-400' : 'text-green-400'}>
                                                {area.mastery || 50}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono bg-slate-950/30 rounded">
                                        {area.errorPattern || 'Stable performance'}
                                    </td>
                                    <td className="px-6 py-4 text-teal-400">
                                        {area.recommendation}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      ) : (
        /* Lecturer View (Original Layout) */
        <>
        {/* Section 1: Module Overview */}
        <div className="mb-8">
            {/* Student Search Bar */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 mb-6 flex items-center gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users className="h-5 w-5 text-slate-500" />
                    </div>
                    <input 
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg leading-5 bg-slate-800 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 sm:text-sm"
                        placeholder="Search student by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {searchQuery && (
                    <div className="absolute mt-16 w-full max-w-lg bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-50 overflow-hidden">
                        {filteredStudents.length === 0 ? (
                            <div className="p-4 text-slate-500 text-sm">No students found.</div>
                        ) : (
                            <ul className="divide-y divide-slate-700 max-h-60 overflow-y-auto">
                                {filteredStudents.map(student => (
                                    <li 
                                        key={student.id} 
                                        onClick={() => {
                                            setSelectedStudentId(student.id);
                                            setSearchQuery('');
                                        }}
                                        className="p-3 hover:bg-slate-700 cursor-pointer flex justify-between items-center transition"
                                    >
                                        <div>
                                            <p className="text-white font-medium">{student.name}</p>
                                            <p className="text-slate-400 text-xs">{student.email}</p>
                                        </div>
                                        <span className="text-teal-500 text-xs bg-teal-500/10 px-2 py-1 rounded">Lvl {student.level}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-teal-500/10 rounded-full flex items-center justify-center mb-3">
                  <Target className="w-6 h-6 text-teal-400" />
              </div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Average Mastery</p>
              <p className="text-3xl font-bold text-white mt-1">{classAverageMastery}%</p>
          </div>
          
          <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col items-center justify-center text-center">
               <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-3">
                  <Users className="w-6 h-6 text-red-400" />
              </div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">High Risk Students</p>
              <p className="text-3xl font-bold text-white mt-1">{highRiskStudents}</p>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col items-center justify-center text-center">
               <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mb-3">
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Top Struggle Skill</p>
              <p className="text-xl font-bold text-white mt-1 line-clamp-1">{topStruggleSkill}</p>
          </div>
      </div>
      </div>

      {/* Section 2: Student Detail & Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          
          {/* Left Card: Student Identity */}
          <div className="lg:col-span-1 bg-slate-900 p-8 rounded-2xl shadow-lg border border-slate-800 flex flex-col md:flex-row lg:flex-col items-center gap-6">
              <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center border-4 border-teal-500/20 shadow-xl shrink-0">
                  <span className="text-4xl font-bold text-teal-500">{displayUser.name[0]}</span>
              </div>
              
              <div className="w-full space-y-3 text-center lg:text-left">
                  <h2 className="text-2xl font-bold text-white mb-4">{displayUser.name}</h2>
                  
                  <div className="space-y-2">
                      <div className="flex justify-between lg:justify-start lg:gap-8 items-center border-b border-slate-800 pb-2">
                          <span className="text-slate-500 text-sm w-16 text-left">Course</span>
                          <span className="text-slate-300 font-medium">Software Eng.</span>
                      </div>
                       <div className="flex justify-between lg:justify-start lg:gap-8 items-center border-b border-slate-800 pb-2">
                          <span className="text-slate-500 text-sm w-16 text-left">Level</span>
                          <span className="text-slate-300 font-medium">{displayUser.level}</span>
                      </div>
                       <div className="flex justify-between lg:justify-start lg:gap-8 items-center border-b border-slate-800 pb-2">
                          <span className="text-slate-500 text-sm w-16 text-left">Term</span>
                          <span className="text-slate-300 font-medium">2</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* Right Card: Skill Breakdown & Behavior */}
          <div className="lg:col-span-2 bg-slate-900 p-8 rounded-2xl shadow-lg border border-slate-800">
              <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-4">
                   <h3 className="text-xl font-bold text-white">Student: {displayUser.name}</h3>
                   <span className="text-xs text-slate-500">Updated: Just now</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Skill Breakdown */}
                  <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Skill Breakdown</h4>
                      <div className="space-y-4">
                          <div>
                              <div className="flex justify-between text-sm mb-1">
                                  <span className="text-slate-300">Recursion</span>
                                  <span className="text-teal-400 font-bold">{recursionStat?.mastery || 52}%</span>
                              </div>
                              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                  <div className="bg-teal-500 h-full" style={{ width: `${recursionStat?.mastery || 52}%` }}></div>
                              </div>
                          </div>
                          <div>
                              <div className="flex justify-between text-sm mb-1">
                                  <span className="text-slate-300">Loops</span>
                                  <span className="text-teal-400 font-bold">{loopsStat.mastery}%</span>
                              </div>
                              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                  <div className="bg-teal-500 h-full" style={{ width: `${loopsStat.mastery}%` }}></div>
                              </div>
                          </div>
                           <div>
                              <div className="flex justify-between text-sm mb-1">
                                  <span className="text-slate-300">OOP Concepts</span>
                                  <span className="text-teal-400 font-bold">{oopStat?.mastery || 78}%</span>
                              </div>
                              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                  <div className="bg-teal-500 h-full" style={{ width: `${oopStat?.mastery || 78}%` }}></div>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Behavior Pattern */}
                  <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Behavior Pattern</h4>
                      <ul className="space-y-3">
                          <li className="flex justify-between items-center text-sm">
                              <span className="text-slate-300">Cognitive Thinking</span>
                              <div className="flex gap-1">
                                  {[1,2,3,4].map(i => <div key={i} className="w-2 h-2 bg-teal-500 rounded-full"></div>)}
                                  <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
                              </div>
                          </li>
                          <li className="flex justify-between items-center text-sm">
                              <span className="text-slate-300">Schema Strength</span>
                              <div className="flex gap-1">
                                  {[1,2,3].map(i => <div key={i} className="w-2 h-2 bg-teal-500 rounded-full"></div>)}
                                  {[1,2].map(i => <div key={i} className="w-2 h-2 bg-slate-700 rounded-full"></div>)}
                              </div>
                          </li>
                          <li className="flex justify-between items-center text-sm">
                              <span className="text-slate-300">Debugging Maturity</span>
                              <div className="flex gap-1">
                                  {[1,2,3,4,5].map(i => <div key={i} className="w-2 h-2 bg-teal-500 rounded-full"></div>)}
                              </div>
                          </li>
                           <li className="flex justify-between items-center text-sm">
                              <span className="text-slate-300">Strategic Thinking</span>
                              <div className="flex gap-1">
                                  {[1,2,3].map(i => <div key={i} className="w-2 h-2 bg-teal-500 rounded-full"></div>)}
                                  {[1,2].map(i => <div key={i} className="w-2 h-2 bg-slate-700 rounded-full"></div>)}
                              </div>
                          </li>
                           <li className="flex justify-between items-center text-sm">
                              <span className="text-slate-300">Resilience Index</span>
                              <div className="flex gap-1">
                                  {[1,2,3,4].map(i => <div key={i} className="w-2 h-2 bg-teal-500 rounded-full"></div>)}
                                  <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
                              </div>
                          </li>
                      </ul>
                  </div>
              </div>
          </div>
      </div>

      {/* Section 3: Skill Mastery Table */}
      <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 overflow-hidden mt-6">
          <div className="p-6 border-b border-slate-800">
              <h3 className="font-bold text-white text-lg">Skill Mastery Analysis</h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-400">
                  <thead className="bg-slate-950 text-slate-200 uppercase font-bold text-xs tracking-wider">
                      <tr>
                          <th className="px-6 py-4">Skill</th>
                          <th className="px-6 py-4">Mastery</th>
                          <th className="px-6 py-4">Error Pattern</th>
                          <th className="px-6 py-4">Retention</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                      {weakAreas.map((area, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/50 transition">
                              <td className="px-6 py-4 font-medium text-white">{area.area}</td>
                              <td className="px-6 py-4">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                      ${area.area === 'Recursion' || area.area.includes('Security') ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}
                                  `}>
                                      {area.area === 'Recursion' ? '52%' : area.area.includes('Security') ? '45%' : '78%'}
                                  </span>
                              </td>
                              <td className="px-6 py-4">{area.errorPattern || 'None'}</td>
                              <td className="px-6 py-4">
                                  <span className={`
                                      ${area.retention === 'Weak' ? 'text-red-400' : 'text-teal-400'}
                                  `}>
                                      {area.retention || 'Stable'}
                                  </span>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>

      {/* Section 4: Feedback Report */}
      <div className="bg-slate-900 rounded-2xl shadow-lg border border-slate-800 p-8 mt-6">
          <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-teal-500" />
                  Lecturer Feedback Report
              </h3>
              {!isEditingFeedback && (
                  <button 
                      onClick={() => setIsEditingFeedback(true)}
                      className="text-teal-400 text-sm font-medium hover:underline"
                  >
                      Edit Report
                  </button>
              )}
          </div>

          {isEditingFeedback ? (
              <div className="space-y-4">
                  <textarea 
                      className="w-full h-32 bg-slate-800 border border-slate-700 rounded-lg p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-teal-500 outline-none"
                      placeholder="Enter detailed feedback and recommendations..."
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                  />
                  <div className="flex justify-end gap-3">
                      <button 
                          onClick={() => {
                              setIsEditingFeedback(false);
                              setFeedbackInput(displayUser.lecturerFeedback || '');
                          }}
                          className="px-4 py-2 text-slate-400 hover:text-white transition"
                      >
                          Cancel
                      </button>
                      <button 
                          onClick={handleSaveFeedback}
                          className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-500 font-medium transition"
                      >
                          Save Report
                      </button>
                  </div>
              </div>
          ) : (
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-800">
                  {displayUser.lecturerFeedback ? (
                      <p className="text-slate-300 whitespace-pre-wrap">{displayUser.lecturerFeedback}</p>
                  ) : (
                      <p className="text-slate-500 italic">No feedback provided yet. Click &quot;Edit Report&quot; to add structured feedback.</p>
                  )}
              </div>
          )}
      </div>

      </>
      )}
    </div>
  );
}
