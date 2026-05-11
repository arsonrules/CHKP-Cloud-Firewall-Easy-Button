export default function ModuleSelect({ provider, modules, selected, onSelect, onNext, onBack, loading, error }) {
  return (
    <div>
      <h2 className="section-title">// Select Terraform Module</h2>

      {provider && (
        <div className="summary-chips">
          <span className="chip">Provider: {provider.name}</span>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <>
          <div className="spinner" />
          <p className="loading-text">CLONING REPO... THIS MAY TAKE A MOMENT</p>
        </>
      ) : modules.length === 0 ? (
        <div className="alert alert-info">No modules found in this provider's repository.</div>
      ) : (
        <div className="module-list">
          {modules.map((m) => (
            <div
              key={m.relativePath}
              className={`module-card ${selected?.relativePath === m.relativePath ? 'selected' : ''}`}
              onClick={() => onSelect(m)}
            >
              <div className="module-name">{m.name}</div>
              {m.relativePath !== '.' && (
                <div className="module-path">{m.relativePath}</div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="nav-row">
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <button
          className="btn btn-primary"
          disabled={!selected || loading}
          onClick={onNext}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
