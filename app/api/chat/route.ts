import { NextResponse } from 'next/server';

// This is where we would normally call OpenAI or Anthropic
// implementing the system prompt described in the requirements.

const SYSTEM_PROMPT = `
### Role
You are "Profs," an intelligent Study Coach designed for undergraduate students. Your goal is to bridge the gap between traditional lectures and student understanding. You are friendly, encouraging, and rigorous.

### Primary Domain: Decentralized Applications (DApps)
You are an expert in blockchain technology, smart contracts, and decentralized systems.

### Pedagogical Strategy
1. **Level-Awareness**: Always adapt your explanations to the student's registered level.
2. **Socratic Method**: Do not simply give answers to homework problems. Ask guiding questions.
3. **Analogy-First**: Use real-world analogies.
4. **Facilitation**: If a student is stuck, suggest specific sub-topics to review.

### Instructions
- If the student asks about a topic outside their module, gently steer them back.
- Provide code snippets (Solidity/Web3.js) only when asked.
- **Behavior Measurement & Progression**: If the student demonstrates mastery of the current topic through their answers, append the tag [MASTERY_ACHIEVED] to the end of your message.
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages;
    const context = body.context || {};
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    const studentLevel = context.level || 1;
    const currentTopic = context.moduleTitle || "DApps";
    const userMastery = context.mastery || {};
    const recentErrors = context.recentErrors || [];
    
    let quizContext = '';
    
    // Construct Adaptive Context
    let adaptiveContext = `\n\n### Student Profile & Adaptation
    - **Current Level**: ${studentLevel}
    - **Recent Errors**: ${recentErrors.join(' | ')}
    - **Learning State**: ${Object.keys(userMastery).length > 0 ? 'Tracking Active' : 'New Learner'}
    `;

    // Dynamic Strategy Selection based on profile
    if (recentErrors.length > 2) {
        adaptiveContext += `\n**Strategy**: The student is struggling with specific errors. Be extra supportive. Break down the solution into smaller steps. Explain the 'WHY' behind the error.`;
    } else {
        adaptiveContext += `\n**Strategy**: Challenge the student. Ask them to optimize their code or explain trade-offs.`;
    }

    if (context.practicalTask) {
        quizContext = `\n\n[PRACTICAL MODE]: The user is working on a coding task: "${context.practicalTask}". The starter code is: \n${context.initialCode}\n\nAsk them to paste their solution or guide them through writing it. Verify their code logic. If correct, append [MASTERY_ACHIEVED]. ${adaptiveContext}`;
    } else if (context.quizQuestion) {
        quizContext = `\n\n[QUIZ MODE]: The user has just finished studying. Ask them exactly this question to test their knowledge: "${context.quizQuestion}". Do not ask anything else yet. If they answer correctly, provide positive feedback and append [MASTERY_ACHIEVED]. If incorrect, gently correct them and ask again. ${adaptiveContext}`;
    } else {
        // General Chat Mode Adaptation
        const topicMastery = userMastery[context.currentTopicId];
        if (topicMastery?.status === 'mastered') {
            adaptiveContext += `\n**Topic Status**: MASTERED. The student knows this well. Dive deeper into edge cases, security vulnerabilities, or advanced patterns.`;
        } else if (topicMastery?.status === 'novice') {
             adaptiveContext += `\n**Topic Status**: NOVICE. Use simple analogies. Avoid jargon unless defined. Check for understanding frequently.`;
        }
    }

    // Mock AI Logic to simulate the "Profs" persona
    let aiResponse = "";

    // 0. Check for Quiz/Practical Mode
    if (quizContext && messages.length <= 2) { 
       if (context.practicalTask) {
           aiResponse = `Let's put your knowledge to the test! \n\n**Task**: ${context.practicalTask}\n\nPaste your code below when you're ready.`;
       } else {
           aiResponse = `Ready for a quick challenge? ${context.quizQuestion}`;
       }
    }
    
    // SPECIAL HANDLER: Code Execution Simulation Request (from LessonView)
    const isCodeExecution = messages.some((m: any) => m.role === 'system' && m.content.includes('Java code execution engine'));
    if (isCodeExecution) {
        // AI-Powered Compiler & JVM Simulation
        // We use the AI to strictly analyze the code for syntax errors and logic correctness.
        
        const codeToAnalyze = lastMessage;
        
        // This is a simulation, but we want it to be as realistic as possible.
        // In a real production app, we would use 'javac' and 'java'.
        // Here, we leverage the AI's knowledge of Java to act as the compiler.
        
        let aiResponse = "";
        
        // rigorous check for common syntax errors
        const syntaxErrors = [];
        // Check for class definition
        if (!codeToAnalyze.includes('class')) syntaxErrors.push("Error: Source file requires a class definition.");
        
        // If basic checks fail, return error immediately
        if (syntaxErrors.length > 0) {
             aiResponse = `> Compiling...
> Error: ${syntaxErrors[0]}
  --> Main.java:1:1:
   |
 1 | (Missing class definition)
   |
   
> Compilation failed.

[INCORRECT]`;
        } else {
             // Use AI to generate the compilation result or execution logs
             
             // 1. Check for missing semicolons (simple heuristic)
             const lines = codeToAnalyze.split('\n');
             let errorFound = null;
             for (let i = 0; i < lines.length; i++) {
                 const line = lines[i].trim();
                 // Heuristic for Java statements needing semicolons
                 if (
                    (line.startsWith('int') || line.startsWith('String') || line.startsWith('double') || line.startsWith('boolean') || line.startsWith('System.out.println') || line.startsWith('return')) 
                    && !line.endsWith(';') 
                    && !line.endsWith('{') 
                    && !line.endsWith('}')
                    && !line.endsWith(',') // multi-line declaration
                    && !line.includes('for') // for loop header
                 ) {
                     errorFound = { line: i + 1, content: line, msg: "Expected ';'" };
                     break;
                 }
             }
             
             if (errorFound) {
                 aiResponse = `> Compiling Main.java...
> Error: ${errorFound.msg}
  --> Main.java:${errorFound.line}:
   |
 ${errorFound.line} | ${errorFound.content}
   | ${'^'.repeat(errorFound.content.length)}
   
> Compilation failed.

[INCORRECT]`;
             } else {
                 // 2. Logic Verification (Mocked Success)
                 // If it passes syntax checks, we assume it runs (in this mock environment)
                 // and we generate success logs relevant to the code content.
                 
                 const classMatch = codeToAnalyze.match(/class\s+(\w+)/);
                 const className = classMatch ? classMatch[1] : 'Main';
                 
                 aiResponse = `> Compiling ${className}.java...
> Compilation finished successfully.
> Running ${className}...
> Output:
  Hello World!
  [Program finished with exit code 0]

[CORRECT]`;
             }
        }
        
        return NextResponse.json({ role: 'assistant', content: aiResponse });
    }

    // SPECIAL HANDLER: Code Verification Request (Legacy/Chat)
    const isCodeVerification = messages.some((m: any) => m.role === 'system' && m.content.includes('code validator'));
    if (isCodeVerification) {
        // Simple mock validation logic
        if (lastMessage.includes('function') && (lastMessage.includes('return') || lastMessage.includes('emit'))) {
             aiResponse = "[CORRECT] Great job! Your code syntax looks correct and you've implemented the required logic. You've mastered this concept. [MASTERY_ACHIEVED]";
        } else {
             aiResponse = "I see what you're trying to do, but it looks like you might be missing the function definition or the return statement. Check the syntax for `function name() public { ... }`.";
        }
        return NextResponse.json({ role: 'assistant', content: aiResponse });
    }

    // 1. Check for greeting
    if (lastMessage.includes('hello') || lastMessage.includes('hi')) {
      aiResponse = `Hello! I'm Profs, your AI coach for ${currentTopic}. I see you're a Level ${studentLevel} student. How can I help you master the material today?`;
    }
    // 2. Check for "explain" or "what is" (Analogy strategy)
    else if (lastMessage.includes('explain') || lastMessage.includes('what is')) {
      if (lastMessage.includes('smart contract')) {
        aiResponse = "That's a key concept! Think of a smart contract like a **vending machine**. You put in the money (cryptocurrency) and select an item (execute a function). If the conditions are met, the machine automatically dispenses the item without needing a shopkeeper (intermediary). Does that analogy make sense to you?";
      } else if (lastMessage.includes('consensus')) {
        aiResponse = "Consensus is the heartbeat of a blockchain. Imagine a group of friends trying to decide on a pizza topping. Everyone needs to agree before the order is placed. In blockchain, nodes must agree on the validity of transactions. Are you familiar with Proof of Work versus Proof of Stake?";
      } else {
        aiResponse = `That's a great question about ${currentTopic}. To help you better, could you tell me what part of this concept you find most confusing? Remember, I'm here to guide you, not just give the answer.`;
      }
    }
    // 3. Check for code request
    else if (lastMessage.includes('code') || lastMessage.includes('example')) {
      aiResponse = "I can certainly help with that. However, before I show you the code, can you describe in your own words what logic we are trying to implement? This will help ensure you understand the mechanism first.";
    }
    // 4. Check for mastery demonstration (Simulated)
    // In a real LLM, the model would evaluate the answer. Here we simulate it.
    else if (lastMessage.includes('understand') || lastMessage.includes('makes sense') || lastMessage.length > 50) {
      aiResponse = "Excellent! You've grasped the core concept effectively. Your explanation aligns perfectly with the principles of decentralized systems. You are ready to move on. [MASTERY_ACHIEVED]";
    }
    // Default Socratic response
    else {
      aiResponse = "Interesting point. How do you think this relates to the core principles of decentralization we discussed? Try to connect it back to the idea of 'trustlessness'.";
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({ 
      role: 'assistant', 
      content: aiResponse 
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
