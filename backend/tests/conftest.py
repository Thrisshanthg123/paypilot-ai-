import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool

from app.config import Settings
from app.database import Base
from app.main import create_app


@pytest.fixture
def settings():
    return Settings(
        app_env="test",
        database_url="sqlite://",
        ai_mode="mock",
        cors_origins=["http://localhost:5173"],
    )


@pytest.fixture
def client(settings):
    test_engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(test_engine)
    app = create_app(settings=settings, db_engine=test_engine)
    with TestClient(app) as test_client:
        yield test_client
    Base.metadata.drop_all(test_engine)
    test_engine.dispose()

