const router = require('express').Router();
const c = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/dashboard', protect, c.dashboard);

module.exports = router;
