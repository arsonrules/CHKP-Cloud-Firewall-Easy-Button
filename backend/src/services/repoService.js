const https = require('https');

const REGISTRY_BASE = 'https://registry.terraform.io/v1/modules/CheckPointSW/cloudguard-network-security';

// Whitelist — also guards the provider value interpolated into the registry URL
const PROVIDERS = ['aws', 'azure', 'gcp', 'nutanix', 'vmware', 'alibaba'];

// In-memory cache keyed by provider: { data, ts }
// Null prototype so keys like "constructor" can't resolve through the chain
const cache = Object.create(null);
const CACHE_TTL_MS = 60 * 60 * 1000;

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    // 30s: the AWS payload is ~2.5MB
    https.get(url, { timeout: 30000 }, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        return reject(new Error(`Registry responded with HTTP ${res.statusCode}`));
      }
      let raw = '';
      res.on('data', (c) => (raw += c));
      res.on('end', () => {
        // registry.terraform.io truncates large chunked responses often enough to matter
        if (!res.complete) return reject(new Error(`Truncated response from ${url}`));
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error(`JSON parse error from ${url}: ${e.message}`)); }
      });
    }).on('error', reject).on('timeout', function () { this.destroy(new Error('Registry request timed out')); });
  });
}

async function getProviderData(provider) {
  const key = String(provider).toLowerCase();
  if (!PROVIDERS.includes(key)) throw new Error(`Unknown provider: ${provider}`);

  const hit = cache[key];
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) return hit.data;

  console.log(`[registry] Fetching latest ${key} from Terraform Registry…`);
  // No version in the path → registry returns the latest published version
  let data;
  try {
    data = await fetchJson(`${REGISTRY_BASE}/${key}`);
  } catch (e) {
    if (hit) {
      console.warn(`[registry] ${e.message} — serving stale ${key} v${hit.data.version}`);
      return hit.data;
    }
    throw e;
  }
  cache[key] = { data, ts: Date.now() };
  console.log(`[registry] ${key} → v${data.version} (${(data.submodules || []).length} submodules)`);
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

async function getModuleSource(provider, relativePath) {
  const key = String(provider).toLowerCase();
  const { version } = await getProviderData(key);
  return {
    source: `CheckPointSW/cloudguard-network-security/${key}//${relativePath}`,
    version,
  };
}

module.exports = { getModules, getSubmoduleInputs, getModuleSource, PROVIDERS };
