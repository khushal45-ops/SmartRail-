import google.generativeai as genai
import os
from fastapi import APIRouter

router = APIRouter()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-flash")

@router.post("")
async def chat(data: dict):
    user_msg = data.get("message", "")
    response = model.generate_content(
        f"You are SmartRail AI assistant. Help with train schedules, PNR status, seat availability, delays, and railway info. Be concise.\n\nUser: {user_msg}"
    )
    return {"response": response.text}
