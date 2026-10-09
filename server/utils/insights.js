/**
 * Educational explanations generated from the values a user entered.
 * These are NOT diagnoses. `usedByModel` marks whether the field is an input to the ML model.
 */
const CHEST_PAIN_LABELS = {
  typical: 'Typical angina',
  atypical: 'Atypical angina',
  'non-anginal': 'Non-anginal pain',
  asymptomatic: 'No chest pain (asymptomatic)',
};

function buildFactors(a) {
  const f = [];
  const add = (key, title, status, text, usedByModel = true) => f.push({ key, title, status, text, usedByModel });

  if (a.bloodPressure >= 140)
    add('bp', 'Resting blood pressure', 'attention', `Your value of ${a.bloodPressure} mmHg is in a range commonly considered high. A healthcare professional can interpret this for you.`);
  else if (a.bloodPressure >= 120)
    add('bp', 'Resting blood pressure', 'note', `Your value of ${a.bloodPressure} mmHg is above the commonly used reference range of below 120 mmHg.`);
  else add('bp', 'Resting blood pressure', 'ok', `Your value of ${a.bloodPressure} mmHg is within the commonly used reference range.`);

  if (a.cholesterol >= 240)
    add('chol', 'Cholesterol', 'attention', `Your total cholesterol of ${a.cholesterol} mg/dL is in a range commonly considered high.`);
  else if (a.cholesterol >= 200)
    add('chol', 'Cholesterol', 'note', `Your total cholesterol of ${a.cholesterol} mg/dL is in the borderline range (200-239 mg/dL).`);
  else add('chol', 'Cholesterol', 'ok', `Your total cholesterol of ${a.cholesterol} mg/dL is below the commonly used 200 mg/dL threshold.`);

  if (a.bloodSugar >= 126)
    add('sugar', 'Fasting blood sugar', 'attention', `Your fasting value of ${a.bloodSugar} mg/dL is well above the commonly used reference range (70-99 mg/dL).`);
  else if (a.bloodSugar >= 100)
    add('sugar', 'Fasting blood sugar', 'note', `Your fasting value of ${a.bloodSugar} mg/dL is slightly above the commonly used reference range (70-99 mg/dL).`);
  else add('sugar', 'Fasting blood sugar', 'ok', `Your fasting value of ${a.bloodSugar} mg/dL is within the commonly used reference range.`);

  const predicted = 220 - a.age;
  const pct = Math.round((a.heartRate / predicted) * 100);
  if (pct < 75)
    add('hr', 'Maximum heart rate', 'note', `Your maximum heart rate of ${a.heartRate} bpm is about ${pct}% of the age-based estimate (${predicted} bpm). Lower achieved maximum rates are a pattern this model associates with higher estimated risk.`);
  else add('hr', 'Maximum heart rate', 'ok', `Your maximum heart rate of ${a.heartRate} bpm is about ${pct}% of the age-based estimate (${predicted} bpm).`);

  if (a.exerciseAngina)
    add('angina', 'Exercise-induced angina', 'attention', 'You reported chest pain or discomfort during exercise. Please discuss this with a qualified healthcare professional.');
  else add('angina', 'Exercise-induced angina', 'ok', 'You did not report chest pain during exercise.');

  add('cp', 'Chest pain type', a.chestPainType === 'typical' ? 'attention' : 'note',
    `You selected "${CHEST_PAIN_LABELS[a.chestPainType]}". Categories follow the definitions used in the training dataset and are only one of several inputs.`);

  if (a.age >= 55) add('age', 'Age', 'note', 'Heart-related risk generally increases with age; age is one input to this estimate.');

  // Profile information - not used by the model
  if (a.bmi >= 30) add('bmi', 'Body mass index', 'note', `Your BMI of ${a.bmi} is in the range commonly labelled obesity. Not used in the estimate.`, false);
  else if (a.bmi >= 25) add('bmi', 'Body mass index', 'note', `Your BMI of ${a.bmi} is in the commonly labelled overweight range. Not used in the estimate.`, false);
  if (a.smoking === 'current') add('smoking', 'Smoking', 'attention', 'Smoking is a widely recognised heart-health risk factor. Not used in the estimate.', false);
  if (a.alcohol === 'regular') add('alcohol', 'Alcohol', 'note', 'Regular alcohol intake can affect blood pressure and heart health. Not used in the estimate.', false);
  if (a.physicalActivity === 'low') add('activity', 'Physical activity', 'note', 'Low physical activity is associated with higher cardiovascular risk. Not used in the estimate.', false);

  return f;
}

function buildInsights(a) {
  const tips = [
    'Aim for regular physical activity that suits your ability, such as brisk walking.',
    'Follow a balanced diet rich in vegetables, fruit, whole grains and lean proteins.',
    'Monitor your blood pressure periodically.',
    'Avoid smoking and limit alcohol.',
    'Consult a qualified healthcare professional if you have concerns about your heart health.',
  ];
  if (a.prediction === 'Higher') tips.unshift('Consider sharing this assessment with a healthcare professional for a proper evaluation.');
  return tips;
}

module.exports = { buildFactors, buildInsights, CHEST_PAIN_LABELS };
