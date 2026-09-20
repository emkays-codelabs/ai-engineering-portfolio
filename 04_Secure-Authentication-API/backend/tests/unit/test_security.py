def test_hash_password_does_not_return_the_plain_text():
    from app.core.security import hash_password

    hashed = hash_password("correct-horse-battery-staple")

    assert hashed != "correct-horse-battery-staple"


def test_hash_password_output_verifies_against_the_original():
    from app.core.security import hash_password, verify_password

    hashed = hash_password("correct-horse-battery-staple")

    assert verify_password("correct-horse-battery-staple", hashed) is True


def test_verify_password_rejects_a_wrong_password():
    from app.core.security import hash_password, verify_password

    hashed = hash_password("correct-horse-battery-staple")

    assert verify_password("wrong-password", hashed) is False


def test_hash_password_salts_so_identical_passwords_hash_differently():
    from app.core.security import hash_password

    first = hash_password("same-password")
    second = hash_password("same-password")

    assert first != second


def test_create_access_token_encodes_subject_role_and_type():
    import uuid

    from app.core.security import create_access_token, decode_token

    user_id = uuid.uuid4()
    token = create_access_token(user_id=user_id, role="admin")
    payload = decode_token(token)

    assert payload["sub"] == str(user_id)
    assert payload["role"] == "admin"
    assert payload["type"] == "access"
    assert "jti" in payload
    assert "exp" in payload


def test_create_refresh_token_encodes_subject_and_type_refresh():
    import uuid

    from app.core.security import create_refresh_token, decode_token

    user_id = uuid.uuid4()
    token, jti = create_refresh_token(user_id=user_id)
    payload = decode_token(token)

    assert payload["sub"] == str(user_id)
    assert payload["type"] == "refresh"
    assert payload["jti"] == jti


def test_decode_token_raises_for_a_tampered_signature():
    import uuid

    import jwt
    import pytest

    from app.core.security import create_access_token, decode_token

    token = create_access_token(user_id=uuid.uuid4(), role="user")
    header, payload, signature = token.split(".")
    # Flip one char within the signature segment, preserving length/alphabet so
    # base64url decoding still succeeds — only the signature bytes are wrong.
    flipped_char = "A" if signature[0] != "A" else "B"
    tampered = f"{header}.{payload}.{flipped_char}{signature[1:]}"

    with pytest.raises(jwt.InvalidSignatureError):
        decode_token(tampered)


def test_decode_token_raises_for_an_expired_token(monkeypatch):
    import uuid
    from datetime import UTC, datetime, timedelta

    import jwt
    import pytest

    from app.core.config import Settings
    from app.core.security import decode_token

    settings = Settings()
    expired_payload = {
        "sub": str(uuid.uuid4()),
        "role": "user",
        "type": "access",
        "jti": "some-jti",
        "iat": datetime.now(UTC) - timedelta(minutes=30),
        "exp": datetime.now(UTC) - timedelta(minutes=15),
    }
    expired_token = jwt.encode(expired_payload, settings.secret_key, algorithm=settings.algorithm)

    with pytest.raises(jwt.ExpiredSignatureError):
        decode_token(expired_token)
