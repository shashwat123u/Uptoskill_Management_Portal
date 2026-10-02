export default function Toast({ type = 'info', children }) {
  const palette = {
    success: { background: '#dcfce7', color: '#166534' },
    error: { background: '#fee2e2', color: '#991b1b' },
    info: { background: '#e0f2fe', color: '#075985' },
  };

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      style={{ marginBottom: 20, padding: 12, borderRadius: 8, ...palette[type] }}
    >
      {children}
    </div>
  );
}