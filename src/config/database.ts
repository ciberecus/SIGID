
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: 'srv994.hstgr.io',
  user: 'u825316010_ciberecus2025',
  password: 'Jozeluiz100$',
  database: 'u825316010_moviles2025',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
