import Loading from './Loading';

export default function ModuleSelect({ provider, modules, selected, onSelect, onNext, onBack, loading, error }) {
  return (
    <div>
      <h2 className="section-title">
        Select deployment module
        <span className="count">{modules.length} modules</span>
      </h2>

      {provider && (
        <div className="summary-chips">
          <span className="chip">Provider<b>{provider.name}</b></span>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <Loading>Fetching modules from Terraform Registry</Loading>
      ) : modules.length === 0 ? (
        <div className="alert alert-info">No modules published for this provider.</div>
      ) : (
        <div className="module-list">
          {modules.map((m) => (
            <button
              key={m.relativePath}
              type="button"
              className={`card module-card ${selected?.relativePath === m.relativePath ? 'selected' : ''}`}
              aria-pressed={selected?.relativePath === m.relativePath}
              onClick={() => onSelect(m)}
            >
              <span className="kick">Module</span>
              <span className="pname">{m.name}</span>
              {m.relativePath !== '.' && <span className="role">{m.relativePath}</span>}
            </button>
          ))}
        </div>
      )}

      <div className="nav-row">
        <button className="btn" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" disabled={!selected || loading} onClick={onNext}>
          Next →
        </button>
      </div>
    </div>
  );
}
