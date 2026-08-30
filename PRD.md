# Product Requirements Document (PRD) — Daily Scheduler

## 1. Overview
Daily Scheduler is a full-stack MERN web application that lets a user sign up,
log in, and manage a personal daily task schedule. Each user's tasks are
private to their account. The app also supports categorizing tasks and
generating AI-assisted scheduling suggestions.

## 2. Problem Statement
People need a simple, focused way to plan their day without the overhead of
large project-management tools. Existing to-do apps are either too simple
(no auth, no persistence) or too complex (teams, projects, permissions).
This app fills that gap: a personal, authenticated, day-oriented scheduler.

## 3. Goals
- Allow a user to securely create an account and log in.
- Allow a user to create, view, update, and delete tasks (CRUD).
- Ensure each user can only see and modify their own tasks.
- Let users organize tasks into categories.
- Provide AI-generated suggestions to help prioritize the day.
- Deploy the app so it's usable from any browser, not just localhost.

## 4. Non-Goals
- Team/multi-user collaboration on the same schedule.
- Native mobile apps (web-responsive only).
- Calendar sync with third-party services (Google Calendar, Outlook) — future
  consideration, not in current scope.

## 5. Target Users
Individuals who want a lightweight, private daily planner — students,
freelancers, or anyone organizing personal tasks day to day.

## 6. Core Features

### 6.1 Authentication
- Sign up with name, email, password.
- Passwords are hashed (bcrypt) before storage — never stored in plain text.
- Log in returns a JWT used to authenticate all further requests.
- Protected routes redirect unauthenticated users to the login page.

### 6.2 Task Management (CRUD)
- Create a task with title, description, date, time.
- View all tasks, grouped by date.
- Mark a task complete/incomplete.
- Edit an existing task.
- Delete a task.
- Tasks are always scoped to the logged-in user.

### 6.3 Categories
- Predefined categories (e.g. Work, Personal, Health, Learning) stored in a
  relational (PostgreSQL) database.
- A task can be assigned one or more categories.
- Categories and their assignment to tasks are modeled with a proper
  primary key / foreign key relationship.

### 6.4 AI Scheduling Suggestions
- User can request AI-generated suggestions for prioritizing today's
  incomplete tasks.
- The backend sends the task list to an LLM with a structured prompt and
  parses a structured JSON response (priority + reasoning per task).

## 7. Success Criteria
- A new user can sign up, log in, and see an empty task list within seconds.
- A user can add, edit, complete, and delete a task without errors.
- Data persists correctly across logout/login and page refresh.
- Category assignment correctly reflects in a joined query.
- AI suggestion feature returns a valid, parseable response for a non-empty
  task list.

## 8. Tech Stack
- Frontend: React (Vite), React Router, Axios
- Backend: Node.js, Express
- Databases: MongoDB (users, tasks), PostgreSQL (categories)
- Auth: JWT, bcrypt
- AI: Anthropic Claude API
- Deployment: Vercel (frontend), Render (backend), MongoDB Atlas + Neon (databases)

## 9. Risks / Constraints
- Free-tier hosting (Render) has cold-start delays after inactivity.
- LLM responses must be validated/parsed defensively since output format
  cannot be 100% guaranteed.
__________________________________________________________END_________________________________________________________________