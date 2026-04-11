from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Task, StatusEnum
from app.schemas import UserCreate, UserResponse, TaskCreate, TaskUpdate, TaskResponse
from datetime import datetime
from typing import List
import requests
import os

router = APIRouter()

def send_whatsapp_message(to_number: str, message: str):
    token = os.getenv("META_WHATSAPP_TOKEN")
    phone_id = os.getenv("META_PHONE_NUMBER_ID")
    url = f"https://graph.facebook.com/v25.0/{phone_id}/messages"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": to_number,
        "type": "text",
        "text": {"body": message}
    }
    try:
        response = requests.post(url, headers=headers, json=payload)
        print(f"WhatsApp response: {response.status_code} — {response.json()}")
    except Exception as e:
        print(f"WhatsApp error: {e}")

# --- User routes ---

@router.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.phone_number == user.phone_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    db_user = User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# --- Task routes ---

@router.post("/tasks", response_model=TaskResponse)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    assignee = db.query(User).filter(User.id == task.assigned_to).first()
    if not assignee:
        raise HTTPException(status_code=404, detail="Assigned user not found")
    db_task = Task(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)

    # Send WhatsApp notification
    deadline_str = db_task.deadline.strftime('%d %b %Y') if db_task.deadline else 'No deadline'
    priority_emoji = "🔴" if db_task.priority == "high" else "🟡" if db_task.priority == "medium" else "🟢"
    message = (
        f"👋 Hi {assignee.name}!\n\n"
        f"You have a new task assigned on *Klarity*.\n\n"
        f"📋 *{db_task.title}*\n"
        f"{priority_emoji} Priority: {db_task.priority.upper()}\n"
        f"📅 Deadline: {deadline_str}\n"
        f"{f'📝 {db_task.description}' if db_task.description else ''}\n\n"
        f"Reply with:\n"
        f"▶️ *START* — to mark as in progress\n"
        f"✅ *DONE* — to mark as complete\n\n"
        f"— Klarity Workforce"
)
    send_whatsapp_message(assignee.phone_number, message)

    return db_task

@router.get("/tasks", response_model=List[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    return db.query(Task).all()

@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.patch("/tasks/{task_id}/status", response_model=TaskResponse)
def update_task_status(task_id: int, update: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.status = update.status
    if update.status == StatusEnum.done:
        task.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task

@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}

@router.post("/tasks/{task_id}/remind")
def remind_employee(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    assignee = db.query(User).filter(User.id == task.assigned_to).first()
    if not assignee:
        raise HTTPException(status_code=404, detail="Assignee not found")

    deadline_str = task.deadline.strftime('%d %b %Y') if task.deadline else 'No deadline'
    priority_emoji = "🔴" if task.priority == "high" else "🟡" if task.priority == "medium" else "🟢"

    message = (
        f"⏰ *Reminder from Klarity*\n\n"
        f"Hi {assignee.name}! This is a reminder about your pending task.\n\n"
        f"📋 *{task.title}*\n"
        f"{priority_emoji} Priority: {task.priority.upper()}\n"
        f"📅 Deadline: {deadline_str}\n\n"
        f"Reply *DONE* when complete or *START* to begin.\n\n"
        f"— Klarity Workforce"
    )
    send_whatsapp_message(assignee.phone_number, message)
    return {"message": "Reminder sent successfully"}

@router.patch("/tasks/{task_id}/reassign")
def reassign_task(task_id: int, data: dict, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    new_assignee = db.query(User).filter(User.id == data["assigned_to"]).first()
    if not new_assignee:
        raise HTTPException(status_code=404, detail="User not found")
    task.assigned_to = data["assigned_to"]
    db.commit()
    db.refresh(task)

    # Notify new assignee via WhatsApp
    deadline_str = task.deadline.strftime('%d %b %Y') if task.deadline else 'No deadline'
    priority_emoji = "🔴" if task.priority == "high" else "🟡" if task.priority == "medium" else "🟢"
    message = (
        f"📋 *Task Reassigned to You on Klarity*\n\n"
        f"Hi {new_assignee.name}! A task has been assigned to you.\n\n"
        f"📋 *{task.title}*\n"
        f"{priority_emoji} Priority: {task.priority.upper()}\n"
        f"📅 Deadline: {deadline_str}\n\n"
        f"Reply *START* to begin or *DONE* when complete.\n\n"
        f"— Klarity Workforce"
    )
    send_whatsapp_message(new_assignee.phone_number, message)
    return task