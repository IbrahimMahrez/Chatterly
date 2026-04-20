const express = require('express');
const router = express.Router();

const {
  getForgotPasswordView,
  sendForgetPasswordLink,
  getsResetPasswordView,
  postResetPasswordView
} = require('../controllers/Passwordcontrollers');

// forgot password
router.route("/forgot_password")
  .get(getForgotPasswordView)
  .post(sendForgetPasswordLink);

// reset password
router.route("/reset_password/:userId/:token")
  .get(getsResetPasswordView)
  .post(postResetPasswordView);

module.exports = router;