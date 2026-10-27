from __future__ import annotations

from fastapi.testclient import TestClient

from app.models import User
from app.security import verify_password


def _register(client: TestClient, email: str = "alex@example.com") -> dict:
    response = client.post(
        "/auth/register",
        json={"full_name": "Alex Example", "email": email, "password": "TestPassword123!"},
    )
    assert response.status_code == 201, response.text
    return response.json()


def test_register_hashes_password_and_never_returns_hash(client, db_session):
    user_data = _register(client)
    assert user_data["email"] == "alex@example.com"
    assert "password" not in user_data
    assert "hashed_password" not in user_data

    user = db_session.query(User).filter_by(email="alex@example.com").one()
    assert user.hashed_password != "TestPassword123!"
    assert verify_password("TestPassword123!", user.hashed_password)


def test_register_normalizes_email_and_rejects_duplicate(client):
    first = _register(client, "  Alex@Example.com  ")
    assert first["email"] == "alex@example.com"

    duplicate = client.post(
        "/auth/register",
        json={"full_name": "Another Alex", "email": "ALEX@example.com", "password": "AnotherPassword123!"},
    )
    assert duplicate.status_code == 409


def test_register_rejects_short_password(client):
    response = client.post(
        "/auth/register",
        json={"full_name": "Alex", "email": "short@example.com", "password": "short"},
    )
    assert response.status_code == 422


def test_json_login_and_me_endpoint(client):
    _register(client)
    login = client.post(
        "/auth/login",
        json={"email": "ALEX@example.com", "password": "TestPassword123!"},
    )
    assert login.status_code == 200, login.text
    token_data = login.json()
    assert token_data["token_type"] == "bearer"
    assert token_data["access_token"]
    assert token_data["user"]["email"] == "alex@example.com"
    assert "hashed_password" not in token_data["user"]

    me = client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {token_data['access_token']}"},
    )
    assert me.status_code == 200
    assert me.json()["id"] == token_data["user"]["id"]


def test_login_rejects_wrong_password(client):
    _register(client)
    response = client.post(
        "/auth/login",
        json={"email": "alex@example.com", "password": "wrong-password"},
    )
    assert response.status_code == 401


def test_oauth_form_login_for_swagger_authorize(client):
    _register(client)
    response = client.post(
        "/auth/token",
        data={"username": "alex@example.com", "password": "TestPassword123!"},
    )
    assert response.status_code == 200, response.text
    assert response.json()["access_token"]


def test_me_requires_a_valid_token(client):
    assert client.get("/auth/me").status_code == 401
    invalid = client.get(
        "/auth/me",
        headers={"Authorization": "Bearer definitely-not-a-jwt"},
    )
    assert invalid.status_code == 401


def test_user_can_update_only_their_profile_fields(client):
    registered = _register(client)
    login = client.post(
        "/auth/login",
        json={"email": "alex@example.com", "password": "TestPassword123!"},
    ).json()
    headers = {"Authorization": f"Bearer {login['access_token']}"}

    update = client.patch("/auth/me", json={"full_name": "Alex Updated"}, headers=headers)
    assert update.status_code == 200, update.text
    assert update.json()["full_name"] == "Alex Updated"
    assert update.json()["id"] == registered["id"]

    empty_update = client.patch("/auth/me", json={}, headers=headers)
    assert empty_update.status_code == 400
