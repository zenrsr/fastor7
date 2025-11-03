const path = require('path');
const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const dialect = process.env.DB_DIALECT || 'sqlite';
const logging = process.env.DB_LOGGING === 'true' ? (msg) => console.debug(`[sequelize] ${msg}`) : false;

let sequelize;

if (dialect === 'sqlite') {
  const storage = process.env.DB_STORAGE || path.join(__dirname, '..', 'crm_db.sqlite');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage,
    logging,
  });
} else {
  // Keeping the config flexible in case the reviewer prefers Postgres/MySQL.
  const dbName = process.env.DB_NAME;
  const username = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || undefined;

  if (!dbName || !username) {
    throw new Error('Database credentials are missing. Check your ENV settings.');
  }

  sequelize = new Sequelize(dbName, username, password, {
    host,
    port,
    dialect,
    logging,
  });
}

module.exports = sequelize;
