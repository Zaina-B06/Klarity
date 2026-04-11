from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import PlainTextResponse
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
    try:
        entry = data["entry"][0]
        changes = entry["changes"][0]
        value = changes["value"]
        messages = value.get("messages", [])

        for message in messages:
            if message["type"] == "text":
                text = message["text"]["body"].strip().lower()
                from_number = message["from"]

                if text == "done":
                    return {"status": "received", "action": "task_done", "from": from_number}

    except Exception as e:
        print(f"Webhook error: {e}")

    return {"status": "ok"}

def send_whatsapp_message(to_number: str, message: str):
    url = f"https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages"
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
    response = requests.post(url, headers=headers, json=payload)
    return response.json()