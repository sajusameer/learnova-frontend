# Learnova — LMS Platform Frontend

**Learnova** is a modern Learning Management System (LMS) frontend built with **Next.js** and integrated with a **Strapi backend**.

The platform provides role-based learning experiences for **Admin, Content Manager, Instructor, and Student** users.

Students can explore courses, enroll in courses, complete lessons, track their learning progress, take quizzes, and view quiz results. Instructors and Content Managers can manage learning content, while Admin users have access to platform-level management features.

---

## 🚀 Live Application

**Frontend:**
https://learnova-frontend-mu.vercel.app

**Backend API:**
https://lms-backend-production-a418.up.railway.app

---

## 📦 Repository

**GitHub:**
https://github.com/sajusameer/learnova-frontend

**Backend Repository:**
https://github.com/sajusameer/lms-backend

---

## 🛠️ Tech Stack

* **Framework:** Next.js
* **UI Library:** React
* **Language:** JavaScript
* **Styling:** Tailwind CSS
* **UI Components:** DaisyUI
* **Animations:** Framer Motion
* **Icons:** Lucide React
* **API Communication:** REST API
* **Backend / CMS:** Strapi
* **Database:** PostgreSQL
* **Authentication:** Strapi Users & Permissions
* **Hosting:** Vercel
* **Version Control:** Git & GitHub

---

# 🎯 Project Overview

Learnova is designed as a complete LMS experience with separate functionality for different user roles.

### User Roles

| Role            | Main Responsibilities                                         |
| --------------- | ------------------------------------------------------------- |
| Admin           | Manage users, roles, courses, lessons, quizzes and blog posts |
| Content Manager | Manage courses, lessons, quizzes and blog posts               |
| Instructor      | Manage own courses, lessons and quizzes                       |
| Student         | Enroll, learn, track progress and take quizzes                |

The frontend communicates with the Strapi backend through REST APIs.

```text
┌──────────────────────┐
│   Learnova Frontend  │
│      Next.js         │
└──────────┬───────────┘
           │
           │ REST API
           ▼
┌──────────────────────┐
│   Strapi Backend     │
│       Railway        │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│     PostgreSQL       │
└──────────────────────┘
```

---

# ✨ Core Features

## 🔐 Authentication

* User registration
* User login
* Logout
* Authentication state management
* Protected routes
* Role-based navigation
* Automatic redirect after logout
* Unauthorized users are prevented from accessing protected areas

After logout, users are redirected to the public Learnova homepage.

---

# 📚 Course Learning

Students can:

* Browse available courses
* View course details
* Enroll in courses
* View enrolled courses
* Open course lessons
* Complete lessons sequentially
* Track course progress

Course information is retrieved from the Strapi backend.

---

# 📈 Progress Tracking

Learnova provides persistent lesson progress tracking.

Students can mark lessons as completed.

For each course, progress is calculated based on completed lessons.

Example:

```text
3 completed lessons
------------------- × 100
5 total lessons

= 60%
```

Progress is stored in the backend so it remains available after refreshing or returning to the application.

---

# 📝 Quiz System

Students can take MCQ quizzes associated with courses.

The quiz flow includes:

1. Open quiz
2. Read questions
3. Select answers
4. Submit quiz
5. Receive automatic score
6. Store quiz result
7. View previous results

Quiz results are associated with the authenticated student.

---

# 👨‍🏫 Instructor Experience

Instructors can manage their own learning content.

Depending on their permissions, instructors can:

* Create courses
* Edit their own courses
* Delete their own courses
* Add lessons
* Edit lessons
* Delete lessons
* Create quizzes
* Manage quizzes
* View student progress

Backend ownership validation ensures that an instructor cannot modify another instructor's course.

---

# 📝 Content Manager Experience

Content Managers can manage platform learning content.

They can:

* Create courses
* Edit courses
* Delete courses
* Manage lessons
* Manage quizzes
* Create blog posts
* Edit blog posts
* Publish blog posts
* Delete blog posts

User management remains restricted to Admin users.

---

# 🛡️ Admin Experience

The Admin dashboard provides platform-level management.

Admin users can:

* View users
* Manage user roles
* Manage courses
* Manage lessons
* Manage quizzes
* Manage blog posts
* View platform statistics

Admin access is protected through role-based authorization.

---

# 📰 Blog

Learnova includes a blog system for educational content.

Content Managers and Admins can:

* Create posts
* Edit posts
* Save drafts
* Publish posts
* Delete posts

Public users and students can view published posts.

Draft posts are not displayed in the public blog.

---

# 🎨 Design System

Learnova uses a clean, modern educational SaaS design.

### Brand

**Product:** Learnova

**Tagline:**

> Learn. Build. Grow.

### Primary Color

```text
Indigo
#4F46E5
```

### Secondary Accent

```text
Cyan
#06B6D4
```

### Background

```text
#F8FAFC
```

### Main Text

```text
#0F172A
```

### Muted Text

```text
#64748B
```

The UI focuses on:

* Clean layouts
* Strong typography hierarchy
* Responsive cards
* Consistent spacing
* Subtle animations
* Accessible contrast
* Mobile-first responsiveness

---

# 📱 Responsive Design

The application is designed to work across:

* Desktop
* Laptop
* Tablet
* Mobile

Major sections and dashboards adapt to smaller screen sizes.

---

# 🗂️ Project Structure

The frontend follows a component-based Next.js structure.

```text
learnova-frontend/
│
├── public/
│
├── src/
│   ├── app/
│   │   ├── about/
│   │   ├── blog/
│   │   ├── courses/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── register/
│   │   └── ...
│   │
│   ├── components/
│   │   ├── common/
│   │   ├── home/
│   │   ├── courses/
│   │   ├── dashboard/
│   │   └── ...
│   │
│   ├── context/
│   │
│   ├── services/
│   │
│   └── ...
│
├── next.config.mjs
├── package.json
├── jsconfig.json
└── README.md
```

> The exact folder structure may evolve as the application grows.

---

# 🔄 Frontend Data Flow

Example: Student Enrollment

```text
Student
   │
   ▼
Course Details Page
   │
   ▼
Enroll Button
   │
   ▼
Next.js Frontend
   │
   │ POST Request
   ▼
Strapi REST API
   │
   ▼
Enrollment Record
   │
   ▼
PostgreSQL
   │
   ▼
API Response
   │
   ▼
Learnova UI
```

---

# 🔐 Role-Based Frontend Access

The frontend displays navigation and pages according to the authenticated user's role.

Example:

```text
Admin
   └── Admin Dashboard

Content Manager
   └── Content Management

Instructor
   └── Instructor Dashboard

Student
   └── Student Dashboard
```

However, frontend UI restrictions are not treated as the primary security mechanism.

The Strapi backend also validates permissions and ownership.

This provides defense in depth:

```text
Frontend Route Protection
          +
Backend Authorization
          =
Secure Role-Based Access
```

---

# 🌐 Environment Variables

Create a `.env.local` file in the project root.

Example:

```env
NEXT_PUBLIC_STRAPI_URL=https://lms-backend-production-a418.up.railway.app
```

For local development:

```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

Do not commit `.env.local` or other files containing private credentials.

---

# 💻 Getting Started

## Prerequisites

Make sure you have:

* Node.js
* npm
* Git

installed on your system.

---

## 1. Clone the Repository

```bash
git clone https://github.com/sajusameer/learnova-frontend.git
```

---

## 2. Navigate to the Project

```bash
cd learnova-frontend
```

---

## 3. Install Dependencies

```bash
npm install
```

---

## 4. Configure Environment Variables

Create:

```text
.env.local
```

Add:

```env
NEXT_PUBLIC_STRAPI_URL=https://lms-backend-production-a418.up.railway.app
```

For local backend development:

```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
```

---

## 5. Start Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🏗️ Production Build

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

---

# ▲ Vercel Deployment

The frontend is deployed on **Vercel**.

Deployment flow:

```text
GitHub
   │
   ▼
Vercel
   │
   ▼
Next.js Production Build
```

Production environment variable:

```text
NEXT_PUBLIC_STRAPI_URL
```

should point to the deployed Railway Strapi backend.

---

# 🧪 Testing Checklist

Before deployment, the main application flows should be tested.

### Authentication

* [ ] Register
* [ ] Login
* [ ] Logout
* [ ] Protected route access
* [ ] Unauthorized route handling

### Student

* [ ] Browse courses
* [ ] View course
* [ ] Enroll
* [ ] View My Courses
* [ ] Open lessons
* [ ] Complete lessons
* [ ] Verify progress
* [ ] Take quiz
* [ ] Submit quiz
* [ ] View quiz result

### Instructor

* [ ] Create course
* [ ] Edit own course
* [ ] Delete own course
* [ ] Add lesson
* [ ] Manage lessons
* [ ] Create quiz
* [ ] Manage quiz
* [ ] View student progress

### Content Manager

* [ ] Manage courses
* [ ] Manage lessons
* [ ] Manage quizzes
* [ ] Create blog post
* [ ] Save draft
* [ ] Publish blog post
* [ ] Edit blog post
* [ ] Delete blog post

### Admin

* [ ] View users
* [ ] Change user roles
* [ ] Manage courses
* [ ] Manage content
* [ ] Manage blog posts
* [ ] View platform statistics

---

# 🔒 Security Notes

The frontend does not assume that hiding a button is sufficient for authorization.

Protected actions are also validated by the Strapi backend.

Important backend protections include:

* Authentication validation
* Role-based permissions
* Instructor ownership validation
* Student data ownership
* Protected API operations

For example, an instructor attempting to modify another instructor's course is rejected by the backend.

---

# 🚀 Deployment

### Frontend

**Platform:** Vercel

**Live URL:**

https://learnova-frontend-mu.vercel.app/

### Backend

**Platform:** Railway

**API URL:**

https://lms-backend-production-a418.up.railway.app/

### Database

**PostgreSQL**

---

# 🎓 Assignment Features

Learnova was developed as an LMS project demonstrating:

* Authentication
* Four-role RBAC
* Course management
* Lesson management
* Student enrollment
* Lesson progress tracking
* Quiz auto-grading
* Quiz result persistence
* Admin dashboard
* Blog management
* Draft / Published workflow
* Backend ownership protection
* Responsive UI
* Production deployment

---

# 🎯 Project Goals

The goal of Learnova is to demonstrate practical full-stack development skills through a real-world LMS architecture.

The project focuses on:

* Clean frontend architecture
* REST API integration
* Secure authentication
* Role-based access control
* Persistent learning data
* Responsive user experience
* Production deployment
* Maintainable component-based UI

---

# 👩‍💻 Author

**Sajeda Begum**

Junior Full Stack Developer

**GitHub:**
https://github.com/sajusameer

**Portfolio:**
https://sajeda-portfolio-jqb2.vercel.app/

---

## 📄 License

This project was created for educational, portfolio, and job-assignment purposes.
