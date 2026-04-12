# Klarity — Workforce Intelligence for SMEs

> AI-powered team management for small businesses. Real-time visibility for managers. Zero friction for employees.

**Live Demo:** https://klarity-five.vercel.app/
**Backend API:** https://klarity-production-1c11.up.railway.app/

---

## Demo Credentials

| Role | Phone | Password |
|------|-------|----------|
| Manager | +910000000001 | manager123 |
| Employee | +910000000002 | emp123 |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite |
| Backend | FastAPI (Python) |
| Database | MySQL (Railway) |
| AI Insights | Groq — Llama 3.3 70B |
| Notifications | Meta WhatsApp Cloud API v25.0 |
| Auth | JWT + bcrypt |
| Deployment | Railway + Vercel |

---

## Features

### Manager
- Team dashboard with employee health scores and completion rates
- Create, assign, remind, and reassign tasks
- WhatsApp notifications sent automatically on task assignment
- AI Advisor — strategic team insights powered by Groq
- Analytics — completion trends, priority breakdown, weekly charts
- Employee detail view with AI behavioral insights
- Generate and print team performance report
- Personal task list

### Employee
- View and manage assigned tasks
- Update task status via WhatsApp (reply START or DONE)
- Personal analytics and performance calendar
- AI Coach — personal feedback and coaching insights

---

## WhatsApp Flow

1. Manager assigns task → employee gets WhatsApp message
2. Employee replies **START** → In Progress
3. Employee replies **DONE** → Done
4. Dashboard updates in real time

---

Built for Supervity CodeQuesters 2026 Hackathon.
