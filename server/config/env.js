require('dotenv').config();

const required = ['MONGODB_URI', 'JWT_SECRET', 'ML_SERVICE_URL'];

function validateEnv() {
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long.');
  }
}

module.exports = { validateEnv };
