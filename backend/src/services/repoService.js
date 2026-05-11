const https = require('https');

const REGISTRY_BASE = 'https://registry.terraform.io/v1/modules/CheckPointSW/cloudguard-network-security';

// Latest versions sourced from registry.terraform.io
const PROVIDER_VERSIONS = {
  aws:     '1.0.11',
  azure:   '1.2.5',
  gcp:     '1.1.2',
  nutanix: '1.0.3',
  vmware:  '1.0.2',
  alibaba: '1.0.2',
};

// In-memory cache keyed by provider
const cache = {};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { timeout: 15000 }, (res) => {
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error(`JSON parse error from ${url}: ${e.message}`)); }
      });
    }).on('error', reject).on('timeout', () => reject(new Error('Registry request timed out')));
  });
}

async function getProviderData(provider) {
  const key = provider.toLowerCase();
  if (cache[key]) return cache[key];

  const version = PROVIDER_VERSIONS[key];
  if (!version) throw new Error(`Unknown provider: ${provider}`);

  console.log(`[registry] Fetching ${key} v${version} from Terraform Registry…`);
  const data = await fetchJson(`${REGISTRY_BASE}/${key}/${version}`);
  cache[key] = data;
  return data;
}

async function getModules(provider) {
  const data = await getProviderData(provider);
  const submodules = data.submodules || [];

  // Exclude internal helper submodules (nested paths like modules/x/common)
  // by keeping only top-level module paths: modules/<name>
  const topLevel = submodules.filter((s) => {
    const parts = s.path.split('/');
    return parts.length === 2 && parts[0] === 'modules';
  });

  const list = (topLevel.length > 0 ? topLevel : submodules).map((s) => ({
    name: s.name,
    relativePath: s.path,
  }));

  return list.sort((a, b) => a.name.localeCompare(b.name));
}

async function getSubmoduleInputs(provider, relativePath) {
  const data = await getProviderData(provider);
  const submod = (data.submodules || []).find((s) => s.path === relativePath);
  if (!submod) throw new Error(`Submodule "${relativePath}" not found for provider "${provider}"`);
  return submod.inputs || [];
}

function getModuleSource(provider, relativePath) {
  const key = provider.toLowerCase();
  return {
    source: `CheckPointSW/cloudguard-network-security/${key}//${relativePath}`,
    version: PROVIDER_VERSIONS[key],
  };
}

module.exports = { getModules, getSubmoduleInputs, getModuleSource, PROVIDER_VERSIONS };
