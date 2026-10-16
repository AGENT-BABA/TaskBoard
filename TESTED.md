# TaskBoard — DevOps Verification & Testing Evidence

This document records the verification steps, test executions, screenshots, and live deployment evidence for the TaskBoard DevOps Capstone Project according to the criteria defined in [GRADING.md](GRADING.md).

---

## 👨‍💻 Project Identity & Authorship
- **Author:** Krushna Sonawane
- **Repository:** [https://github.com/AGENT-BABA/TaskBoard](https://github.com/AGENT-BABA/TaskBoard)
- **Stack:** FastAPI (Python 3.12/3.14), React + Vite, PostgreSQL 16, Docker, Terraform, Kubernetes (EKS), Helm, Prometheus & Grafana.

---

## 📦 Master Capstone Submission & Deliverables Index

The table below compiles all verified deliverables across Modules M1 through M10 into a centralized index. Every file path and evidence artifact is directly accessible:

| Module | Engineering Topic | Primary Source Code & Manifests | Verified Evidence / Screenshot | Status |
| :---: | :--- | :--- | :--- | :---: |
| **M1** | **Application (FastAPI + React + DB)** | [backend/](backend/), [frontend/](frontend/) | [Frontend Dashboard](docs/screenshots/01-TaskBoard-DashBoard.jpg) | Verified ✅ |
| **M2** | **Automated Testing & Code Quality** | [backend/tests/test_api.py](backend/tests/test_api.py), [conftest.py](backend/tests/conftest.py) | [Pytest 8/8 Passing](docs/screenshots/02-pytest-passing.jpg) | Verified ✅ |
| **M3** | **Git & GitHub Version Control** | [GitHub Repository](https://github.com/AGENT-BABA/TaskBoard), [.gitignore](.gitignore) | Semantic commit history (10+ commits) | Verified ✅ |
| **M4** | **Docker & Containerization** | [docker-compose.yml](docker-compose.yml), [backend/Dockerfile](backend/Dockerfile), [frontend/Dockerfile](frontend/Dockerfile) | [Compose Up Terminal](docs/screenshots/01-docker-compose-terminal.jpg) | Verified ✅ |
| **M5** | **CI/CD Automation Pipeline** | [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml) | [GitHub Actions Success](docs/screenshots/04-github-actions-success.jpg), [GHCR Packages](docs/screenshots/05-ghcr-packages.jpg) | Verified ✅ |
| **M6** | **DevSecOps Vulnerability Scan** | [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml) (Trivy Scan), Patched deps | [Trivy Backend Scan](docs/screenshots/03-trivy-backend-scan.jpg), [Trivy Frontend Scan](docs/screenshots/03-trivy-frontend-scan.jpg) | Verified ✅ |
| **M7** | **Terraform Infrastructure as Code** | [terraform/](terraform/) (`main.tf`, `variables.tf`, `outputs.tf`) | [Terraform Plan](docs/screenshots/06-terraform-plan.jpg), [EKS Console](docs/screenshots/07-aws-eks-console.jpg), [EC2 Nodes](docs/screenshots/08-aws-ec2-nodes.jpg) | Verified ✅ |
| **M8** | **Kubernetes & Helm Deployment** | [helm/taskboard/](helm/taskboard/), [k8s/namespace.yaml](k8s/namespace.yaml) | [Kubectl Pods](docs/screenshots/10-kubectl-pods-running.jpg), [Services & HPA](docs/screenshots/11-kubectl-svc-hpa.jpg), [Helm List](docs/screenshots/12-helm-list.jpg), [Browser on EKS](docs/screenshots/13-browser-taskboard-eks.jpg) | Verified ✅ |
| **M9** | **Observability (Prometheus & Grafana)** | [monitoring/](monitoring/) (`prometheus.yml`, `prometheus-values.yaml`, `grafana/`) | [Curl Metrics](docs/screenshots/14-curl-metrics.jpg), [Prometheus Targets](docs/screenshots/15-prometheus-targets-01.jpg), [Grafana Dashboard](docs/screenshots/16-grafana-dashboard-remake.jpg) | Verified ✅ |
| **M10** | **Presentation & Project Documentation** | [README.md](README.md), [TESTED.md](TESTED.md), [Slide Deck (PPTX)](TaskBoard_DevOps_Capstone_Presentation.pptx), [Web Deck (HTML)](docs/presentation.html) | [Interactive Web Presentation](docs/presentation.html) | Verified ✅ |

---

## 🌟 Key Engineering & Architectural Improvements (For Evaluation)

The following core fixes and production enhancements were implemented to ensure stability and security:

> [!IMPORTANT]
> ### 1. 🛠️ PostgreSQL Healthcheck & Container Race Condition Resolution
> **Problem Identified:**
> In the standard compose configuration, `backend` uses basic `depends_on: - postgres`. During initial volume bootstrap (`initdb`), PostgreSQL takes 1–2 seconds to create cluster files before listening on port 5432. Because Docker flags the container as "started" immediately upon process creation, the backend attempted to execute `alembic upgrade head` before PostgreSQL was ready to accept TCP connections, causing:
> ```text
> psycopg.OperationalError: connection to server at "172.22.0.2", port 5432 failed: Connection refused
> backend-1 exited with code 1
> ```
> **Production Fix Implemented:**
> Updated [docker-compose.yml](docker-compose.yml) with a native Docker healthcheck and explicit dependency condition:
> 1. Added `pg_isready -U taskboard -d taskboard` healthcheck to the `postgres` service with 2s interval and 10 retries.
> 2. Configured `backend` to depend on `postgres` with `condition: service_healthy`.
> 3. Added `restart: on-failure` for self-healing resilience.
> This guarantees deterministic, zero-crash startup across any fresh Linux, WSL, or macOS host.

> [!TIP]
> ### 2. ⚡ Frontend React Asynchronous Form Event Fix
> **Problem Identified:**
> In `frontend/src/main.jsx`, the task creation handler accessed `e.currentTarget` *after* awaiting `fetch()`. In React's synthetic event pooling/cleanup, `e.currentTarget` was cleared to `null` before the fetch promise resolved. This threw an unhandled `TypeError: Cannot read properties of null (reading 'reset')`, preventing `setShowForm(false)` from ever executing. As a result, the modal remained open, causing users to click submit repeatedly and create duplicate tasks.
> **Production Fix Implemented:**
> Captured the form reference synchronously prior to the async call: `const form = e.currentTarget;` allowing clean form reset and modal dismissal immediately upon task creation.

> [!NOTE]
> ### 3. 🎨 Dark/Light Mode & Modern SaaS Design System
> - Built a custom CSS design system in `frontend/src/styles.css` using modern CSS variables (`--bg-primary`, `--bg-card`, `--text-primary`, `--accent`, etc.).
> - Added an accessible theme toggle switch in the top-right header with state persistence in `localStorage`.
> - Imported modern Google Fonts (`Plus Jakarta Sans` and `Inter`) in `frontend/index.html`.
> - Added full sidebar navigation tabs (`Dashboard`, `My Tasks`, `Projects`, `Activity`) with dynamic filtering for Krushna's assigned tasks.

> [!NOTE]
> ### 4. 🗑️ Full REST CRUD Completion
> Implemented `DELETE /api/tasks/{id}` on both backend router and frontend UI (with interactive delete button `✕`), meeting the minimum 4 REST API methods requirement (GET, POST, PUT, DELETE).

> [!NOTE]
> ### 5. 🐍 Modern Python & Cross-Platform Wheel Compatibility
> Updated `backend/requirements.txt` to `psycopg[binary]>=3.2.3` ensuring seamless native builds across Linux/WSL running Python 3.14 as well as standard Docker containers running Python 3.12.

> [!IMPORTANT]
> ### 6. 🛡️ DevSecOps Automated Vulnerability Gate & Remediation (Backend & Frontend)
> **Problem Identified:**
> During CI/CD execution, Aqua Security Trivy scanned both container images and enforced strict security gates with `exit-code: 1`:
> 1. **Backend (`taskboard-backend`):** Caught 3 `HIGH` severity CVEs in transitive dependency `starlette` (version `0.41.3` bundled with `fastapi==0.115.6`):
>    - `CVE-2025-62727`: DoS via quadratic CPU exhaustion ($O(n^2)$) in HTTP Range headers.
>    - `CVE-2026-48818`: SSRF and credential leak via UNC paths in `StaticFiles`.
>    - `CVE-2026-54283`: DoS via unconstrained form field limits.
> 2. **Frontend (`taskboard-frontend`):** Caught 43 vulnerabilities (41 `HIGH`, 2 `CRITICAL`) in base image `nginx:1.27-alpine` (Alpine 3.21.3) across outdated system libraries (`libcrypto3`, `libssl3`, `musl`, `libexpat`, `c-ares`, `libpng`, `libxml2`, `zlib`).
> 3. **Workflow Dependency:** The starter template had `aquasecurity/trivy-action@0.30.0` which failed because upstream maintainers revoked and deleted `setup-trivy@v0.2.2`.
>
> In both cases, the pipeline halted with `exit-code: 1`, preventing vulnerable artifacts from reaching the container registry.
>
> **Production Fix Implemented:**
> 1. Upgraded `.github/workflows/ci-cd.yml` to `aquasecurity/trivy-action@v0.36.0` (pinned to immutable commit hashes).
> 2. **Backend Remediation:** Upgraded `fastapi>=0.143.0` and `prometheus-fastapi-instrumentator>=8.1.0` in `backend/requirements.txt` to pull patched `starlette>=1.8.0` (0 CVEs).
> 3. **Frontend Remediation:** Added `RUN apk upgrade --no-cache` to `frontend/Dockerfile` to upgrade all 22 system packages to their latest patched releases (0 CVEs).
> 4. Verified zero HIGH/CRITICAL vulnerabilities remaining while maintaining 100% test pass rate across all 8 Pytest tests.

---

## M1 & M4 — Local Full Stack & Docker Compose Verification

### 1. Stack Startup (`docker-compose.yml`)
- **Command:**
  ```bash
  docker compose up --build
  ```
- **Description:** Concurrently starts PostgreSQL 16 (with health check), FastAPI backend (runs Alembic migrations on boot), and React frontend (Nginx reverse proxy).
- **Startup Output:**
  ```text
  [+] Running 3/3
  ✔ Container taskboard-postgres-1  Healthy
  ✔ Container taskboard-backend-1   Started
  ✔ Container taskboard-frontend-1  Started
  ```
- **Terminal Startup Evidence:**
  ![Docker Compose Terminal](docs/screenshots/01-docker-compose-terminal.jpg)

### 2. Browser Verification
- **Frontend Dashboard:** `http://localhost:3000`
  - *Evidence:* Responsive SaaS UI rendering KPI cards, task list, category filters, and create modal in Dark/Light mode.
  - *Screenshot:*
    ![Frontend Dashboard](docs/screenshots/01-TaskBoard-DashBoard.jpg)
- **FastAPI Documentation:** `http://localhost:8000/docs`
  - *Evidence:* Swagger UI showing `/health`, `/ready`, `/metrics`, and `/api/tasks` (CRUD).

---

## M2 — Automated Testing & Code Quality

- **Test Suite Location:** `backend/tests/test_api.py`
- **Execution Command:**
  ```bash
  cd backend
  pytest -v
  ```
- **Test Architecture:**
  - Uses an isolated, in-memory SQLite database (`test.db`) with automatic schema initialization (`Base.metadata.create_all(bind=engine)`).
  - Tests run completely independent of the production PostgreSQL database.
- **Test Results (8 of 8 Passed — 100%):**
  - `tests/test_api.py::test_health` **PASSED** (Backend health check)
  - `tests/test_api.py::test_root` **PASSED** (Root endpoint)
  - `tests/test_api.py::test_create_task` **PASSED** (Task creation with validation)
  - `tests/test_api.py::test_list_tasks` **PASSED** (Task collection retrieval)
  - `tests/test_api.py::test_get_task_by_id` **PASSED** (Single task retrieval by ID)
  - `tests/test_api.py::test_update_task` **PASSED** (Status & title update)
  - `tests/test_api.py::test_task_stats` **PASSED** (KPI & statistics calculation)
  - `tests/test_api.py::test_delete_task` **PASSED** (Task deletion & 404 verification)
- **Evidence:**
  ![Pytest Passing](docs/screenshots/02-pytest-passing.jpg)

---

## M3 — Git & Repository Best Practices

- **Repository:** [https://github.com/AGENT-BABA/TaskBoard](https://github.com/AGENT-BABA/TaskBoard)
- **Commit History:** Follows semantic commit conventions (`feat`, `fix`, `chore`, `docs`).
- **Clean Hygiene:** Root `.gitignore` configured to exclude `.env`, `*.pyc`, `__pycache__`, `node_modules`, `.venv`, `test.db`, and `.terraform`.

---

## M5 & M6 — CI/CD Pipeline & DevSecOps (Trivy Scan)

- **Workflow:** `.github/workflows/ci-cd.yml`
- **Actions Run URL:** [https://github.com/AGENT-BABA/TaskBoard/actions](https://github.com/AGENT-BABA/TaskBoard/actions)
- **Pipeline Stages:**
  1. `test`: Pytest tests (8 passing) + React static build
  2. `build-scan-push`: Docker build + Trivy vulnerability scanning (`HIGH,CRITICAL` CVE check) + Push to GitHub Container Registry (GHCR)
  3. `deploy`: Helm upgrade on Kubernetes (safely gated until EKS cluster provisioning)

### DevSecOps Vulnerability Analysis & Remediation (M6 Rubric Evidence):
- **Trivy Targets:** Scanned both backend (`ghcr.io/agent-baba/taskboard-backend`) and frontend (`ghcr.io/agent-baba/taskboard-frontend`) container images.

#### 1. Backend Scan Findings & Remediation:
- **Findings:** Debian 13 base OS was completely clean (0 findings). In Python packages, Trivy identified 3 `HIGH` severity CVEs in `starlette` (`0.41.3`):
  - **CVE-2025-62727 (HIGH):** Denial of Service via quadratic CPU exhaustion in Range header parsing.
  - **CVE-2026-48818 (HIGH):** SSRF and credential leak in `StaticFiles`.
  - **CVE-2026-54283 (HIGH):** DoS via unconstrained form field limits.
- **Evidence:**
  ![Trivy Backend Scan](docs/screenshots/03-trivy-backend-scan.jpg)
- **Fix:** Bumped `fastapi>=0.143.0` and `prometheus-fastapi-instrumentator>=8.1.0` in `backend/requirements.txt`, pulling patched `starlette>=1.8.0`.

#### 2. Frontend Scan Findings & Remediation:
- **Findings:** Alpine 3.21.3 in `nginx:1.27-alpine` contained 43 vulnerabilities (41 `HIGH`, 2 `CRITICAL`) in outdated base system libraries (`libcrypto3`, `libssl3`, `musl`, `libexpat`, `c-ares`, `libpng`, `libxml2`, `zlib`).
  - **Criticals:** `CVE-2026-31789` (OpenSSL heap buffer overflow on 32-bit systems) in `libcrypto3` and `libssl3`.
  - **Highs:** Use-after-free in `c-ares` (`CVE-2026-33630`), heap overflow in `libpng` (`CVE-2025-64720`), XML DoS in `libxml2` (`CVE-2025-32414`), and buffer overflow in `zlib` (`CVE-2026-22184`).
- **Evidence:**
  ![Trivy Frontend Scan](docs/screenshots/03-trivy-frontend-scan.jpg)
- **Fix:** Added `RUN apk upgrade --no-cache` in `frontend/Dockerfile` which automatically fetches the latest security patches for all 22 system packages from Alpine's package repositories.
- **Enforced Security Gate:** The pipeline halted on each scan with `exit-code: 1` as configured, proving that vulnerable artifacts were successfully blocked from deployment until fully patched.

### 3. Pipeline Success & Container Registry Verification (M5 Rubric Evidence):
- **All Pipeline Jobs Passing:**
  - `test`: All 8 Pytest test cases passed + React Vite build compiled cleanly.
  - `build-scan-push`: Docker images built, Trivy scans passed with 0 CVEs on both images, and containers pushed to GHCR.
  - `deploy`: Pre-flight environment check passed.
- **Pipeline Run Evidence:**
  ![GitHub Actions Green Pipeline](docs/screenshots/04-github-actions-success.jpg)

- **GitHub Packages (GHCR) Publishing:**
  - `ghcr.io/agent-baba/taskboard-backend:<sha>`
  - `ghcr.io/agent-baba/taskboard-frontend:<sha>`
- **Registry Packages Evidence:**
  ![GHCR Packages](docs/screenshots/05-ghcr-packages.jpg)

---

## M7 — Terraform Infrastructure as Code (AWS EKS)

- **Region:** `ap-southeast-2` (Sydney — Target Region authorized by AWS Organization Service Control Policy `p-f7g6w0ns`)
- **Infrastructure Provisioned:**
  - **AWS VPC (`10.20.0.0/16`):** Multi-AZ subnets across `ap-southeast-2a` and `ap-southeast-2b` (`vpc-008a86094baf9ccbb`), Internet Gateway, and NAT Gateway.
  - **AWS EKS Cluster (`taskboard-eks`):** Kubernetes 1.31 control plane (`https://5888C3F87E8260980E71D8B9894312A2.gr7.ap-southeast-2.eks.amazonaws.com`).
  - **Managed Node Group (`main`):** 2x `t3.small` EC2 worker nodes (Auto Scaling: min 2, max 4, desired 2).
- **Execution Commands (PowerShell / Windows Native):**
  ```powershell
  cd terraform
  terraform init
  terraform validate
  terraform plan
  terraform apply -auto-approve
  ```

> [!NOTE]
> ### 🌐 Enterprise SCP Policy Compliance & Region Adjustment
> **Discovery:** During infrastructure provisioning, the AWS Organization enforced Service Control Policies (SCPs):
> 1. **SCP `p-f7g6w0ns`:** Restricts AWS resources to `ap-southeast-2` and restricts customer-managed KMS key creation.
> 2. **SCP `p-0iewlcrm`:** Restricts `iam:CreateOpenIDConnectProvider`.
> 3. **Account Free-Tier Policy:** Enforces free-tier eligible instance types (`t3.small`, `t3.micro`).
> **Fix Applied:** Configured `variables.tf` to `ap-southeast-2`, updated AZs, set `create_kms_key = false`, `create_cloudwatch_log_group = false`, `enable_irsa = false`, and used `instance_types = ["t3.small"]`. All 40+ resources provisioned cleanly and compliant with enterprise cloud guardrails.

### 1. Terraform Plan Evidence:
- **Plan Summary:** `Plan: 40 to add, 0 to change, 0 to destroy.` (VPC, EKS cluster, security groups, subnets, and node group).
- **Evidence:**
  ![Terraform Plan](docs/screenshots/06-terraform-plan.jpg)

### 2. Live AWS Cloud Infrastructure Verification:
- **AWS Console EKS Cluster:**
  - *Evidence:* AWS Console showing `taskboard-eks` in `Active` status with Kubernetes version 1.31 in `ap-southeast-2`.
  - *Screenshot:*
    ![AWS EKS Console](docs/screenshots/07-aws-eks-console.jpg)

- **AWS Console EC2 Worker Nodes:**
  - *Evidence:* EC2 instances console showing 2x `t3.small` worker nodes in `running` state.
  - *Screenshot:*
    ![AWS EC2 Worker Nodes](docs/screenshots/08-aws-ec2-nodes.jpg)

- **Kubectl Cluster Connectivity:**
  - *Evidence:* `kubectl get nodes -o wide` showing both nodes in `Ready` status with version `v1.31.14-eks-b9510e3`:
    - `ip-10-20-1-92.ap-southeast-2.compute.internal`: Ready
    - `ip-10-20-2-5.ap-southeast-2.compute.internal`: Ready
  - *Screenshot:*
    ![Kubectl Nodes](docs/screenshots/09-kubectl-nodes.jpg)

### 3. Clean Cloud Teardown Verification:
- **Teardown Execution Commands:**
  ```powershell
  cd terraform
  terraform destroy -auto-approve
  ```
- **Confirmation & Verification:**
  - Complete deletion of all 40 cloud resources (EKS cluster, managed node groups, VPC, subnets, NAT gateway, route tables, and security groups) ensuring zero runaway AWS costs.
  - Verification confirmed via AWS CLI:
    ```powershell
    aws eks describe-cluster --name taskboard-eks --region ap-southeast-2
    # Output: ResourceNotFoundException: No cluster found for name: taskboard-eks
    ```
  - Verification confirmed via Terraform State:
    ```powershell
    terraform state list
    # Output: (Empty - all managed resources successfully destroyed)
    ```

---

## M8 — Kubernetes Orchestration & Helm Deployment

- **Namespace:** `taskboard` (provisioned via [k8s/namespace.yaml](k8s/namespace.yaml))
- **Helm Chart Structure:** Complete chart in `helm/taskboard/` containing `Chart.yaml`, `values.yaml`, `values-dev.yaml`, `values-prod.yaml`, and templates.
- **Execution Commands:**
  ```bash
  kubectl apply -f k8s/namespace.yaml
  helm upgrade --install taskboard ./helm/taskboard -n taskboard
  ```
- **Deployment Verification:**
  - **Replicas:** Backend (2 replicas), Frontend (2 replicas), PostgreSQL (1 replica with schema migration).
  - **ClusterIP Services:** `backend` (8000), `taskboard-backend` (8000), `taskboard-frontend` (80), and `taskboard-postgres` (5432).
  - **Autoscaling (HPA):** `taskboard-backend` configured for CPU target 60%, min 2, max 6 replicas.
  - **Ingress:** Configured for `taskboard.local` routing `/` to `taskboard-frontend:80` and `/api` to `taskboard-backend:8000`.

### 1. Pods Running Verification:
- **Output:**
  ```text
  NAME                                           READY   STATUS    RESTARTS   AGE
  taskboard-frontend-6c44675f4f-crqbd            1/1     Running   0          10m
  taskboard-frontend-6c44675f4f-znv52            1/1     Running   0          10m
  taskboard-postgres-6cf6f7949f-j29gf            1/1     Running   0          10m
  taskboard-taskboard-backend-654ffbff47-khpl2   1/1     Running   2          10m
  taskboard-taskboard-backend-654ffbff47-l82hz   1/1     Running   2          10m
  ```
- **Evidence:**
  ![Kubectl Pods Running](docs/screenshots/10-kubectl-pods-running.jpg)

### 2. Services, HPA & Ingress Verification:
- **Output:**
  ```text
  NAME                         TYPE        CLUSTER-IP      PORT(S)
  service/backend              ClusterIP   172.20.54.7     8000/TCP
  service/taskboard-backend    ClusterIP   172.20.220.52   8000/TCP
  service/taskboard-frontend   ClusterIP   172.20.185.86   80/TCP
  service/taskboard-postgres   ClusterIP   172.20.73.1     5432/TCP

  NAME                                                    REFERENCE                                TARGETS              MINPODS   MAXPODS   REPLICAS
  horizontalpodautoscaler.autoscaling/taskboard-backend   Deployment/taskboard-taskboard-backend   cpu: <unknown>/60%   2         6         2

  NAME                                  CLASS   HOSTS             ADDRESS   PORTS
  ingress.networking.k8s.io/taskboard   nginx   taskboard.local             80
  ```
- **Evidence:**
  ![Kubectl Services and HPA](docs/screenshots/11-kubectl-svc-hpa.jpg)

### 3. Helm Release Verification:
- **Command:** `helm list -n taskboard`
- **Output:**
  ```text
  NAME     	NAMESPACE	REVISION	STATUS  	CHART          	APP VERSION
  taskboard	taskboard	1       	deployed	taskboard-1.0.0	1.0.0
  ```
- **Evidence:**
  ![Helm List](docs/screenshots/12-helm-list.jpg)

### 4. Application Verification on EKS:
- **Live Cluster Verification:** Port-forwarded `taskboard-frontend` to `http://localhost:3000`. Created and loaded production test task *"Verify AWS EKS Deployment"* connected directly to PostgreSQL running inside the EKS cluster.
- **Evidence:**
  ![Browser TaskBoard on EKS](docs/screenshots/13-browser-taskboard-eks.jpg)

---

## M9 — Observability (Prometheus & Grafana)

- **Architecture:**
  - Deployed `kube-prometheus-stack` via Helm in the `monitoring` namespace using custom lightweight values ([monitoring/prometheus-values.yaml](monitoring/prometheus-values.yaml)).
  - Provisioned Custom Resource Definitions (`servicemonitors.monitoring.coreos.com`) and deployed `ServiceMonitor/taskboard-taskboard-backend` in namespace `taskboard`.
  - Prometheus continuously scrapes FastAPI application metrics via `/metrics` on port 8000.
  - Grafana is configured with the internal Prometheus data source (`http://kube-prometheus-stack-prometheus.monitoring:9090`).

### 1. Application Metrics Endpoint Verification:
- **Metrics Endpoint:** `curl http://localhost:8000/metrics`
  - Fully exposed via `prometheus-fastapi-instrumentator`.
  - Exposes Python garbage collection, process CPU/memory, HTTP request counts, and latency histograms.
- **Evidence:**
  ![Curl Metrics](docs/screenshots/14-curl-metrics.jpg)

### 2. Prometheus Targets Scrape Verification:
- **Prometheus UI:** `http://localhost:9090/targets`
- **Verification:** Prometheus discovers and continuously scrapes the `taskboard-backend` endpoints showing status **`UP`** (1/1 active targets).
- **Evidence:**
  ![Prometheus Targets 01](docs/screenshots/15-prometheus-targets-01.jpg)
  ![Prometheus Targets 02](docs/screenshots/15-prometheus-targets-02.jpg)
  ![Prometheus Targets 03](docs/screenshots/15-prometheus-targets-03.jpg)

### 3. Grafana Live Metrics Dashboard:
- **Grafana UI:** `http://localhost:3001` (Credentials: `admin` / `admin`)
- **Executive Telemetry Dashboard:** Fully customized multi-panel monitoring dashboard visualizing real-time telemetry from the FastAPI backend:
  1. **p95 Response Latency (ms):** Radial gauge showing 95th-percentile API response latency (`95 ms`) with green/yellow/red threshold markers.
  2. **Total API Requests:** KPI stat card displaying total requests processed (`324` requests) with a live area trend sparkline.
  3. **HTTP Status Code Distribution:** Donut visualization showing clean status code distribution (`HTTP 2xx: 100%`, `HTTP 4xx: 0%`) with table metrics.
  4. **Request Throughput (req/sec):** Live time-series graph displaying traffic rates grouped by API endpoint (`/api/tasks`, `/health`, `/metrics`, `/docs`).
- **Evidence:**
  ![Grafana Executive Telemetry Dashboard](docs/screenshots/16-grafana-dashboard-remake.jpg)
  *Figure: TaskBoard Executive Telemetry Dashboard featuring real-time multi-panel telemetry.*

  <details>
  <summary>View Baseline / Cluster Grafana Dashboard</summary>

  ![Grafana Dashboard Baseline](docs/screenshots/16-grafana-dashboard.jpg)

  </details>

---

## M10 — Final Presentation & Documentation

### 1. Presentation Deliverables & Formats
- **PowerPoint Presentation Deck:** [TaskBoard_DevOps_Capstone_Presentation.pptx](TaskBoard_DevOps_Capstone_Presentation.pptx) — 11-slide enterprise presentation deck containing embedded screenshots for all modules M1–M10.
- **Interactive Web Slide Deck:** [docs/presentation.html](docs/presentation.html) — Standalone interactive slide deck with keyboard arrow navigation, 1-click full-screen zoom (Lightbox), and Prometheus multi-view slider.
- **Automated Deck Generator:** [scripts/generate_presentation.py](scripts/generate_presentation.py) — Python script utilizing `python-pptx` to programmatically build the deck.

### 2. Project Documentation Deliverables
- **System Architecture & Setup Manual:** [README.md](README.md) — Comprehensive technical guide covering application stack, API routes, setup commands, Docker, Kubernetes, and troubleshooting labs.
- **Verification & Testing Evidence Report:** [TESTED.md](TESTED.md) — Step-by-step test execution logs, screenshots, and live deployment evidence for all modules.
- **Grading Rubric Mapping:** [GRADING.md](GRADING.md) — Complete rubric compliance mapping for all modules.

### 3. Core Source Code & Infrastructure Deliverables Tagging
- **Full-Stack Source Code:**
  - Backend: [backend/](backend/) (FastAPI REST API, SQLAlchemy models, Alembic migrations)
  - Frontend: [frontend/](frontend/) (React + Vite, Nginx reverse proxy, modern CSS variables)
  - Automated Tests: [backend/tests/](backend/tests/) (8 unit/integration tests with in-memory SQLite isolation)
- **Containerization & CI/CD Pipelines:**
  - Multi-Container Local Stack: [docker-compose.yml](docker-compose.yml)
  - Backend Dockerfile: [backend/Dockerfile](backend/Dockerfile)
  - Frontend Dockerfile: [frontend/Dockerfile](frontend/Dockerfile)
  - GitHub Actions Workflow: [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml) (Pytest, Trivy CVE scan, GHCR image push)
- **Cloud Infrastructure as Code (AWS EKS):**
  - Terraform Configurations: [terraform/](terraform/) (`main.tf`, `variables.tf`, `outputs.tf`, `versions.tf`)
  - Clean Teardown State: Verified $0.00 runaway cloud costs via `terraform destroy`
- **Kubernetes Packaging & GitOps Provisioning:**
  - Helm Chart: [helm/taskboard/](helm/taskboard/) (Deployments, Services, Ingress, HPA, ConfigMaps)
  - Namespace Manifest: [k8s/namespace.yaml](k8s/namespace.yaml)
  - Prometheus Configurations: [monitoring/prometheus.yml](monitoring/prometheus.yml), [monitoring/prometheus-values.yaml](monitoring/prometheus-values.yaml)
  - Automated Grafana Dashboard Provisioning: [monitoring/grafana/](monitoring/grafana/)

### 4. Verified Screenshot Evidence Package (16 Artifacts)
- **M1/M4 (Application & Docker):** [01-docker-compose-terminal.jpg](docs/screenshots/01-docker-compose-terminal.jpg), [01-TaskBoard-DashBoard.jpg](docs/screenshots/01-TaskBoard-DashBoard.jpg)
- **M2 (Automated Testing):** [02-pytest-passing.jpg](docs/screenshots/02-pytest-passing.jpg)
- **M5/M6 (CI/CD & DevSecOps):** [03-trivy-backend-scan.jpg](docs/screenshots/03-trivy-backend-scan.jpg), [03-trivy-frontend-scan.jpg](docs/screenshots/03-trivy-frontend-scan.jpg), [04-github-actions-success.jpg](docs/screenshots/04-github-actions-success.jpg), [05-ghcr-packages.jpg](docs/screenshots/05-ghcr-packages.jpg)
- **M7 (Terraform AWS EKS):** [06-terraform-plan.jpg](docs/screenshots/06-terraform-plan.jpg), [07-aws-eks-console.jpg](docs/screenshots/07-aws-eks-console.jpg), [08-aws-ec2-nodes.jpg](docs/screenshots/08-aws-ec2-nodes.jpg), [09-kubectl-nodes.jpg](docs/screenshots/09-kubectl-nodes.jpg)
- **M8 (Kubernetes & Helm):** [10-kubectl-pods-running.jpg](docs/screenshots/10-kubectl-pods-running.jpg), [11-kubectl-svc-hpa.jpg](docs/screenshots/11-kubectl-svc-hpa.jpg), [12-helm-list.jpg](docs/screenshots/12-helm-list.jpg), [13-browser-taskboard-eks.jpg](docs/screenshots/13-browser-taskboard-eks.jpg)
- **M9 (Observability):** [14-curl-metrics.jpg](docs/screenshots/14-curl-metrics.jpg), [15-prometheus-targets-01.jpg](docs/screenshots/15-prometheus-targets-01.jpg), [16-grafana-dashboard-remake.jpg](docs/screenshots/16-grafana-dashboard-remake.jpg)

### 5. Authorship Verification
- Clean semantic commit history and verified screenshots proving independent implementation and deployment by **Krushna Sonawane**.
