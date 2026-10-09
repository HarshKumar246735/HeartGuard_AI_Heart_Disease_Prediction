const router = require('express').Router();
const c = require('../controllers/assessmentController');
const v = require('../validators');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { predictLimiter } = require('../middleware/rateLimiters');

router.use(protect);
router.post('/', predictLimiter, v.assessment, validate, c.create);
router.get('/', v.listQuery, validate, c.list);
router.get('/:id/pdf', c.pdf);
router.get('/:id', c.get);
router.delete('/:id', c.remove);

module.exports = router;
