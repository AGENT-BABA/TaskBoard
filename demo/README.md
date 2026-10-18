# 🎬 Module M10: Demo & Presentation Artifacts — TaskBoard

This directory contains the completed demonstration artifacts, presentation decks, and recorded capstone walkthrough for **Module M10** evaluation as defined in the course grading criteria.

---

## 📦 Verified Deliverables Index

| Deliverable | File / Resource | Description | Status |
|---|---|---|:---:|
| **Walkthrough Video (Local)** | [`presentation_video.mp4`](./presentation_video.mp4) | High-definition 1080p live walkthrough & capstone defense (7m 36s) | Complete ✅ |
| **Walkthrough Video (Stream)** | [Watch on YouTube](https://youtu.be/eweihmsbcKw) | Direct streaming link for rapid online evaluation | Live 🌐 |
| **Executive Slide Deck (PPTX)** | [`TaskBoard_DevOps_Capstone_Presentation.pptx`](./TaskBoard_DevOps_Capstone_Presentation.pptx) | 11 widescreen presentation slides covering architecture, CI/CD, and metrics | Complete ✅ |
| **Interactive Web Deck (HTML)** | [`presentation.html`](../docs/presentation.html) | Standalone responsive slide deck with Lightbox zoom and image switcher | Complete ✅ |

---

## 👨‍💻 Presenter & Project Identity

- **Presenter & Author:** Krushna Sonawane
- **Project Name:** TaskBoard — Production-Grade DevOps Microservices Pipeline
- **Repository:** [https://github.com/AGENT-BABA/TaskBoard](https://github.com/AGENT-BABA/TaskBoard)
- **Live Video URL:** [https://youtu.be/eweihmsbcKw](https://youtu.be/eweihmsbcKw)
- **Tech Stack:** FastAPI (Python), React 18 + Vite, PostgreSQL 16, Docker Compose, Pytest, GitHub Actions CI/CD with Aqua Trivy scanning, Terraform (AWS VPC & EKS), Helm v4, Prometheus, and Grafana.

---

## 📑 Presentation Structure Covered in Video

The recorded presentation covers all required assessment areas end-to-end:

1. **System Architecture & Stack:** Full-stack microservices architecture, Docker containerization, and PostgreSQL healthcheck synchronization.
2. **Automated Testing & Code Quality:** In-memory SQLite isolated Pytest test suite (8/8 tests passing in ~0.7s).
3. **CI/CD & DevSecOps Gate:** Multi-stage GitHub Actions workflow with automated Trivy container vulnerability scanning (0 High / 0 Critical CVEs) and GHCR image publishing.
4. **Live SaaS Application:** Interactive Agile Kanban board with real-time status transitions, custom project tracking, and sprint analytics.
5. **Infrastructure as Code (Terraform):** Modular AWS VPC and Amazon EKS cluster provisioning with automated lifecycle teardown to ensure zero runaway costs.
6. **Kubernetes Packaging (Helm):** Production Helm chart linting, multi-replica deployments, and Horizontal Pod Autoscaling (HPA).
7. **Production Observability:** Prometheus real-time target scraping (`UP 1/1`) and Grafana Executive Telemetry dashboard (p95 response latencies, request rates, status code distribution).
