from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Task
from groq import Groq
import os
import json
from datetime import datetime

router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_employee_insights(employee_id: int, db: Session):
    employee = db.query(User).filter(User.id == employee_id).first()
    if not employee:
        return None

    tasks = db.query(Task).filter(Task.assigned_to == employee_id).all()
    if not tasks:
        return {"employee_id": employee_id, "name": employee.name, "insights": ["No tasks assigned yet."]}

    total = len(tasks)
    done = [t for t in tasks if t.status == 'done']
    pending = [t for t in tasks if t.status == 'pending']
    in_progress = [t for t in tasks if t.status == 'in_progress']
    overdue = [t for t in tasks if t.status != 'done' and t.deadline and t.deadline < datetime.utcnow()]
    high_priority = [t for t in tasks if t.priority == 'high']
    high_done = [t for t in high_priority if t.status == 'done']
    rate = round((len(done) / total) * 100) if total > 0 else 0

    prompt = f"""You are an HR analytics AI. Analyze this employee's work data and provide exactly 4 short, specific, actionable insights. Each insight should be 1 sentence. Be direct and data-driven. No bullet points, no numbering — just return 4 lines separated by newlines.

Employee: {employee.name}
Department: {employee.department or 'General'}
Total tasks: {total}
Completed: {len(done)} ({rate}%)
In progress: {len(in_progress)}
Pending: {len(pending)}
Overdue: {len(overdue)}
High priority tasks: {len(high_priority)} total, {len(high_done)} completed
Task titles: {', '.join([t.title for t in tasks[:8]])}

Generate 4 specific insights about performance, risk areas, strengths, and recommended actions."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300
        )
        raw = response.choices[0].message.content.strip()
        insights = [line.strip().lstrip('*•-').strip() for line in raw.split('\n') if line.strip()][:4]
        return {"employee_id": employee_id, "name": employee.name, "insights": insights}
    except Exception as e:
        return {"employee_id": employee_id, "name": employee.name, "insights": [f"AI analysis unavailable: {str(e)}"]}


@router.get("/insights")
def get_all_insights(db: Session = Depends(get_db)):
    employees = db.query(User).filter(User.role == 'employee').all()
    return [get_employee_insights(emp.id, db) for emp in employees]


@router.get("/insights/{employee_id}")
def get_insight(employee_id: int, db: Session = Depends(get_db)):
    result = get_employee_insights(employee_id, db)
    if not result:
        raise HTTPException(status_code=404, detail="Employee not found")
    return result


@router.get("/advisor")
def get_advisor_insights(db: Session = Depends(get_db)):
    employees = db.query(User).filter(User.role == 'employee').all()
    tasks = db.query(Task).all()

    employee_stats = []
    for emp in employees:
        emp_tasks = [t for t in tasks if t.assigned_to == emp.id]
        done = [t for t in emp_tasks if t.status == 'done']
        overdue = [t for t in emp_tasks if t.status != 'done' and t.deadline and t.deadline < datetime.utcnow()]
        in_progress = [t for t in emp_tasks if t.status == 'in_progress']
        rate = round((len(done) / len(emp_tasks)) * 100) if emp_tasks else 0
        employee_stats.append({
            'name': emp.name,
            'department': emp.department or 'General',
            'total': len(emp_tasks),
            'done': len(done),
            'overdue': len(overdue),
            'in_progress': len(in_progress),
            'rate': rate
        })

    total_tasks = len(tasks)
    total_done = len([t for t in tasks if t.status == 'done'])
    total_overdue = len([t for t in tasks if t.status != 'done' and t.deadline and t.deadline < datetime.utcnow()])
    team_rate = round((total_done / total_tasks) * 100) if total_tasks else 0

    prompt = f"""You are a senior HR and workforce management advisor AI. Analyze this team's performance data and generate actionable strategic advice for the manager.

Team data:
{chr(10).join([f"- {e['name']} ({e['department']}): {e['total']} tasks, {e['done']} done, {e['overdue']} overdue, {e['in_progress']} in progress, {e['rate']}% completion rate" for e in employee_stats])}

Total team tasks: {total_tasks}
Team completion rate: {team_rate}%
Overdue tasks: {total_overdue}

Generate exactly 6 specific, actionable strategic insights for the manager. Each insight must reference specific employee names and numbers, include a concrete recommended action, and be honest even if critical. Cover: workload distribution, performance risks, reassignment opportunities, hiring needs, burnout risks, and team strengths.

Respond ONLY with valid JSON, no markdown, no explanation:
{{
  "summary": "2-3 sentence executive summary of team health",
  "score": <number 0-100>,
  "insights": [
    {{
      "type": "warning|opportunity|risk|strength|action|hiring",
      "title": "Short title",
      "detail": "Specific insight with names and numbers",
      "action": "Recommended action"
    }}
  ]
}}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800
        )
        raw = response.choices[0].message.content.strip()
        clean = raw.replace('```json', '').replace('```', '').strip()
        parsed = json.loads(clean)
        return parsed
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/advisor/employee/{employee_id}")
def get_employee_advisor(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(User).filter(User.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    tasks = db.query(Task).filter(Task.assigned_to == employee_id).all()
    done = [t for t in tasks if t.status == 'done']
    overdue = [t for t in tasks if t.status != 'done' and t.deadline and t.deadline < datetime.utcnow()]
    in_progress = [t for t in tasks if t.status == 'in_progress']
    pending = [t for t in tasks if t.status == 'pending']
    rate = round((len(done) / len(tasks)) * 100) if tasks else 0
    high_priority = [t for t in tasks if t.priority == 'high']
    high_done = [t for t in high_priority if t.status == 'done']

    prompt = f"""You are a personal performance coach AI talking directly to an employee. Give them honest, warm, specific coaching based on their work data.

Employee: {employee.name}
Department: {employee.department or 'General'}
Total tasks: {len(tasks)}
Completed: {len(done)} ({rate}%)
In progress: {len(in_progress)}
Pending: {len(pending)}
Overdue: {len(overdue)}
High priority tasks: {len(high_priority)} total, {len(high_done)} completed
Task titles: {', '.join([t.title for t in tasks[:8]])}

Generate exactly 6 personal coaching insights. Speak directly to the employee using "you". Be warm but honest. Cover: what they're doing well, where they're falling behind, work habits, focus areas, motivation, and one specific tip.

Respond ONLY with valid JSON:
{{
  "summary": "2-3 sentence personal summary addressing the employee directly",
  "score": <number 0-100>,
  "insights": [
    {{
      "type": "strength|improve|warning|habit|motivation|focus",
      "title": "Short title",
      "detail": "Specific insight addressing employee directly with their data",
      "tip": "One concrete actionable tip"
    }}
  ]
}}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=800
        )
        raw = response.choices[0].message.content.strip()
        clean = raw.replace('```json', '').replace('```', '').strip()
        parsed = json.loads(clean)
        return parsed
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))