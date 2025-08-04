// validators/user.js
import Joi from 'joi';

export const registerValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required',
  }),

  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),

  role: Joi.number().valid(1, 2).required().messages({
    'any.only': 'Role must be 1 (Manager) or 2 (Employee)',
    'any.required': 'Role is required',
  })
});

export const loginValidation = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Invalid email format',
    'any.required': 'Email is required',
  }),

  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  })
});
