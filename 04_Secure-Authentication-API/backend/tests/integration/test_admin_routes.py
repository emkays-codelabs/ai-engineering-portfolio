def _register_and_login(client, email, password="a-valid-password"):
    client.post("/api/v1/auth/register", json={"email": email, "password": password})
    login_response = client.post(
        "/api/v1/auth/login", data={"username": email, "password": password}
    )
    return login_response.json()["access_token"]


def _promote_to_admin(client, email):
    from app.models.user import Role
    from app.repositories.user_repository import UserRepository

    db = client.session_factory()
    try:
        user = UserRepository(db).get_by_email(email)
        user.role = Role.ADMIN
        db.commit()
    finally:
        db.close()


def test_admin_users_list_returns_all_users_for_an_admin(client):
    admin_token = _register_and_login(client, "admin@example.com")
    _register_and_login(client, "regular@example.com")
    _promote_to_admin(client, "admin@example.com")

    response = client.get(
        "/api/v1/admin/users", headers={"Authorization": f"Bearer {admin_token}"}
    )

    assert response.status_code == 200
    emails = {u["email"] for u in response.json()}
    assert emails == {"admin@example.com", "regular@example.com"}


def test_admin_users_list_rejects_a_regular_user_with_403(client):
    regular_token = _register_and_login(client, "regular@example.com")

    response = client.get(
        "/api/v1/admin/users", headers={"Authorization": f"Bearer {regular_token}"}
    )

    assert response.status_code == 403
    assert response.json()["code"] == "INSUFFICIENT_ROLE"


def test_admin_users_list_rejects_unauthenticated_with_401(client):
    response = client.get("/api/v1/admin/users")

    assert response.status_code == 401
