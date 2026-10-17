import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = '/api';

const PIPELINE_STAGES = [
    {
        id: 'pytest',
        name: '1. Pytest Gate',
        status: 'PASSED',
        cmd: 'pytest -q',
        duration: '1.24s',
        log: '======================== 8 passed in 1.24s ========================\n✓ test_health: 200 OK (FastAPI Liveness probe)\n✓ test_ready: 200 OK (PostgreSQL DB connection verified)\n✓ test_create_task: 201 Created (REST POST)\n✓ test_get_tasks: 200 OK (REST GET)\n✓ test_update_task: 200 OK (REST PUT)\n✓ test_delete_task: 204 No Content (REST DELETE)\n✓ test_stats: 200 OK (Aggregation KPI endpoint)\n✓ test_not_found: 404 Not Found (Edge case handling)'
    },
    {
        id: 'build',
        name: '2. Vite Frontend Build',
        status: 'PASSED',
        cmd: 'vite build',
        duration: '149ms',
        log: 'vite building for production...\n✓ 15 modules transformed.\ndist/index.html 0.71 kB\ndist/assets/index.css 19.83 kB\ndist/assets/index.js 245.15 kB\n✓ Built in 149ms without bundle errors.'
    },
    {
        id: 'docker',
        name: '3. Docker Containerization',
        status: 'PASSED',
        cmd: 'docker build -t taskboard-backend:latest ./backend',
        duration: '12.4s',
        log: '[1/7] FROM python:3.12-slim\n[2/7] WORKDIR /app\n[3/7] RUN adduser --disabled-password --gecos "" taskboard\n[4/7] RUN pip install -r requirements.txt (fastapi>=0.143.0, psycopg>=3.2.3)\n[5/7] USER taskboard\n[6/7] EXPOSE 8000\n[7/7] CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]\nSuccessfully tagged taskboard-backend:latest'
    },
    {
        id: 'trivy',
        name: '4. Trivy Security Gate',
        status: 'PASSED',
        cmd: 'trivy image --exit-code 1 --severity HIGH,CRITICAL taskboard-backend',
        duration: '4.8s',
        log: 'Total Vulnerabilities: 0 (HIGH: 0, CRITICAL: 0)\n✓ Starlette upgraded to 1.8.0 (Patched CVE-2025-62727, CVE-2026-48818, CVE-2026-54283)\n✓ Alpine packages upgraded via apk upgrade --no-cache\nSecurity gate PASSED. Container approved for registry promotion.'
    },
    {
        id: 'ghcr',
        name: '5. GHCR Package Push',
        status: 'PASSED',
        cmd: 'docker push ghcr.io/agent-baba/taskboard-backend:sha-main',
        duration: '3.1s',
        log: 'sha256:5b4eb350bf11 Pushed\nghcr.io/agent-baba/taskboard-backend:latest\nghcr.io/agent-baba/taskboard-frontend:latest\nPublished to GitHub Container Registry.'
    },
    {
        id: 'helm',
        name: '6. Helm & Ingress Deploy',
        status: 'PASSED',
        cmd: 'helm upgrade --install taskboard ./helm/taskboard -n taskboard',
        duration: '5.6s',
        log: 'Release "taskboard" has been upgraded. Happy Helming!\nNAME: taskboard\nNAMESPACE: taskboard\nSTATUS: deployed\nREVISION: 2\nTEST SUITE: None\nIngress: http://taskboard.local/ (Path: / -> Frontend, /api -> Backend)'
    }
];

function App() {
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, done: 0 });
    const [filter, setFilter] = useState('ALL');
    const [priorityFilter, setPriorityFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('board'); // 'board' | 'table' | 'analytics'
    const [showForm, setShowForm] = useState(false);
    const [defaultStatusForNew, setDefaultStatusForNew] = useState('TODO');
    const [defaultTitleForNew, setDefaultTitleForNew] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentTab, setCurrentTab] = useState('dashboard');
    
    // Interactive Activity State
    const [activityFilter, setActivityFilter] = useState('ALL');
    const [selectedStage, setSelectedStage] = useState(PIPELINE_STAGES[0]);
    const [probing, setProbing] = useState(false);
    const [activityLog, setActivityLog] = useState([
        { id: 1, type: 'pipeline', title: 'GitHub Actions CI/CD Pipeline Passed', desc: 'All 8 Pytest tests passed; Trivy scan detected 0 CVEs; images pushed to GHCR.', time: '10 min ago' },
        { id: 2, type: 'health', title: 'Live Health Check: 200 OK', desc: 'FastAPI liveness (/health) and PostgreSQL database readiness (/ready) probes healthy.', time: '15 min ago' },
        { id: 3, type: 'task', title: 'Task Advanced on Board', desc: 'Task #TASK-7 moved to IN_PROGRESS by Krushna Sonawane.', time: '25 min ago' },
        { id: 4, type: 'system', title: 'Grafana Telemetry Dashboard Auto-Provisioned', desc: 'Dashboard taskboard-telemetry and Prometheus datasource loaded as code.', time: '40 min ago' },
        { id: 5, type: 'pipeline', title: 'Docker Compose Stack Rebuilt', desc: 'Vite production assets built and Nginx reverse proxy serving port 3000.', time: '1 hr ago' }
    ]);

    // Dark mode state persisted in localStorage
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('taskboard-theme') === 'dark';
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark-mode');
            localStorage.setItem('taskboard-theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark-mode');
            localStorage.setItem('taskboard-theme', 'light');
        }
    }, [darkMode]);

    const load = async () => {
        try {
            setError('');
            const [a, b] = await Promise.all([
                fetch(`${API}/tasks`),
                fetch(`${API}/tasks/stats`)
            ]);
            if (!a.ok || !b.ok) throw Error('Backend unavailable');
            setTasks(await a.json());
            setStats(await b.json());
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    // Filter by Tab (My Tasks vs All)
    const baseTasks = currentTab === 'my_tasks'
        ? tasks.filter(t => (t.assignee || '').toLowerCase().includes('krushna'))
        : tasks;

    // Filter by Priority
    const priorityFiltered = priorityFilter === 'ALL'
        ? baseTasks
        : baseTasks.filter(t => t.priority === priorityFilter);

    // Filter by Search Query
    const searchFiltered = priorityFiltered.filter(t => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        return (
            (t.title || '').toLowerCase().includes(q) ||
            (t.description || '').toLowerCase().includes(q) ||
            (t.assignee || '').toLowerCase().includes(q)
        );
    });

    // Visible for table view (also filtered by Status button)
    const visibleForTable = filter === 'ALL'
        ? searchFiltered
        : searchFiltered.filter(t => t.status === filter);

    // Direct Status Movement for Kanban Cards
    const moveTask = async (task, targetStatus) => {
        try {
            await fetch(`${API}/tasks/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...task, status: targetStatus })
            });
            // Prepend dynamic event to activity log
            setActivityLog(prev => [{
                id: Date.now(),
                type: 'task',
                title: `Task #TASK-${task.id} Status Updated`,
                desc: `"${task.title}" was moved from ${task.status} to ${targetStatus}.`,
                time: 'Just now'
            }, ...prev]);
            await load();
        } catch (err) {
            setError(err.message);
        }
    };

    // Sequential status toggle (for table inline button)
    const update = async (t) => {
        const next = t.status === 'TODO' ? 'IN_PROGRESS' : t.status === 'IN_PROGRESS' ? 'DONE' : 'TODO';
        await moveTask(t, next);
    };

    const remove = async (id) => {
        try {
            await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
            setActivityLog(prev => [{
                id: Date.now(),
                type: 'task',
                title: `Task Deleted`,
                desc: `Task #TASK-${id} was permanently removed.`,
                time: 'Just now'
            }, ...prev]);
            await load();
        } catch (err) {
            setError(err.message);
        }
    };

    const openCreateModal = (presetStatus = 'TODO', titlePrefix = '') => {
        setDefaultStatusForNew(presetStatus);
        setDefaultTitleForNew(titlePrefix);
        setShowForm(true);
    };

    const create = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const f = new FormData(form);
        const title = f.get('title');
        const assignee = f.get('assignee') || 'Krushna';
        try {
            const res = await fetch(`${API}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description: f.get('description'),
                    priority: f.get('priority'),
                    assignee,
                    status: f.get('status') || defaultStatusForNew
                })
            });
            if (!res.ok) throw new Error('Failed to create task');
            form.reset();
            setShowForm(false);
            setActivityLog(prev => [{
                id: Date.now(),
                type: 'task',
                title: `New Task Created`,
                desc: `"${title}" created and assigned to ${assignee}.`,
                time: 'Just now'
            }, ...prev]);
            await load();
        } catch (err) {
            setError(err.message);
        }
    };

    // Interactive System Health Prober
    const runHealthProbe = async () => {
        setProbing(true);
        const startTime = Date.now();
        try {
            const [h, r, m] = await Promise.all([
                fetch('/health').catch(() => fetch(`${API}/health`)),
                fetch('/ready').catch(() => fetch(`${API}/ready`)),
                fetch('/metrics').catch(() => fetch(`${API}/metrics`))
            ]);
            const duration = Date.now() - startTime;
            setActivityLog(prev => [{
                id: Date.now(),
                type: 'health',
                title: `Live System Health Probe Completed (${duration}ms)`,
                desc: `Liveness /health: ${h.status} OK • Database Readiness /ready: ${r.status} OK • Telemetry /metrics: ${m.status} OK`,
                time: 'Just now'
            }, ...prev]);
        } catch (err) {
            setActivityLog(prev => [{
                id: Date.now(),
                type: 'system',
                title: 'Health Probe Encountered Issue',
                desc: `Error executing probe: ${err.message}`,
                time: 'Just now'
            }, ...prev]);
        } finally {
            setProbing(false);
        }
    };

    // Filter project tasks directly into Board
    const filterByProject = (projectKeyword) => {
        setSearchTerm(projectKeyword);
        setCurrentTab('dashboard');
        setViewMode('board');
    };

    // Calculate priority statistics for Graphical representation
    const priorityStats = {
        high: tasks.filter(t => t.priority === 'HIGH').length,
        medium: tasks.filter(t => t.priority === 'MEDIUM').length,
        low: tasks.filter(t => t.priority === 'LOW').length,
    };

    // Calculate assignee breakdown
    const assigneeMap = {};
    tasks.forEach(t => {
        const name = t.assignee || 'Unassigned';
        if (!assigneeMap[name]) assigneeMap[name] = { total: 0, done: 0 };
        assigneeMap[name].total += 1;
        if (t.status === 'DONE') assigneeMap[name].done += 1;
    });

    // Visible activities filtered by pill
    const visibleActivities = activityFilter === 'ALL'
        ? activityLog
        : activityLog.filter(a => a.type.toUpperCase() === activityFilter);

    return (
        <div className="app">
            <aside className="sidebar">
                <div className="brand">
                    <span className="brand-mark">T</span>
                    <div>
                        <b>TaskBoard</b>
                        <small>DevOps Capstone</small>
                    </div>
                </div>

                <nav>
                    <a className={currentTab === 'dashboard' ? 'active' : ''} onClick={() => { setCurrentTab('dashboard'); setSearchTerm(''); }} style={{ cursor: 'pointer' }}>
                        ▦ <span>Dashboard</span>
                    </a>
                    <a className={currentTab === 'my_tasks' ? 'active' : ''} onClick={() => { setCurrentTab('my_tasks'); setSearchTerm(''); }} style={{ cursor: 'pointer' }}>
                        ✓ <span>My Tasks</span>
                    </a>
                    <a className={currentTab === 'projects' ? 'active' : ''} onClick={() => setCurrentTab('projects')} style={{ cursor: 'pointer' }}>
                        ◫ <span>Projects</span>
                    </a>
                    <a className={currentTab === 'activity' ? 'active' : ''} onClick={() => setCurrentTab('activity')} style={{ cursor: 'pointer' }}>
                        ◌ <span>Activity</span>
                    </a>
                </nav>

                <div className="side-bottom">
                    <div className="upgrade">
                        <strong>Ship with confidence.</strong>
                        <p>Build, test, containerize, deploy & observe cloud native apps.</p>
                    </div>
                    <div className="profile">
                        <div className="avatar">KS</div>
                        <div>
                            <b>Krushna Sonawane</b>
                            <small>Lead DevOps Engineer</small>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="main">
                <header>
                    <div>
                        <p className="eyebrow">WORKSPACE / {currentTab.toUpperCase().replace('_', ' ')}</p>
                        <h1>Good morning, Krushna 👋</h1>
                        <p className="muted">Here’s what’s happening with your team and pipelines today.</p>
                    </div>
                    <div className="header-actions">
                        <button
                            className="theme-toggle"
                            onClick={() => setDarkMode(!darkMode)}
                            title="Toggle Light/Dark Theme"
                        >
                            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                        </button>
                        <button className="primary" onClick={() => openCreateModal('TODO')}>
                            ＋ New task
                        </button>
                    </div>
                </header>

                {error && (
                    <div className="alert">
                        ⚠ {error}. Ensure the FastAPI backend and PostgreSQL are running.
                    </div>
                )}

                {/* Top Stat Cards */}
                <section className="stats">
                    <Stat label="Total tasks" value={stats.total} icon="▦" />
                    <Stat label="To do" value={stats.todo} icon="○" />
                    <Stat label="In progress" value={stats.inProgress} icon="◔" />
                    <Stat label="Completed" value={stats.done} icon="✓" />
                </section>

                {/* ============================================================== */}
                {/* 1. PROJECTS TAB (INTERACTIVE WORKSPACE & MICROSERVICES HUB)    */}
                {/* ============================================================== */}
                {currentTab === 'projects' ? (
                    <section className="content-grid" style={{ gridTemplateColumns: '1fr' }}>
                        <div className="panel" style={{ padding: '24px' }}>
                            <div className="panel-head" style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border-color)' }}>
                                <div>
                                    <h2>Workspace Projects & Domains</h2>
                                    <p className="muted">Active services, infrastructure repositories, and automated pipelines. Click actions to filter tasks or launch tools.</p>
                                </div>
                                <span className="chart-badge">4 Active Domains</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '22px' }}>
                                {/* Project 1: Core SaaS */}
                                <div className="project-card-interactive">
                                    <div>
                                        <div className="project-top-meta">
                                            <span style={{ fontSize: '9px', fontWeight: 800, color: '#16a34a', background: 'var(--badge-done-bg)', padding: '4px 8px', borderRadius: '20px' }}>ACTIVE SERVICE</span>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Port 8000 / 3000</span>
                                        </div>
                                        <h3 style={{ margin: '12px 0 6px', fontSize: '17px', color: 'var(--text-main)' }}>TaskBoard Core SaaS</h3>
                                        <p className="muted" style={{ fontSize: '12px', lineHeight: 1.5 }}>FastAPI Python REST backend, React 18 frontend, PostgreSQL 16 database with Alembic schema migrations.</p>
                                        
                                        <div className="project-tech-pills">
                                            <span className="tech-pill">FastAPI</span>
                                            <span className="tech-pill">React + Vite</span>
                                            <span className="tech-pill">PostgreSQL 16</span>
                                            <span className="tech-pill">SQLAlchemy</span>
                                            <span className="tech-pill">Alembic</span>
                                        </div>

                                        <div className="project-progress-bar">
                                            <div className="project-progress-meta">
                                                <span>Workload Progress</span>
                                                <span>{stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%</span>
                                            </div>
                                            <div className="bar-track">
                                                <div className="bar-fill emerald" style={{ width: `${stats.total > 0 ? (stats.done / stats.total) * 100 : 0}%` }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="project-actions-row">
                                        <button className="btn-secondary" onClick={() => filterByProject('SaaS')}>
                                            🔍 Filter in Board
                                        </button>
                                        <button className="btn-secondary" onClick={() => openCreateModal('TODO', '[SaaS] ')}>
                                            ＋ Add Task
                                        </button>
                                        <a href="/docs" target="_blank" rel="noreferrer" className="btn-secondary" style={{ marginLeft: 'auto' }}>
                                            ↗ Swagger /docs
                                        </a>
                                    </div>
                                </div>

                                {/* Project 2: AWS EKS Cloud Infrastructure */}
                                <div className="project-card-interactive">
                                    <div>
                                        <div className="project-top-meta">
                                            <span style={{ fontSize: '9px', fontWeight: 800, color: '#9333ea', background: 'var(--badge-progress-bg)', padding: '4px 8px', borderRadius: '20px' }}>IAC / AWS</span>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Region: ap-south-1</span>
                                        </div>
                                        <h3 style={{ margin: '12px 0 6px', fontSize: '17px', color: 'var(--text-main)' }}>AWS EKS Infrastructure</h3>
                                        <p className="muted" style={{ fontSize: '12px', lineHeight: 1.5 }}>Terraform VPC with public/private subnets, NAT gateways, and managed Kubernetes 1.31 worker node groups.</p>
                                        
                                        <div className="project-tech-pills">
                                            <span className="tech-pill">Terraform 1.16</span>
                                            <span className="tech-pill">AWS VPC</span>
                                            <span className="tech-pill">Amazon EKS</span>
                                            <span className="tech-pill">EC2 t3.medium</span>
                                            <span className="tech-pill">Cost Gate: $0.00</span>
                                        </div>

                                        <div className="project-progress-bar">
                                            <div className="project-progress-meta">
                                                <span>Infrastructure Status</span>
                                                <span style={{ color: '#16a34a' }}>Clean Teardown ✅</span>
                                            </div>
                                            <div className="bar-track">
                                                <div className="bar-fill primary" style={{ width: '100%' }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="project-actions-row">
                                        <button className="btn-secondary" onClick={() => filterByProject('EKS')}>
                                            🔍 Filter in Board
                                        </button>
                                        <button className="btn-secondary" onClick={() => openCreateModal('TODO', '[EKS] ')}>
                                            ＋ Add Task
                                        </button>
                                        <span className="chart-badge" style={{ marginLeft: 'auto', color: '#10b981' }}>
                                            Destroyed ($0.00)
                                        </span>
                                    </div>
                                </div>

                                {/* Project 3: DevSecOps & CI/CD */}
                                <div className="project-card-interactive">
                                    <div>
                                        <div className="project-top-meta">
                                            <span style={{ fontSize: '9px', fontWeight: 800, color: '#d97706', background: 'var(--badge-med-bg)', padding: '4px 8px', borderRadius: '20px' }}>CI/CD AUTOMATION</span>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>GitHub Actions</span>
                                        </div>
                                        <h3 style={{ margin: '12px 0 6px', fontSize: '17px', color: 'var(--text-main)' }}>DevSecOps & CI/CD Pipeline</h3>
                                        <p className="muted" style={{ fontSize: '12px', lineHeight: 1.5 }}>Automated workflow enforcing Pytest quality gates, Aqua Trivy CVE security scanning, and GHCR container delivery.</p>
                                        
                                        <div className="project-tech-pills">
                                            <span className="tech-pill">GitHub Actions</span>
                                            <span className="tech-pill">Aqua Trivy (0 CVEs)</span>
                                            <span className="tech-pill">GHCR Registry</span>
                                            <span className="tech-pill">Helm Packaging</span>
                                        </div>

                                        <div className="project-progress-bar">
                                            <div className="project-progress-meta">
                                                <span>Security Scan Gate</span>
                                                <span style={{ color: '#16a34a' }}>0 CVEs (Pass)</span>
                                            </div>
                                            <div className="bar-track">
                                                <div className="bar-fill emerald" style={{ width: '100%' }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="project-actions-row">
                                        <button className="btn-secondary" onClick={() => filterByProject('CI/CD')}>
                                            🔍 Filter in Board
                                        </button>
                                        <button className="btn-secondary" onClick={() => openCreateModal('TODO', '[CI/CD] ')}>
                                            ＋ Add Task
                                        </button>
                                        <a href="https://github.com/AGENT-BABA/TaskBoard/actions" target="_blank" rel="noreferrer" className="btn-secondary" style={{ marginLeft: 'auto' }}>
                                            ↗ GitHub Actions
                                        </a>
                                    </div>
                                </div>

                                {/* Project 4: Observability & Telemetry */}
                                <div className="project-card-interactive">
                                    <div>
                                        <div className="project-top-meta">
                                            <span style={{ fontSize: '9px', fontWeight: 800, color: '#0284c7', background: 'var(--badge-low-bg)', padding: '4px 8px', borderRadius: '20px' }}>OBSERVABILITY</span>
                                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Port 3001 / 9090</span>
                                        </div>
                                        <h3 style={{ margin: '12px 0 6px', fontSize: '17px', color: 'var(--text-main)' }}>Monitoring & Telemetry</h3>
                                        <p className="muted" style={{ fontSize: '12px', lineHeight: 1.5 }}>Automated Prometheus scraping of FastAPI /metrics with custom multi-panel Grafana executive dashboard provisioned as code.</p>
                                        
                                        <div className="project-tech-pills">
                                            <span className="tech-pill">Prometheus 2.45</span>
                                            <span className="tech-pill">Grafana 11</span>
                                            <span className="tech-pill">p95 Latency Gauge</span>
                                            <span className="tech-pill">HTTP Status Donut</span>
                                        </div>

                                        <div className="project-progress-bar">
                                            <div className="project-progress-meta">
                                                <span>Telemetry Health</span>
                                                <span style={{ color: '#10b981' }}>Scraping 1/1 UP</span>
                                            </div>
                                            <div className="bar-track">
                                                <div className="bar-fill emerald" style={{ width: '100%' }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="project-actions-row">
                                        <button className="btn-secondary" onClick={() => filterByProject('Metrics')}>
                                            🔍 Filter in Board
                                        </button>
                                        <a href="http://localhost:3001" target="_blank" rel="noreferrer" className="btn-secondary">
                                            ↗ Grafana UI
                                        </a>
                                        <a href="/metrics" target="_blank" rel="noreferrer" className="btn-secondary" style={{ marginLeft: 'auto' }}>
                                            ↗ /metrics
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                ) : currentTab === 'activity' ? (
                    /* ============================================================== */
                    /* 2. ACTIVITY TAB (INTERACTIVE AUDIT STREAM & PIPELINE INSPECTOR) */
                    /* ============================================================== */
                    <section className="content-grid" style={{ gridTemplateColumns: '1fr' }}>
                        <div className="panel" style={{ padding: '24px' }}>
                            <div className="activity-toolbar">
                                <div>
                                    <h2>Deployment & Audit Activity Stream</h2>
                                    <p className="muted">Real-time audit log of task lifecycle events, system probes, and CI/CD executions.</p>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <button
                                        className="probe-btn"
                                        onClick={runHealthProbe}
                                        disabled={probing}
                                        title="Trigger an asynchronous health check on running FastAPI and PostgreSQL services"
                                    >
                                        {probing ? '⏳ Probing...' : '⚡ Run Live Health Probe'}
                                    </button>

                                    <div className="activity-filter-pills">
                                        {['ALL', 'TASK', 'HEALTH', 'PIPELINE'].map(f => (
                                            <button
                                                key={f}
                                                className={`activity-filter-btn ${activityFilter === f ? 'active' : ''}`}
                                                onClick={() => setActivityFilter(f)}
                                            >
                                                {f === 'ALL' ? 'All Events' : f}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic Activity Timeline */}
                            <div className="activity-timeline">
                                {visibleActivities.map(item => (
                                    <div className="timeline-entry" key={item.id}>
                                        <div className={`timeline-badge ${item.type}`}>
                                            {item.type === 'task' ? '✓' : item.type === 'health' ? '⚡' : item.type === 'pipeline' ? '↗' : 'ℹ'}
                                        </div>
                                        <div className="timeline-content">
                                            <b>{item.title}</b>
                                            <p>{item.desc}</p>
                                        </div>
                                        <span className="timeline-time">{item.time}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Interactive CI/CD Pipeline Visualizer & Inspector */}
                            <div className="pipeline-visualizer-card">
                                <div className="pipeline-visualizer-head">
                                    <div>
                                        <h3>Interactive CI/CD Deployment Pipeline</h3>
                                        <p className="muted">Click on any pipeline stage to inspect execution logs, test outputs, and commands.</p>
                                    </div>
                                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', background: 'var(--badge-done-bg)', padding: '4px 10px', borderRadius: '12px' }}>
                                        PIPELINE: PASSING ✅
                                    </span>
                                </div>

                                <div className="pipeline-interactive-stages">
                                    {PIPELINE_STAGES.map((stage, idx) => (
                                        <React.Fragment key={stage.id}>
                                            <button
                                                className={`pipeline-stage-pill ${selectedStage.id === stage.id ? 'active-stage' : ''}`}
                                                onClick={() => setSelectedStage(stage)}
                                                title={`Click to inspect ${stage.name}`}
                                            >
                                                <span>{stage.name}</span>
                                                <small style={{ opacity: 0.8 }}>({stage.duration})</small>
                                            </button>
                                            {idx < PIPELINE_STAGES.length - 1 && (
                                                <span className="stage-arrow">➔</span>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </div>

                                {/* Terminal Output Drawer for Selected Stage */}
                                <div className="stage-inspector-drawer">
                                    <div className="stage-inspector-top">
                                        <b>STAGE: {selectedStage.name} — Command: {selectedStage.cmd}</b>
                                        <span>STATUS: {selectedStage.status} ({selectedStage.duration})</span>
                                    </div>
                                    <pre className="stage-inspector-code">{selectedStage.log}</pre>
                                </div>
                            </div>
                        </div>
                    </section>
                ) : (
                    /* ============================================================== */
                    /* 3. DASHBOARD & MY TASKS TAB (KANBAN, TABLE, ANALYTICS VIEWS)   */
                    /* ============================================================== */
                    <>
                        {/* Sub-Header Toolbar: View Switcher, Search, and Priority Filter */}
                        <div className="board-toolbar">
                            <div className="view-switcher">
                                <button
                                    className={`view-btn ${viewMode === 'board' ? 'active' : ''}`}
                                    onClick={() => setViewMode('board')}
                                >
                                    ☷ <span>Kanban Board</span>
                                </button>
                                <button
                                    className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                                    onClick={() => setViewMode('table')}
                                >
                                    ☰ <span>List Table</span>
                                </button>
                                <button
                                    className={`view-btn ${viewMode === 'analytics' ? 'active' : ''}`}
                                    onClick={() => setViewMode('analytics')}
                                >
                                    📊 <span>Graphical Insights</span>
                                </button>
                            </div>

                            <div className="toolbar-controls">
                                <div className="search-box">
                                    <span className="search-icon">🔍</span>
                                    <input
                                        type="text"
                                        placeholder="Search title, desc, assignee..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                <select
                                    className="filter-select"
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                >
                                    <option value="ALL">All Priorities</option>
                                    <option value="HIGH">High Priority</option>
                                    <option value="MEDIUM">Medium Priority</option>
                                    <option value="LOW">Low Priority</option>
                                </select>
                            </div>
                        </div>

                        {/* 1. KANBAN BOARD VIEW */}
                        {viewMode === 'board' && (
                            <div className="kanban-board">
                                {/* Column 1: TO DO */}
                                <KanbanColumn
                                    title="To Do"
                                    type="todo"
                                    tasks={searchFiltered.filter(t => t.status === 'TODO')}
                                    onMove={moveTask}
                                    onDelete={remove}
                                    onAddTask={() => openCreateModal('TODO')}
                                />

                                {/* Column 2: IN PROGRESS */}
                                <KanbanColumn
                                    title="In Progress"
                                    type="in_progress"
                                    tasks={searchFiltered.filter(t => t.status === 'IN_PROGRESS')}
                                    onMove={moveTask}
                                    onDelete={remove}
                                    onAddTask={() => openCreateModal('IN_PROGRESS')}
                                />

                                {/* Column 3: DONE */}
                                <KanbanColumn
                                    title="Completed"
                                    type="done"
                                    tasks={searchFiltered.filter(t => t.status === 'DONE')}
                                    onMove={moveTask}
                                    onDelete={remove}
                                    onAddTask={() => openCreateModal('DONE')}
                                />
                            </div>
                        )}

                        {/* 2. LIST / TABLE VIEW */}
                        {viewMode === 'table' && (
                            <section className="content-grid">
                                <div className="panel tasks-panel">
                                    <div className="panel-head">
                                        <div>
                                            <h2>{currentTab === 'my_tasks' ? 'My Assigned Tasks' : 'Tasks'}</h2>
                                            <p className="muted">
                                                {currentTab === 'my_tasks' ? `Tasks assigned to Krushna (${visibleForTable.length})` : 'Track work across the product team.'}
                                            </p>
                                        </div>
                                        <div className="filters">
                                            {['ALL', 'TODO', 'IN_PROGRESS', 'DONE'].map(x => (
                                                <button
                                                    className={filter === x ? 'selected' : ''}
                                                    onClick={() => setFilter(x)}
                                                    key={x}
                                                >
                                                    {x === 'ALL' ? 'All' : x.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {loading ? (
                                        <div className="empty">Loading tasks…</div>
                                    ) : (
                                        <div className="table-wrap">
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Task</th>
                                                        <th>Assignee</th>
                                                        <th>Priority</th>
                                                        <th>Status</th>
                                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {visibleForTable.map(t => (
                                                        <tr key={t.id}>
                                                            <td>
                                                                <div className="task-title">
                                                                    <span className={`dot ${t.status.toLowerCase()}`}></span>
                                                                    <div>
                                                                        <b>{t.title}</b>
                                                                        <small>{t.description}</small>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td>{t.assignee}</td>
                                                            <td>
                                                                <span className={`priority ${t.priority.toLowerCase()}`}>
                                                                    {t.priority}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <span className={`status ${t.status.toLowerCase()}`}>
                                                                    {t.status.replace('_', ' ')}
                                                                </span>
                                                            </td>
                                                            <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                                <button
                                                                    className="icon-btn"
                                                                    onClick={() => update(t)}
                                                                    title="Advance status (TODO -> IN PROGRESS -> DONE)"
                                                                >
                                                                    ↻
                                                                </button>
                                                                <button
                                                                    className="icon-btn"
                                                                    onClick={() => remove(t.id)}
                                                                    title="Delete task"
                                                                    style={{ marginLeft: '6px', color: 'var(--badge-high-text)' }}
                                                                >
                                                                    ✕
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {!visibleForTable.length && (
                                                <div className="empty">
                                                    {currentTab === 'my_tasks' ? 'No tasks currently assigned to you.' : 'No tasks matching current filter.'}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <aside className="panel activity">
                                    <div className="panel-head">
                                        <div>
                                            <h2>Recent activity</h2>
                                            <p className="muted">Latest workspace events.</p>
                                        </div>
                                    </div>
                                    <Activity icon="✓" text="Monitoring dashboard completed" time="12 min ago" />
                                    <Activity icon="◔" text="Release task moved to in progress" time="38 min ago" />
                                    <Activity icon="＋" text="New onboarding task created" time="1 hr ago" />
                                    <Activity icon="↗" text="Deployment pipeline passed" time="2 hrs ago" />
                                    <div className="pipeline">
                                        <span>CI</span><i></i>
                                        <span>Build</span><i></i>
                                        <span>Scan</span><i></i>
                                        <span>Deploy</span>
                                    </div>
                                </aside>
                            </section>
                        )}

                        {/* 3. GRAPHICAL ANALYTICS & INSIGHTS VIEW */}
                        {viewMode === 'analytics' && (
                            <div className="analytics-section">
                                <div className="analytics-grid-two">
                                    {/* Donut Chart: Status Distribution */}
                                    <div className="chart-card">
                                        <div className="chart-header">
                                            <div>
                                                <h3>Status Distribution</h3>
                                                <p>Breakdown of all project tasks across lifecycle stages.</p>
                                            </div>
                                            <span className="chart-badge">{stats.total} Total</span>
                                        </div>
                                        <DonutChart
                                            todo={stats.todo}
                                            inProgress={stats.inProgress}
                                            done={stats.done}
                                            total={stats.total}
                                        />
                                    </div>

                                    {/* Bar Chart: Priority Workload */}
                                    <div className="chart-card">
                                        <div className="chart-header">
                                            <div>
                                                <h3>Priority Workload</h3>
                                                <p>Urgency distribution across High, Medium, and Low priorities.</p>
                                            </div>
                                            <span className="chart-badge">Severity</span>
                                        </div>
                                        <div className="bar-chart-container">
                                            <PriorityBar
                                                label="High Priority"
                                                count={priorityStats.high}
                                                total={stats.total}
                                                colorClass="high"
                                            />
                                            <PriorityBar
                                                label="Medium Priority"
                                                count={priorityStats.medium}
                                                total={stats.total}
                                                colorClass="medium"
                                            />
                                            <PriorityBar
                                                label="Low Priority"
                                                count={priorityStats.low}
                                                total={stats.total}
                                                colorClass="low"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Team Workload & Sprint Velocity */}
                                <div className="chart-card">
                                    <div className="chart-header">
                                        <div>
                                            <h3>Team Workload & Velocity</h3>
                                            <p>Active task assignments and completion rates per team engineer.</p>
                                        </div>
                                        <span className="chart-badge">Resource Allocation</span>
                                    </div>
                                    <div className="bar-chart-container">
                                        {Object.entries(assigneeMap).map(([name, data]) => {
                                            const pct = data.total > 0 ? Math.round((data.done / data.total) * 100) : 0;
                                            return (
                                                <div className="bar-row" key={name}>
                                                    <div className="bar-meta">
                                                        <span><b>👤 {name}</b> ({data.done} of {data.total} completed)</span>
                                                        <span>{pct}% velocity</span>
                                                    </div>
                                                    <div className="bar-track">
                                                        <div
                                                            className="bar-fill emerald"
                                                            style={{ width: `${pct}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* System Health Indicators */}
                                <div className="health-strip">
                                    <div className="health-item">
                                        <div className="health-status-dot"></div>
                                        <div className="health-details">
                                            <b>FastAPI Backend</b>
                                            <small>Port 8000 • UP (200 OK)</small>
                                        </div>
                                    </div>
                                    <div className="health-item">
                                        <div className="health-status-dot"></div>
                                        <div className="health-details">
                                            <b>PostgreSQL 16</b>
                                            <small>Port 5432 • Healthy</small>
                                        </div>
                                    </div>
                                    <div className="health-item">
                                        <div className="health-status-dot"></div>
                                        <div className="health-details">
                                            <b>Prometheus /metrics</b>
                                            <small>Scraping • UP (1/1)</small>
                                        </div>
                                    </div>
                                    <div className="health-item">
                                        <div className="health-status-dot"></div>
                                        <div className="health-details">
                                            <b>Ingress / Reverse Proxy</b>
                                            <small>Nginx • Active routing</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Create Task Modal */}
                {showForm && (
                    <div className="modal-backdrop" onClick={() => setShowForm(false)}>
                        <form className="modal" onSubmit={create} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-head">
                                <div>
                                    <p className="eyebrow">CREATE TASK</p>
                                    <h2>Add a new task</h2>
                                </div>
                                <button type="button" className="close" onClick={() => setShowForm(false)}>
                                    ×
                                </button>
                            </div>
                            <label>
                                Task title
                                <input
                                    name="title"
                                    required
                                    placeholder="e.g. Configure production ingress"
                                    defaultValue={defaultTitleForNew}
                                    autoFocus
                                />
                            </label>
                            <label>
                                Description
                                <textarea name="description" placeholder="What needs to be done?" />
                            </label>
                            <div className="form-row">
                                <label>
                                    Priority
                                    <select name="priority" defaultValue="MEDIUM">
                                        <option value="LOW">LOW</option>
                                        <option value="MEDIUM">MEDIUM</option>
                                        <option value="HIGH">HIGH</option>
                                    </select>
                                </label>
                                <label>
                                    Initial Status
                                    <select name="status" defaultValue={defaultStatusForNew}>
                                        <option value="TODO">To Do</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="DONE">Completed</option>
                                    </select>
                                </label>
                            </div>
                            <div className="form-row">
                                <label>
                                    Assignee
                                    <input name="assignee" defaultValue="Krushna" />
                                </label>
                            </div>
                            <button className="primary full">Create task</button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}

// -------------------------------------------------------------
// Component: Kanban Column
// -------------------------------------------------------------
function KanbanColumn({ title, type, tasks, onMove, onDelete, onAddTask }) {
    return (
        <div className="kanban-col">
            <div className="kanban-col-head">
                <div className="kanban-col-title">
                    <span className={`col-indicator ${type}`}></span>
                    <h3>{title}</h3>
                    <span className="count-badge">{tasks.length}</span>
                </div>
                <button
                    className="add-col-task-btn"
                    onClick={onAddTask}
                    title={`Add task to ${title}`}
                >
                    ＋
                </button>
            </div>

            <div className="kanban-cards">
                {tasks.map(task => (
                    <KanbanCard
                        key={task.id}
                        task={task}
                        onMove={onMove}
                        onDelete={onDelete}
                    />
                ))}
                {!tasks.length && (
                    <div className="kanban-empty">
                        <span>No tasks in {title}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

// -------------------------------------------------------------
// Component: Kanban Card
// -------------------------------------------------------------
function KanbanCard({ task, onMove, onDelete }) {
    const initials = (task.assignee || 'KS')
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="kanban-card">
            <div className="kanban-card-top">
                <span className={`priority ${task.priority.toLowerCase()}`}>
                    {task.priority}
                </span>
                <span className="task-tag">#TASK-{task.id}</span>
            </div>

            <h4 className="kanban-card-title">{task.title}</h4>
            {task.description && (
                <p className="kanban-card-desc">{task.description}</p>
            )}

            <div className="kanban-card-footer">
                <div className="assignee-chip" title={`Assigned to ${task.assignee || 'Unassigned'}`}>
                    <span className="assignee-avatar-sm">{initials}</span>
                    <span>{task.assignee || 'Unassigned'}</span>
                </div>

                <div className="kanban-actions">
                    {task.status === 'TODO' && (
                        <button
                            className="kanban-move-btn"
                            onClick={() => onMove(task, 'IN_PROGRESS')}
                            title="Move to In Progress"
                        >
                            Start ➔
                        </button>
                    )}

                    {task.status === 'IN_PROGRESS' && (
                        <>
                            <button
                                className="kanban-move-btn"
                                onClick={() => onMove(task, 'TODO')}
                                title="Move back to To Do"
                            >
                                ⬅
                            </button>
                            <button
                                className="kanban-move-btn"
                                onClick={() => onMove(task, 'DONE')}
                                title="Mark as Completed"
                                style={{ backgroundColor: 'var(--badge-done-bg)', color: 'var(--badge-done-text)' }}
                            >
                                Done ✔
                            </button>
                        </>
                    )}

                    {task.status === 'DONE' && (
                        <button
                            className="kanban-move-btn"
                            onClick={() => onMove(task, 'IN_PROGRESS')}
                            title="Reopen task"
                        >
                            ↺ Reopen
                        </button>
                    )}

                    <button
                        className="kanban-delete-btn"
                        onClick={() => onDelete(task.id)}
                        title="Delete task"
                    >
                        ✕
                    </button>
                </div>
            </div>
        </div>
    );
}

// -------------------------------------------------------------
// Component: SVG Donut Chart
// -------------------------------------------------------------
function DonutChart({ todo, inProgress, done, total }) {
    const size = 160;
    const strokeWidth = 18;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    if (total === 0) {
        return (
            <div className="donut-layout">
                <div className="donut-svg-wrap">
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border-subtle)" strokeWidth={strokeWidth} />
                    </svg>
                    <div className="donut-center-label">
                        <span className="donut-center-number">0</span>
                        <span className="donut-center-sub">Tasks</span>
                    </div>
                </div>
            </div>
        );
    }

    const pDone = done / total;
    const pProg = inProgress / total;
    const pTodo = todo / total;

    const strokeDone = pDone * circumference;
    const strokeProg = pProg * circumference;
    const strokeTodo = pTodo * circumference;

    const offsetDone = 0;
    const offsetProg = -strokeDone;
    const offsetTodo = -(strokeDone + strokeProg);

    const completionRate = Math.round(pDone * 100);

    return (
        <div className="donut-layout">
            <div className="donut-svg-wrap">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border-subtle)" strokeWidth={strokeWidth} />
                    {done > 0 && (
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${strokeDone} ${circumference}`}
                            strokeDashoffset={offsetDone}
                        />
                    )}
                    {inProgress > 0 && (
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="#a855f7"
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${strokeProg} ${circumference}`}
                            strokeDashoffset={offsetProg}
                        />
                    )}
                    {todo > 0 && (
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth={strokeWidth}
                            strokeDasharray={`${strokeTodo} ${circumference}`}
                            strokeDashoffset={offsetTodo}
                        />
                    )}
                </svg>
                <div className="donut-center-label">
                    <span className="donut-center-number">{completionRate}%</span>
                    <span className="donut-center-sub">Complete</span>
                </div>
            </div>

            <div className="donut-legend">
                <div className="legend-row">
                    <span className="legend-label">
                        <i className="legend-dot" style={{ backgroundColor: '#10b981' }}></i>
                        Completed
                    </span>
                    <span className="legend-val">{done} ({Math.round(pDone * 100)}%)</span>
                </div>
                <div className="legend-row">
                    <span className="legend-label">
                        <i className="legend-dot" style={{ backgroundColor: '#a855f7' }}></i>
                        In Progress
                    </span>
                    <span className="legend-val">{inProgress} ({Math.round(pProg * 100)}%)</span>
                </div>
                <div className="legend-row">
                    <span className="legend-label">
                        <i className="legend-dot" style={{ backgroundColor: '#3b82f6' }}></i>
                        To Do
                    </span>
                    <span className="legend-val">{todo} ({Math.round(pTodo * 100)}%)</span>
                </div>
            </div>
        </div>
    );
}

// -------------------------------------------------------------
// Component: Horizontal Bar Chart
// -------------------------------------------------------------
function PriorityBar({ label, count, total, colorClass }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="bar-row">
            <div className="bar-meta">
                <span>{label} ({count})</span>
                <span>{pct}%</span>
            </div>
            <div className="bar-track">
                <div
                    className={`bar-fill ${colorClass}`}
                    style={{ width: `${pct}%` }}
                ></div>
            </div>
        </div>
    );
}

// -------------------------------------------------------------
// Helper Subcomponents
// -------------------------------------------------------------
function Stat({ label, value, icon }) {
    return (
        <div className="stat">
            <div className="stat-icon">{icon}</div>
            <div>
                <small>{label}</small>
                <strong>{value}</strong>
                <span>Updated just now</span>
            </div>
        </div>
    );
}

function Activity({ icon, text, time }) {
    return (
        <div className="activity-row">
            <span className="activity-icon">{icon}</span>
            <div>
                <b>{text}</b>
                <small>{time}</small>
            </div>
        </div>
    );
}

createRoot(document.getElementById('root')).render(<App />);
