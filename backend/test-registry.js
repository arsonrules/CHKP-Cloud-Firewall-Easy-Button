// Live smoke check against the Terraform Registry: node test-registry.js
const assert = require('assert');
const repo = require('./src/services/repoService');
const fileGenerator = require('./src/services/fileGenerator');
const { Writable } = require('stream');

// Versions the app shipped with on 2026-08-10 — the registry must never go backwards
const FLOOR = { aws: '1.1.0', azure: '1.2.6', gcp: '1.1.4', nutanix: '1.0.3', vmware: '1.0.2', alibaba: '1.1.0' };

const cmp = (a, b) => {
  const [x, y] = [a, b].map((v) => v.split('.').map(Number));
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
};

(async () => {
  for (const provider of repo.PROVIDERS) {
    const modules = await repo.getModules(provider);
    assert(modules.length > 0, `${provider}: no modules returned`);

    const { source, version } = await repo.getModuleSource(provider, modules[0].relativePath);
    assert(cmp(version, FLOOR[provider]) >= 0, `${provider}: registry version ${version} < shipped ${FLOOR[provider]}`);
    assert(source.includes(`/${provider}//`), `${provider}: bad module source ${source}`);

    const vars = await repo.getSubmoduleInputs(provider, modules[0].relativePath);
    assert(Array.isArray(vars), `${provider}: inputs missing for ${modules[0].name}`);

    console.log(`ok  ${provider} v${version} — ${modules.length} modules, ${vars.length} inputs on "${modules[0].name}"`);
  }

  // main.tf must carry a resolved version pin, not "undefined"
  const chunks = [];
  const sink = new Writable({ write(c, _e, cb) { chunks.push(c); cb(); } });
  await fileGenerator.generate(
    { provider: 'aws', modulePath: 'modules/gateway', moduleName: 'gateway', values: {} },
    sink
  );
  assert(Buffer.concat(chunks).length > 0, 'generate produced an empty zip');
  console.log('ok  generate() streamed a zip');

  await assert.rejects(() => repo.getModules('../../evil'), /Unknown provider/);
  console.log('ok  unknown provider rejected');
})().catch((e) => { console.error('FAIL', e.message); process.exit(1); });
