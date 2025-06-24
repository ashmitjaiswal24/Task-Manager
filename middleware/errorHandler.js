// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: errors.join(', ') });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ error: `${field} already exists` });
  }

  // PostgreSQL errors
  if (err.code === '23505') {
    return res.status(400).json({ error: 'Duplicate entry' });
  }

  res.status(500).json({ error: 'Internal server error' });
};

module.exports = { errorHandler };