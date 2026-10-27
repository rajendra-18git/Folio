from datetime import datetime, timedelta
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.core.auth import get_current_user, get_optional_current_user
from app.core.config import settings, get_effective_smtp_config, set_runtime_smtp_config, set_runtime_gemini_key, set_runtime_gemini_model
from app.models.db_models import User, EmailVerificationOTP
from app.services.email_service import generate_otp, send_otp_email, send_test_email
from app.schemas.api_schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    AuthTokenResponse,
    SendOtpRequest,
    SendOtpResponse,
    VerifyOtpLoginRequest,
    RegisterWithOtpRequest,
    UpdateSmtpRequest,
    SmtpStatusResponse,
    GenericMessageResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(request: UserRegisterRequest, db: Session = Depends(get_db)):
    """Register a new user account with email and password."""
    normalized_email = request.email.strip().lower()
    
    # Check if user already exists
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists.",
        )
    
    # Hash password and store
    hashed = hash_password(request.password)
    new_user = User(
        email=normalized_email,
        hashed_password=hashed,
        full_name=request.full_name.strip() if request.full_name else None,
        is_active=True,
        is_verified=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create token
    token = create_access_token(data={"sub": new_user.id, "email": new_user.email})
    
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user),
    )

@router.post("/login", response_model=AuthTokenResponse)
def login_user(request: UserLoginRequest, db: Session = Depends(get_db)):
    """Authenticate with email and password to receive a JWT access token."""
    normalized_email = request.email.strip().lower()
    
    user = db.query(User).filter(User.email == normalized_email).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account has been disabled.",
        )
    
    token = create_access_token(data={"sub": user.id, "email": user.email})

    # Activate stored user API key immediately upon login
    if user.gemini_api_key:
        set_runtime_gemini_key(user.gemini_api_key)
    if user.gemini_model:
        set_runtime_gemini_model(user.gemini_model)

    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )

@router.post("/send-otp", response_model=SendOtpResponse)
def send_email_otp(request: SendOtpRequest, db: Session = Depends(get_db)):
    """Generate and dispatch a real email containing a 6-digit verification OTP."""
    normalized_email = request.email.strip().lower()
    if "@" not in normalized_email or "." not in normalized_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide a valid email address.",
        )

    # Invalidate any existing unused OTPs for this email and purpose
    db.query(EmailVerificationOTP).filter(
        EmailVerificationOTP.email == normalized_email,
        EmailVerificationOTP.purpose == request.purpose,
        EmailVerificationOTP.is_used == False,
    ).update({"is_used": True})
    db.commit()

    # Generate new OTP code
    otp_code = generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    new_otp = EmailVerificationOTP(
        email=normalized_email,
        otp_code=otp_code,
        purpose=request.purpose,
        expires_at=expires_at,
        is_used=False,
    )
    db.add(new_otp)
    db.commit()

    # Dispatch real email via SMTP service
    sent_success, msg = send_otp_email(normalized_email, otp_code, request.purpose)

    return SendOtpResponse(
        message=f"Verification code sent to {normalized_email}",
        email=normalized_email,
        expires_in_seconds=settings.OTP_EXPIRE_MINUTES * 60,
        email_sent=sent_success,
        debug_hint=otp_code if not sent_success else None,
    )

@router.post("/verify-otp-login", response_model=AuthTokenResponse)
def verify_otp_and_login(request: VerifyOtpLoginRequest, db: Session = Depends(get_db)):
    """Verify an email OTP code and sign in (or automatically create a verified account)."""
    normalized_email = request.email.strip().lower()
    otp_code = request.otp_code.strip()

    # Query for matching valid unused OTP
    otp_record = (
        db.query(EmailVerificationOTP)
        .filter(
            EmailVerificationOTP.email == normalized_email,
            EmailVerificationOTP.otp_code == otp_code,
            EmailVerificationOTP.is_used == False,
            EmailVerificationOTP.expires_at > datetime.utcnow(),
        )
        .order_by(EmailVerificationOTP.created_at.desc())
        .first()
    )

    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code. Please request a new code.",
        )

    # Mark OTP as redeemed
    otp_record.is_used = True

    # Find or auto-create verified user
    user = db.query(User).filter(User.email == normalized_email).first()
    if not user:
        random_pwd = hash_password(secrets.token_urlsafe(20))
        user = User(
            email=normalized_email,
            hashed_password=random_pwd,
            full_name=normalized_email.split("@")[0].capitalize(),
            is_active=True,
            is_verified=True,
        )
        db.add(user)
    else:
        user.is_verified = True

    db.commit()
    db.refresh(user)

    # Issue JWT Token
    token = create_access_token(data={"sub": user.id, "email": user.email})

    # Activate stored user API key immediately upon OTP login
    if user.gemini_api_key:
        set_runtime_gemini_key(user.gemini_api_key)
    if user.gemini_model:
        set_runtime_gemini_model(user.gemini_model)

    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )

@router.post("/register-with-otp", response_model=AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def register_with_verified_otp(request: RegisterWithOtpRequest, db: Session = Depends(get_db)):
    """Register and activate an account verified via email OTP."""
    normalized_email = request.email.strip().lower()
    otp_code = request.otp_code.strip()

    # Check if user already exists
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please sign in instead.",
        )

    # Verify OTP
    otp_record = (
        db.query(EmailVerificationOTP)
        .filter(
            EmailVerificationOTP.email == normalized_email,
            EmailVerificationOTP.otp_code == otp_code,
            EmailVerificationOTP.is_used == False,
            EmailVerificationOTP.expires_at > datetime.utcnow(),
        )
        .order_by(EmailVerificationOTP.created_at.desc())
        .first()
    )

    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code.",
        )

    otp_record.is_used = True

    hashed = hash_password(request.password)
    new_user = User(
        email=normalized_email,
        hashed_password=hashed,
        full_name=request.full_name.strip() if request.full_name else None,
        is_active=True,
        is_verified=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(data={"sub": new_user.id, "email": new_user.email})

    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(new_user),
    )

@router.get("/smtp-status", response_model=SmtpStatusResponse)
def get_smtp_status():
    """Check current SMTP configuration status."""
    cfg = get_effective_smtp_config()
    return SmtpStatusResponse(
        is_configured=cfg["is_configured"],
        smtp_host=cfg["host"],
        smtp_port=cfg["port"],
        smtp_user=cfg["user"],
        smtp_from_email=cfg["from_email"],
    )

@router.post("/smtp-config", response_model=GenericMessageResponse)
def update_smtp_configuration(req: UpdateSmtpRequest):
    """Update runtime SMTP credentials for real email delivery."""
    set_runtime_smtp_config(
        host=req.smtp_host,
        port=req.smtp_port,
        user=req.smtp_user,
        password=req.smtp_password,
        from_email=req.smtp_from_email,
    )
    cfg = get_effective_smtp_config()
    if cfg["is_configured"]:
        return GenericMessageResponse(message="SMTP credentials updated and real email delivery active.")
    return GenericMessageResponse(message="SMTP configuration updated.")

@router.post("/test-smtp", response_model=GenericMessageResponse)
def test_smtp_delivery(request: SendOtpRequest):
    """Send a real test email to check SMTP delivery connection."""
    normalized_email = request.email.strip().lower()
    success, msg = send_test_email(normalized_email)
    if success:
        return GenericMessageResponse(message=msg, success=True)
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Retrieve profile information for the authenticated user."""
    if current_user.gemini_api_key:
        set_runtime_gemini_key(current_user.gemini_api_key)
    if current_user.gemini_model:
        set_runtime_gemini_model(current_user.gemini_model)
    return UserResponse.model_validate(current_user)
