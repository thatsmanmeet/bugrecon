import jwt from 'jsonwebtoken';
import { APIError } from './APIError.js';
import { cookieOptions } from '../constants.js';

export const generateRefreshToken = (res, userId) => {
  try {
    const payload = { _id: userId };
    const token = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    });
    res.cookie('refreshToken', token, cookieOptions);
    return token;
  } catch (error) {
    console.log(error);
    throw new APIError(401, 'Unable to generate refresh token', error);
  }
};
