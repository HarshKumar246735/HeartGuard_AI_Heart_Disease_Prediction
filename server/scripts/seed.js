/**
 * Optional DEMO data seeder. Creates one admin, one demo user and a few sample assessments.
 * Predictions are produced by the real ML service (so it must be running / reachable).
 * Demo accounts are flagged `isDemo` and use the @demo.heartguard.local domain.
 *
 *   SEED_ADMIN_PASSWORD=... SEED_DEMO_PASSWORD=... npm run seed
 */
const { validateEnv } = require('../config/env');
validateEnv();
const crypto = require('crypto');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Assessment = require('../models/Assessment');
const mlService = require('../services/mlService');
const { levelFromProbability } = require('../utils/risk');

if (process.env.NODE_ENV === 'production' && (!process.env.SEED_ADMIN_PASSWORD || !process.env.SEED_DEMO_PASSWORD)) {
  console.error('In production you must provide SEED_ADMIN_PASSWORD and SEED_DEMO_PASSWORD.');
  process.exit(1);
}

const adminPassword = process.env.SEED_ADMIN_PASSWORD || `Demo-${crypto.randomBytes(6).toString('hex')}1`;
const demoPassword = process.env.SEED_DEMO_PASSWORD || `Demo-${crypto.randomBytes(6).toString('hex')}1`;

const samples = [
  { age: 34, gender: 'female', bloodPressure: 112, cholesterol: 180, bloodSugar: 88, heartRate: 182, chestPainType: 'non-anginal', exerciseAngina: false, bmi: 22.4, smoking: 'never', alcohol: 'occasional', physicalActivity: 'high' },
  { age: 47, gender: 'male', bloodPressure: 132, cholesterol: 224, bloodSugar: 104, heartRate: 160, chestPainType: 'atypical', exerciseAngina: false, bmi: 26.8, smoking: 'former', alcohol: 'occasional', physicalActivity: 'moderate' },
  { age: 58, gender: 'male', bloodPressure: 148, cholesterol: 262, bloodSugar: 132, heartRate: 118, chestPainType: 'asymptomatic', exerciseAngina: true, bmi: 31.2, smoking: 'current', alcohol: 'regular', physicalActivity: 'low' },
  { age: 63, gender: 'female', bloodPressure: 140, cholesterol: 245, bloodSugar: 99, heartRate: 128, chestPainType: 'typical', exerciseAngina: true, bmi: 28.1, smoking: 'never', alcohol: 'none', physicalActivity: 'low' },
  { age: 41, gender: 'male', bloodPressure: 124, cholesterol: 198, bloodSugar: 95, heartRate: 170, chestPainType: 'non-anginal', exerciseAngina: false, bmi: 24.6, smoking: 'never', alcohol: 'occasional', physicalActivity: 'moderate' },
];

(async () => {
  await connectDB();
  const old = await User.find({ isDemo: true }).select('_id');
  await Assessment.deleteMany({ userId: { $in: old.map((u) => u._id) } });
  await User.deleteMany({ isDemo: true });

  await User.create({ name: 'Demo Admin', email: 'admin@demo.heartguard.local', password: adminPassword, role: 'admin', isDemo: true });
  const demo = await User.create({ name: 'Demo User', email: 'user@demo.heartguard.local', password: demoPassword, isDemo: true });

  for (let i = 0; i < samples.length; i += 1) {
    const probability = await mlService.predict(samples[i]);
    await Assessment.create({
      ...samples[i], userId: demo._id, probability, prediction: levelFromProbability(probability),
      createdAt: new Date(Date.now() - (samples.length - i) * 6 * 24 * 60 * 60 * 1000),
    });
  }

  console.log('\nDEMO DATA created (not for production use):');
  console.log(`  admin: admin@demo.heartguard.local / ${adminPassword}`);
  console.log(`  user:  user@demo.heartguard.local  / ${demoPassword}\n`);
  await mongoose.disconnect();
})().catch((e) => { console.error('Seed failed:', e.message); process.exit(1); });
