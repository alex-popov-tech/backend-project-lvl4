const path = require('path');
require('dotenv').config();

const { DATABASE_URL } = process.env;
const migrations = {
  directory: path.resolve(__dirname, 'server', 'migrations'),
};

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: 'dev.sqlite3',
    },
    useNullAsDefault: true,
    migrations,
    seeds: {
      directory: path.resolve('server', 'seeds'),
    },
  },

  test: {
    client: 'sqlite3',
    connection: ':memory:',
    useNullAsDefault: true,
    migrations,
  },

  production: {
    client: 'pg',
    connection: DATABASE_URL,
    useNullAsDefault: true,
    migrations,
  },
};
