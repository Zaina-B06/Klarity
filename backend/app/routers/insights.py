from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Task
from groq import Groq
import os

router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_employee_insights(employee_id: int, db: Session):
    employee = db.query(User).filter(User.id == employee_id).first()
    if not employee:
        return None

    tasks = db.query(Task).filter(Task.assigned_to == employee_id).all()
    if not tasks:
        return {"employee_id": employee_id, "name": employee.name, "insights": ["No tasks assigned yet."]}

    from datetime import datetime
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