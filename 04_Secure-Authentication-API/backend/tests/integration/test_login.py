def _register(client, email="alice@example.com", password="a-valid-password"):
    return client.post("/api/v1/auth/register", json={"email": email, "password": password})


def test_login_returns_access_token_and_sets_httponly_refresh_cookie(client):
    _register(client)

    response = client.post(
        "/api/v1/auth/login",
        data={"username": "alice@example.com", "password": "a-valid-password"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert "access_token" in body
    assert "refresh_token" not in body  # never in the JSON body — cookie only, per ADR-0002

    refresh_cookie = response.cookies.get("refresh_token")
    assert refresh_cookie is not None

    set_cookie_header = response.headers.get("set-cookie", "")
    assert "httponly" in set_cookie_header.lower()
    assert "samesite=strict" in set_cookie_header.lower()


def test_login_rejects_wrong_password_with_401(client):
    _register(client)

    response = client.post(
        "/api/v1/auth/login",
        data={"username": "alice@example.com", "password": "wrong-password"},
    )

    assert response.status_code == 401
    body = response.json()
    assert body["code"] == "INVALID_CREDENTIALS"


def test_login_rejects_unknown_email_with_401(client):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "nobody@example.com", "password": "whatever"},
    )

    assert response.status_code == 401
