const router = require('express').Router();
const c = require('../controllers/adminController');
const v = require('../validators');
const validate = require('../middleware/validate');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);
router.get('/statistics', c.statistics);
router.get('/users', c.listUsers);
router.get('/users/:id', c.getUser);
router.put('/users/:id/status', v.toggleStatus, validate, c.setStatus);
router.delete('/users/:id', c.deleteUser);
router.get('/assessments', c.listAssessments);
router.get('/assessments/:id', c.getAssessment);
router.delete('/assessments/:id', c.deleteAssessment);

module.exports = router;
