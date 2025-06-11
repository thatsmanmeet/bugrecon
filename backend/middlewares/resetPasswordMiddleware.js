import { User } from '../models/user.model.js';
import { APIError } from '../utils/APIError.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import crypto from 'crypto';

export const resetPasswordMiddleware = asyncHandler(async (req, res, next) => {
  const incomingToken = req.params.token;

  if (!incomingToken) {
    throw new APIError(400, 'Reset Token not found');
  }

  // first we recreated the hashed version of the token
  const hashedResetToken = crypto
    .createHash('sha256')
    .update(incomingToken)
    .digest('hex');

  // now we will find the user in the database with same hashed token and with expiry greater than current time

  const user = await User.findOne({
    forgotPasswordToken: hashedResetToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new APIError(400, 'User not found or invalid reset token');
  }

  req.resetUser = user;
  next();
});
