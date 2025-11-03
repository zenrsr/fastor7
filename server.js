const express = require('express');
const dotenv = require('dotenv');
const { initDatabase } = require('./models');

const employeeRoutes = require('./routes/employeeRoutes');
const enquiryRoutes = require('./routes/enquiryRoutes');

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());

app.get('/', (_req, res) => {
  res.json({ message: 'CRM API is running.' });
});

app.use('/api/employees', employeeRoutes);
app.use('/api/enquiries', enquiryRoutes);

app.use((req, res) => {
  return res.status(404).json({ message: 'Route not found.' });
});

app.use((err, _req, res, _next) => {
  console.error('Unexpected error:', err);
  return res.status(500).json({ message: 'Unexpected server error.' });
});

const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server boot failed:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
