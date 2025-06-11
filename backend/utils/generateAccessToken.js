import jwt from 'jsonwebtoken';
import { cookieOptions } from '../constants.js';
import { APIError } from './APIError.js';

export const generateAccessToken = (res, userId, userEmail, role) => {
  try {
    const payload = { _id: userId, email: userEmail, role };
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });

    res.cookie('accessToken', token, cookieOptions);
    return token;
  } catch (error) {
    console.log(error);
    throw new APIError(401, 'Error generating access token', error);
  }
};
