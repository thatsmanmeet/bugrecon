import { ERROR_CODES } from '../constants.js';
import { User } from '../models/user.model.js';
import { APIError } from '../utils/APIError.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import jwt from 'jsonwebtoken';

export const authMiddleware = asyncHandler(async (req, res, next) => {
  try {
    // get tokens from cookie or header
    const incomingToken =
      req.cookies?.accessToken ||
      req.header('Authorization')?.replace('Bearer ', '');

    if (!incomingToken) {
      throw new APIError(400, 'Token not found. Login Again!');
    }

    // if token is found, let's decode the token

    const decodedToken = jwt.verify(
      incomingToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    if (!decodedToken) {
      throw new APIError(400, 'Invalid Access Token! Login Again');
    }

    // now token decode is successful, let's find the associated user

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new APIError(404, 'User not found associated with this token');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new APIError(401, 'Token Expired', ERROR_CODES.AUTH.TOKEN_EXPIRED);
    } else if (error.name === 'JsonWebTokenError') {
      throw new APIError(
        401,
        'Invalid Access Token! Login Again',
        ERROR_CODES.AUTH.INVALID_TOKEN
      );
    }
    throw new APIError(401, 'Authentication failed. Login Again');
  }
});
