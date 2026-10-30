import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger("app.email_service")


class EmailService:
    @classmethod
    def verify_smtp_connection(cls) -> Dict[str, Any]:
        """Verify SMTP connectivity and authentication status."""
        if not settings.SMTP_HOST or not settings.SMTP_USER:
            return {
                "status": "UNCONFIGURED",
                "message": "SMTP host or user not configured",
                "host": settings.SMTP_HOST
            }
        
        try:
            if settings.SMTP_SSL:
                server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=8)
            else:
                server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=8)
                if settings.SMTP_TLS:
                    server.starttls()

            if settings.SMTP_PASSWORD:
                clean_pass = settings.SMTP_PASSWORD.replace(" ", "")
                server.login(settings.SMTP_USER, clean_pass)

            # Mask user email to prevent information disclosure
            masked_user = "configured"
            if settings.SMTP_USER:
                if "@" in settings.SMTP_USER:
                    parts = settings.SMTP_USER.split("@")
                    name = parts[0]
                    masked_name = name[0] + "***" + (name[-1] if len(name) > 1 else "")
                    masked_user = f"{masked_name}@{parts[1]}"
                else:
                    masked_user = settings.SMTP_USER[:2] + "***"

            server.quit()
            return {
                "status": "OPERATIONAL",
                "message": "SMTP server authenticated and reachable",
                "host": settings.SMTP_HOST,
                "port": settings.SMTP_PORT,
                "user": masked_user
            }
        except Exception as e:
            logger.error("SMTP connection check failed: %s", str(e))
            return {
                "status": "ERROR",
                "message": f"Connection failed: {str(e)[:100]}",
                "host": settings.SMTP_HOST,
                "port": settings.SMTP_PORT
            }

    @classmethod
    def send_login_otp_email(
        cls,
        to_email: str,
        otp_code: str,
        user_name: Optional[str] = None
    ) -> bool:
        """Send a 6-digit two-step verification code to the user's email address."""
        if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.warning("SMTP not fully configured; cannot dispatch live OTP email to %s", to_email)
            return False

        display_name = user_name or "Aayuraura Scholar"
        subject = f"Your Aayuraura Verification Code: {otp_code}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1310; color: #f1f6f2; margin: 0; padding: 24px; }}
            .container {{ max-width: 520px; margin: 0 auto; background: #131d17; border: 1px solid #233529; border-radius: 16px; padding: 32px; }}
            .header {{ text-align: center; margin-bottom: 24px; }}
            .brand {{ color: #4ade80; font-size: 20px; font-weight: bold; letter-spacing: 0.5px; }}
            .title {{ font-size: 18px; font-weight: 600; margin-top: 12px; color: #e2e8f0; }}
            .otp-box {{ background: #1b2a21; border: 1px solid #34d399; border-radius: 12px; padding: 18px; text-align: center; margin: 28px 0; }}
            .otp-code {{ font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #4ade80; font-family: 'Courier New', monospace; }}
            .notice {{ font-size: 13px; color: #94a3b8; line-height: 1.6; margin-top: 16px; }}
            .footer {{ border-top: 1px solid #233529; padding-top: 18px; margin-top: 28px; text-align: center; font-size: 11px; color: #64748b; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="brand">AAYURAURA</div>
              <div class="title">Two-Step Login Verification</div>
            </div>
            <p>Namaste {display_name},</p>
            <p class="notice">A login attempt was initiated for your Aayuraura account. Use the one-time verification code below to complete your sign in:</p>
            <div class="otp-box">
              <div class="otp-code">{otp_code}</div>
            </div>
            <p class="notice">
              <strong>Security Notice:</strong> This code will expire in <strong>{settings.OTP_EXPIRATION_MINUTES} minutes</strong> and can only be used once. Never share this code with anyone.
            </p>
            <p class="notice">
              If you did not initiate this login request, please secure your account immediately by resetting your password.
            </p>
            <div class="footer">
              &copy; Aayuraura &bull; BAMS Academic & Clinical Intelligence Platform
            </div>
          </div>
        </body>
        </html>
        """

        plain_text = f"""
Namaste {display_name},

Your Aayuraura login verification code is: {otp_code}

This code is valid for {settings.OTP_EXPIRATION_MINUTES} minutes.
If you did not request this, please change your password immediately.

Aayuraura Platform Security
        """

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
            msg["To"] = to_email

            msg.attach(MIMEText(plain_text, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            clean_pass = settings.SMTP_PASSWORD.replace(" ", "")

            if settings.SMTP_SSL:
                server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=12)
            else:
                server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=12)
                if settings.SMTP_TLS:
                    server.starttls()

            server.login(settings.SMTP_USER, clean_pass)
            server.sendmail(settings.SMTP_FROM_EMAIL, [to_email], msg.as_string())
            server.quit()
            logger.info("Successfully sent OTP email to %s", to_email)
            return True
        except Exception as e:
            logger.error("Failed to send OTP email to %s: %s", to_email, str(e))
            return False
