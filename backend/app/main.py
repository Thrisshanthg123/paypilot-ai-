from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app import models  # noqa: F401 - registers ORM models with Base.metadata
from app.api import router
from app.config import Settings, get_settings
from app.database import Base, engine, get_db


def create_app(settings: Settings | None = None, db_engine=None) -> FastAPI:
    settings = settings or get_settings()

    @asynccontextmanager
    async def lifespan(_application: FastAPI):
        Base.metadata.create_all(bind=active_engine)
        yield

    active_engine = db_engine or engine
    application = FastAPI(
        title=settings.app_name,
        version="1.0.0",
        description="FraudShield transaction risk, payment policy, and PayPal Sandbox API.",
        lifespan=lifespan,
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "Idempotency-Key"],
    )

    def _db_override():
        from sqlalchemy.orm import sessionmaker

        local_session = sessionmaker(bind=active_engine, autoflush=False, expire_on_commit=False)
        db: Session = local_session()
        try:
            yield db
        finally:
            db.close()

    application.dependency_overrides[get_db] = _db_override
    application.dependency_overrides[get_settings] = lambda: settings

    @application.get("/health")
    def health():
        try:
            with active_engine.connect() as connection:
                connection.execute(text("SELECT 1"))
        except SQLAlchemyError as exc:
            raise HTTPException(status_code=503, detail="Database is unavailable.") from exc
        return {
            "status": "ok",
            "service": settings.app_name,
            "environment": settings.app_env,
            "database": "connected",
            "ai_mode": settings.ai_mode,
            "paypal_configured": bool(settings.paypal_client_id and settings.paypal_client_secret),
        }

    application.include_router(router, prefix=settings.api_prefix)
    return application


app = create_app()

