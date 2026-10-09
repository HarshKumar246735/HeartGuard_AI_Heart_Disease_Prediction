const Assessment = require('../models/Assessment');
const User = require('../models/User');

const countBy = (rows) => ({
  Low: rows.filter((r) => r.prediction === 'Low').length,
  Moderate: rows.filter((r) => r.prediction === 'Moderate').length,
  Higher: rows.filter((r) => r.prediction === 'Higher').length,
});

async function userDashboard(userId) {
  const rows = await Assessment.find({ userId }).sort({ createdAt: 1 }).select('prediction probability createdAt').lean();
  const c = countBy(rows);
  return {
    totals: { total: rows.length, low: c.Low, moderate: c.Moderate, higher: c.Higher },
    lastAssessment: rows.length ? rows[rows.length - 1] : null,
    distribution: [
      { name: 'Low', value: c.Low },
      { name: 'Moderate', value: c.Moderate },
      { name: 'Higher', value: c.Higher },
    ],
    trend: rows.slice(-12).map((r) => ({ id: r._id, createdAt: r.createdAt, probability: r.probability })),
    recent: rows.slice(-5).reverse(),
  };
}

async function adminStatistics() {
  const since = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000);
  since.setHours(0, 0, 0, 0);
  const [totalUsers, activeUsers, totalAssessments, dist, daily, recent] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Assessment.countDocuments(),
    Assessment.aggregate([{ $group: { _id: '$prediction', count: { $sum: 1 } } }]),
    Assessment.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Assessment.find().sort({ createdAt: -1 }).limit(8).populate('userId', 'name email').lean(),
  ]);
  const d = Object.fromEntries(dist.map((x) => [x._id, x.count]));
  return {
    totals: { totalUsers, activeUsers, totalAssessments, low: d.Low || 0, moderate: d.Moderate || 0, higher: d.Higher || 0 },
    distribution: [
      { name: 'Low', value: d.Low || 0 },
      { name: 'Moderate', value: d.Moderate || 0 },
      { name: 'Higher', value: d.Higher || 0 },
    ],
    trend: daily.map((x) => ({ date: x._id, count: x.count })),
    recent,
  };
}

module.exports = { userDashboard, adminStatistics };
