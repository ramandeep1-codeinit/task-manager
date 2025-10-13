// validators/user.js
import Joi from 'joi';

export const registerValidation = Joi.object({
  userName: Joi.string().min(2).max(50).required().messages({
    'string.base': 'Username must be a string',
    'string.empty': 'Username is required',
    'string.min': 'Username must be at least 2 characters',
    'string.max': 'Username cannot exceed 50 characters',
    'any.required': 'Username is required',
  }),

  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required',
  }),

  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),

  role: Joi.string().valid("Manager", "Employee").required().messages({
    'any.only': 'Role must be either "Manager" or "Employee"',
    'any.required': 'Role is required',
  }),
});

export const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required',
  }),

  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});
