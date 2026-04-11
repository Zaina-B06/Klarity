from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Task, RoleEnum
from groq import Groq
import os
import time
from dotenv import load_dotenv
load_dotenv()

router = APIRouter()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def build_prompt(user, tasks):
    assigned = [t for t in tasks if t.assigned_to == user.id]
    if not assigned:
        return None

    done = [t for t in assigned if t.status == 'done']
    pending = [t for t in assigned if t.status == 'pending']
    in_progress = [t for t in assigned if t.status == 'in_progress']
    overdue = [t for t in assigned if
               t.status != 'done' and t.deadline and
               t.deadline.timestamp() < time.time()]
    rate = round((len(done) / len(assigned)) * 100) if assigned else 0

    task_details = "\n".join([
        f"- '{t.title}' | priority: {t.priority} | status: {t.status} | deadline: {t.deadline.strftime('%Y-%m-%d') if t.deadline else 'none'}"
        for t in assigned
    ])

    return f"""You are an AI workforce analyst for a small business manager.
Analyze this employee's task data and return exactly 2 short plain-English observations.

Employee: {user.name}
Total tasks: {len(assigned)}
Completed: {len(done)}
In progress: {len(in_progress)}
Pending: {len(pending)}
Overdue: {len(overdue)}
Completion rate: {rate}%

Task details:
{task_details}

Rules:
- Be direct and specific, not generic
- Each insight must be MAX 15 words — short and punchy
- No long explanations
- keep bullet points, numbers, labels
- Tone: direct manager assistant
"""

@router.get("/insights/{employee_id}")
def get_employee_insights(employee_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == employee_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Employee not found")

    tasks = db.query(Task).all()
    prompt = build_prompt(user, tasks)

    if not prompt:
        return {"employee_id": employee_id, "name": user.name, "insights": ["No tasks assigned yet."]}

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=200
        )
        raw = response.choices[0].message.content.strip()
        insights = [line.strip() for line in raw.split('\n') if line.strip()]
        return {"employee_id": employee_id, "name": user.name, "insights": insights[:2]}
    except Exception as e:
        print(f"Groq error: {e}")
        return {"employee_id": employee_id, "name": user.name, "insights": ["Unable to generate insights right now."]}

@router.get("/insights")
def get_all_insights(db: Session = Depends(get_db)):
    employees = db.query(User).filter(User.role == RoleEnum.employee).all()
    tasks = db.query(Task).all()
    results = []

    for user in employees:
        prompt = build_prompt(user, tasks)
        if not prompt:
            results.append({"employee_id": user.id, "name": user.name, "insights": ["No tasks assigned yet."]})
            continue
        try:
            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200
            )
            raw = response.choices[0].message.content.strip()
            insights = [line.strip() for line in raw.split('\n') if line.strip()]
            results.append({"employee_id": user.id, "name": user.name, "insights": insights[:2]})
        except Exception as e:
            print(f"Groq error for {user.name}: {e}")
            results.append({"employee_id": user.id, "name": user.name, "insights": ["Unable to generate insights right now."]})

    return results