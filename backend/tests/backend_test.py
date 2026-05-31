"""
Backend sanity tests for Leonida Vice (GTA 6 fansite).
Backend is intentionally minimal: /api/ root and /api/status only.
"""
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "http://localhost:8001").rstrip("/")


# Sanity: root endpoint
def test_api_root_returns_hello_world():
    resp = requests.get(f"{BASE_URL}/api/", timeout=15)
    assert resp.status_code == 200, f"Expected 200, got {resp.status_code}: {resp.text}"
    data = resp.json()
    assert data.get("message") in ("Hello World", "Leonida Vice API")


# Status check create + retrieval
def test_status_check_create_and_list():
    payload = {"client_name": "TEST_pytest_sanity"}
    create = requests.post(f"{BASE_URL}/api/status", json=payload, timeout=15)
    assert create.status_code == 200, f"POST /api/status failed: {create.status_code} {create.text}"
    created = create.json()
    assert created["client_name"] == payload["client_name"]
    assert "id" in created and isinstance(created["id"], str)
    assert "timestamp" in created

    listing = requests.get(f"{BASE_URL}/api/status", timeout=15)
    assert listing.status_code == 200
    arr = listing.json()
    assert isinstance(arr, list)
    assert any(item.get("id") == created["id"] for item in arr), "Created status not present in GET listing"
