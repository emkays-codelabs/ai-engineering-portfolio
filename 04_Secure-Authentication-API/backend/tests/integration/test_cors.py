def test_cors_allows_the_configured_frontend_origin_with_credentials(client):
    response = client.get("/health", headers={"Origin": "http://localhost:5173"})

    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"
    assert response.headers.get("access-control-allow-credentials") == "true"


def test_cors_does_not_reflect_an_unconfigured_origin(client):
    response = client.get("/health", headers={"Origin": "http://evil.example.com"})

    assert response.headers.get("access-control-allow-origin") != "http://evil.example.com"
