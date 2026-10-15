import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = '/api';

function App() {
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, done: 0 });
    const [filter, setFilter] = useState('ALL');
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentTab, setCurrentTab] = useState('dashboard');
    
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

    const filteredTasks = currentTab === 'my_tasks'
        ? tasks.filter(t => (t.assignee || '').toLowerCase().includes('krushna'))
        : tasks;

    const visible = filter === 'ALL'
        ? filteredTasks
        : filteredTasks.filter(t => t.status === filter);

    const update = async (t) => {
        const next = t.status === 'TODO' ? 'IN_PROGRESS' : t.status === 'IN_PROGRESS' ? 'DONE' : 'TODO';
        await fetch(`${API}/tasks/${t.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...t, status: next })
        });
        await load();
    };

    const remove = async (id) => {
        try {
            await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
            await load();
        } catch (err) {
            setError(err.message);
        }
    };

    const create = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const f = new FormData(form);
        try {
            const res = await fetch(`${API}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: f.get('title'),
                    description: f.get('description'),
                    priority: f.get('priority'),
                    assignee: f.get('assignee'),
                    status: 'TODO'
                })
            });
            if (!res.ok) throw new Error('Failed to create task');
            form.reset();
            setShowForm(false);
            await load();
        } catch (err) {
            setError(err.message);
        }
    };

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
                    <a className={currentTab === 'dashboard' ? 'active' : ''} onClick={() => setCurrentTab('dashboard')} style={{ cursor: 'pointer' }}>
                        ▦ <span>Dashboard</span>
                    </a>
                    <a className={currentTab === 'my_tasks' ? 'active' : ''} onClick={() => setCurrentTab('my_tasks')} style={{ cursor: 'pointer' }}>
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
                        <div className="avatar">KB</div>
                        <div>
                            <b>Krushna</b>
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
                        <button className="primary" onClick={() => setShowForm(true)}>
                            ＋ New task
                        </button>
                    </div>
                </header>

                {error && (
                    <div className="alert">
                        ⚠ {error}. Ensure the FastAPI backend and PostgreSQL are running.
                    </div>
                )}

                <section className="stats">
                    <Stat label="Total tasks" value={stats.total} icon="▦" />
                    <Stat label="To do" value={stats.todo} icon="○" />
                    <Stat label="In progress" value={stats.inProgress} icon="◔" />
                    <Stat label="Completed" value={stats.done} icon="✓" />
                </section>

                {currentTab === 'projects' ? (
                    <section className="content-grid" style={{ gridTemplateColumns: '1fr' }}>
                        <div className="panel" style={{ padding: '24px' }}>
                            <div className="panel-head" style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border-color)' }}>
                                <div>
                                    <h2>Workspace Projects</h2>
                                    <p className="muted">Microservices and infrastructure tracked in this environment.</p>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '20px' }}>
                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', backgroundColor: 'var(--bg-card-hover)' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 800, color: '#16a34a', background: 'var(--badge-done-bg)', padding: '4px 8px', borderRadius: '20px' }}>ACTIVE</span>
                                    <h3 style={{ margin: '12px 0 6px', fontSize: '16px', color: 'var(--text-main)' }}>TaskBoard Core SaaS</h3>
                                    <p className="muted" style={{ fontSize: '12px', marginBottom: '14px', lineHeight: 1.5 }}>FastAPI + React 18 + PostgreSQL application stack.</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                                        <span>Tasks: <b>{stats.total}</b></span>
                                        <span>Completed: <b>{stats.done}</b></span>
                                    </div>
                                </div>
                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', backgroundColor: 'var(--bg-card-hover)' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 800, color: '#9333ea', background: 'var(--badge-progress-bg)', padding: '4px 8px', borderRadius: '20px' }}>IAC / AWS</span>
                                    <h3 style={{ margin: '12px 0 6px', fontSize: '16px', color: 'var(--text-main)' }}>EKS Infrastructure</h3>
                                    <p className="muted" style={{ fontSize: '12px', marginBottom: '14px', lineHeight: 1.5 }}>Terraform VPC with private subnets & managed EKS 1.31 nodes.</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                                        <span>Nodes: <b>2-4 (t3.medium)</b></span>
                                        <span>Region: <b>ap-south-1</b></span>
                                    </div>
                                </div>
                                <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', backgroundColor: 'var(--bg-card-hover)' }}>
                                    <span style={{ fontSize: '9px', fontWeight: 800, color: '#d97706', background: 'var(--badge-med-bg)', padding: '4px 8px', borderRadius: '20px' }}>CI/CD & OPS</span>
                                    <h3 style={{ margin: '12px 0 6px', fontSize: '16px', color: 'var(--text-main)' }}>Automation & Observability</h3>
                                    <p className="muted" style={{ fontSize: '12px', marginBottom: '14px', lineHeight: 1.5 }}>GitHub Actions, Trivy scanner, Helm chart, and Prometheus metrics.</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                                        <span>Registry: <b>GHCR</b></span>
                                        <span>Metrics: <b>/metrics</b></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                ) : currentTab === 'activity' ? (
                    <section className="content-grid" style={{ gridTemplateColumns: '1fr' }}>
                        <div className="panel" style={{ padding: '24px' }}>
                            <div className="panel-head" style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border-color)' }}>
                                <div>
                                    <h2>Deployment & Audit Activity</h2>
                                    <p className="muted">Live event stream from local and pipeline executions.</p>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gap: '4px', marginTop: '16px' }}>
                                <Activity icon="✓" text="Docker Compose stack verified and healthy" time="Just now" />
                                <Activity icon="✓" text="PostgreSQL 16 migration 0001_create_tasks applied" time="5 min ago" />
                                <Activity icon="✓" text="Prometheus metric instrumentation active on /metrics" time="15 min ago" />
                                <Activity icon="◔" text="GitHub Actions CI/CD trigger received" time="45 min ago" />
                                <Activity icon="＋" text="TaskBoard repository initialized on main" time="1 hr ago" />
                            </div>
                            <div className="pipeline" style={{ margin: '24px 0 0', padding: '16px' }}>
                                <span>Pytest Gate</span><i></i>
                                <span>Vite Build</span><i></i>
                                <span>Docker Build</span><i></i>
                                <span>Trivy CVE Scan</span><i></i>
                                <span>GHCR Push</span><i></i>
                                <span>Helm Deploy</span>
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="content-grid">
                        <div className="panel tasks-panel">
                            <div className="panel-head">
                                <div>
                                    <h2>{currentTab === 'my_tasks' ? 'My Assigned Tasks' : 'Tasks'}</h2>
                                    <p className="muted">
                                        {currentTab === 'my_tasks' ? `Tasks assigned to Krushna (${visible.length})` : 'Track work across the product team.'}
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
                                            {visible.map(t => (
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
                                    {!visible.length && (
                                        <div className="empty">
                                            {currentTab === 'my_tasks' ? 'No tasks currently assigned to you.' : 'No tasks in this filter.'}
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

                {showForm && (
                    <div className="modal-backdrop">
                        <form className="modal" onSubmit={create}>
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
                                <input name="title" required placeholder="e.g. Configure production ingress" />
                            </label>
                            <label>
                                Description
                                <textarea name="description" placeholder="What needs to be done?" />
                            </label>
                            <div className="form-row">
                                <label>
                                    Priority
                                    <select name="priority">
                                        <option>LOW</option>
                                        <option>MEDIUM</option>
                                        <option>HIGH</option>
                                    </select>
                                </label>
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
