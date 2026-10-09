export const DISCLAIMER =
  'HeartGuard AI provides an educational risk estimate based on the information provided. It is not a medical diagnosis and should not replace professional medical advice.';

export const RISK_META = {
  Low: { label: 'Lower Estimated Risk', short: 'Low', tone: 'low', color: '#2f855a' },
  Moderate: { label: 'Moderate Estimated Risk', short: 'Moderate', tone: 'moderate', color: '#c58a1b' },
  Higher: { label: 'Higher Estimated Risk', short: 'Higher', tone: 'higher', color: '#c0392b' },
};

export const CHEST_PAIN_OPTIONS = [
  { value: 'typical', label: 'Typical angina' },
  { value: 'atypical', label: 'Atypical angina' },
  { value: 'non-anginal', label: 'Non-anginal pain' },
  { value: 'asymptomatic', label: 'No chest pain' },
];
export const CHEST_PAIN_LABELS = Object.fromEntries(CHEST_PAIN_OPTIONS.map((o) => [o.value, o.label]));

/** Validation ranges. Must mirror server/validators/index.js */
export const RULES = {
  age: { min: 18, max: 100, label: 'Age', unit: 'years', integer: true, required: true },
  bloodPressure: { min: 80, max: 250, label: 'Resting blood pressure', unit: 'mmHg', required: true },
  cholesterol: { min: 100, max: 600, label: 'Total cholesterol', unit: 'mg/dL', required: true },
  bloodSugar: { min: 50, max: 500, label: 'Fasting blood sugar', unit: 'mg/dL', required: true },
  heartRate: { min: 60, max: 220, label: 'Maximum heart rate', unit: 'bpm', required: true },
  bmi: { min: 10, max: 70, label: 'BMI', unit: 'kg/m²', required: false },
};

export const TOOLTIPS = {
  age: 'Heart-related risk generally increases with age, so age is one of the inputs to the model.',
  gender: 'The training dataset recorded biological sex. Patterns differ between groups, so it is used as a model input.',
  bloodPressure: 'The upper (systolic) number from a resting reading. Under 120 mmHg is commonly considered a normal reference.',
  cholesterol: 'Total serum cholesterol from a blood test. Under 200 mg/dL is commonly used as a desirable level.',
  bloodSugar: 'Glucose measured after at least 8 hours without eating. The model uses whether it is above 120 mg/dL.',
  chestPainType: 'The training dataset groups chest discomfort into four types. Pick the closest match to what you experience, or "No chest pain".',
  exerciseAngina: 'Chest pain or tightness that appears during exercise and eases with rest.',
  heartRate: 'The highest heart rate reached during exercise or a stress test. If unsure, use 220 minus your age as a rough estimate.',
  bmi: 'Body mass index, from height and weight. Saved with your assessment but not used by the model.',
  smoking: 'Saved with your assessment for context. Not used by the model.',
  alcohol: 'Saved with your assessment for context. Not used by the model.',
  physicalActivity: 'Saved with your assessment for context. Not used by the model.',
};

export const INITIAL_FORM = {
  age: '', gender: '', bloodPressure: '', cholesterol: '', bloodSugar: '', heartRate: '',
  chestPainType: '', exerciseAngina: false, bmi: '', smoking: '', alcohol: '', physicalActivity: '',
};

export const INSIGHT_TOPICS = [
  { icon: 'Activity', title: 'Blood pressure', body: 'Blood pressure is the force of blood against artery walls. Readings under 120/80 mmHg are commonly considered normal. Persistently high readings make the heart work harder, so regular checks are worthwhile.', tips: ['Check at the same time each day', 'Limit salt in your diet', 'Ask a professional how often to test'] },
  { icon: 'Droplet', title: 'Cholesterol', body: 'Cholesterol is a fatty substance carried in the blood. Total levels under 200 mg/dL are commonly considered desirable. Higher levels can contribute to build-up in the arteries over time.', tips: ['Favour fibre-rich foods', 'Choose unsaturated over saturated fats', 'Get a lipid panel if advised'] },
  { icon: 'HeartPulse', title: 'Heart rate', body: 'Resting heart rate for most adults sits between 60 and 100 beats per minute. Maximum heart rate during exercise is often estimated as 220 minus your age and tends to decline with age.', tips: ['Measure resting rate after sitting quietly', 'Warm up before intense exercise', 'Mention unusual palpitations to a clinician'] },
  { icon: 'Footprints', title: 'Physical activity', body: 'Health organisations commonly suggest around 150 minutes of moderate activity per week for adults. Regular movement supports blood pressure, weight and mood.', tips: ['Start with short daily walks', 'Build up gradually', 'Choose activities you enjoy'] },
  { icon: 'CigaretteOff', title: 'Smoking', body: 'Tobacco use is one of the most widely recognised risk factors for heart and blood-vessel disease. Benefits of stopping begin within weeks, and continue for years.', tips: ['Talk to a clinician about support options', 'Identify and plan around triggers', 'Ask friends and family for backing'] },
  { icon: 'Salad', title: 'Healthy lifestyle', body: 'Sleep, stress, diet and activity work together. A balanced eating pattern with plenty of vegetables, fruit, whole grains and lean protein supports long-term heart health.', tips: ['Aim for 7-9 hours of sleep', 'Limit processed foods', 'Keep alcohol moderate'] },
];

export const adminNav = [
  { to: '/admin', label: 'Admin Dashboard', icon: 'ShieldCheck', end: true },
  { to: '/admin/users', label: 'Users', icon: 'Users' },
  { to: '/admin/assessments', label: 'Assessments', icon: 'ClipboardList' },
];
export const userNav = [
  { to: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { to: '/assessment/new', label: 'New Assessment', icon: 'FilePlus2' },
  { to: '/history', label: 'History', icon: 'History' },
  { to: '/reports', label: 'Reports', icon: 'FileText' },
  { to: '/health-insights', label: 'Health Insights', icon: 'Lightbulb' },
  { to: '/profile', label: 'Profile', icon: 'UserRound' },
];
