import mysql from 'mysql2/promise'

type DBPool = mysql.Pool

let _pool: DBPool | undefined

export function useDB() {
  if (_pool) return _pool
  const config = useRuntimeConfig()
  _pool = mysql.createPool({
    host: config.dbHost,
    port: Number(config.dbPort ?? 3306),
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    // optional: timezone
    timezone: 'Z',
  })
  return _pool
}