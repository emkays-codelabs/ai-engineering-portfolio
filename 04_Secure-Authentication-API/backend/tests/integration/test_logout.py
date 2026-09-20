def _register_and_login(client, email="alice@example.com", password="a-valid-password"):
    client.post("/api/v1/auth/register", json={"email": email, "password": password})
    return client.post("/api/v1/auth/login", data={"username": email, "password": password})


def test_logout_returns_204_and_clears_the_refresh_cookie(client):
    _register_and_login(client)

    response = client.post("/api/v1/auth/logout")

    assert response.status_code == 204
    set_cookie_header = response.headers.get("set-cookie", "")
    assert "refresh_token=" in set_cookie_header


def test_logout_revokes_the_refresh_token_so_it_can_no_longer_be_used_to_refresh(client):
    login_response = _register_and_login(client)
    refresh_cookie = login_response.cookies.get("refresh_token")

    client.post("/api/v1/auth/logout")

    client.cookies.set("refresh_token", refresh_cookie)
    refresh_attempt = client.post("/api/v1/auth/refresh")

    assert refresh_attempt.status_code == 401
    assert refresh_attempt.json()["code"] == "INVALID_REFRESH_TOKEN"


def test_logout_without_a_cookie_still_returns_204(client):
    response = client.post("/api/v1/auth/logout")

    assert response.status_code == 204
