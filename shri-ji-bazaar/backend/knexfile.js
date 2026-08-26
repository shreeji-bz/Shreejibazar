module.exports = {
  development: {
    client: 'pg',
    connection: { connectionString: process.env.DATABASE_URL },
    migrations: { directory: './src/database/migrations', tableName: 'knex_migrations' },
    seeds: { directory: './src/database/seed' },
    pool: { min: 2, max: 10 },
  },
  staging: { client: 'pg', connection: { connectionString: process.env.DATABASE_URL }, migrations: { directory: './src/database/migrations' }, seeds: { directory: './src/database/seed' } },
  production: { client: 'pg', connection: { connectionString: process.env.DATABASE_URL }, migrations: { directory: './src/database/migrations' }, seeds: { directory: './src/database/seed' }, pool: { min: 2, max: 10 } },
};
