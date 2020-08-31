// Update with your config settings.

const path = require('path');

const migrations = {
  directory: path.resolve('server', 'migrations'),
};

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: 'dev.sqlite3',
    },
    useNullAsDefault: true,
    migrations,
  },

  test: {
    client: 'sqlite3',
    connection: 'memory',
    useNullAsDefault: true,
    migrations,
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: 'prod.sqlite3',
    },
    useNullAsDefault: true,
    migrations,
  },
};
