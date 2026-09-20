def _register_and_login(client, email="alice@example.com", password="a-valid-password"):
    client.post("/api/v1/auth/register", json={"email": email, "password": password})
    login_response = client.post(
        "/api/v1/auth/login", data={"username": email, "password": password}
    )
    return login_response


def test_refresh_returns_a_new_access_token_and_rotates_the_cookie(client):
    login_response = _register_and_login(client)
    old_access_token = login_response.json()["access_token"]

    refresh_response = client.post("/api/v1/auth/refresh")

    assert refresh_response.status_code == 200
    new_access_token = refresh_response.json()["access_token"]
    assert new_access_token != old_access_token
    assert refresh_response.cookies.get("refresh_token") is not None


def test_refresh_rejects_replay_of_an_already_rotated_cookie(client):
    login_response = _register_and_login(client)
    original_refresh_cookie = login_response.cookies.get("refresh_token")

    first = client.post("/api/v1/auth/refresh")
    assert first.status_code == 200
    # client's cookie jar now holds the NEW rotated cookie from `first`'s response;
    # explicitly replay the original (now-revoked) one, as a stolen-token attacker would.
    client.cookies.set("refresh_token", original_refresh_cookie)
    replay = client.post("/api/v1/auth/refresh")

    assert replay.status_code == 401
    assert replay.json()["code"] == "INVALID_REFRESH_TOKEN"


def test_refresh_without_a_cookie_returns_401(client):
    response = client.post("/api/v1/auth/refresh")

    assert response.status_code == 401
    assert response.json()["code"] == "INVALID_REFRESH_TOKEN"
