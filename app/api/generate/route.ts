import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { title, content, moduleTitle, files } = await req.json();
    
    // Simulate AI Latency
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Construct the System Prompt based on user instructions
    const systemPrompt = `
    Role: You are an expert Computer Science lecturer and educational game designer.
    Objective: Convert the provided lab task content into student-friendly, gamified learning content for a learning app.
    
    Instructions:
    1. Create a concise module summary (Simple language, focus on learning outcomes).
    2. Generate 8-10 Multiple Choice Questions (MCQs) (Mix of concepts, code, common mistakes).
    3. Create Coding Practice Challenges (Beginner -> Advanced, Clear tasks, Expected behavior).
    4. Gamify the experience (Levels, motivating language).
    
    Output Format: JSON with fields: summary, mcqs (array of {question, options, correctIndex}), challenges (array of {level, title, task, initialCode}).
    `;

    // In a real application, we would call an LLM here with the prompt and user content/files.
    // For this prototype, we will simulate the "Expert Lecturer" output logic.

    const lowerTitle = title.toLowerCase();
    
    // 1. Module Summary Simulation
    const summary = `In this module, you will master ${title}. We'll break down complex concepts into bite-sized missions, focusing on practical implementation and avoiding common pitfalls. Get ready to level up your coding skills!`;

    // 2. MCQs Simulation
    const mcqs = [
        {
            question: `What is the primary purpose of ${title}?`,
            options: ["To increase code complexity", "To solve X efficiently", "To confuse the compiler", "None of the above"],
            correctIndex: 1
        },
        {
            question: "Which of the following is a common mistake when implementing this?",
            options: ["Ignoring edge cases", "Using too many comments", "Variable naming", "Using standard libraries"],
            correctIndex: 0
        }
        // ... (Would generate 8-10 in real scenario)
    ];

    // 3. Coding Challenges Simulation
    const challenges = [];
    
    // Level 1: Beginner
    challenges.push({
        level: "Level 1: Novice Initiate",
        title: "Hello World of " + title,
        task: `Create a basic implementation of ${title}. Ensure it compiles without errors.`,
        initialCode: `// Your first mission: Implement ${title}\n`
    });

    // Level 2: Boss Fight
    if (files && files.length > 0) {
         challenges.push({
            level: "Level 2: Boss Fight",
            title: "Architectural Implementation",
            task: "Based on the uploaded diagram, implement the core interface and class structure. Use Lambda expressions where appropriate.",
            initialCode: `// Implement the design from the uploaded file\ninterface CoreSystem {\n    // TODO\n}`
        });
    } else {
        challenges.push({
            level: "Level 2: Logic Master",
            title: "Advanced Logic",
            task: "Refactor your previous code to use a Lambda expression for cleaner syntax.",
            initialCode: `// Refactor this function to use Lambdas\n`
        });
    }

    // Map to existing frontend schema (Simplified for compatibility)
    // In a full implementation, we would update the frontend to display the full list of MCQs and Challenges.
    // For now, we return the "Boss Fight" or first challenge as the main practical task.

    const mainChallenge = challenges[challenges.length - 1];

    // Determine Type
    const isPractical = lowerTitle.includes('code') || lowerTitle.includes('function') || lowerTitle.includes('implement') || lowerTitle.includes('lab') || (files && files.length > 0);

    return NextResponse.json({
        type: isPractical ? 'practical' : 'quiz',
        summary,
        quizQuestion: mcqs[0].question, // Legacy field
        options: mcqs[0].options, // Populate top-level options for frontend compatibility
        correctOptionIndex: mcqs[0].correctIndex,
        mcqs, // New field
        practicalTask: mainChallenge.task,
        initialCode: mainChallenge.initialCode,
        xpReward: 300 + (files ? files.length * 50 : 0)
    });

  } catch (error) {
    return NextResponse.json({ error: 'Generation Failed' }, { status: 500 });
  }
}
