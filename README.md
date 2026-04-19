# Study Coach

Study Coach is a Next.js learning platform prototype for students and lecturers.
It supports guided lessons, quizzes, practical coding activities, student progress tracking, and lecturer-authored module content.

## Features

- Student and lecturer sign-in flow
- Module and topic-based learning journey
- Multiple choice quiz activities
- Practical coding activities with an in-browser editor
- Student progress tracking using completion, mastery, attempts, and time spent
- Lecturer tools for creating modules, topics, and student feedback
- Dashboard analytics and student analysis views

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Monaco Editor
- Recharts
- Lucide React

## Project Status

This app currently behaves like a prototype or demo application:

- Data is stored in `localStorage`
- There is no external database configured
- Authentication is simplified
- AI and code execution routes use mocked or heuristic logic

## Requirements

- Node.js 18 or later recommended
- npm

## Installation

1. Open a terminal in the project folder:

```bash
cd /Users/macbook/Documents/trae_projects/Study\ Coach/ai-study-coach
```

2. Install dependencies:

```bash
npm install
```

## Run The App

Start the development server:

```bash
npm run dev
```

Open the app in your browser:

```text
http://localhost:3000
```

## Other Useful Commands

Run a production build:

```bash
npm run build
```

Start the production server after building:

```bash
npm run start
```

Run linting:

```bash
npm run lint
```

## How To Use The App

### 1. Sign In

On the home page, enter:

- Full name
- Email address
- Role: `Student` or `Lecturer`
- Level / course

Then click the sign-in button to enter the dashboard.

### 2. Student Flow

As a student, you can:

- Open available modules from the sidebar
- View the list of module topics
- Complete quizzes
- Complete practical coding activities
- Open the analysis page to view your progress

Progress is currently measured using:

- Completed topics
- Attempts per topic
- Time spent
- Mastery score
- Recent errors

### 3. Lecturer Flow

As a lecturer, you can:

- View your lecturer dashboard
- Open teaching modules
- Add and edit module topics
- Create quiz activities
- Create practical coding activities
- Search student analysis records
- Add lecturer feedback for students

## How Results Are Measured

The app tracks user progress in the browser and updates learning metrics when a student interacts with activities.

### Quiz Activities

- A selected option is compared with the stored correct answer
- Correct answers can mark the topic as completed
- Wrong answers can register failed attempts

### Practical Coding Activities

- Code is entered in the built-in editor
- The app sends the code to the internal API route
- The route simulates compilation and execution
- The result is shown in the console output panel

### Progress Model

The current progress model includes:

- Topic completion
- XP
- Mastery score
- Attempt count
- Time spent
- Recent errors
- Lecturer feedback

## Data Persistence

The application stores data in browser `localStorage`.

This means:

- Progress is local to the current browser
- Clearing browser storage resets the saved session data
- The app does not yet support shared multi-user persistence

## Main Folder Structure

```text
app/
  api/
    chat/
    generate/
  dashboard/
  layout.tsx
  page.tsx

components/
  ChatInterface.tsx
  LecturerView.tsx
  LessonView.tsx
  StudentProfile.tsx

lib/
  data.ts
  store.tsx

types/
  index.ts
```

## Important Files

- `app/page.tsx` - login and entry page
- `app/dashboard/page.tsx` - main dashboard and learning flow
- `components/LessonView.tsx` - quiz and coding activity experience
- `components/StudentProfile.tsx` - student analysis and lecturer student analysis views
- `components/LecturerView.tsx` - lecturer dashboard/profile
- `lib/store.tsx` - global app state and progress tracking
- `app/api/chat/route.ts` - mocked AI and code execution logic
- `app/api/generate/route.ts` - mocked content generation logic

## Notes

- If the UI looks out of date after changes, restart the dev server
- If local data causes unexpected behavior, clear browser storage for the app
- Some analytics and code execution results are simulated for demo purposes

## License

This project currently does not include a license file.
