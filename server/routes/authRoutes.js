const router = require('express').Router();
const c = require('../controllers/authController');
const v = require('../validators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiters');

router.post('/register', authLimiter, v.register, validate, c.register);
router.post('/login', authLimiter, v.login, validate, c.login);
router.get('/me', protect, c.me);
router.put('/profile', protect, v.profile, validate, c.updateProfile);
router.put('/change-password', protect, authLimiter, v.changePassword, validate, c.changePassword);
router.delete('/me', protect, authLimiter, v.deleteAccount, validate, c.deleteAccount);

module.exports = router;
