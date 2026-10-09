const mongoose = require('mongoose');
const User = require('../models/User');
const Assessment = require('../models/Assessment');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const analytics = require('../services/analyticsService');
const { buildFactors, buildInsights } = require('../utils/insights');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isId = (id) => mongoose.isValidObjectId(id);

exports.statistics = asyncHandler(async (_req, res) => {
  res.json({ success: true, ...(await analytics.adminStatistics()) });
});

exports.listUsers = asyncHandler(async (req, res) => {
  const match = {};
  if (req.query.search) {
    const rx = new RegExp(escapeRegex(String(req.query.search).slice(0, 60)), 'i');
    match.$or = [{ name: rx }, { email: rx }];
  }
  if (req.query.status === 'active') match.isActive = true;
  if (req.query.status === 'inactive') match.isActive = false;

  const users = await User.aggregate([
    { $match: match },
    { $sort: { createdAt: -1 } },
    { $limit: 500 },
    { $lookup: { from: 'assessments', localField: '_id', foreignField: 'userId', as: 'a' } },
    { $addFields: { assessmentCount: { $size: '$a' } } },
    { $project: { password: 0, a: 0, __v: 0 } },
  ]);
  res.json({ success: true, count: users.length, users });
});

exports.getUser = asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) throw new ApiError(400, 'Invalid user id.');
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');
  const assessments = await Assessment.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10).select('prediction probability createdAt').lean();
  const assessmentCount = await Assessment.countDocuments({ userId: user._id });
  res.json({ success: true, user, assessmentCount, assessments });
});

exports.setStatus = asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) throw new ApiError(400, 'Invalid user id.');
  if (String(req.user._id) === req.params.id) throw new ApiError(400, 'You cannot change your own status.');
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true });
  if (!user) throw new ApiError(404, 'User not found.');
  res.json({ success: true, user });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) throw new ApiError(400, 'Invalid user id.');
  if (String(req.user._id) === req.params.id) throw new ApiError(400, 'You cannot delete your own account here.');
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');
  if (user.role === 'admin') throw new ApiError(400, 'Administrator accounts cannot be deleted from the panel.');
  await Assessment.deleteMany({ userId: user._id });
  await user.deleteOne();
  res.json({ success: true, message: 'User and their assessments deleted.' });
});

exports.listAssessments = asyncHandler(async (req, res) => {
  const filter = {};
  if (['Low', 'Moderate', 'Higher'].includes(req.query.risk)) filter.prediction = req.query.risk;
  if (req.query.userId && isId(req.query.userId)) filter.userId = req.query.userId;
  if (req.query.from || req.query.to) {
    filter.createdAt = {};
    if (req.query.from && !Number.isNaN(Date.parse(req.query.from))) filter.createdAt.$gte = new Date(req.query.from);
    if (req.query.to && !Number.isNaN(Date.parse(req.query.to))) {
      const end = new Date(req.query.to);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
    if (!Object.keys(filter.createdAt).length) delete filter.createdAt;
  }
  let rows = await Assessment.find(filter).sort({ createdAt: -1 }).limit(500).populate('userId', 'name email').lean();
  if (req.query.search) {
    const q = String(req.query.search).toLowerCase();
    rows = rows.filter((r) => r.userId && `${r.userId.name} ${r.userId.email}`.toLowerCase().includes(q));
  }
  res.json({ success: true, count: rows.length, assessments: rows });
});

exports.getAssessment = asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) throw new ApiError(400, 'Invalid assessment id.');
  const doc = await Assessment.findById(req.params.id).populate('userId', 'name email').lean();
  if (!doc) throw new ApiError(404, 'Assessment not found.');
  res.json({ success: true, assessment: { ...doc, factors: buildFactors(doc), insights: buildInsights(doc) } });
});

exports.deleteAssessment = asyncHandler(async (req, res) => {
  if (!isId(req.params.id)) throw new ApiError(400, 'Invalid assessment id.');
  const doc = await Assessment.findByIdAndDelete(req.params.id);
  if (!doc) throw new ApiError(404, 'Assessment not found.');
  res.json({ success: true, message: 'Assessment deleted.' });
});
