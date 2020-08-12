// Update with your config settings.

const path = require('path');

const migrations = {
  directory: path.resolve('server', 'migrations'),
};

const seeds = {
  directory: path.resolve('server', 'seeds'),
};

module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: 'dev.sqlite3',
    },
    useNullAsDefault: true,
    migrations,
    seeds,
  },

  test: {
    client: 'sqlite3',
    connection: {
      filename: 'test.sqlite3',
    },
    useNullAsDefault: true,
    migrations,
    seeds,
  },

  production: {
    client: 'sqlite3',
    connection: {
      filename: 'prod.sqlite3',
    },
    useNullAsDefault: true,
    migrations,
    seeds,
  },

};
