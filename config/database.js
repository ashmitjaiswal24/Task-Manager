// config/database.js
const mongoose = require('mongoose');
const { Pool } = require('pg');

let db = null;

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

const connectPostgreSQL = async () => {
  try {
    const pool = new Pool({
      host: process.env.POSTGRES_HOST,
      port: process.env.POSTGRES_PORT,
      database: process.env.POSTGRES_DB,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
    });

    // Test connection
    await pool.query('SELECT NOW()');
    console.log('Connected to PostgreSQL');
    
    // Create tables if they don't exist
    await createTables(pool);
    
    return pool;
  } catch (error) {
    console.error('PostgreSQL connection error:', error);
    throw error;
  }
};

const createTables = async (pool) => {
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  const createTasksTable = `
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      description TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      priority VARCHAR(10) DEFAULT 'medium',
      due_date TIMESTAMP,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await pool.query(createUsersTable);
  await pool.query(createTasksTable);
  console.log('Database tables created/verified');
};

const connectDatabase = async () => {
  const dbType = process.env.DATABASE_TYPE || 'mongodb';
  
  if (dbType === 'mongodb') {
    db = await connectMongoDB();
  } else if (dbType === 'postgresql') {
    db = await connectPostgreSQL();
  } else {
    throw new Error('Invalid DATABASE_TYPE. Use "mongodb" or "postgresql"');
  }
  
  return db;
};

const getDatabase = () => db;

module.exports = { connectDatabase, getDatabase };