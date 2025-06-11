import { asyncHandler } from '../utils/AsyncHandler.js';
import { APIResponse } from '../utils/APIResponse.js';
import { APIError } from '../utils/APIError.js';
import { User } from '../models/user.model.js';
import validator from 'validator';
import speakeasy from 'speakeasy';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { generateAccessToken } from '../utils/generateAccessToken.js';
import { generateRefreshToken } from '../utils/generateRefreshToken.js';
import { cookieOptions, ERROR_CODES } from '../constants.js';
import { sendEmail } from '../utils/SendMail.js';

const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password, confirmPassword } = req.body;

  if (!name || !username || !email || !password || !confirmPassword) {
    throw new APIError(400, 'All fields are required');
  }

  if (!validator.isEmail(email)) {
    throw new APIError(400, 'Invalid Email Address');
  }

  if (password !== confirmPassword) {
    throw new APIError(422, "Passwords don't match");
  }

  if (password.toString().length < 8 || confirmPassword.toString().length < 8) {
    throw new APIError(401, 'Passwords must have a minimum length of 8');
  }

  // here we will first check if username is taken already or not
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    throw new APIError(409, 'Email or Username already taken');
  }

  const newUser = await User.create({
    name,
    username,
    email,
    password,
  });

  if (!newUser) {
    throw new APIError(500, "Something wen't wrong creating new user");
  }

  const html = `
   <h2>Welcome to BugRecon</h2>
   <p>Hi, ${newUser.name}, We're glad to have you on our platform. It will be fun building products and solving bugs together! Let's start smashing the Bugs.</p>
   <p>BugRecon Team</p>
  `;

  await sendEmail({
    email: newUser.email,
    subject: 'Welcome to BugRecon',
    html,
  });

  return res
    .status(201)
    .json(new APIResponse(201, 'User created successfully', newUser));
});

const checkUserAvailability = asyncHandler(async (req, res) => {
  const { username } = req.body;

  if (!username) {
    throw new APIError(401, 'Please send a valid username');
  }

  const user = await User.findOne({ username });

  if (user) {
    throw new APIError(409, 'Username not available');
  }

  return res.status(200).json(new APIResponse(200, 'Username Available'));
});

const generateTwoFactorSecret = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+twoFactorSecret');

  if (!user) {
    throw new APIError(401, 'User not found');
  }

  if (user.twoFactorEnabled) {
    throw new APIError(409, 'Two Factor Authentication already enabled');
  }

  // generate secret and save it to user
  const userSecret = speakeasy.generateSecret({ name: user.name });
  user.twoFactorSecret = userSecret.base32;
  await user.save({ validateBeforeSave: false });

  // send the tokens to user
  return res.status(200).json(
    new APIResponse(
      200,
      '2fa secret generated. Scan the QR Code with an authenticator app',
      {
        secret: userSecret.base32,
        qrCodeData: userSecret.otpauth_url,
      }
    )
  );
});

const verifyTwoFactorSecret = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+twoFactorSecret');

  if (!user || !user.twoFactorSecret) {
    throw new APIError(404, 'User not found or 2FA process not started');
  }

  if (user.twoFactorEnabled) {
    throw new APIError(409, 'Two Factor Authentication is already enabled');
  }

  const { token } = req.body;

  if (!token) {
    throw new APIError(401, 'Totp Code is required');
  }

  const isVerified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    token: token,
    window: 1,
    encoding: 'base32',
  });

  if (!isVerified) {
    throw new APIError(403, 'Invalid Totp Code');
  }

  // enable the two factor code now
  user.twoFactorEnabled = true;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new APIResponse(200, '2FA Enabled Successfully'));
});

const disableTwoFactorSecret = asyncHandler(async (req, res) => {
  const { password } = req.body;

  if (!password) {
    throw new APIError(401, 'Password is required');
  }

  const user = await User.findById(req.user._id).select(
    '+twoFactorSecret +password'
  );

  if (!user) {
    throw new APIError(404, 'User not found');
  }

  if (!user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new APIError(400, '2FA is already disabled');
  }

  const isPasswordValid = await user.matchPassword(password);

  if (!isPasswordValid) {
    throw new APIError(403, 'Password is not valid');
  }

  // now disable 2FA
  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new APIResponse(200, '2FA disabled successfully'));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password, token } = req.body;

  const loginIdentifier = username || email || null;

  if (!loginIdentifier || !password) {
    throw new APIError(400, 'All fields are required');
  }

  if (email && !validator.isEmail(email)) {
    throw new APIError(401, 'Invalid email address.');
  }

  if (password.toString().length < 8) {
    throw new APIError(400, 'Password must have a minimum length of 8');
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  }).select('+password +twoFactorSecret +refreshToken');

  if (!existingUser) {
    throw new APIError(404, 'User not found');
  }

  const isPasswordValid = await existingUser.matchPassword(password);

  if (!isPasswordValid) {
    throw new APIError(401, 'Invalid email/username or password');
  }

  if (existingUser.twoFactorEnabled) {
    if (!token || token === '') {
      return res
        .status(200)
        .json(new APIResponse(200, '2FA Required', { token: true }));
    }
    // verify token

    const isTokenValid = speakeasy.totp.verify({
      secret: existingUser.twoFactorSecret,
      encoding: 'base32',
      window: 1,
      token: token,
    });

    if (!isTokenValid) {
      throw new APIError(403, 'Invalid Totp code');
    }
  }

  // generate access and refresh tokens and send cookie
  const accessToken = generateAccessToken(
    res,
    existingUser._id,
    existingUser.email,
    existingUser.role
  );
  const refreshToken = generateRefreshToken(res, existingUser._id);

  existingUser.refreshToken = refreshToken;
  await existingUser.save({ validateBeforeSave: false });

  const returnUser = existingUser.toObject();
  delete returnUser.password;
  delete returnUser.twoFactorSecret;
  delete returnUser.refreshToken;

  return res.status(200).json(
    new APIResponse(200, 'logged In Successfully', {
      ...returnUser,
      accessToken,
      refreshToken,
    })
  );
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user._id, {
    $unset: {
      refreshToken: 1,
    },
  });

  if (!user) {
    throw new APIError(401, 'User not authenticated.');
  }

  return res
    .clearCookie('accessToken', cookieOptions)
    .clearCookie('refreshToken', cookieOptions)
    .status(200)
    .json(new APIResponse(200, 'User logged out successfully'));
});

const getUserProfile = asyncHandler(async (req, res) => {
  if (!req.user._id) throw new APIError(403, 'Not Authenticated');

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new APIError(404, 'User not found');
  }

  return res.status(200).json(new APIResponse(200, 'Profile fetched', user));
});

const updateUserProfile = asyncHandler(async (req, res) => {
  const { name, username, email, password, confirmPassword } = req.body;

  // && -> so that all fields are null detected
  if (!name && !username && !email && !password && !confirmPassword) {
    return res.status(200).json(new APIResponse(200, 'Nothing to update'));
  }

  if (email && !validator.isEmail(email)) {
    throw new APIError(401, 'Invalid email address');
  }

  if (!req.user || !req.user._id) {
    throw new APIError(403, 'User not authenticated');
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    throw new APIError(404, 'User not found');
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.username = username || user.username;

  if (password) {
    if (!confirmPassword) {
      throw new APIError(400, 'Confirm password is required');
    }
    if (password !== confirmPassword) {
      throw new APIError(400, "Password's don't match");
    }
    user.password = password;
  }

  await user.save();

  const returnUser = user.toObject();
  delete returnUser.password;

  return res
    .status(200)
    .json(new APIResponse(200, 'Profile Updated', returnUser));
});

const deleteUserProfile = asyncHandler(async (req, res) => {
  return res.status(501).json(new APIResponse(501, 'Delete not implemented'));
});

const refreshUserTokens = asyncHandler(async (req, res) => {
  // get incoming tokens
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new APIError(
      400,
      'No Refresh Token Found',
      ERROR_CODES.AUTH.TOKEN_MISSING
    );
  }

  // now let's decode our tokens
  let decodedToken;
  try {
    decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new APIError(
        400,
        'Refresh Token Expired',
        ERROR_CODES.AUTH.REFRESH_EXPIRED
      );
    }
    throw new APIError(400, 'Invalid Refresh Token');
  }

  // get user
  const user = await User.findById(decodedToken._id).select('+refreshToken');

  if (!user) {
    throw new APIError(404, 'User not found with this token');
  }

  if (user.refreshToken !== incomingRefreshToken) {
    throw new APIError(401, 'Refresh token is invalid/expired');
  }

  // generate new access and refresh tokens
  const accessToken = generateAccessToken(res, user._id, user.email, user.role);
  const refreshToken = generateRefreshToken(res, user._id);

  const returnUser = user.toObject();
  delete returnUser.refreshToken;

  return res.status(200).json(
    new APIResponse(200, 'Refresh Token Reset', {
      ...returnUser,
      accessToken,
      refreshToken,
    })
  );
});

const generateResetPasswordToken = asyncHandler(async (req, res) => {
  // we need to get an email -> Right?
  const { email } = req.body;

  if (!email) {
    throw new APIError(401, 'Email address is required');
  }

  if (!validator.isEmail(email)) {
    throw new APIError(401, 'Invalid email address');
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new APIError(404, "User doesn't exist");
  }

  // create a reset token that will be sent to the user
  const resetToken = crypto.randomBytes(20).toString('hex');
  // save hashed version of this token to db
  const hashedStoredToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  const expiryDate = Date.now() + 15 * 60 * 1000;

  // save these to DB
  user.forgotPasswordToken = hashedStoredToken;
  user.forgotPasswordExpiry = expiryDate;
  await user.save({ validateBeforeSave: false });

  // now send the reset token via email

  const resetUrl = `${process.env.APP_URL}/reset-password/${resetToken}`;
  const html = `
    <h2>Password Reset Request</h2>
    <p>Hi ${user.name},</p>
    <p>You requested a password reset. Click the link below to reset it:</p>
    <a href="${resetUrl}" target="_blank">${resetUrl}</a>
    <p>This link will expire in 15 minutes.</p>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Reset your password',
    html,
  });

  return res
    .status(200)
    .json(new APIResponse(200, 'Reset Password Link Sent to Email'));
});

const verifyResetPasswordToken = asyncHandler(async (req, res) => {
  // reset user will come from the reset password middleware, we will just handle reset password here
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    throw new APIError(
      400,
      'Please provide both password and confirmPassword.'
    );
  }

  if (password !== confirmPassword) {
    throw new APIError(400, "Passwords don't match");
  }

  const user = req.resetUser;

  user.password = password;
  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordToken = undefined;
  await user.save();

  const html = `
  <h2>Password has been successfully changed</h2>
  <p>Hello ${user.name}</p>
  <p>Your BugRecon's password has been successfully changed. You can now Login with new password.</p>
  <p>BugRecon Team</p>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Password Changed',
    html,
  });

  return res
    .status(200)
    .json(new APIResponse(200, 'Password has been reset successfully.', {}));
});

export {
  registerUser,
  checkUserAvailability,
  generateTwoFactorSecret,
  verifyTwoFactorSecret,
  disableTwoFactorSecret,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  refreshUserTokens,
  generateResetPasswordToken,
  verifyResetPasswordToken,
};
