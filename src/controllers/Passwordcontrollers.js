
const asyncWrapper = require('../middlewares/catchAsync');
const { User } = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const createMailTransporter = () => nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Enable this only for local networks that inject a self-signed TLS certificate.
  tls: {
    rejectUnauthorized: process.env.EMAIL_TLS_REJECT_UNAUTHORIZED !== 'false',
  },
});

const createResetEmail = (link) => ({
  from: `"Chatterly" <${process.env.EMAIL_USER}>`,
  subject: 'Reset your Chatterly password',
  html: `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;color:#172033;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;background:#f1f5f9;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;overflow:hidden;background:#ffffff;border-radius:20px;box-shadow:0 16px 45px rgba(15,23,42,.15);">
          <tr><td style="padding:28px 34px;background:linear-gradient(135deg,#6d4df4,#4f8cff);color:#ffffff;text-align:center;">
            <div style="display:inline-block;padding:9px 14px;background:rgba(255,255,255,.16);border-radius:10px;font-size:22px;font-weight:700;letter-spacing:.3px;">Chatterly</div>
            <h1 style="margin:18px 0 0;font-size:25px;line-height:1.25;">Reset your password</h1>
          </td></tr>
          <tr><td style="padding:34px;">
            <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">We received a request to reset the password for your Chatterly account.</p>
            <p style="margin:0 0 26px;font-size:14px;line-height:1.7;color:#64748b;">Click the button below to choose a new password. This link expires in <strong style="color:#334155;">15 minutes</strong>.</p>
            <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 26px;"><tr><td style="border-radius:10px;background:#6d4df4;"><a href="${link}" style="display:inline-block;padding:14px 24px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Reset password</a></td></tr></table>
            <div style="padding:14px 16px;background:#f8fafc;border-left:4px solid #6d4df4;border-radius:7px;color:#64748b;font-size:12px;line-height:1.6;">If you did not request a password reset, you can safely ignore this email. Your password will not change.</div>
            <p style="margin:24px 0 0;color:#94a3b8;font-size:11px;line-height:1.6;word-break:break-all;">Button not working? Copy this link:<br><a href="${link}" style="color:#6d4df4;">${link}</a></p>
          </td></tr>
          <tr><td style="padding:18px 34px;background:#f8fafc;color:#94a3b8;font-size:12px;text-align:center;">© ${new Date().getFullYear()} Chatterly · Connect with your community</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`,
});

module.exports.getForgotPasswordView = asyncWrapper(async (req, res) => {
   
   res.render('forgot_password');


});




module.exports.sendForgetPasswordLink = asyncWrapper(async (req, res) => {
  
    const user =await User.findOne({ email: req.body.email }); // find user by email
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }
     const secrt=process.env.JWT_SECRET + user.password; // create a secret using the user's password and a secret key from environment variables
       const token = jwt.sign({ email: user.email, id: user._id }, secrt, { expiresIn: '15m' }); // generate a JWT token with the user's email and id as payload, signed with the secret and set to expire in 15 minutes
     
       
      const link = `http://localhost:7000/password/reset_password/${user._id}/${token}`;
      const transporter = createMailTransporter();
    const mailOptions = { to: user.email, ...createResetEmail(link) };
         transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ message: 'Error sending email.' });
        } else {
            console.log('Email sent: ' + info.response);
             res.render('link_sent', { message: 'Password reset link has been sent to your email.' });
        }
       
});





});

module.exports.getsResetPasswordView = asyncWrapper(async (req, res) => {
  
    const user =await User.findById(req.params.userId); // find user by ID
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }
        const secrt=process.env.JWT_SECRET + user.password; // create a secret using the user's password and a secret key from environment variables
        try {
            jwt.verify(req.params.token, secrt);
            res.render('reset_password', { email: user.email, id: user._id, token: req.params.token }); // render the reset password view with the user's email, id, and token
        } catch (error) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

});






module.exports.postResetPasswordView = asyncWrapper(async (req, res) => {
  
    const user =await User.findById(req.params.userId); // find user by ID
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }
        const secrt=process.env.JWT_SECRET + user.password; // create a secret using the user's password and a secret key from environment variables
        try {
            jwt.verify(req.params.token, secrt);
            const salt = await bcrypt.genSalt(10); // generate salt for hashing
            user.password = await bcrypt.hash(req.body.password, salt); // hash the new password with the generated salt
            await user.save(); // save the updated user with the new password
            res.render('success-password', { message: 'Password has been reset successfully.' }); // render the reset password view with a success message
        } catch (error) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

});

module.exports.sendForgetPasswordLinkApi = asyncWrapper(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const secrt = process.env.JWT_SECRET + user.password;
  const token = jwt.sign({ email: user.email, id: user._id }, secrt, { expiresIn: '15m' });

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const link = `${frontendUrl}/reset-password/${user._id}/${token}`;

  const transporter = createMailTransporter();
  const mailOptions = { to: user.email, ...createResetEmail(link) };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Password reset link has been sent to your email.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email.' });
  }
});

module.exports.postResetPasswordApi = asyncWrapper(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found.' });
  }

  const secrt = process.env.JWT_SECRET + user.password;

  try {
    jwt.verify(req.params.token, secrt);
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    await user.save();
    res.json({ message: 'Password has been reset successfully.' });
  } catch (error) {
    return res.status(400).json({ message: 'Invalid or expired token.' });
  }
});
  

