def test_create_persists_a_new_user(db_session):
    from app.repositories.user_repository import UserRepository

    repo = UserRepository(db_session)

    created = repo.create(email="alice@example.com", hashed_password="hashed-value")

    assert created.id is not None
    assert created.email == "alice@example.com"
    assert created.hashed_password == "hashed-value"


def test_get_by_email_returns_the_matching_user(db_session):
    from app.repositories.user_repository import UserRepository

    repo = UserRepository(db_session)
    repo.create(email="bob@example.com", hashed_password="h")

    found = repo.get_by_email("bob@example.com")

    assert found is not None
    assert found.email == "bob@example.com"


def test_get_by_email_returns_none_when_not_found(db_session):
    from app.repositories.user_repository import UserRepository

    repo = UserRepository(db_session)

    assert repo.get_by_email("nobody@example.com") is None


def test_get_by_id_returns_the_matching_user(db_session):
    from app.repositories.user_repository import UserRepository

    repo = UserRepository(db_session)
    created = repo.create(email="carol@example.com", hashed_password="h")

    found = repo.get_by_id(created.id)

    assert found is not None
    assert found.email == "carol@example.com"


def test_get_by_id_returns_none_when_not_found(db_session):
    import uuid

    from app.repositories.user_repository import UserRepository

    repo = UserRepository(db_session)

    assert repo.get_by_id(uuid.uuid4()) is None


def test_list_all_returns_every_user(db_session):
    from app.repositories.user_repository import UserRepository

    repo = UserRepository(db_session)
    repo.create(email="a@example.com", hashed_password="h")
    repo.create(email="b@example.com", hashed_password="h")

    users = repo.list_all()

    assert {u.email for u in users} == {"a@example.com", "b@example.com"}


def test_list_all_returns_empty_list_when_no_users(db_session):
    from app.repositories.user_repository import UserRepository

    repo = UserRepository(db_session)

    assert repo.list_all() == []
