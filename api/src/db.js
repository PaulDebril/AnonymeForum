const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'forum_user',
  password: process.env.DB_PASSWORD || 'forum_pass',
  database: process.env.DB_NAME || 'forum_db'
});

module.exports = {
  query: (text, params) => pool.query(text, params)
};
