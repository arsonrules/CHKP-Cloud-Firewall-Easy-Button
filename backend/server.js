const express = require('express');
const cors = require('cors');
const apiRoutes = require('./src/routes/api');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`[CHKP IaC] Backend running on port ${PORT}`);
});
