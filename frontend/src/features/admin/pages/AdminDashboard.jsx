import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import CreateIntern from '../components/CreateIntern';
import CreateTl from '../components/CreateTl';
import ForwardedRequestsList from '../components/ForwardedRequestsList';
import TeamLeadersSection from '../components/TeamLeadersSection';
import TemplateForm from '../components/TemplateForm';
import TemplateList from '../components/TemplateList';
import AdminAnalytics from '../analytics/pages/AdminAnalytics';
import useTemplates from '../hooks/useTemplates';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState('overview');
  const [editingTemplate, setEditingTemplate] = useState(null);
  const {
    templates,
    certificateTypes,
    loading,
    saving,
    error,
    refetch,
    addTemplate,
    editTemplate,
    toggleActive,
  } = useTemplates();

  const initials = (user?.fullName || 'Admin')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const logout = () => {
    handleLogout();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard-shell">
      <header className="admin-topbar">
        <div className="admin-brand"><span className="admin-brand-icon">UP</span><strong>uptoskills</strong></div>
        <div className="admin-topbar-user">
          <div className="admin-avatar">{initials}</div>
          <div><strong>{user?.fullName || 'Administrator'}</strong><small>{user?.email || 'Loading profile...'}</small></div>
          <button className="admin-logout" onClick={logout} title="Sign out"><span>↩</span> Logout</button>
        </div>
      </header>

      <aside className="admin-sidebar" aria-label="Admin navigation">
        <p className="admin-sidebar-label">Workspace</p>
        <nav className="admin-sidebar-nav">
          <button className={`admin-nav-item ${activeView === 'overview' ? 'active' : ''}`} onClick={() => { setActiveView('overview'); setEditingTemplate(null); }}><span>▦</span> Overview</button>
          <button className={`admin-nav-item ${activeView === 'intern' ? 'active' : ''}`} onClick={() => { setActiveView('intern'); setEditingTemplate(null); }}><span>＋</span> Create Intern</button>
          <button className={`admin-nav-item ${activeView === 'teamleader' ? 'active' : ''}`} onClick={() => { setActiveView('teamleader'); setEditingTemplate(null); }}><span>♙</span> Create Team Leader</button>
          <button className={`admin-nav-item ${activeView === 'requests' ? 'active' : ''}`} onClick={() => { setActiveView('requests'); setEditingTemplate(null); }}><span>▤</span> Certificate Requests</button>
          <button className={`admin-nav-item ${activeView === 'analytics' ? 'active' : ''}`} onClick={() => { setActiveView('analytics'); setEditingTemplate(null); }}><span>◫</span> Analytics</button>
          <button className={`admin-nav-item ${activeView === 'templates' ? 'active' : ''}`} onClick={() => { setActiveView('templates'); setEditingTemplate(null); }}><span>❖</span> Templates</button>
        </nav>
        <div className="admin-sidebar-note"><span>●</span> Admin access enabled</div>
      </aside>

      <main className="admin-dashboard-main">
        <header className="admin-page-header">
          <p className="admin-eyebrow">ADMINISTRATION</p>
          <h1>{activeView === 'overview' ? 'Welcome back' : activeView === 'intern' ? 'Create an intern' : activeView === 'teamleader' ? 'Create a team leader' : activeView === 'requests' ? 'Certificate requests' : activeView === 'analytics' ? 'Admin Analytics' : 'Certificate Templates'}</h1>
          <p>{activeView === 'overview' ? 'Manage your portal accounts from one secure workspace.' : activeView === 'requests' ? 'Finalize certificate requests forwarded by Team Leaders.' : activeView === 'analytics' ? 'Monitor internship activity, certificate requests, turnaround time, and team leader performance.' : activeView === 'templates' ? 'Create and manage certificate templates. One active template per certificate type is recommended.' : 'Complete the details below to create a new portal account.'}</p>
        </header>

        {activeView === 'overview' ? (
          <>
            <section className="admin-profile-card" aria-label="Administrator profile">
              <div className="admin-profile-heading"><div className="admin-profile-avatar">{initials}</div><div><p className="admin-eyebrow">YOUR PROFILE</p><h2>{user?.fullName || 'Administrator'}</h2><p>{user?.email || 'Loading profile...'}</p></div></div>
              <div className="admin-profile-details">
                <div><span>Role</span><strong>{user?.role || 'admin'}</strong></div>
                <div><span>Mobile number</span><strong>{user?.mobileNo || 'Not provided'}</strong></div>
                <div><span>Member since</span><strong>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}</strong></div>
              </div>
              <div className="admin-quick-actions">
                <button onClick={() => setActiveView('intern')}><span>＋</span><strong>Create Intern</strong><small>Register a new intern account</small></button>
                <button onClick={() => setActiveView('teamleader')}><span>♙</span><strong>Create Team Leader</strong><small>Add a team leader to the portal</small></button>
                <button onClick={() => setActiveView('templates')}><span>❖</span><strong>Templates</strong><small>Manage certificate templates</small></button>
                <button onClick={() => setActiveView('analytics')}><span>◫</span><strong>Analytics</strong><small>View admin metrics</small></button>
              </div>
            </section>
            <TeamLeadersSection />
          </>
        ) : activeView === 'intern' ? <CreateIntern /> : activeView === 'teamleader' ? <CreateTl /> : activeView === 'requests' ? <ForwardedRequestsList /> : activeView === 'analytics' ? <AdminAnalytics /> : (
          <>
            <TemplateForm
              template={editingTemplate}
              certificateTypes={certificateTypes}
              onSubmit={async (payload) => {
                if (editingTemplate) {
                  const id = editingTemplate._id || editingTemplate.id;
                  await editTemplate(id, payload);
                  setEditingTemplate(null);
                } else {
                  await addTemplate(payload);
                }
              }}
              onCancel={editingTemplate ? () => setEditingTemplate(null) : undefined}
              saving={saving}
            />
            <TemplateList
              templates={templates}
              loading={loading}
              error={error}
              onEdit={(tpl) => { setEditingTemplate(tpl); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onToggle={(id) => toggleActive(id)}
              onRetry={refetch}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;