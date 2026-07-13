const { body, validationResult } = require('express-validator');
const ApiError = require('../../shared/utils/ApiError');

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be 8+ characters')
    .matches(/[A-Z]/).withMessage('Must contain uppercase')
    .matches(/[0-9]/).withMessage('Must contain number')
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required')
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('Validation failed:', req.body, errors.array());
    throw new ApiError(400, 'Validation failed', errors.array());
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validate
};
