import os
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db import Base, engine

# Ensure test SQLite database tables are created for testing
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_health():
    """Verify liveness probe endpoint returns UP status."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "UP"}

def test_root():
    """Verify root API service info."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "TaskBoard API"
    assert "version" in data

def test_create_task():
    """Verify task creation via POST /api/tasks."""
    payload = {
        "title": "Configure EKS Cluster",
        "description": "Set up VPC and worker nodes with Terraform",
        "priority": "HIGH",
        "assignee": "Krushna"
    }
    response = client.post("/api/tasks", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["priority"] == "HIGH"
    assert data["status"] == "TODO"
    assert data["assignee"] == "Krushna"
    assert "id" in data

def test_list_tasks():
    """Verify task listing via GET /api/tasks."""
    response = client.get("/api/tasks")
    assert response.status_code == 200
    tasks = response.json()
    assert isinstance(tasks, list)
    assert len(tasks) >= 1

def test_get_task_by_id():
    """Verify retrieving a single task by ID via GET /api/tasks/{id}."""
    post_res = client.post("/api/tasks", json={
        "title": "Setup Ingress",
        "description": "Route traffic to frontend and backend",
        "priority": "MEDIUM",
        "assignee": "Krushna"
    })
    task_id = post_res.json()["id"]

    get_res = client.get(f"/api/tasks/{task_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == task_id
    assert get_res.json()["title"] == "Setup Ingress"

def test_update_task():
    """Verify task status update via PUT /api/tasks/{id}."""
    post_res = client.post("/api/tasks", json={
        "title": "Run Trivy Security Scan",
        "priority": "HIGH",
        "assignee": "Krushna"
    })
    task_id = post_res.json()["id"]

    update_res = client.put(f"/api/tasks/{task_id}", json={"status": "IN_PROGRESS"})
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "IN_PROGRESS"

def test_task_stats():
    """Verify stats aggregation via GET /api/tasks/stats."""
    response = client.get("/api/tasks/stats")
    assert response.status_code == 200
    stats = response.json()
    assert "total" in stats
    assert "todo" in stats
    assert "inProgress" in stats
    assert "done" in stats
    assert stats["total"] >= 1

def test_delete_task():
    """Verify task deletion via DELETE /api/tasks/{id}."""
    post_res = client.post("/api/tasks", json={
        "title": "Temporary cleanup task",
        "priority": "LOW",
        "assignee": "Krushna"
    })
    task_id = post_res.json()["id"]

    del_res = client.delete(f"/api/tasks/{task_id}")
    assert del_res.status_code == 204

    get_res = client.get(f"/api/tasks/{task_id}")
    assert get_res.status_code == 404
