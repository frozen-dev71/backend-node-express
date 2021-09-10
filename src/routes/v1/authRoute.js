import { Router } from 'express';
import catchAsync from '~/utils/catchAsync';
import validate from '~/middlewares/validate';
import authenticate from '~/middlewares/authenticate';
import * as authValidation from '~/validations/authValidation';
import * as authController from '~/controllers/authController';

const router = Router();

router.post('/signup', validate(authValidation.signup), catchAsync(authController.signup));
router.post('/signin', validate(authValidation.signin), catchAsync(authController.signin));
router.get('/me', authenticate(), catchAsync(authController.me));
router.post('/logout', validate(authValidation.logout), catchAsync(authController.logout));
router.post('/refresh-tokens', validate(authValidation.refreshTokens), catchAsync(authController.refreshTokens));
router.post('/send-verification-email', authenticate(), catchAsync(authController.sendVerificationEmail));
router.post('/verify-email', validate(authValidation.verifyEmail), catchAsync(authController.verifyEmail));
router.post('/forgot-password', validate(authValidation.forgotPassword), catchAsync(authController.forgotPassword));
router.post('/reset-password', validate(authValidation.resetPassword), catchAsync(authController.resetPassword));

export default router;
