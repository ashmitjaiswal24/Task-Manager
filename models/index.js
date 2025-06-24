// models/index.js (PostgreSQL queries)
const bcrypt = require('bcryptjs');
const { getDatabase } = require('../config/database');

class UserModel {
  static async create(userData) {
    const { username, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const query = `
      INSERT INTO users (username, email, password) 
      VALUES ($1, $2, $3) 
      RETURNING id, username, email, created_at
    `;
    
    const db = getDatabase();
    const result = await db.query(query, [username, email, hashedPassword]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const db = getDatabase();
    const result = await db.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, username, email, created_at FROM users WHERE id = $1';
    const db = getDatabase();
    const result = await db.query(query, [id]);
    return result.rows[0];
  }

  static async comparePassword(candidatePassword, hashedPassword) {
    return await bcrypt.compare(candidatePassword, hashedPassword);
  }
}

class TaskModel {
  static async create(taskData) {
    const { title, description, status, priority, dueDate, userId } = taskData;
    
    const query = `
      INSERT INTO tasks (title, description, status, priority, due_date, user_id) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      RETURNING *
    `;
    
    const db = getDatabase();
    const result = await db.query(query, [title, description, status, priority, dueDate, userId]);
    return result.rows[0];
  }

  static async findByUserId(userId, filters = {}) {
    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    const params = [userId];
    let paramCount = 1;

    if (filters.status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(filters.status);
    }

    if (filters.priority) {
      paramCount++;
      query += ` AND priority = $${paramCount}`;
      params.push(filters.priority);
    }

    query += ' ORDER BY created_at DESC';

    const db = getDatabase();
    const result = await db.query(query, params);
    return result.rows;
  }

  static async findById(id, userId) {
    const query = 'SELECT * FROM tasks WHERE id = $1 AND user_id = $2';
    const db = getDatabase();
    const result = await db.query(query, [id, userId]);
    return result.rows[0];
  }

  static async update(id, userId, updates) {
    const fields = Object.keys(updates);
    const setClause = fields.map((field, index) => `${field} = $${index + 3}`).join(', ');
    
    const query = `
      UPDATE tasks 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 AND user_id = $2 
      RETURNING *
    `;
    
    const params = [id, userId, ...Object.values(updates)];
    const db = getDatabase();
    const result = await db.query(query, params);
    return result.rows[0];
  }

  static async delete(id, userId) {
    const query = 'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING *';
    const db = getDatabase();
    const result = await db.query(query, [id, userId]);
    return result.rows[0];
  }
}

module.exports = { UserModel, TaskModel };