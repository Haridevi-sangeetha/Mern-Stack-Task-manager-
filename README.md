# Task Management System (MERN Stack)

Technical Assessment Submission for MERN Stack Intern position.

## Project Description
A full-stack web application designed for task tracking and employee work assignment with separate Admin and Employee access controls.

- **Admin Module**: View employee list, assign new tasks, set priority levels (High/Medium/Low), track task statistics, search tasks, and filter by status or assigned employee.
- **Employee Module**: View personal assigned tasks, update task status (Not Started, Pending, In Progress, Completed).
- **Email Notifications**: Integrated with Nodemailer to alert employees on task assignment and alert administrators when an employee updates task status.
- **Search & Pagination**: Server-side filtering, search by title/description, and paginated listing.

---

## Tech Stack
- **Frontend**: React.js, Vite, Tailwind CSS, Lucide Icons, Axios
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Email Service**: Nodemailer

---

## Installation & Setup Instructions

### 1. Backend Setup
```bash
cd backend
npm install

# Create initial admin & employee accounts
npm run seed

# Run backend API server (Port 5000)
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Run Vite dev server (Port 3000)
npm run dev
```

---

## Default Login Credentials

- **Admin**: `admin@xplore.com` / `Admin@12345`
- **Employee 1**: `hari@xplore.com` / `User@12345`
- **Employee 2**: `jane@xplore.com` / `User@12345`
- **Employee 3**: `alex@xplore.com` / `User@12345`

---

## API Endpoints

### Auth
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Fetch current user info

### Users
- `GET /api/users/employees` - Get list of employees (Admin only)
- `POST /api/users/employees` - Register employee account (Admin only)

### Tasks
- `GET /api/tasks/stats` - Fetch task summary counts
- `GET /api/tasks/admin` - Fetch all tasks with search & pagination (Admin only)
- `GET /api/tasks/my-tasks` - Fetch assigned tasks for logged-in employee
- `POST /api/tasks` - Create task & send email notification (Admin only)
- `PUT /api/tasks/:id` - Edit task (Admin only)
- `PATCH /api/tasks/:id/status` - Update task status & notify admin
- `DELETE /api/tasks/:id` - Delete task (Admin only)
