const repoService = require('./repoService');

// Strip HCL-style default values to plain display strings
// e.g. '"gateway"' → 'gateway', 'true' → 'true', '{}' → '{}'
function stripHclDefault(raw) {
  if (raw === undefined || raw === null || raw === '') return undefined;
  const s = String(raw).trim();
  if (s === 'null') return null;
  // Quoted string → unwrap
  if (s.startsWith('"') && s.endsWith('"')) {
    return s.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, '\n');
  }
  return s;
}

function inferOptions(inp) {
  const type = (inp.type || '').trim();
  // bool → fixed dropdown
  if (type === 'bool' || type === 'boolean') return ['true', 'false'];

  // Try to extract from description: "Valid values: a, b, c" or "Allowed values: x | y"
  const desc = inp.description || '';
  const listMatch = desc.match(/(?:valid values?|allowed values?|one of)[^:]*:\s*([^\n.]+)/i);
  if (listMatch) {
    return listMatch[1]
      .split(/[,|;]/)
      .map((s) => s.trim().replace(/^["']|["']$/g, ''))
      .filter(Boolean);
  }
  return [];
}

async function getModuleVariables(provider, relativePath) {
  const inputs = await repoService.getSubmoduleInputs(provider, relativePath);

  return inputs.map((inp) => {
    const rawDefault = inp.default;
    const hasDefault = rawDefault !== '' && rawDefault !== undefined;

    return {
      name: inp.name,
      type: (inp.type || 'string').trim(),
      description: inp.description || '',
      default: stripHclDefault(rawDefault),
      required: !hasDefault,
      sensitive: /password|secret|key|token/i.test(inp.name),
      options: inferOptions(inp),
    };
  });
}

module.exports = { getModuleVariables };
