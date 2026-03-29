import httpx
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

async def send_otp_email(to_email: str, volunteer_name: str, otp: str):
    """
    Sends a 6-digit OTP code to the restaurant owner using the Resend HTTP API.
    """
    if not settings.RESEND_API_KEY:
        logger.warning("RESEND_API_KEY is not set. Skipping OTP email dispatch.")
        return

    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {settings.RESEND_API_KEY}",
        "Content-Type": "application/json"
    }

    html_content = f"""
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Action Required: Verify Food Pickup</h2>
        <p>Volunteer <strong>{volunteer_name}</strong> has claimed your food rescue task and is on their way!</p>
        <p>Please verify their identity upon arrival and provide them with this secure pickup code:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="letter-spacing: 0.2em; color: #16a34a; margin: 0;">{otp}</h1>
        </div>
        <p>The volunteer must enter this code in their app to securely accept the delivery.</p>
        <p style="color: #6b7280; font-size: 0.875rem;">Thank you for fighting food waste!<br/>The SustainBite Team</p>
    </div>
    """

    payload = {
        "from": "SustainBite <onboarding@resend.dev>",
        "to": [to_email],
        "subject": "Volunteer Pickup OTP - The Hunger Signal",
        "html": html_content
    }

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(url, headers=headers, json=payload, timeout=10.0)
            if resp.status_code >= 400:
                logger.error(f"Resend error: {resp.text}")
            else:
                logger.info(f"OTP email sent to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send OTP email: {e}")
