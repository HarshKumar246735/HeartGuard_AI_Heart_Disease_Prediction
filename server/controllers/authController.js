const User = require('../models/User');
const Assessment = require('../models/Assessment');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/token');

const authResponse = (res, status, user) => res.status(status).json({ success: true, token: signToken(user._id), user });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) throw new ApiError(409, 'An account with that email already exists.');
  // Role is never taken from the request body: public sign-ups are always regular users.
  const user = await User.create({ name, email, password, role: 'user' });
  authResponse(res, 201, user);
});

exports.login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  // Same message for unknown email and wrong password to avoid account enumeration.
  if (!user || !(await user.comparePassword(req.body.password))) throw new ApiError(401, 'Incorrect email or password.');
  if (!user.isActive) throw new ApiError(403, 'This account has been deactivated. Contact an administrator.');
  authResponse(res, 200, user);
});

exports.me = asyncHandler(async (req, res) => res.json({ success: true, user: req.user }));

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  if (email && email !== req.user.email && (await User.findOne({ email }))) throw new ApiError(409, 'That email is already in use.');
  if (name) req.user.name = name;
  if (email) req.user.email = email;
  await req.user.save();
  res.json({ success: true, user: req.user });
});

exports.changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(req.body.currentPassword))) throw new ApiError(400, 'Current password is incorrect.');
  user.password = req.body.newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated.' });
});

exports.deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(req.body.password))) throw new ApiError(400, 'Password is incorrect.');
  if (user.role === 'admin') {
    const admins = await User.countDocuments({ role: 'admin', isActive: true });
    if (admins <= 1) throw new ApiError(400, 'You are the only administrator and cannot delete this account.');
  }
  await Assessment.deleteMany({ userId: user._id });
  await user.deleteOne();
  res.json({ success: true, message: 'Account deleted.' });
});
