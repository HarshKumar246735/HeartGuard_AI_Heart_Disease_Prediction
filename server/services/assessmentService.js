const Assessment = require('../models/Assessment');
const ApiError = require('../utils/ApiError');
const mlService = require('./mlService');
const { levelFromProbability } = require('../utils/risk');
const { buildFactors, buildInsights } = require('../utils/insights');

const INPUT_FIELDS = [
  'age', 'gender', 'bloodPressure', 'cholesterol', 'bloodSugar', 'heartRate',
  'chestPainType', 'exerciseAngina', 'bmi', 'smoking', 'alcohol', 'physicalActivity',
];

const pickInputs = (body) =>
  INPUT_FIELDS.reduce((acc, k) => {
    if (body[k] !== undefined && body[k] !== null && body[k] !== '') acc[k] = body[k];
    return acc;
  }, {});

/** Attach derived, non-stored educational content. */
function present(doc) {
  const a = doc.toObject ? doc.toObject() : doc;
  return { ...a, factors: buildFactors(a), insights: buildInsights(a) };
}

async function create(userId, body) {
  const inputs = pickInputs(body);
  const probability = await mlService.predict(inputs);
  const doc = await Assessment.create({
    ...inputs,
    userId,
    probability: Math.round(probability * 10000) / 10000,
    prediction: levelFromProbability(probability),
  });
  return present(doc);
}

async function list(userId, { risk, sort = 'newest', limit = 200 }) {
  const filter = { userId };
  if (['Low', 'Moderate', 'Higher'].includes(risk)) filter.prediction = risk;
  const sorts = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, highest: { probability: -1, createdAt: -1 } };
  return Assessment.find(filter).sort(sorts[sort] || sorts.newest).limit(Math.min(Number(limit) || 200, 500)).lean();
}

async function getOwned(userId, id) {
  const doc = await Assessment.findOne({ _id: id, userId });
  if (!doc) throw new ApiError(404, 'Assessment not found.');
  return doc;
}

async function remove(userId, id) {
  const doc = await Assessment.findOneAndDelete({ _id: id, userId });
  if (!doc) throw new ApiError(404, 'Assessment not found.');
}

module.exports = { create, list, getOwned, remove, present };
