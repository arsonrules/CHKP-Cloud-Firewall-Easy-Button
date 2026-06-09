const express = require('express');
const cors = require('cors');
const apiRoutes = require('./src/routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.use('/api', apiRoutes);

// JSON error handler — avoid leaking stack traces / file paths in HTML error pages
app.use((err, req, res, next) => {
  console.error('[error]', err.message);
  if (res.headersSent) return next(err);
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }
  res.status(err.status || 500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`[CHKP IaC] Backend running on port ${PORT}`);
});
