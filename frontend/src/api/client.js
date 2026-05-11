import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const getProviders = () => api.get('/providers').then((r) => r.data);

export const cloneRepo = (provider) =>
  api.post('/clone', { provider }, { timeout: 300_000 }).then((r) => r.data);

export const getVariables = (provider, modulePath) =>
  api.get('/variables', { params: { provider, modulePath } }).then((r) => r.data);

export const generateZip = (provider, modulePath, moduleName, values) =>
  api.post(
    '/generate',
    { provider, modulePath, moduleName, values },
    { responseType: 'blob', timeout: 60_000 }
  );
