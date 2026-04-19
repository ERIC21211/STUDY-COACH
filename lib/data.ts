import { Module, Topic, User } from '@/types';

export const initialModules: Module[] = [
  // LEVEL 4: Software Development (Java & Fundamentals)
  { id: 'm4-1', code: 'JAVA101', title: 'Building blocks in Java', description: 'Introduction to Java syntax, variables, and data types.', minLevel: 4, creatorId: 'system' },
  { id: 'm4-2', code: 'JAVA102', title: 'Making Choices', description: 'Control flow, if-statements, and switch cases.', minLevel: 4, creatorId: 'system' },
  { id: 'm4-3', code: 'JAVA103', title: 'Programming with Loops', description: 'For, while, and do-while loops in depth.', minLevel: 4, creatorId: 'system' },
  { id: 'm4-4', code: 'JAVA104', title: 'Structured Programming', description: 'Methods, scope, and modular code design.', minLevel: 4, creatorId: 'system' },
  { id: 'm4-5', code: 'JAVA105', title: 'Arrays', description: 'Working with arrays and array lists.', minLevel: 4, creatorId: 'system' },
  { id: 'm4-6', code: 'OOP101', title: 'Object Orientated Programming', description: 'Concepts of objects, classes, and encapsulation.', minLevel: 4, creatorId: 'system' },
  { id: 'm4-7', code: 'OOP102', title: 'Implementing Classes', description: 'Constructors, inheritance, and polymorphism.', minLevel: 4, creatorId: 'system' },
  { id: 'm4-8', code: 'OOP103', title: 'Advanced Programming', description: 'Interfaces, abstract classes, and exceptions.', minLevel: 4, creatorId: 'system' },

  // LEVEL 5: Advanced Programming
  { id: 'm5-1', code: 'JAVA201', title: 'Interfaces and Lambda Expressions', description: 'Functional programming concepts in Java.', minLevel: 5, creatorId: 'system' },
  { id: 'm5-2', code: 'JAVA202', title: 'Generics and Polymorphism', description: 'Type safety and code reusability.', minLevel: 5, creatorId: 'system' },
  { id: 'm5-3', code: 'JAVA203', title: 'Exceptions', description: 'Error handling and custom exceptions.', minLevel: 5, creatorId: 'system' },
  { id: 'm5-4', code: 'JAVA204', title: 'Collection of Classes', description: 'Lists, Sets, Maps, and HashMaps.', minLevel: 5, creatorId: 'system' },
  { id: 'm5-5', code: 'TOOLS101', title: 'What are IDEs', description: 'Using IntelliJ, Eclipse, and VS Code effectively.', minLevel: 5, creatorId: 'system' },
  { id: 'm5-6', code: 'JAVA205', title: 'File Handling', description: 'Reading and writing files, I/O streams.', minLevel: 5, creatorId: 'system' },
  { id: 'm5-7', code: 'GUI101', title: 'JavaFX', description: 'Building desktop GUIs with JavaFX.', minLevel: 5, creatorId: 'system' },
  { id: 'm5-8', code: 'GUI102', title: 'Advanced JavaFX', description: 'Scene builder, styling, and complex controls.', minLevel: 5, creatorId: 'system' },
  { id: 'm5-9', code: 'JAVA206', title: 'Multi Threaded Programming', description: 'Concurrency, threads, and synchronization.', minLevel: 5, creatorId: 'system' },
  { id: 'm5-10', code: 'NET101', title: 'Sockets', description: 'Network programming and client-server communication.', minLevel: 5, creatorId: 'system' },
  { id: 'm5-11', code: 'JAVA207', title: 'Packages', description: 'Organizing code and managing dependencies.', minLevel: 5, creatorId: 'system' },

  // LEVEL 6: Mobile Distributed Systems
  { id: 'm6-1', code: 'MDS101', title: 'Introduction to Mobile Distributed Application', description: 'Concepts of distributed systems in mobile environments.', minLevel: 6, creatorId: 'system' },
  { id: 'm6-2', code: 'MDS102', title: 'BPMN', description: 'Business Process Model and Notation for workflow management.', minLevel: 6, creatorId: 'system' },
  { id: 'm6-3', code: 'NODE101', title: 'Practice of Node.js and Express.js', description: 'Backend development with JavaScript.', minLevel: 6, creatorId: 'system' },
  { id: 'm6-4', code: 'API101', title: 'API gateway', description: 'Managing API traffic and microservices.', minLevel: 6, creatorId: 'system' },
  { id: 'm6-5', code: 'BC101', title: 'Blockchain', description: 'Fundamentals of distributed ledger technology.', minLevel: 6, creatorId: 'system' },
  { id: 'm6-6', code: 'SC101', title: 'Smart Contract', description: 'Developing and deploying smart contracts on Ethereum.', minLevel: 6, creatorId: 'system' }
];

export const initialTopics: Topic[] = [
  // Topics for new modules can be added here
];

// Mock Students for Lecturer Search
export const mockStudents: User[] = [
  {
    id: 'student-1',
    name: 'John Doe',
    email: 'john.doe@university.edu',
    role: 'student',
    level: 4,
    completedTopicIds: [],
    xp: 2450,
    lives: 5,
    recentErrors: ['Base case omission', 'Infinite loop detected', 'Null pointer exception'],
    mastery: {}
  },
  {
    id: 'student-2',
    name: 'Jane Smith',
    email: 'jane.smith@university.edu',
    role: 'student',
    level: 5,
    completedTopicIds: [],
    xp: 3200,
    lives: 4,
    recentErrors: ['Type mismatch', 'Index out of bounds'],
    mastery: {}
  },
  {
    id: 'student-3',
    name: 'Michael Brown',
    email: 'm.brown@university.edu',
    role: 'student',
    level: 4,
    completedTopicIds: [],
    xp: 1800,
    lives: 5,
    recentErrors: ['Syntax error', 'Variable not defined'],
    mastery: {}
  },
  {
    id: 'student-4',
    name: 'Sarah Wilson',
    email: 's.wilson@university.edu',
    role: 'student',
    level: 6,
    completedTopicIds: [],
    xp: 4500,
    lives: 3,
    recentErrors: ['Promise rejection', 'Async/Await misuse'],
    mastery: {}
  },
  {
    id: 'student-5',
    name: 'David Lee',
    email: 'd.lee@university.edu',
    role: 'student',
    level: 5,
    completedTopicIds: [],
    xp: 2900,
    lives: 5,
    recentErrors: ['Null pointer exception'],
    mastery: {}
  }
];
