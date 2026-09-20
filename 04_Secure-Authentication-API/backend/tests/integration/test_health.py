def test_health_returns_200_when_db_is_reachable(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_health_returns_503_when_db_is_unreachable(client):
    from app.core.database import get_db
    from app.main import app

    class _BrokenSession:
        def execute(self, *args, **kwargs):
            raise ConnectionError("simulated DB outage")

    def _broken_get_db():
        yield _BrokenSession()

    original_override = app.dependency_overrides[get_db]
    app.dependency_overrides[get_db] = _broken_get_db
    try:
        response = client.get("/health")
    finally:
        app.dependency_overrides[get_db] = original_override

    assert response.status_code == 503
    assert response.json() == {"status": "unavailable"}
