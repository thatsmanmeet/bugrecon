import express from 'express';
const router = express.Router();
import {
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
} from '../controllers/user.controllers.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { resetPasswordMiddleware } from '../middlewares/resetPasswordMiddleware.js';

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', authMiddleware, logoutUser);
router.post('/username', checkUserAvailability);
router
  .route('/profile')
  .get(authMiddleware, getUserProfile)
  .patch(authMiddleware, updateUserProfile)
  .delete(authMiddleware, deleteUserProfile);

router.post('/refreshToken', refreshUserTokens);
router.post('/forgotpassword', generateResetPasswordToken);
router.post(
  '/resetpassword/:token',
  resetPasswordMiddleware,
  verifyResetPasswordToken
);
router.post('/2fa/enable', authMiddleware, generateTwoFactorSecret);
router.post('/2fa/verify', authMiddleware, verifyTwoFactorSecret);
router.post('/2fa/disable', authMiddleware, disableTwoFactorSecret);

export default router;
