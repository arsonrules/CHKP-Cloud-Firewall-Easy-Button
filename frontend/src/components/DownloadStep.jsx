import { useState } from 'react';
import { generateZip } from '../api/client';

export default function DownloadStep({ provider, module: mod, values, onBack }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errorLog, setErrorLog] = useState(null);
  const [error, setError] = useState(null);

  async function handleGenerate() {
    setLoading(true);
    setDone(false);
    setErrorLog(null);
    setError(null);

    try {
      const resp = await generateZip(
        provider.id,
        mod.relativePath,
        mod.name,
        values
      );

      const blob = resp.data;

      // Check if it's an Error.log ZIP by trying to read the filename
      const disposition = resp.headers['content-disposition'] || '';
      const filename = disposition.match(/filename="?([^";\s]+)"?/)?.[1]
        || `terraform-${provider.id}-${mod.name}.zip`;

      // Trigger browser download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setDone(true);
    } catch (err) {
      if (err.response) {
        try {
          const text = await err.response.data.text();
          setError(JSON.parse(text).error || text);
        } catch {
          setError(err.message);
        }
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="section-title">// Generate Terraform Files</h2>

      <div className="summary-chips">
        {provider && <span className="chip">Provider: {provider.name}</span>}
        {mod && <span className="chip">Module: {mod.name}</span>}
        <span className="chip">Variables: {Object.keys(values).length} configured</span>
      </div>

      {done && !errorLog && (
        <div className="download-step">
          <div className="success-icon">⬇</div>
          <p style={{ color: 'var(--green)', marginBottom: '1rem', fontFamily: 'Orbitron,sans-serif', fontSize: '0.9rem' }}>
            TERRAFORM FILES DOWNLOADED
          </p>
          <p style={{ color: 'var(--muted)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
            Unzip the file, then run <code style={{ color: 'var(--cyan)' }}>terraform init &amp;&amp; terraform plan</code>
          </p>
        </div>
      )}

      {errorLog && (
        <>
          <div className="alert alert-error">Generation completed with errors. Error.log included in ZIP.</div>
          <pre className="error-log-box">{errorLog}</pre>
        </>
      )}

      {error && (
        <div className="alert alert-error">{error}</div>
      )}

      {loading ? (
        <>
          <div className="spinner" />
          <p className="loading-text">GENERATING TERRAFORM FILES...</p>
        </>
      ) : (
        <button
          className={`btn ${done ? 'btn-download' : 'btn-generate'}`}
          onClick={handleGenerate}
          disabled={loading}
        >
          {done ? '⬇  Download Again' : '⚡  Generate & Download ZIP'}
        </button>
      )}

      <div className="nav-row" style={{ marginTop: '1.5rem' }}>
        <button className="btn btn-secondary" onClick={onBack} disabled={loading}>← Back</button>
      </div>
    </div>
  );
}
