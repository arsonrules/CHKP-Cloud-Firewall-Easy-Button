import { useState, useEffect } from 'react';
import Loading from './Loading';

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
  // Required inputs first — modules ship 40+ variables and the registry order buries them
  const ordered = [...variables].sort((a, b) => Number(b.required) - Number(a.required));
  const requiredCount = variables.filter((v) => v.required).length;
  const filledRequired = variables.filter((v) => v.required && values[v.name]).length;
  const complete = filledRequired === requiredCount;

  return (
    <div>
      <h2 className="section-title">
        Configure variables
        <span className="count">{variables.length} inputs</span>
      </h2>

      {(provider || mod) && (
        <div className="summary-chips">
          {provider && <span className="chip">Provider<b>{provider.name}</b></span>}
          {mod && <span className="chip">Module<b>{mod.name}</b></span>}
          <span className={`chip ${complete ? 'ok' : 'warn'}`}>
            Required<b>{filledRequired}/{requiredCount}</b>
          </span>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <Loading>Loading variables</Loading>
      ) : variables.length === 0 ? (
        <div className="alert alert-info">This module declares no input variables.</div>
      ) : (
        <>
          <div className="thead">
            <span className="thead-label">Variable</span>
            <span className="thead-label">Value</span>
          </div>

          <div className="variable-form">
            {ordered.map((v) => {
              const hasError = touched[v.name] && fieldErrors[v.name];
              const currentVal = values[v.name] ?? '';

              return (
                <div className={`field-group ${v.required ? 'required' : ''}`} key={v.name}>
                  <div>
                    <label className="field-label" htmlFor={`var-${v.name}`}>
                      {v.name}
                      {v.required && <span className="required-badge" title="Required">✳</span>}
                      {v.type && <span className="field-type" title={v.type}>{v.type}</span>}
                      {v.sensitive && <span className="sensitive-badge">Sensitive</span>}
                    </label>
                    {v.description && <p className="field-desc">{v.description}</p>}
                  </div>

                  <div>
                    {v.options && v.options.length > 0 ? (
                      <select
                        id={`var-${v.name}`}
                        className={`field-select ${hasError ? 'error' : ''}`}
                        value={currentVal}
                        onChange={(e) => handleChange(v.name, e.target.value)}
                      >
                        <option value="">— Select —</option>
                        {v.options.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={`var-${v.name}`}
                        className={`field-input ${hasError ? 'error' : ''}`}
                        type={v.sensitive ? 'password' : v.type === 'number' ? 'number' : 'text'}
                        value={currentVal}
                        placeholder={
                          v.required ? 'Required'
                            : v.default ? `Default: ${v.default}`
                            : 'Optional'
                        }
                        onChange={(e) => handleChange(v.name, e.target.value)}
                      />
                    )}

                    {hasError && <span className="field-error">{fieldErrors[v.name]}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <div className="nav-row">
        <button className="btn" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" disabled={loading || variables.length === 0} onClick={handleNext}>
          Next →
        </button>
      </div>
    </div>
  );
}
