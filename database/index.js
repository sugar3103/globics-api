const knex = require('knex')({
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASS,
    connectTimeout: 90000,
    timezone: 'UTC',
    pool: {
      max: 50,
      min: 2,
      acquireTimeout: 60 * 1000,
      createTimeoutMillis: 30000,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
      propagateCreateError: false
    }
  }
})
const knexLogger = require('knex-logger')(knex)
const bookshelf = require('bookshelf')(knex)
bookshelf.plugin(require('bookshelf-eloquent'))
module.exports = { bookshelf, knexLogger, knex }
