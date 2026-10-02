const prettyType = (type) => type ? type.replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '—';
const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

export default function TemplateList({
  templates,
  loading,
  error,
  onEdit,
  onToggle,
  onRetry,
}) {
  return (
    <section className="forwarded-requests-panel" aria-labelledby="templates-list-title">
      <div className="forwarded-requests-heading">
        <div>
          <p className="admin-eyebrow">CERTIFICATE DESK</p>
          <h2 id="templates-list-title">Certificate Templates</h2>
          <p>Manage templates for each certificate type. Toggle active status to control which templates are used for generation.</p>
        </div>
        {!loading && !error && <span className="forwarded-requests-count">{templates.length} total</span>}
      </div>

      {loading && (
        <div className="team-leader-list" aria-label="Loading templates">
          {[1, 2, 3].map((item) => <div className="team-leader-skeleton" key={item} />)}
        </div>
      )}

      {!loading && error && (
        <div className="forwarded-requests-error" role="alert">
          <span>{error}</span>
          {onRetry && <button type="button" onClick={onRetry}>Retry</button>}
        </div>
      )}

      {!loading && !error && !templates.length && (
        <p className="forwarded-requests-state">No templates yet. Create your first template above.</p>
      )}

      {!loading && !error && templates.length > 0 && (
        <div className="forwarded-requests-list">
          {templates.map((template) => {
            const id = template._id || template.id;
            const isActive = template.isActive;
            const creator = template.createdBy || {};
            return (
              <article className="forwarded-request-row" key={id}>
                <div className="forwarded-request-details">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h3 style={{ margin: 0 }}>{template.name || template.templateName}</h3>
                    <span
                      className={`status-badge ${isActive ? 'status-active' : 'status-inactive'}`}
                      style={{
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        background: isActive ? '#d1fae5' : '#f3f4f6',
                        color: isActive ? '#065f46' : '#4b5563',
                      }}
                    >
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="forwarded-request-meta">
                    {prettyType(template.certificateType)} · Version {template.version || 1} · Updated {formatDate(template.updatedAt || template.createdAt)}
                  </p>
                  {template.description && (
                    <p className="forwarded-request-reason" style={{ marginTop: '6px' }}>
                      {template.description}
                    </p>
                  )}
                  {creator.fullName && (
                    <p style={{ marginTop: '6px', fontSize: '13px', color: '#6b7280' }}>
                      Created by {creator.fullName}
                    </p>
                  )}
                </div>
                <div className="forwarded-request-actions">
                  <button
                    type="button"
                    className="forwarded-approve-button"
                    onClick={() => onEdit && onEdit(template)}
                    style={{ background: '#3b82f6' }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="forwarded-reject-button"
                    onClick={() => onToggle && onToggle(id)}
                    style={{ background: isActive ? '#ef4444' : '#10b981' }}
                  >
                    {isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
