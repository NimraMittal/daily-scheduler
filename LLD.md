# Low-Level Design (LLD) — Daily Scheduler

## 1. Database Schemas

### 1.1 MongoDB — `User` collection
```js
{
  _id: ObjectId,
  name: String,        // required
  email: String,        // required, unique, lowercase
  password: String,     // required, bcrypt hash
  createdAt: Date,
  updatedAt: Date
}
```

### 1.2 MongoDB — `Task` collection
```js
{
  _id: ObjectId,
  user: ObjectId,        // references User._id
  title: String,          // required
  description: String,    // optional
  date: Date,              // required
  time: String,             // optional, "HH:MM"
  completed: Boolean,       // default false
  createdAt: Date,
  updatedAt: Date
}
```

### 1.3 PostgreSQL — `categories` table
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);
```

### 1.4 PostgreSQL — `task_categories` table (join table)
```sql
CREATE TABLE task_categories (
  task_id TEXT NOT NULL,               -- stores Mongo Task._id as text
  category_id INTEGER NOT NULL REFERENCES categories(id),
  PRIMARY KEY (task_id, category_id)
);
```

## 2. API Endpoints

### 2.1 Auth
| Method | Route | Auth required | Body | Response |
|---|---|---|---|---|
| POST | /api/auth/signup | No | `{ name, email, password }` | `{ token, user }` |
| POST | /api/auth/login | No | `{ email, password }` | `{ token, user }` |

### 2.2 Tasks
| Method | Route | Auth required | Body | Response |
|---|---|---|---|---|
| POST | /api/tasks | Yes | `{ title, description, date, time }` | created task |
| GET | /api/tasks | Yes | — | array of tasks for user |
| GET | /api/tasks/:id | Yes | — | single task |
| PUT | /api/tasks/:id | Yes | any updatable fields | updated task |
| DELETE | /api/tasks/:id | Yes | — | `{ msg }` |

### 2.3 Categories
| Method | Route | Auth required | Body | Response |
|---|---|---|---|---|
| GET | /api/categories | Yes | — | array of `{ id, name }` |
| POST | /api/categories/assign | Yes | `{ taskId, categoryId }` | `{ msg }` |
| GET | /api/categories/task/:taskId | Yes | — | array of categories for that task (JOIN) |

### 2.4 AI
| Method | Route | Auth required | Body | Response |
|---|---|---|---|---|
| POST | /api/ai/suggest | Yes | — | `{ suggestions: [{ title, priority, reason }] }` |

## 3. Key Function-Level Logic

### 3.1 `authMiddleware`
```
1. Read Authorization header.
2. If missing or doesn't start with "Bearer " → 401.
3. Extract token, verify with JWT_SECRET.
4. On success, attach decoded user id to req.user, call next().
5. On failure → 401.
```

### 3.2 Signup
```
1. Validate name/email/password present.
2. Check if email already exists → 400 if so.
3. Hash password with bcrypt (salt rounds: 10).
4. Create User document.
5. Sign JWT with { id: user._id }, 7 day expiry.
6. Return { token, user } (password excluded).
```

### 3.3 Task JOIN query (category lookup)
```sql
SELECT c.id, c.name
FROM task_categories tc
JOIN categories c ON c.id = tc.category_id
WHERE tc.task_id = $1;
```
Executed via parameterized query using the `pg` library's `Pool.query()`,
passing `taskId` as `$1` to prevent SQL injection.

### 3.4 AI suggestion flow
```
1. Fetch user's incomplete tasks from MongoDB.
2. Format tasks into a plain-text list for the prompt.
3. Send system prompt (role + strict JSON output instruction) + task list
   to Claude via the Anthropic Messages API.
4. Receive response text, attempt JSON.parse.
5. On parse failure, fall back to { suggestions: [] } rather than crashing.
6. Return parsed suggestions to frontend.
```

## 4. Frontend Component Structure
```
App
 └─ AuthProvider
     └─ BrowserRouter
         ├─ /login    → Login
         ├─ /signup   → Signup
         └─ /          → PrivateRoute
                          └─ Dashboard
                              ├─ task form (create/edit)
                              ├─ task list (grouped by date)
                              ├─ category selector per task
                              └─ "Suggest my day" (AI) panel
```

## 5. Error Handling Convention
- All backend route handlers wrapped in try/catch.
- Errors respond with appropriate HTTP status (400 validation, 401 auth,
  404 not found, 500 server error) and a `{ msg }` JSON body.
- Frontend surfaces `err.response?.data?.msg` in the UI where relevant.

## 6. Testing Checklist (manual)
1. Signup → login → CRUD a task → toggle complete → edit → delete.
2. Assign a category to a task, verify JOIN query returns correct category.
3. Request AI suggestions with 0 tasks → empty array, no crash.
4. Request AI suggestions with 2+ tasks → valid structured response.
5. Access `/` while logged out → redirected to `/login`.