import Loading from './Loading';

export default function ProviderSelect({ providers, selected, onSelect, onNext, loading }) {
  return (
    <div>
      <h2 className="section-title">
        Select cloud provider
        <span className="count">{providers.length} available</span>
      </h2>

      {loading ? (
        <Loading>Loading providers</Loading>
      ) : (
        <div className="provider-grid">
          {providers.map((p) => (
            <button
              key={p.id}
              type="button"
              data-provider={p.id}
              className={`card provider-card ${selected?.id === p.id ? 'selected' : ''}`}
              aria-pressed={selected?.id === p.id}
              onClick={() => onSelect(p)}
            >
              <img src={`/icons/${p.icon}`} alt="" />
              <span className="meta">
                <span className="kick">Provider</span>
                <span className="pname">{p.name}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="nav-row end">
        <button className="btn btn-primary" disabled={!selected || loading} onClick={onNext}>
          Next →
        </button>
      </div>
    </div>
  );
}
