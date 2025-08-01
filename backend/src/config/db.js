import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;
console.log("DATABASE_URL:", process.env.DATABASE_URL);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
}); 

try {
  const res = await pool.query('SELECT NOW()');
  console.log('✅ Database connected successfully at', res.rows[0].now);
} catch (err) {
  console.error('Database connection error:', err);
}

export default pool;