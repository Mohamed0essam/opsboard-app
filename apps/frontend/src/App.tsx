import { useEffect, useMemo, useState } from 'react';

type User = {
  id: number;
  email: string;
  full_name?: string;
  role: string;
};

type Project = {
  id: number;
  name: string;
  description: string;
  environment: 'dev' | 'staging' | 'prod';
  created_at: string;
};

type Incident = {
  id: number;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'mitigated' | 'resolved';
  created_at: string;
  project_name: string;
};

const tokenKey = 'opsboard-token';
const userKey = 'opsboard-user';

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(tokenKey);
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, { ...options, headers });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ? JSON.stringify(data.message) : 'Request failed');
  }

  return data as T;
}

export function App() {
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(userKey);
    return raw ? JSON.parse(raw) : null;
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [error, setError] = useState<string>('');
  const [authForm, setAuthForm] = useState({
    email: '',
    fullName: '',
    password: ''
  });
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    environment: 'dev' as 'dev' | 'staging' | 'prod'
  });
  const [incidentForm, setIncidentForm] = useState({
    projectId: '',
    title: '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical'
  });

  const projectOptions = useMemo(
    () => projects.map((project) => ({ value: String(project.id), label: project.name })),
    [projects]
  );

  async function loadDashboard() {
    try {
      const projectResponse = await api<{ items: Project[] }>('/api/projects');
      const incidentResponse = await api<{ items: Incident[] }>('/api/incidents');
      setProjects(projectResponse.items);
      setIncidents(incidentResponse.items);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    }
  }

  useEffect(() => {
    if (user) {
      void loadDashboard();
    }
  }, [user]);

  async function submitAuth(event: React.FormEvent) {
    event.preventDefault();
    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload =
        mode === 'register'
          ? {
              email: authForm.email,
              fullName: authForm.fullName,
              password: authForm.password
            }
          : {
              email: authForm.email,
              password: authForm.password
            };

      const response = await api<{ token: string; user: User }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      localStorage.setItem(tokenKey, response.token);
      localStorage.setItem(userKey, JSON.stringify(response.user));
      setUser(response.user);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  }

  async function submitProject(event: React.FormEvent) {
    event.preventDefault();
    try {
      await api('/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectForm)
      });
      setProjectForm({ name: '', description: '', environment: 'dev' });
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  }

  async function submitIncident(event: React.FormEvent) {
    event.preventDefault();
    try {
      await api('/api/incidents', {
        method: 'POST',
        body: JSON.stringify({
          ...incidentForm,
          projectId: Number(incidentForm.projectId)
        })
      });
      setIncidentForm({
        projectId: '',
        title: '',
        description: '',
        severity: 'medium'
      });
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create incident');
    }
  }

  async function updateIncidentStatus(id: number, status: Incident['status']) {
    try {
      await api(`/api/incidents/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update incident');
    }
  }

  function logout() {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    setUser(null);
    setProjects([]);
    setIncidents([]);
  }

  if (!user) {
    return (
      <main className="shell auth-shell">
        <section className="card auth-card">
          <h1>OpsBoard</h1>
          <p className="muted">A starter application for your DevOps project.</p>

          <div className="tabs">
            <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>
              Register
            </button>
            <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>
              Login
            </button>
          </div>

          <form onSubmit={submitAuth} className="form">
            <label>
              Email
              <input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                required
              />
            </label>

            {mode === 'register' && (
              <label>
                Full name
                <input
                  value={authForm.fullName}
                  onChange={(e) => setAuthForm({ ...authForm, fullName: e.target.value })}
                  required
                />
              </label>
            )}

            <label>
              Password
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                required
              />
            </label>

            <button type="submit">{mode === 'register' ? 'Create account' : 'Sign in'}</button>
          </form>

          {error && <p className="error">{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <header className="header">
        <div>
          <h1>OpsBoard Dashboard</h1>
          <p className="muted">
            Signed in as {user.email} ({user.role})
          </p>
        </div>
        <button type="button" onClick={logout}>Logout</button>
      </header>

      {error && <p className="error">{error}</p>}

      <section className="grid">
        <article className="card">
          <h2>Create project</h2>
          <form onSubmit={submitProject} className="form">
            <label>
              Name
              <input
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                required
              />
            </label>
            <label>
              Description
              <textarea
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                required
              />
            </label>
            <label>
              Environment
              <select
                value={projectForm.environment}
                onChange={(e) =>
                  setProjectForm({ ...projectForm, environment: e.target.value as 'dev' | 'staging' | 'prod' })
                }
              >
                <option value="dev">dev</option>
                <option value="staging">staging</option>
                <option value="prod">prod</option>
              </select>
            </label>
            <button type="submit">Save project</button>
          </form>
        </article>

        <article className="card">
          <h2>Create incident</h2>
          <form onSubmit={submitIncident} className="form">
            <label>
              Project
              <select
                value={incidentForm.projectId}
                onChange={(e) => setIncidentForm({ ...incidentForm, projectId: e.target.value })}
                required
              >
                <option value="">Select a project</option>
                {projectOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Title
              <input
                value={incidentForm.title}
                onChange={(e) => setIncidentForm({ ...incidentForm, title: e.target.value })}
                required
              />
            </label>

            <label>
              Description
              <textarea
                value={incidentForm.description}
                onChange={(e) => setIncidentForm({ ...incidentForm, description: e.target.value })}
                required
              />
            </label>

            <label>
              Severity
              <select
                value={incidentForm.severity}
                onChange={(e) =>
                  setIncidentForm({
                    ...incidentForm,
                    severity: e.target.value as 'low' | 'medium' | 'high' | 'critical'
                  })
                }
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
                <option value="critical">critical</option>
              </select>
            </label>

            <button type="submit">Create incident</button>
          </form>
        </article>
      </section>

      <section className="grid">
        <article className="card">
          <h2>Projects</h2>
          <div className="list">
            {projects.map((project) => (
              <div key={project.id} className="list-item">
                <strong>{project.name}</strong>
                <span>{project.environment}</span>
                <p>{project.description}</p>
              </div>
            ))}
            {projects.length === 0 && <p className="muted">No projects yet.</p>}
          </div>
        </article>

        <article className="card">
          <h2>Incidents</h2>
          <div className="list">
            {incidents.map((incident) => (
              <div key={incident.id} className="list-item">
                <div className="incident-top">
                  <strong>{incident.title}</strong>
                  <span className={`badge severity-${incident.severity}`}>{incident.severity}</span>
                </div>
                <p>{incident.description}</p>
                <small>
                  Project: {incident.project_name} · Status: {incident.status}
                </small>
                <div className="button-row">
                  {(['investigating', 'mitigated', 'resolved'] as const).map((status) => (
                    <button type="button" key={status} onClick={() => updateIncidentStatus(incident.id, status)}>
                      Mark {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {incidents.length === 0 && <p className="muted">No incidents yet.</p>}
          </div>
        </article>
      </section>
    </main>
  );
}
