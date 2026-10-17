# Demo & Presentation Artifacts — TaskBoard DevOps Capstone

This directory contains the presentation deck, video walkthrough instructions, and submission artifacts required for **Module M10** evaluation as defined in [SUBMISSION.md](https://github.com/Nency-Ravaliya/devsecops-python/blob/main/SUBMISSION.md) and [GRADING.md](../GRADING.md).

---

## 📦 Required Deliverables Checklist

- [x] **Slide Deck (PPTX):** [TaskBoard_DevOps_Capstone_Presentation.pptx](./TaskBoard_DevOps_Capstone_Presentation.pptx) — 11 enterprise widescreen slides.
- [x] **Interactive Web Slide Deck (HTML):** [presentation.html](../docs/presentation.html) — Standalone interactive slide deck with Lightbox zoom and Prometheus slider.
- [ ] **Presentation Walkthrough Video (MP4):** Save as `presentation_video.mp4` in this folder (or link below).

---

## 🎥 Video Walkthrough Presentation Script (In Required Order)

Per the course guidelines, the video presentation should follow this sequence (3–5 minutes):

### 1. Slide Deck Presentation (1–2 minutes)
- Introduce yourself: **Krushna Sonawane** (Lead DevOps Engineer).
- Present slides from `demo/TaskBoard_DevOps_Capstone_Presentation.pptx` or `docs/presentation.html`:
  - **Slide 1:** Title & Project Identity.
  - **Slide 2:** 3-Tier Enterprise Architecture (React ➔ FastAPI ➔ PostgreSQL ➔ Prometheus/Grafana ➔ AWS EKS).
  - **Slide 3:** Key Problems Solved (PostgreSQL startup race condition, React synthetic event pooling fix, and Starlette/Alpine CVE patching).

### 2. Codebase Walkthrough (30–45 seconds)
- Open VS Code / IDE:
  - Show standard repository layout: `backend/`, `frontend/`, `terraform/`, `helm/`, `monitoring/`, `docker-compose.yml`.
  - Highlight Docker Compose healthcheck (`pg_isready`) and Alembic migrations.

### 3. CI/CD Pipeline (30–45 seconds)
- Open GitHub Actions tab (`https://github.com/AGENT-BABA/TaskBoard/actions`):
  - Show the 3-stage automated pipeline:
    1. **Test:** Pytest 8/8 passing + Vite build.
    2. **Build, Scan & Push:** Docker containerization + Aqua Trivy scan (0 CVEs) + GHCR package push.
    3. **Deploy:** Helm release gate.

### 4. Infrastructure as Code (Terraform & AWS EKS) (30 seconds)
- Show `terraform/` directory:
  - Explain VPC, subnets, NAT gateway, and managed EKS 1.31 node groups.
  - Show AWS Console verification screenshots ([TESTED.md](../TESTED.md)):
    - `06-terraform-plan.jpg`, `07-aws-eks-console.jpg`, `08-aws-ec2-nodes.jpg`.
  - Explain clean teardown: `terraform destroy` was executed to maintain $0.00 runaway cloud costs.

### 5. Kubernetes & Helm Deployment (30 seconds)
- Show Helm chart `helm/taskboard/`:
  - Show verified screenshots:
    - Pods running: `10-kubectl-pods-running.jpg`.
    - Services, HPA, and Ingress: `11-kubectl-svc-hpa.jpg`.
    - Live browser running on AWS EKS: `13-browser-taskboard-eks.jpg`.

### 6. Observability (Prometheus & Grafana) (30–45 seconds)
- Show live local monitoring on `http://localhost:3001`:
  - Prometheus targets status: `UP (1/1)`.
  - Grafana Executive Telemetry Dashboard with:
    1. p95 Response Latency Radial Gauge (ms).
    2. Total API Requests processed counter.
    3. HTTP 2xx vs 4xx status distribution donut chart.
    4. Request throughput by endpoint time series.

### 7. Interactive Frontend Walkthrough (30 seconds)
- Show `http://localhost:3000`:
  - **Kanban Board:** Move task cards across To Do ➔ In Progress ➔ Completed.
  - **Graphical Insights:** Show the SVG Donut chart and priority breakdown.
  - **Activity Tab:** Click `⚡ Run Live Health Probe` to demonstrate real-time async probing.

---

## 📹 How to Record and Add Your Video

1. **Option A (Windows Game Bar — Free & Built-in):**
   - Press <kbd>Win</kbd> + <kbd>Alt</kbd> + <kbd>R</kbd> to start recording with your microphone on.
   - Walk through the steps above.
   - Press <kbd>Win</kbd> + <kbd>Alt</kbd> + <kbd>R</kbd> to stop. The video is saved to `Videos\Captures`.
   - Copy the video to this folder as `presentation_video.mp4` (if file size < 100MB).
2. **Option B (Loom / YouTube / Google Drive):**
   - Record via Loom, OBS, or Clipchamp.
   - If the file is larger than 100MB, upload it to Google Drive / YouTube (Unlisted) / Loom and paste the link below:

```text
Video URL: [Paste your video link here if > 100MB]
```
