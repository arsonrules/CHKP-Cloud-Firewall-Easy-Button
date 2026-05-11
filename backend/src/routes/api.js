const express = require('express');
const router = express.Router();
const repoService = require('../services/repoService');
const hclParser = require('../services/hclParser');
const fileGenerator = require('../services/fileGenerator');

const PROVIDERS = [
  { id: 'aws',      name: 'AWS',     icon: 'AWS.png'      },
  { id: 'azure',    name: 'Azure',   icon: 'Azure.png'    },
  { id: 'gcp',      name: 'GCP',     icon: 'GCP.png'      },
  { id: 'alibaba',  name: 'Alibaba', icon: 'Alibaba.png'  },
  { id: 'nutanix',  name: 'Nutanix', icon: 'Nutanix.png'  },
  { id: 'vmware',   name: 'VMware',  icon: 'vmware.png'   },
];

router.get('/providers', (req, res) => {
  res.json(PROVIDERS);
});

// Fetches available submodules from the Terraform Registry (no git clone needed)
router.post('/clone', async (req, res) => {
  const { provider } = req.body;
  if (!provider) return res.status(400).json({ error: 'provider is required' });

  try {
    const modules = await repoService.getModules(provider);
    res.json({ success: true, modules });
  } catch (err) {
    console.error('[modules]', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/variables', async (req, res) => {
  const { provider, modulePath } = req.query;
  if (!provider || !modulePath) {
    return res.status(400).json({ error: 'provider and modulePath are required' });
  }

  try {
    const variables = await hclParser.getModuleVariables(provider, modulePath);
    res.json({ variables });
  } catch (err) {
    console.error('[variables]', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/generate', async (req, res) => {
  const { provider, modulePath, moduleName, values } = req.body;
  if (!provider || !modulePath) {
    return res.status(400).json({ error: 'provider and modulePath are required' });
  }

  try {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="terraform-${provider}-${moduleName || 'module'}.zip"`
    );
    await fileGenerator.generate({ provider, modulePath, moduleName, values: values || {} }, res);
  } catch (err) {
    console.error('[generate]', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

module.exports = router;
