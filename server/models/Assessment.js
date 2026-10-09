const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // --- Inputs used by the ML model ---
    age: { type: Number, required: true, min: 18, max: 100 },
    gender: { type: String, enum: ['male', 'female'], required: true },
    bloodPressure: { type: Number, required: true, min: 80, max: 250 }, // resting systolic, mmHg
    cholesterol: { type: Number, required: true, min: 100, max: 600 }, // total, mg/dL
    bloodSugar: { type: Number, required: true, min: 50, max: 500 }, // fasting, mg/dL
    heartRate: { type: Number, required: true, min: 60, max: 220 }, // maximum achieved, bpm
    chestPainType: { type: String, enum: ['typical', 'atypical', 'non-anginal', 'asymptomatic'], required: true },
    exerciseAngina: { type: Boolean, required: true },
    // --- Profile information (NOT used by the ML model) ---
    bmi: { type: Number, min: 10, max: 70 },
    smoking: { type: String, enum: ['never', 'former', 'current'] },
    alcohol: { type: String, enum: ['none', 'occasional', 'regular'] },
    physicalActivity: { type: String, enum: ['low', 'moderate', 'high'] },
    // --- Output ---
    prediction: { type: String, enum: ['Low', 'Moderate', 'Higher'], required: true },
    probability: { type: Number, required: true, min: 0, max: 1 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

assessmentSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
