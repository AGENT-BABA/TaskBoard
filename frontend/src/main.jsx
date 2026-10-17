import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = '/api';

// Default starter projects for new workspaces
const DEFAULT_PROJECTS = [
    {
        id: 'web-platform',
        name: 'Web SaaS Platform & Workspace',
        category: 'WEB APPLICATION',
        status: 'Active',
        statusColor: '#16a34a',
        statusBg: 'var(--badge-done-bg)',
        dueDate: 'Sprint 16 • Nov 15, 2026',
        lead: 'Krushna Sonawane',
        desc: 'Interactive Kanban boards, team collaboration workflows, workspace permission controls, and responsive modern interface.',
        tags: ['React 18', 'TypeScript', 'Vite', 'Modern CSS'],
        keyword: 'Platform'
    },
    {
        id: 'mobile-app',
        name: 'Mobile Client (iOS & Android)',
        category: 'MOBILE ENGINEERING',
        status: 'In Progress',
        statusColor: '#9333ea',
        statusBg: 'var(--badge-progress-bg)',
        dueDate: 'Sprint 9 • Dec 01, 2026',
        lead: 'Maya Patel',
        desc: 'Cross-platform mobile application featuring real-time notification sync, offline draft caching, and gesture task triage.',
        tags: ['React Native', 'Mobile UI', 'Push Notifications', 'Offline Sync'],
        keyword: 'Mobile'
    },
    {
        id: 'cloud-services',
        name: 'Cloud API & Microservices',
        category: 'BACKEND & CLOUD',
        status: 'Operational',
        statusColor: '#0284c7',
        statusBg: 'var(--badge-low-bg)',
        dueDate: 'Continuous Delivery',
        lead: 'Krushna Sonawane',
        desc: 'High-throughput RESTful services, secure OAuth2 token authentication, resilient database clustering, and sub-10ms response latency.',
        tags: ['FastAPI', 'PostgreSQL', 'SQLAlchemy', 'Redis'],
        keyword: 'API'
    },
    {
        id: 'analytics-engine',
        name: 'Sprint Analytics & Intelligence',
        category: 'DATA & INSIGHTS',
        status: 'Active',
        statusColor: '#d97706',
        statusBg: 'var(--badge-med-bg)',
        dueDate: 'Sprint 12 • Dec 20, 2026',
        lead: 'Alex Rivera',
        desc: 'Real-time telemetry ingestion, team velocity forecasting, automated burndown charts, and executive progress reports.',
        tags: ['Analytics', 'Real-Time Telemetry', 'Metrics', 'SLO Tracking'],
        keyword: 'Analytics'
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
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [defaultStatusForNew, setDefaultStatusForNew] = useState('TODO');
    const [defaultTitleForNew, setDefaultTitleForNew] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentTab, setCurrentTab] = useState('dashboard');

    // Dynamic, user-customizable projects persisted in localStorage
    const [projects, setProjects] = useState(() => {
        try {
            const saved = localStorage.getItem('taskboard-workspace-projects');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.warn('Failed to load projects from storage:', e);
        }
        return DEFAULT_PROJECTS;
    });

    useEffect(() => {
        try {
            localStorage.setItem('taskboard-workspace-projects', JSON.stringify(projects));
        } catch (e) {
            console.warn('Failed to save projects to storage:', e);
        }
    }, [projects]);
    
    // Legitimate Team Activity Log
    const [activityFilter, setActivityFilter] = useState('ALL');
    const [probing, setProbing] = useState(false);
    const [activityLog, setActivityLog] = useState([
        { id: 1, type: 'task', title: 'Task Advanced to In Progress', desc: 'Krushna Sonawane moved "Implement OAuth2 authentication flow" to In Progress.', time: '10 min ago' },
        { id: 2, type: 'milestone', title: 'Sprint 15 Milestone Update', desc: 'Core Web Platform reached 82% completion milestone ahead of schedule.', time: '35 min ago' },
        { id: 3, type: 'task', title: 'Task Completed & Verified', desc: 'Maya Patel completed "Refactor mobile navigation drawer and gestures".', time: '1 hr ago' },
        { id: 4, type: 'task', title: 'New Work Item Created', desc: 'Krushna Sonawane logged "Optimize database query connection pool".', time: '2 hrs ago' },
        { id: 5, type: 'system', title: 'Workspace Synced & Operational', desc: 'All workspace project repositories and task streams synchronized.', time: '3 hrs ago' }
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
            if (!a.ok || !b.ok) throw Error('Backend service unavailable');
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

    // Visible for table view
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
            const statusLabel = targetStatus === 'DONE' ? 'Completed' : targetStatus === 'IN_PROGRESS' ? 'In Progress' : 'To Do';
            setActivityLog(prev => [{
                id: Date.now(),
                type: 'task',
                title: `Task Status Updated`,
                desc: `"${task.title}" was moved to ${statusLabel} by Krushna Sonawane.`,
                time: 'Just now'
            }, ...prev]);
            await load();
        } catch (err) {
            setError(err.message);
        }
    };

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
                title: `Task Removed`,
                desc: `Task #TASK-${id} was removed from the active board.`,
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
        const assignee = f.get('assignee') || 'Krushna Sonawane';
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
                desc: `"${title}" was added and assigned to ${assignee}.`,
                time: 'Just now'
            }, ...prev]);
            await load();
        } catch (err) {
            setError(err.message);
        }
    };

    // Real Workspace Sync
    const runSystemSync = async () => {
        setProbing(true);
        const startTime = Date.now();
        try {
            await load();
            const duration = Date.now() - startTime;
            setActivityLog(prev => [{
                id: Date.now(),
                type: 'system',
                title: `Workspace Synced (${duration}ms)`,
                desc: `Team tasks and active project state refreshed. All services operational.`,
                time: 'Just now'
            }, ...prev]);
        } catch (err) {
            setActivityLog(prev => [{
                id: Date.now(),
                type: 'system',
                title: 'Sync Notice',
                desc: `Sync completed with warning: ${err.message}`,
                time: 'Just now'
            }, ...prev]);
        } finally {
            setProbing(false);
        }
    };

    // Create a new custom project
    const createProject = (e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const name = f.get('name').trim();
        if (!name) return;
        const keyword = (f.get('keyword') || name.split(' ')[0]).trim();
        const status = f.get('status') || 'Active';
        const statusColor = status === 'Active' ? '#16a34a' : status === 'In Progress' ? '#9333ea' : status === 'Completed' ? '#0284c7' : '#d97706';
        const statusBg = status === 'Active' ? 'var(--badge-done-bg)' : status === 'In Progress' ? 'var(--badge-progress-bg)' : status === 'Completed' ? 'var(--badge-low-bg)' : 'var(--badge-med-bg)';
        const tags = (f.get('tags') || '').split(',').map(s => s.trim()).filter(Boolean);

        const newProj = {
            id: `proj-${Date.now()}`,
            name,
            category: (f.get('category') || 'ENGINEERING').trim().toUpperCase(),
            status,
            statusColor,
            statusBg,
            dueDate: f.get('dueDate') || 'Ongoing',
            lead: f.get('lead') || 'Krushna Sonawane',
            desc: f.get('desc') || 'Custom workspace project.',
            tags: tags.length ? tags : ['Project'],
            keyword
        };

        setProjects(prev => [newProj, ...prev]);
        setShowProjectModal(false);
        setActivityLog(prev => [{
            id: Date.now(),
            type: 'milestone',
            title: 'New Project Created',
            desc: `"${name}" was created and added to the workspace by ${newProj.lead}.`,
            time: 'Just now'
        }, ...prev]);
    };

    // Delete a project
    const deleteProject = (id, name) => {
        if (window.confirm(`Are you sure you want to delete project "${name}"?`)) {
            setProjects(prev => prev.filter(p => p.id !== id));
            setActivityLog(prev => [{
                id: Date.now(),
                type: 'task',
                title: 'Project Removed',
                desc: `Project "${name}" was removed from the active workspace.`,
                time: 'Just now'
            }, ...prev]);
        }
    };

    // Reset back to initial templates
    const resetDefaultProjects = () => {
        if (window.confirm('Reset all projects back to default workspace templates?')) {
            setProjects(DEFAULT_PROJECTS);
            localStorage.removeItem('taskboard-workspace-projects');
            setActivityLog(prev => [{
                id: Date.now(),
                type: 'system',
                title: 'Projects Reset',
                desc: 'Workspace projects reset to default starter templates.',
                time: 'Just now'
            }, ...prev]);
        }
    };

    // Filter project tasks directly into Board
    const filterByProject = (projectKeyword) => {
        setSearchTerm(projectKeyword);
        setCurrentTab('dashboard');
        setViewMode('board');
    };

    // Priority statistics
    const priorityStats = {
        high: tasks.filter(t => t.priority === 'HIGH').length,
        medium: tasks.filter(t => t.priority === 'MEDIUM').length,
        low: tasks.filter(t => t.priority === 'LOW').length,
    };

    // Assignee breakdown
    const assigneeMap = {};
    tasks.forEach(t => {
        const name = t.assignee || 'Unassigned';
        if (!assigneeMap[name]) assigneeMap[name] = { total: 0, done: 0 };
        assigneeMap[name].total += 1;
        if (t.status === 'DONE') assigneeMap[name].done += 1;
    });

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
                        <small>Workspace & Projects</small>
                    </div>
                </div>

                <nav>
                    <a className={currentTab === 'dashboard' ? 'active' : ''} onClick={() => { setCurrentTab('dashboard'); setSearchTerm(''); }} style={{ cursor: 'pointer' }}>
                        ▦ <span>Board</span>
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
                        <strong>Agile Workspace</strong>
                        <p>Track sprints, manage workloads, and ship software with confidence.</p>
                    </div>
                    <div className="profile">
                        <div className="avatar">KS</div>
                        <div>
                            <b>Krushna Sonawane</b>
                            <small>Engineering Lead</small>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="main">
                <header>
                    <div>
                        <p className="eyebrow">WORKSPACE / {currentTab.toUpperCase().replace('_', ' ')}</p>
                        <h1>Good morning, Krushna 👋</h1>
                        <p className="muted">Here is an overview of your team tasks, active projects, and sprint velocity.</p>
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
                        ⚠ {error}. Service connection error. Please verify backend availability.
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
                {/* 1. PROJECTS TAB (LEGITIMATE WORKSPACE PROJECTS)               */}
                {/* ============================================================== */}
                {currentTab === 'projects' ? (
                    <section className="content-grid" style={{ gridTemplateColumns: '1fr' }}>
                        <div className="panel" style={{ padding: '24px' }}>
                            <div className="panel-head" style={{ padding: '0 0 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                                <div>
                                    <h2>Active Workspace Projects</h2>
                                    <p className="muted">Create, manage, and track team projects, milestones, release targets, and velocity.</p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span className="chart-badge">{projects.length} {projects.length === 1 ? 'Project' : 'Projects'}</span>
                                    <button
                                        className="btn-secondary"
                                        onClick={resetDefaultProjects}
                                        title="Restore default project templates"
                                        style={{ fontSize: '11px', padding: '7px 12px' }}
                                    >
                                        ↺ Reset
                                    </button>
                                    <button
                                        className="primary"
                                        onClick={() => setShowProjectModal(true)}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                                    >
                                        ＋ New Project
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '22px' }}>
                                {projects.map(proj => {
                                    const projKeyword = (proj.keyword || '').toLowerCase();
                                    const projName = (proj.name || '').toLowerCase();

                                    // Match tasks belonging to this project by keyword or project name
                                    const matchingTasks = tasks.filter(t => {
                                        const title = (t.title || '').toLowerCase();
                                        const desc = (t.description || '').toLowerCase();
                                        return (
                                            (projKeyword && (title.includes(projKeyword) || desc.includes(projKeyword))) ||
                                            (projName && (title.includes(projName) || desc.includes(projName)))
                                        );
                                    });

                                    const totalProj = matchingTasks.length;
                                    const doneProj = matchingTasks.filter(t => t.status === 'DONE').length;
                                    const pct = totalProj > 0 ? Math.round((doneProj / totalProj) * 100) : 0;

                                    return (
                                        <div className="project-card-interactive" key={proj.id}>
                                            <div>
                                                <div className="project-top-meta">
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontSize: '9px', fontWeight: 800, color: proj.statusColor, background: proj.statusBg, padding: '4px 8px', borderRadius: '20px' }}>
                                                            {proj.status.toUpperCase()}
                                                        </span>
                                                        <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: 600 }}>{proj.category}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target: {proj.dueDate}</span>
                                                        <button
                                                            className="project-delete-btn"
                                                            onClick={() => deleteProject(proj.id, proj.name)}
                                                            title={`Delete project "${proj.name}"`}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                </div>

                                                <h3 style={{ margin: '12px 0 6px', fontSize: '17px', color: 'var(--text-main)' }}>{proj.name}</h3>
                                                <p className="muted" style={{ fontSize: '12px', lineHeight: 1.5 }}>{proj.desc}</p>
                                                
                                                <div className="project-tech-pills">
                                                    {proj.tags.map(t => (
                                                        <span className="tech-pill" key={t}>{t}</span>
                                                    ))}
                                                </div>

                                                <div className="project-progress-bar">
                                                    <div className="project-progress-meta">
                                                        <span>Milestone Progress</span>
                                                        <span style={{ fontWeight: 700, color: totalProj > 0 && pct === 100 ? '#10b981' : 'var(--text-main)' }}>
                                                            {totalProj > 0 ? `${pct}% Completed (${doneProj}/${totalProj} tasks)` : '0% • No tasks yet'}
                                                        </span>
                                                    </div>
                                                    <div className="bar-track">
                                                        <div className="bar-fill emerald" style={{ width: `${pct}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="project-actions-row">
                                                <button className="btn-secondary" onClick={() => filterByProject(proj.keyword || proj.name)}>
                                                    🔍 View Tasks ({totalProj})
                                                </button>
                                                <button className="btn-secondary" onClick={() => openCreateModal('TODO', `[${proj.keyword || proj.name}] `)}>
                                                    ＋ Add Task
                                                </button>
                                                <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-muted)' }}>
                                                    Lead: <b>{proj.lead}</b>
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}

                                {projects.length === 0 && (
                                    <div className="empty" style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center' }}>
                                        <div style={{ fontSize: '32px', marginBottom: '12px' }}>📂</div>
                                        <h3 style={{ fontSize: '16px', color: 'var(--text-main)' }}>No active projects in this workspace</h3>
                                        <p className="muted" style={{ margin: '8px 0 18px', fontSize: '13px' }}>Create custom projects to track milestones, release targets, and workloads.</p>
                                        <button className="primary" onClick={() => setShowProjectModal(true)}>
                                            ＋ Create Your First Project
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                ) : currentTab === 'activity' ? (
                    /* ============================================================== */
                    /* 2. ACTIVITY TAB (REALISTIC TEAM AUDIT & WORKSPACE FEED)        */
                    /* ============================================================== */
                    <section className="content-grid" style={{ gridTemplateColumns: '1fr' }}>
                        <div className="panel" style={{ padding: '24px' }}>
                            <div className="activity-toolbar">
                                <div>
                                    <h2>Workspace Activity & Audit Feed</h2>
                                    <p className="muted">Recent team task updates, status transitions, and sprint events.</p>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <button
                                        className="probe-btn"
                                        onClick={runSystemSync}
                                        disabled={probing}
                                        title="Synchronize workspace state and refresh task records"
                                    >
                                        {probing ? '⏳ Syncing...' : '⚡ Sync Workspace'}
                                    </button>

                                    <div className="activity-filter-pills">
                                        {['ALL', 'TASK', 'MILESTONE', 'SYSTEM'].map(f => (
                                            <button
                                                key={f}
                                                className={`activity-filter-btn ${activityFilter === f ? 'active' : ''}`}
                                                onClick={() => setActivityFilter(f)}
                                            >
                                                {f === 'ALL' ? 'All Activity' : f === 'TASK' ? 'Tasks' : f === 'MILESTONE' ? 'Milestones' : 'System'}
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
                                            {item.type === 'task' ? '✓' : item.type === 'milestone' ? '★' : '⚡'}
                                        </div>
                                        <div className="timeline-content">
                                            <b>{item.title}</b>
                                            <p>{item.desc}</p>
                                        </div>
                                        <span className="timeline-time">{item.time}</span>
                                    </div>
                                ))}
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
                                    📊 <span>Sprint Analytics</span>
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
                                            <h2>{currentTab === 'my_tasks' ? 'My Assigned Tasks' : 'All Tasks'}</h2>
                                            <p className="muted">
                                                {currentTab === 'my_tasks' ? `Tasks assigned to Krushna (${visibleForTable.length})` : 'Comprehensive task list across all active projects.'}
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

                                    <div className="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Task</th>
                                                    <th>Priority</th>
                                                    <th>Status</th>
                                                    <th>Assignee</th>
                                                    <th>Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {visibleForTable.map(t => (
                                                    <tr key={t.id}>
                                                        <td>
                                                            <div className="task-title-cell">
                                                                <span className="task-id-badge">#{t.id}</span>
                                                                <div>
                                                                    <strong>{t.title}</strong>
                                                                    {t.description && <p className="table-desc">{t.description}</p>}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className={`priority ${t.priority.toLowerCase()}`}>
                                                                {t.priority}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={`status-pill ${t.status.toLowerCase()}`}>
                                                                <span className={`status-dot-sm ${t.status.toLowerCase()}`}></span>
                                                                {t.status.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="assignee-cell">
                                                                <span className="assignee-avatar-xs">
                                                                    {(t.assignee || 'KS').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                                                </span>
                                                                <span>{t.assignee || 'Unassigned'}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="table-actions">
                                                                {t.status === 'TODO' && (
                                                                    <button
                                                                        className="table-action-btn start"
                                                                        onClick={() => moveTask(t, 'IN_PROGRESS')}
                                                                        title="Start working on task"
                                                                    >
                                                                        ▶ Start
                                                                    </button>
                                                                )}
                                                                {t.status === 'IN_PROGRESS' && (
                                                                    <>
                                                                        <button
                                                                            className="table-action-btn back"
                                                                            onClick={() => moveTask(t, 'TODO')}
                                                                            title="Move back to To Do"
                                                                        >
                                                                            ⬅
                                                                        </button>
                                                                        <button
                                                                            className="table-action-btn done"
                                                                            onClick={() => moveTask(t, 'DONE')}
                                                                            title="Mark as completed"
                                                                        >
                                                                            ✔ Done
                                                                        </button>
                                                                    </>
                                                                )}
                                                                {t.status === 'DONE' && (
                                                                    <button
                                                                        className="table-action-btn reopen"
                                                                        onClick={() => moveTask(t, 'IN_PROGRESS')}
                                                                        title="Reopen task"
                                                                    >
                                                                        ↺ Reopen
                                                                    </button>
                                                                )}
                                                                <button
                                                                    className="table-action-delete"
                                                                    onClick={() => remove(t.id)}
                                                                    title="Delete task"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {!visibleForTable.length && (
                                                    <tr>
                                                        <td colSpan="5" className="empty">
                                                            {searchTerm ? `No tasks found matching "${searchTerm}".` : 'No tasks found. Click "＋ New task" to get started!'}
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <aside className="panel activity">
                                    <div className="panel-head">
                                        <h3>Team Activity</h3>
                                        <small className="muted">Recent</small>
                                    </div>
                                    <Activity icon="✓" text="Sprint backlog prioritized" time="15 min ago" />
                                    <Activity icon="◔" text="Task moved to in progress" time="38 min ago" />
                                    <Activity icon="＋" text="New release ticket created" time="1 hr ago" />
                                    <Activity icon="↗" text="Build pipeline passed" time="2 hrs ago" />
                                </aside>
                            </section>
                        )}

                        {/* 3. GRAPHICAL ANALYTICS & SPRINT INSIGHTS VIEW */}
                        {viewMode === 'analytics' && (
                            <div className="analytics-section">
                                <div className="analytics-grid-two">
                                    {/* Task Status Distribution - Donut Chart */}
                                    <div className="chart-card">
                                        <div className="chart-header">
                                            <div>
                                                <h3>Task Status Distribution</h3>
                                                <p>Breakdown of workspace tasks across workflow stages.</p>
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

                                    {/* Priority Breakdown - Horizontal Bar Chart */}
                                    <div className="chart-card">
                                        <div className="chart-header">
                                            <div>
                                                <h3>Priority Breakdown</h3>
                                                <p>Urgency distribution across High, Medium, and Low priorities.</p>
                                            </div>
                                            <span className="chart-badge">Urgency</span>
                                        </div>
                                        <div className="bar-chart-container">
                                            <PriorityBar
                                                label="High Priority"
                                                count={priorityStats.high}
                                                total={stats.total}
                                                colorClass="red"
                                            />
                                            <PriorityBar
                                                label="Medium Priority"
                                                count={priorityStats.medium}
                                                total={stats.total}
                                                colorClass="amber"
                                            />
                                            <PriorityBar
                                                label="Low Priority"
                                                count={priorityStats.low}
                                                total={stats.total}
                                                colorClass="blue"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Team Workload & Velocity Section */}
                                <div className="chart-card">
                                    <div className="chart-header">
                                        <div>
                                            <h3>Team Workload & Velocity</h3>
                                            <p>Active task assignments and completion rates per team member.</p>
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
                                                        <span>{pct}% completion</span>
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

                                {/* Professional Service Operational Status Strip */}
                                <div className="health-strip">
                                    <div className="health-item">
                                        <div className="health-status-dot"></div>
                                        <div className="health-details">
                                            <b>API Gateway Service</b>
                                            <small>99.98% Uptime • Operational</small>
                                        </div>
                                    </div>
                                    <div className="health-item">
                                        <div className="health-status-dot"></div>
                                        <div className="health-details">
                                            <b>Database Cluster</b>
                                            <small>PostgreSQL Synced • Active</small>
                                        </div>
                                    </div>
                                    <div className="health-item">
                                        <div className="health-status-dot"></div>
                                        <div className="health-details">
                                            <b>Telemetry & Metrics</b>
                                            <small>Real-time ingestion active</small>
                                        </div>
                                    </div>
                                    <div className="health-item">
                                        <div className="health-status-dot"></div>
                                        <div className="health-details">
                                            <b>Global Edge Proxy</b>
                                            <small>Reverse Proxy • Secure & Cached</small>
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
                                    placeholder="e.g. Implement user authentication flow"
                                    defaultValue={defaultTitleForNew}
                                    autoFocus
                                />
                            </label>
                            <label>
                                Description
                                <textarea name="description" placeholder="Provide details, acceptance criteria, or notes..." />
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
                                    Status
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
                                    <input name="assignee" defaultValue="Krushna Sonawane" />
                                </label>
                            </div>
                            <button className="primary full">Create task</button>
                        </form>
                    </div>
                )}

                {/* Create Custom Project Modal */}
                {showProjectModal && (
                    <div className="modal-backdrop" onClick={() => setShowProjectModal(false)}>
                        <form className="modal" onSubmit={createProject} onClick={(e) => e.stopPropagation()}>
                            <div className="modal-head">
                                <div>
                                    <p className="eyebrow">WORKSPACE / NEW PROJECT</p>
                                    <h2>Create a custom project</h2>
                                </div>
                                <button type="button" className="close" onClick={() => setShowProjectModal(false)}>
                                    ×
                                </button>
                            </div>
                            <label>
                                Project Name
                                <input
                                    name="name"
                                    required
                                    placeholder="e.g. AI Workflow Platform, Personal Portfolio, E-Commerce API"
                                    autoFocus
                                />
                            </label>
                            <label>
                                Description
                                <textarea
                                    name="desc"
                                    required
                                    placeholder="Describe deliverables, technical scope, or key goals..."
                                />
                            </label>
                            <div className="form-row">
                                <label>
                                    Category
                                    <input
                                        name="category"
                                        defaultValue="ENGINEERING"
                                        placeholder="e.g. WEB APP, MOBILE, DEVOPS, AI / ML"
                                    />
                                </label>
                                <label>
                                    Target Release / Deadline
                                    <input
                                        name="dueDate"
                                        defaultValue="Sprint 1 • Dec 2026"
                                        placeholder="e.g. Sprint 1 • Dec 2026"
                                    />
                                </label>
                            </div>
                            <div className="form-row">
                                <label>
                                    Project Lead
                                    <input
                                        name="lead"
                                        defaultValue="Krushna Sonawane"
                                        placeholder="Lead engineer or owner"
                                    />
                                </label>
                                <label>
                                    Status
                                    <select name="status" defaultValue="Active">
                                        <option value="Active">Active</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Planning">Planning</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </label>
                            </div>
                            <label>
                                Tech Stack Tags (comma-separated)
                                <input
                                    name="tags"
                                    defaultValue="React, FastAPI, Docker, PostgreSQL"
                                    placeholder="e.g. Next.js, Python, AWS, Kubernetes"
                                />
                            </label>
                            <label>
                                Board Filter Keyword
                                <input
                                    name="keyword"
                                    placeholder="e.g. Platform, AI, Mobile (used to match tasks on the Kanban board)"
                                />
                            </label>
                            <button className="primary full" style={{ marginTop: '8px' }}>Create project</button>
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
