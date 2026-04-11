from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import User, Task, StatusEnum
from datetime import datetime
import os
import requests
from dotenv import load_dotenv
load_dotenv()

router = APIRouter()

VERIFY_TOKEN = os.getenv("META_VERIFY_TOKEN")
WHATSAPP_TOKEN = os.getenv("META_WHATSAPP_TOKEN")
PHONE_NUMBER_ID = os.getenv("META_PHONE_NUMBER_ID")

@router.get("/whatsapp/webhook")
async def verify_webhook(request: Request):
    params = dict(request.query_params)
    mode = params.get("hub.mode")
    token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")
    if mode == "subscribe" and token == VERIFY_TOKEN:
        return PlainTextResponse(content=challenge)
    raise HTTPException(status_code=403, detail="Verification failed")

@router.post("/whatsapp/webhook")
async def receive_message(request: Request):
    data = await request.json()
    print(f"Webhook received: {data}")
    try:
        entry = data["entry"][0]
        changes = entry["changes"][0]
        value = changes["value"]
        messages = value.get("messages", [])

        for message in messages:
            if message["type"] == "text":
                text = message["text"]["body"].strip().upper()
                from_number = "+" + message["from"]

                db = SessionLocal()
                try:
                    user = db.query(User).filter(
                        User.phone_number == from_number
                    ).first()

                    if user:
                        # Get their most recent non-done task
                        task = db.query(Task).filter(
                            Task.assigned_to == user.id,
                            Task.status != StatusEnum.done
                        ).order_by(Task.created_at.desc()).first()

                        if task:
                            if text == "DONE":
                                task.status = StatusEnum.done
                                task.completed_at = datetime.utcnow()
                                db.commit()
                                send_reply(from_number, f"✅ Great work {user.name}! *{task.title}* marked as done.")
                            elif text == "START":
                                task.status = StatusEnum.in_progress
                                db.commit()
                                send_reply(from_number, f"▶️ Got it {user.name}! *{task.title}* is now in progress.")
                            else:
                                send_reply(from_number, "Reply *DONE* to complete your latest task or *START* to begin it.")
                        else:
                            send_reply(from_number, "✅ You have no pending tasks right now. Great work!")
                    else:
                        print(f"Unknown number: {from_number}")
                finally:
                    db.close()

    except Exception as e:
        print(f"Webhook error: {e}")

    return {"status": "ok"}

def send_reply(to_number: str, message: str):
    url = f"https://graph.facebook.com/v25.0/{PHONE_NUMBER_ID}/messages"
    headers = {
        "Authorization": f"Bearer {WHATSAPP_TOKEN}",
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
        print(f"Reply sent: {response.status_code}")
    except Exception as e:
        print(f"Reply error: {e}")