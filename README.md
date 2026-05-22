Klarity ⚡

AI-powered workforce intelligence platform for small teams — task management, real-time analytics, and AI advisor in one dual-role SaaS.

Live App | GitHub
What it does
Klarity is a full-stack workforce platform built for small teams who want visibility into productivity without changing how they work. It ships with two distinct experiences — one for managers, one for employees — built around five core modules:

Dual-Role Dashboards — Managers see team-wide analytics and performance; employees see their own workload, tasks, and progress
Task Management — Managers assign and track tasks; employees view, update, and complete them
AI Advisor — Powered by Groq's LLaMA 3, gives both managers and employees contextual insights, summaries, and recommendations
Analytics — Real-time performance tracking, workload visibility, and team productivity metrics
Reports — Generate employee and team performance reports
WhatsApp Notifications — Optional integration via WhatsApp Cloud API for task assignments and updates

Why I built it
Most workforce tools (Asana, Monday, ClickUp) overwhelm small teams with feature bloat. Klarity is an attempt at the opposite: a simple, AI-first platform that gives a 5-person team visibility into who's doing what, without the setup overhead. Built as a solo full-stack project to push myself on real production engineering — auth, deployment, AI integration, dual-role UI.
Tech Stack

Frontend: React (Vite), React Router, Axios, Context API for auth state
Backend: Python, FastAPI
Auth: JWT-based authentication
Database: MySQL
AI: Groq API (LLaMA 3) for the AI Advisor
Integrations: WhatsApp Cloud API (Meta)
Deployment: Backend on Railway, Frontend on Vercel
