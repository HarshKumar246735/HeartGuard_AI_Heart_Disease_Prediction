const { body, query } = require('express-validator');

const strongPassword = (field) =>
  body(field)
    .isString().withMessage('Password is required')
    .isLength({ min: 8, max: 72 }).withMessage('Password must be 8-72 characters')
    .matches(/[A-Za-z]/).withMessage('Password must include a letter')
    .matches(/\d/).withMessage('Password must include a number');

exports.register = [
  body('name').isString().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
  body('email').isString().trim().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  strongPassword('password'),
];

exports.login = [
  body('email').isString().trim().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Password is required'),
];

exports.profile = [
  body('name').optional().isString().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
  body('email').optional().isString().trim().isEmail().withMessage('Enter a valid email address').normalizeEmail(),
];

exports.changePassword = [
  body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
  strongPassword('newPassword'),
];

exports.deleteAccount = [body('password').isString().notEmpty().withMessage('Password is required to delete your account')];

const optionalNum = (f, min, max, label) =>
  body(f).optional({ values: 'falsy' }).isFloat({ min, max }).withMessage(`${label} must be between ${min} and ${max}`).toFloat();

exports.assessment = [
  body('age').isInt({ min: 18, max: 100 }).withMessage('Age must be between 18 and 100').toInt(),
  body('gender').isIn(['male', 'female']).withMessage('Select a gender'),
  body('bloodPressure').isFloat({ min: 80, max: 250 }).withMessage('Blood pressure must be between 80 and 250 mmHg').toFloat(),
  body('cholesterol').isFloat({ min: 100, max: 600 }).withMessage('Cholesterol must be between 100 and 600 mg/dL').toFloat(),
  body('bloodSugar').isFloat({ min: 50, max: 500 }).withMessage('Fasting blood sugar must be between 50 and 500 mg/dL').toFloat(),
  body('heartRate').isFloat({ min: 60, max: 220 }).withMessage('Maximum heart rate must be between 60 and 220 bpm').toFloat(),
  body('chestPainType').isIn(['typical', 'atypical', 'non-anginal', 'asymptomatic']).withMessage('Select a chest pain type'),
  body('exerciseAngina').isBoolean().withMessage('Exercise-induced angina must be yes or no').toBoolean(),
  optionalNum('bmi', 10, 70, 'BMI'),
  body('smoking').optional({ values: 'falsy' }).isIn(['never', 'former', 'current']).withMessage('Invalid smoking value'),
  body('alcohol').optional({ values: 'falsy' }).isIn(['none', 'occasional', 'regular']).withMessage('Invalid alcohol value'),
  body('physicalActivity').optional({ values: 'falsy' }).isIn(['low', 'moderate', 'high']).withMessage('Invalid activity value'),
];

exports.listQuery = [
  query('risk').optional().isIn(['Low', 'Moderate', 'Higher']).withMessage('Invalid risk filter'),
  query('sort').optional().isIn(['newest', 'oldest', 'highest']).withMessage('Invalid sort'),
];

exports.toggleStatus = [body('isActive').isBoolean().withMessage('isActive must be true or false').toBoolean()];
