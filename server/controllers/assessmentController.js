const asyncHandler = require('../utils/asyncHandler');
const service = require('../services/assessmentService');
const { streamReport } = require('../services/pdfService');

exports.create = asyncHandler(async (req, res) => {
  const assessment = await service.create(req.user._id, req.body);
  res.status(201).json({ success: true, assessment });
});

exports.list = asyncHandler(async (req, res) => {
  const assessments = await service.list(req.user._id, req.query);
  res.json({ success: true, count: assessments.length, assessments });
});

exports.get = asyncHandler(async (req, res) => {
  const doc = await service.getOwned(req.user._id, req.params.id);
  res.json({ success: true, assessment: service.present(doc) });
});

exports.remove = asyncHandler(async (req, res) => {
  await service.remove(req.user._id, req.params.id);
  res.json({ success: true, message: 'Assessment deleted.' });
});

exports.pdf = asyncHandler(async (req, res) => {
  const doc = await service.getOwned(req.user._id, req.params.id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="heartguard-assessment-${doc._id}.pdf"`);
  streamReport(res, { assessment: service.present(doc), user: req.user });
});
