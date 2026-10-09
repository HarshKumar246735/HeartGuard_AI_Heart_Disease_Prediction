const asyncHandler = require('../utils/asyncHandler');
const analytics = require('../services/analyticsService');

exports.dashboard = asyncHandler(async (req, res) => {
  res.json({ success: true, ...(await analytics.userDashboard(req.user._id)) });
});
