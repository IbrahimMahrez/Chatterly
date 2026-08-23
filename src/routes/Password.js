const express = require('express');
const router = express.Router();

const {
  getForgotPasswordView,
  sendForgetPasswordLink,
  getsResetPasswordView,
  postResetPasswordView,
  sendForgetPasswordLinkApi,
  postResetPasswordApi,
} = require('../controllers/Passwordcontrollers');

// forgot password
router.route("/forgot_password")
  .get(getForgotPasswordView)
  .post(sendForgetPasswordLink);

// reset password
router.route("/reset_password/:userId/:token")
  .get(getsResetPasswordView)
  .post(postResetPasswordView);

router.post('/api/forgot', sendForgetPasswordLinkApi);
router.post('/api/reset/:userId/:token', postResetPasswordApi);

module.exports = router;