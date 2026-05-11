import { useState, useEffect } from 'react';

export default function VariableForm({ provider, module: mod, variables, values, onChange, onNext, onBack, loading, error }) {
  const [touched, setTouched] = useState({});

  useEffect(() => {
    setTouched({});
  }, [variables]);

  function handleChange(name, value) {
    onChange(name, value);
    setTouched((t) => ({ ...t, [name]: true }));
  }

  function validate() {
    const errs = {};
    for (const v of variables) {
      if (v.required && !values[v.name]) {
        errs[v.name] = 'Required';
      }
    }
    return errs;
  }

  function handleNext() {
    const all = {};
    variables.forEach((v) => (all[v.name] = true));
    setTouched(all);
    const errs = validate();
    if (Object.keys(errs).length === 0) onNext();
  }

  const fieldErrors = validate();
  const requiredCount = variables.filter((v) => v.required).length;
  const filledRequired = variables.filter((v) => v.required && values[v.name]).length;

  return (
    <div>
      <h2 className="section-title">// Configure Variables</h2>

      {(provider || mod) && (
        <div className="summary-chips">
          {provider && <span className="chip">Provider: {provider.name}</span>}
          {mod && <span className="chip">Module: {mod.name}</span>}
          <span className="chip" style={{ color: filledRequired === requiredCount ? 'var(--green)' : 'var(--yellow)' }}>
            Required: {filledRequired}/{requiredCount}
          </span>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <>
          <div className="spinner" />
          <p className="loading-text">LOADING VARIABLES...</p>
        </>
      ) : variables.length === 0 ? (
        <div className="alert alert-info">No variables found for this module.</div>
      ) : (
        <div className="variable-form">
          {variables.map((v) => {
            const hasError = touched[v.name] && fieldErrors[v.name];
            const currentVal = values[v.name] ?? '';

            return (
              <div className="field-group" key={v.name}>
                <label className="field-label">
                  {v.name}
                  {v.required && <span className="required-badge" title="Required">*</span>}
                  {v.sensitive && <span className="sensitive-badge">SENSITIVE</span>}
                </label>

                {v.description && (
                  <p className="field-desc">{v.description}</p>
                )}

                {v.options && v.options.length > 0 ? (
                  <select
                    className={`field-select ${hasError ? 'error' : ''}`}
                    value={currentVal}
                    onChange={(e) => handleChange(v.name, e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {v.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={`field-input ${hasError ? 'error' : ''}`}
                    type={v.sensitive ? 'password' : v.type === 'number' ? 'number' : 'text'}
                    value={currentVal}
                    placeholder={
                      v.default !== undefined && v.default !== null
                        ? `Default: ${v.default}`
                        : v.type
                          ? `(${v.type})`
                          : ''
                    }
                    onChange={(e) => handleChange(v.name, e.target.value)}
                  />
                )}

                {hasError && (
                  <span className="field-error">⚠ {fieldErrors[v.name]}</span>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="nav-row">
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <button
          className="btn btn-primary"
          disabled={loading || variables.length === 0}
          onClick={handleNext}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
