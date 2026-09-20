def test_register_returns_201_and_the_created_user_without_the_password_hash(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "alice@example.com", "password": "a-valid-password"},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "alice@example.com"
    assert "password" not in body
    assert "hashed_password" not in body
    assert body["role"] == "user"
    assert body["is_active"] is True


def test_register_rejects_a_duplicate_email_with_409(client):
    client.post(
        "/api/v1/auth/register",
        json={"email": "dup@example.com", "password": "a-valid-password"},
    )

    response = client.post(
        "/api/v1/auth/register",
        json={"email": "dup@example.com", "password": "another-password"},
    )

    assert response.status_code == 409
    body = response.json()
    assert body["code"] == "EMAIL_ALREADY_REGISTERED"


def test_register_rejects_an_invalid_email_with_422(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "not-an-email", "password": "a-valid-password"},
    )

    assert response.status_code == 422


def test_register_rejects_a_too_short_password_with_422(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "bob@example.com", "password": "short"},
    )

    assert response.status_code == 422
