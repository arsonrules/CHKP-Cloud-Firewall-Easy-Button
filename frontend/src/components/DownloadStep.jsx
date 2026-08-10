import { useState } from 'react';
import Loading from './Loading';
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
      <h2 className="section-title">
        Generate terraform files
        <span className="count">main.tf · versions.tf · README.md</span>
      </h2>

      <div className="summary-chips">
        {provider && <span className="chip">Provider<b>{provider.name}</b></span>}
        {mod && <span className="chip">Module<b>{mod.name}</b></span>}
        <span className="chip">Variables<b>{Object.keys(values).length}</b></span>
      </div>

      {done && !errorLog && (
        <div className="download-step">
          <div className="dl-h">Terraform files downloaded</div>
          <p>
            Unzip the archive, then run <code>terraform init &amp;&amp; terraform plan</code>
          </p>
          <div className="file-list">
            <span>main.tf</span>
            <span>versions.tf</span>
            <span>README.md</span>
          </div>
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
        <Loading>Generating terraform files</Loading>
      ) : (
        <button
          className={`btn ${done ? 'btn-download' : 'btn-generate'}`}
          onClick={handleGenerate}
          disabled={loading}
        >
          {done ? 'Download again' : 'Generate & download ZIP'}
        </button>
      )}

      <div className="nav-row">
        <button className="btn" onClick={onBack} disabled={loading}>← Back</button>
      </div>
    </div>
  );
}
