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
      <header className="app-header">
        <h1>⚡ CHKP CloudGuard IaC Easy Button</h1>
        <p>Generate Check Point CGNS Terraform configurations in minutes</p>
      </header>

      <ProgressBar current={step} />

      <div className="card">
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

      <footer style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--muted)', fontSize: '0.7rem' }}>
        Check Point Software Technologies — CloudGuard Network Security IaC Generator
      </footer>
    </div>
  );
}
