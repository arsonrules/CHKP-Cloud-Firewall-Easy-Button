export default function ProviderSelect({ providers, selected, onSelect, onNext, loading }) {
  return (
    <div>
      <h2 className="section-title">// Select Cloud Provider</h2>

      {loading ? (
        <>
          <div className="spinner" />
          <p className="loading-text">INITIALIZING...</p>
        </>
      ) : (
        <div className="provider-grid">
          {providers.map((p) => (
            <div
              key={p.id}
              className={`provider-card ${selected?.id === p.id ? 'selected' : ''}`}
              onClick={() => onSelect(p)}
            >
              <img src={`/icons/${p.icon}`} alt={p.name} />
              <span className="provider-name">{p.name}</span>
            </div>
          ))}
        </div>
      )}

      <div className="nav-row" style={{ justifyContent: 'flex-end' }}>
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
