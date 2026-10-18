# TaskBoard — Verification & Testing Evidence

> [!TIP]
> **Complete Technical Documentation & Video Walkthrough:**  
> The comprehensive project documentation, live YouTube presentation link, architecture diagrams, and full verified testing reports have been consolidated into the primary project [README.md](README.md).

---

## 👨‍💻 Project Identity & Authorship
- **Author:** Krushna Sonawane
- **Repository:** [https://github.com/AGENT-BABA/TaskBoard](https://github.com/AGENT-BABA/TaskBoard)
- **Tech Stack:** FastAPI (Python 3.12), React 18 + Vite, PostgreSQL 16, Docker, Terraform 1.16, Kubernetes (Amazon EKS 1.31), Helm, Prometheus & Grafana.

---

## 📦 Master Capstone Deliverables Quick Index

| Module | Engineering Topic | Primary Source Code & Manifests | Verified Evidence / Screenshot | Status |
| :---: | :--- | :--- | :--- | :---: |
| **M1** | **Application (FastAPI + React + DB)** | [backend/](backend/), [frontend/](frontend/) | [List Table](docs/screenshots/01-TaskBoard-DashBoard.jpg), [Kanban](docs/screenshots/01-TaskBoard-DashBoard-02.jpg), [Analytics](docs/screenshots/01-TaskBoard-DashBoard-03.jpg) | Verified ✅ |
| **M2** | **Automated Testing & Code Quality** | [backend/tests/test_api.py](backend/tests/test_api.py), [conftest.py](backend/tests/conftest.py) | [Pytest 8/8 Passing](docs/screenshots/02-pytest-passing.jpg) | Verified ✅ |
| **M3** | **Git & GitHub Version Control** | [GitHub Repository](https://github.com/AGENT-BABA/TaskBoard), [.gitignore](.gitignore) | Semantic commit history (10+ commits) | Verified ✅ |
| **M4** | **Docker & Containerization** | [docker-compose.yml](docker-compose.yml), [backend/Dockerfile](backend/Dockerfile), [frontend/Dockerfile](frontend/Dockerfile) | [Compose Up Terminal](docs/screenshots/01-docker-compose-terminal.jpg) | Verified ✅ |
| **M5** | **CI/CD Automation Pipeline** | [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml) | [GitHub Actions Success](docs/screenshots/04-github-actions-success.jpg), [GHCR Packages](docs/screenshots/05-ghcr-packages.jpg) | Verified ✅ |
| **M6** | **DevSecOps Vulnerability Scan** | [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml) (Trivy Scan), Patched deps | [Trivy Backend Scan](docs/screenshots/03-trivy-backend-scan.jpg), [Trivy Frontend Scan](docs/screenshots/03-trivy-frontend-scan.jpg) | Verified ✅ |
| **M7** | **Terraform Infrastructure as Code** | [terraform/](terraform/) (`main.tf`, `variables.tf`, `outputs.tf`) | [Terraform Plan](docs/screenshots/06-terraform-plan.jpg), [EKS Console](docs/screenshots/07-aws-eks-console.jpg), [EC2 Nodes](docs/screenshots/08-aws-ec2-nodes.jpg) | Verified ✅ |
| **M8** | **Kubernetes & Helm Deployment** | [helm/taskboard/](helm/taskboard/), [k8s/namespace.yaml](k8s/namespace.yaml) | [Kubectl Pods](docs/screenshots/10-kubectl-pods-running.jpg), [Services & HPA](docs/screenshots/11-kubectl-svc-hpa.jpg), [Helm List](docs/screenshots/12-helm-list.jpg), [Browser on EKS](docs/screenshots/13-browser-taskboard-eks.jpg) | Verified ✅ |
| **M9** | **Observability (Prometheus & Grafana)** | [monitoring/](monitoring/) (`prometheus.yml`, `prometheus-values.yaml`, [monitoring/grafana/](monitoring/grafana/)) | [Curl Metrics](docs/screenshots/14-curl-metrics.jpg), [Prometheus Targets](docs/screenshots/15-prometheus-targets-01.jpg), [Grafana Dashboard](docs/screenshots/16-grafana-dashboard-remake.jpg) | Verified ✅ |
| **M10** | **Presentation & Project Documentation** | [demo/](demo/), [README.md](README.md), [Slide Deck (PPTX)](demo/TaskBoard_DevOps_Capstone_Presentation.pptx), [Web Deck (HTML)](docs/presentation.html) | [Live Video (MP4)](demo/presentation_video.mp4), [YouTube Stream](https://youtu.be/eweihmsbcKw), [Interactive Web Deck](docs/presentation.html) | Verified ✅ |

---

## 🔗 Key Links & Deliverables

- 📘 **Master Technical Documentation & Test Execution:** [README.md](README.md)
- 🎥 **Live Walkthrough Video:** [demo/presentation_video.mp4](demo/presentation_video.mp4) | [YouTube](https://youtu.be/eweihmsbcKw)
- 📊 **Executive Slide Deck:** [demo/TaskBoard_DevOps_Capstone_Presentation.pptx](demo/TaskBoard_DevOps_Capstone_Presentation.pptx)
- 🌐 **Interactive Web Presentation Deck:** [docs/presentation.html](docs/presentation.html)
- 📋 **Grading Rubric Compliance:** [GRADING.md](GRADING.md)
