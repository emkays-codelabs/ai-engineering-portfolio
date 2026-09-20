def _register_and_login(client, email="alice@example.com", password="a-valid-password"):
    client.post("/api/v1/auth/register", json={"email": email, "password": password})
    login_response = client.post(
        "/api/v1/auth/login", data={"username": email, "password": password}
    )
    return login_response.json()["access_token"]


def test_users_me_returns_the_authenticated_user(client):
    access_token = _register_and_login(client)

    response = client.get(
        "/api/v1/users/me", headers={"Authorization": f"Bearer {access_token}"}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["email"] == "alice@example.com"
    assert "hashed_password" not in body


def test_users_me_rejects_no_authorization_header(client):
    response = client.get("/api/v1/users/me")

    assert response.status_code == 401


def test_users_me_rejects_a_garbage_bearer_token(client):
    response = client.get(
        "/api/v1/users/me", headers={"Authorization": "Bearer not-a-real-token"}
    )

    assert response.status_code == 401
    assert response.json()["code"] == "INVALID_ACCESS_TOKEN"


def test_users_me_rejects_a_refresh_token_used_as_access_token(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "alice@example.com", "password": "a-valid-password"},
    )
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": "alice@example.com", "password": "a-valid-password"},
    )
    refresh_token = login_response.cookies.get("refresh_token")

    response = client.get(
        "/api/v1/users/me", headers={"Authorization": f"Bearer {refresh_token}"}
    )

    assert response.status_code == 401
