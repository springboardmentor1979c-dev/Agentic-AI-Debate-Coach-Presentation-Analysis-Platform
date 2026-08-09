from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.schemas_and_models import DBUser, DBUserProfile, UserRegister, UserLogin, Token, UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
async def register(user_in: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBUser).filter(DBUser.email == user_in.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = get_password_hash(user_in.password)
    new_user = DBUser(
        email=user_in.email,
        username=user_in.username,
        full_name=user_in.full_name,
        hashed_password=hashed_pw,
        role=user_in.role or "Learner",
        avatar_url=f"https://api.dicebear.com/7.x/bottts/svg?seed={user_in.username}"
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Create default user profile
    profile = DBUserProfile(
        user_id=new_user.id,
        experience_level="Intermediate",
        preferred_topics=["AI Ethics", "Economic Policy", "Global Trade"],
        presentation_domains=["Tech Pitching", "Keynote Address"],
        learning_goals=["Master 4-step rebuttal framework", "Reduce filler words to under 3/min"],
        coaching_preferences="Socratic & Constructive"
    )
    db.add(profile)
    await db.commit()

    token = create_access_token(subject=str(new_user.id))
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=new_user.id,
        username=new_user.username,
        role=new_user.role
    )

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(DBUser).filter(DBUser.email == credentials.email))
    user = result.scalars().first()
    
    if not user:
        # Auto register demo user for seamless UX if needed
        demo_pw = get_password_hash(credentials.password)
        user = DBUser(
            email=credentials.email,
            username=credentials.email.split("@")[0],
            full_name=credentials.email.split("@")[0].title(),
            hashed_password=demo_pw,
            role="Learner",
            avatar_url=f"https://api.dicebear.com/7.x/bottts/svg?seed={credentials.email}"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        
        profile = DBUserProfile(user_id=user.id)
        db.add(profile)
        await db.commit()
    elif not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(subject=str(user.id))
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        username=user.username,
        role=user.role
    )

@router.get("/oauth2/google", response_model=Token)
async def oauth_google_login(db: AsyncSession = Depends(get_db)):
    # Simulated OAuth2 login flow
    email = "oauth_user@debatecoach.ai"
    result = await db.execute(select(DBUser).filter(DBUser.email == email))
    user = result.scalars().first()
    
    if not user:
        user = DBUser(
            email=email,
            username="OAuthLearner",
            full_name="OAuth Verified Debater",
            hashed_password=get_password_hash("oauthpass123"),
            role="Learner",
            avatar_url="https://api.dicebear.com/7.x/bottts/svg?seed=oauth"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        db.add(DBUserProfile(user_id=user.id))
        await db.commit()

    token = create_access_token(subject=str(user.id))
    return Token(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        username=user.username,
        role=user.role
    )
