import { useState, useEffect } from 'react';
import ProgressBar from './components/ProgressBar';
import ProviderSelect from './components/ProviderSelect';
import ModuleSelect from './components/ModuleSelect';
import VariableForm from './components/VariableForm';
import DownloadStep from './components/DownloadStep';
import { getProviders, cloneRepo, getVariables } from './api/client';

export default function App() {
  const [step, setStep] = useState(1);

  // Data
  const [providers, setProviders] = useState([]);
  const [provider, setProvider] = useState(null);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [variables, setVariables] = useState([]);
  const [formValues, setFormValues] = useState({});

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load providers on mount
  useEffect(() => {
    setLoading(true);
    getProviders()
      .then(setProviders)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // Seed form defaults when variables load
  useEffect(() => {
    if (variables.length === 0) return;
    const defaults = {};
    variables.forEach((v) => {
      if (v.default !== undefined && v.default !== null) {
        defaults[v.name] = String(v.default);
      }
    });
    setFormValues(defaults);
  }, [variables]);

  async function handleProviderNext() {
    setError(null);
    setModules([]);
    setSelectedModule(null);
    setLoading(true);
    try {
      const data = await cloneRepo(provider.id);
      setModules(data.modules || []);
      setStep(2);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleModuleNext() {
    setError(null);
    setVariables([]);
    setLoading(true);
    try {
      const data = await getVariables(provider.id, selectedModule.relativePath);
      setVariables(data.variables || []);
      setStep(3);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleVariableChange(name, value) {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleVariableNext() {
    setStep(4);
  }

  return (
    <div className="app-wrapper">
      <header className="topbar">
        <div className="brandmark" />
        <div className="title">CloudGuard Network Security</div>
        <div className="subtitle">Terraform IaC easy button</div>
        <div className="spacer" />
        <div className="stamp">registry.terraform.io / CheckPointSW</div>
      </header>

      <div className="band">
        <span className="band-label">Selection</span>
        <div className="band-items">
          {provider ? <b>{provider.name}</b> : <em>No provider</em>}
          <span className="sep">/</span>
          {selectedModule ? <b>{selectedModule.name}</b> : <em>No module</em>}
          <span className="sep">/</span>
          {variables.length > 0
            ? <b>{variables.length} variables</b>
            : <em>No variables</em>}
        </div>
      </div>

      <main className="stage">
        <ProgressBar current={step} />

        <div className="panel">
        {step === 1 && (
          <ProviderSelect
            providers={providers}
            selected={provider}
            onSelect={(p) => { setProvider(p); setError(null); }}
            onNext={handleProviderNext}
            loading={loading}
          />
        )}

        {step === 2 && (
          <ModuleSelect
            provider={provider}
            modules={modules}
            selected={selectedModule}
            onSelect={(m) => { setSelectedModule(m); setError(null); }}
            onNext={handleModuleNext}
            onBack={() => { setStep(1); setError(null); }}
            loading={loading}
            error={error}
          />
        )}

        {step === 3 && (
          <VariableForm
            provider={provider}
            module={selectedModule}
            variables={variables}
            values={formValues}
            onChange={handleVariableChange}
            onNext={handleVariableNext}
            onBack={() => { setStep(2); setError(null); }}
            loading={loading}
            error={error}
          />
        )}

        {step === 4 && (
          <DownloadStep
            provider={provider}
            module={selectedModule}
            values={formValues}
            onBack={() => { setStep(3); setError(null); }}
          />
        )}
        </div>
      </main>

      <footer className="band foot">
        <span className="band-label">Check Point Software</span>
        <div className="band-items">
          Module metadata and versions resolved live from the Terraform Registry
          <span className="sep">/</span>
          Generated configs pin the version current at download time
        </div>
      </footer>
    </div>
  );
}
