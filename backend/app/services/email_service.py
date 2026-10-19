import smtplib
import secrets
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Tuple
from app.core.config import get_effective_smtp_config

logger = logging.getLogger("documind.email")

def generate_otp() -> str:
    """Generate a secure, random 6-digit numeric OTP."""
    return str(secrets.randbelow(900000) + 100000)

def send_otp_email(to_email: str, otp_code: str, purpose: str = "login") -> Tuple[bool, str]:
    """
    Send a real email containing a 6-digit OTP verification code.
    If SMTP credentials are provided, dispatches via real SMTP.
    If SMTP credentials are missing or SMTP fails, logs the OTP clearly for development/demo.
    """
    smtp_cfg = get_effective_smtp_config()
    
    subject_action = "Sign in to Folio" if purpose == "login" else "Complete your Folio registration"
    subject = f"{otp_code} is your Folio verification code"

    text_body = f"""Hello,

Use the following one-time verification code to {subject_action}:

    {otp_code}

This code will expire in 10 minutes.

If you didn't request this code, you can safely ignore this email.

— The Folio Document Intelligence Team
"""

    html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Folio Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F4F7FC; font-family: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0E1530;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #F4F7FC; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #FFFFFF; border-radius: 20px; box-shadow: 0 10px 40px rgba(14,21,48,0.08); border: 1px solid #E3E8F3; overflow: hidden;" cellspacing="0" cellpadding="0">
          
          <!-- Blue Brand Header Banner -->
          <tr>
            <td style="background-color: #2F5BFF; padding: 32px; text-align: center;">
              <div style="display: inline-block; width: 48px; height: 48px; background: #FFFFFF; border-radius: 14px; margin-bottom: 12px; line-height: 48px; text-align: center;">
                <span style="font-family: 'Sora', sans-serif; font-size: 26px; font-weight: 800; color: #2F5BFF;">F</span>
              </div>
              <h1 style="margin: 0; color: #FFFFFF; font-size: 22px; font-weight: 700; letter-spacing: -0.02em;">Folio Security Verification</h1>
              <p style="margin: 6px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Document Intelligence & Study Assistant</p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <p style="margin: 0 0 16px; font-size: 16px; color: #0E1530; font-weight: 600;">
                {subject_action}
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #5B6478; line-height: 1.55;">
                We received a request to verify your email address (<strong>{to_email}</strong>). Please enter the following 6-digit one-time code to proceed:
              </p>

              <!-- OTP Code Display Card -->
              <div style="background-color: #EAF0FF; border: 1.5px solid #C9D6FF; border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 24px;">
                <span style="font-family: 'Courier New', monospace; font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #1C3FCF; display: inline-block; padding-left: 8px;">
                  {otp_code}
                </span>
                <div style="font-size: 12px; color: #5B6478; margin-top: 8px; font-weight: 500;">
                  ⏱ Valid for 10 minutes
                </div>
              </div>

              <p style="margin: 0 0 12px; font-size: 13px; color: #5B6478; line-height: 1.5;">
                • Never share this verification code with anyone.<br>
                • If you did not make this request, you can safely disregard this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; border-top: 1px solid #EEF1F8; padding: 20px 32px; text-align: center; font-size: 12px; color: #8A94A6;">
              © 2026 Folio AI · Grounded Document Intelligence
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    # If real SMTP is configured, attempt sending
    if smtp_cfg["is_configured"]:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{smtp_cfg['from_name']} <{smtp_cfg['from_email']}>"
            msg["To"] = to_email

            part1 = MIMEText(text_body, "plain", "utf-8")
            part2 = MIMEText(html_body, "html", "utf-8")
            msg.attach(part1)
            msg.attach(part2)

            with smtplib.SMTP(smtp_cfg["host"], smtp_cfg["port"], timeout=12) as server:
                if smtp_cfg["tls"]:
                    server.starttls()
                server.login(smtp_cfg["user"], smtp_cfg["password"])
                server.send_message(msg)

            logger.info(f"Successfully sent real OTP email to {to_email}")
            return True, f"Real email sent to {to_email} via SMTP"
        except Exception as e:
            logger.error(f"Failed to send email via SMTP to {to_email}: {e}")
            # Fall through to logging fallback so user is not stuck
            print(f"\n==========================================")
            print(f"[REAL EMAIL OTP FALLBACK] TO: {to_email}")
            print(f"OTP CODE: {otp_code}")
            print(f"SMTP Error was: {e}")
            print(f"==========================================\n")
            return False, f"SMTP dispatch error: {str(e)}"
    else:
        # Development / Demo Fallback Mode
        logger.info(f"[DEV OTP CODE] To: {to_email} | Code: {otp_code} | Purpose: {purpose}")
        print(f"\n==========================================")
        print(f"[FOLIO DEV MODE EMAIL OTP] TO: {to_email}")
        print(f"6-DIGIT VERIFICATION CODE: {otp_code}")
        print(f"(Configure SMTP in Settings or .env to send real emails)")
        print(f"==========================================\n")
        return False, "SMTP credentials not configured. OTP printed to server terminal."

def send_test_email(to_email: str) -> Tuple[bool, str]:
    """Test the SMTP configuration by sending a quick greeting email."""
    smtp_cfg = get_effective_smtp_config()
    if not smtp_cfg["is_configured"]:
        return False, "SMTP is not configured. Please supply Host, Port, User, and Password."

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Folio — SMTP Test Message"
        msg["From"] = f"{smtp_cfg['from_name']} <{smtp_cfg['from_email']}>"
        msg["To"] = to_email

        body = f"""Hello,

This is a test email from your Folio Document Intelligence instance.
Your SMTP settings are correctly configured and working!

— Folio System
"""
        msg.attach(MIMEText(body, "plain", "utf-8"))

        with smtplib.SMTP(smtp_cfg["host"], smtp_cfg["port"], timeout=10) as server:
            if smtp_cfg["tls"]:
                server.starttls()
            server.login(smtp_cfg["user"], smtp_cfg["password"])
            server.send_message(msg)

        return True, f"Test email sent successfully to {to_email}!"
    except Exception as e:
        return False, f"SMTP connection failed: {str(e)}"
