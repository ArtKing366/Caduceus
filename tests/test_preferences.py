from __future__ import annotations

from fastapi.testclient import TestClient


def _create_user_and_headers(client: TestClient, email: str) -> dict[str, str]:
    registration = client.post(
        "/auth/register",
        json={"full_name": "Test User", "email": email, "password": "TestPassword123!"},
    )
    assert registration.status_code == 201, registration.text
    login = client.post(
        "/auth/login",
        json={"email": email, "password": "TestPassword123!"},
    )
    assert login.status_code == 200, login.text
    return {"Authorization": f"Bearer {login.json()['access_token']}"}


def test_preference_crud(client):
    headers = _create_user_and_headers(client, "preferences@example.com")

    created = client.post(
        "/preferences",
        headers=headers,
        json={
            "preference_type": "allergy",
            "preference": "peanuts",
            "is_strict": True,
            "notes": "Avoid all peanut ingredients.",
        },
    )
    assert created.status_code == 201, created.text
    preference_id = created.json()["id"]
    assert created.json()["is_strict"] is True

    listing = client.get("/preferences", headers=headers)
    assert listing.status_code == 200
    assert len(listing.json()) == 1

    updated = client.patch(
        f"/preferences/{preference_id}",
        headers=headers,
        json={"is_strict": False, "notes": None},
    )
    assert updated.status_code == 200, updated.text
    assert updated.json()["is_strict"] is False
    assert updated.json()["notes"] is None

    deleted = client.delete(f"/preferences/{preference_id}", headers=headers)
    assert deleted.status_code == 204
    assert client.get("/preferences", headers=headers).json() == []


def test_duplicate_preference_is_rejected(client):
    headers = _create_user_and_headers(client, "duplicate-pref@example.com")
    payload = {"preference_type": "diet", "preference": "vegetarian", "is_strict": False}
    assert client.post("/preferences", headers=headers, json=payload).status_code == 201
    duplicate = client.post("/preferences", headers=headers, json=payload)
    assert duplicate.status_code == 409


def test_user_cannot_read_or_modify_another_users_preference(client):
    user_a_headers = _create_user_and_headers(client, "user-a@example.com")
    created = client.post(
        "/preferences",
        headers=user_a_headers,
        json={"preference_type": "allergy", "preference": "walnuts", "is_strict": True},
    )
    assert created.status_code == 201
    preference_id = created.json()["id"]

    user_b_headers = _create_user_and_headers(client, "user-b@example.com")
    update = client.patch(
        f"/preferences/{preference_id}",
        headers=user_b_headers,
        json={"preference": "not-walnuts"},
    )
    assert update.status_code == 404

    delete = client.delete(f"/preferences/{preference_id}", headers=user_b_headers)
    assert delete.status_code == 404

    # The second user's list must not reveal the first user's preference.
    assert client.get("/preferences", headers=user_b_headers).json() == []


def test_preferences_require_authentication(client):
    assert client.get("/preferences").status_code == 401
    assert client.post(
        "/preferences",
        json={"preference_type": "diet", "preference": "vegan", "is_strict": False},
    ).status_code == 401
