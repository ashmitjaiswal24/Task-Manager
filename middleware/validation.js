// middleware/validation.js
const Joi = require('joi');


const validateUser = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().alphanum().min(3).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const validateTask = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().max(200).required(),
    description: Joi.string().allow(''),
    status: Joi.string().valid('pending', 'in-progress', 'completed'),
    priority: Joi.string().valid('low', 'medium', 'high'),
    dueDate: Joi.date().iso()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = { validateUser, validateLogin, validateTask };