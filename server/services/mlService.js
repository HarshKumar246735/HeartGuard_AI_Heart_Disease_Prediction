const axios = require('axios');
const ApiError = require('../utils/ApiError');

const CHEST_PAIN_CODE = { typical: 1, atypical: 2, 'non-anginal': 3, asymptomatic: 4 }; // UCI Cleveland coding

/** Maps an assessment's inputs to the exact feature names the FastAPI model was trained on. */
function toModelPayload(a) {
  return {
    age: a.age,
    sex: a.gender === 'male' ? 1 : 0,
    cp: CHEST_PAIN_CODE[a.chestPainType],
    trestbps: a.bloodPressure,
    chol: a.cholesterol,
    fbs: a.bloodSugar > 120 ? 1 : 0,
    thalach: a.heartRate,
    exang: a.exerciseAngina ? 1 : 0,
  };
}

async function callPredict(payload) {
  const { data } = await axios.post(`${process.env.ML_SERVICE_URL.replace(/\/$/, '')}/predict`, payload, {
    timeout: 60000, // free-tier hosts can take ~50s to wake from sleep
  });
  return data;
}

async function predict(assessmentInput) {
  const payload = toModelPayload(assessmentInput);
  try {
    let data;
    try {
      data = await callPredict(payload);
    } catch (e) {
      if (e.response) throw e; // real HTTP error, do not retry
      data = await callPredict(payload); // one retry for cold starts / transient network errors
    }
    if (typeof data.probability !== 'number') throw new Error('Malformed ML response');
    return data.probability;
  } catch (err) {
    console.error('ML service error:', err.message);
    throw new ApiError(503, 'The prediction service is unavailable right now. Please try again in a minute.');
  }
}

module.exports = { predict, toModelPayload };
