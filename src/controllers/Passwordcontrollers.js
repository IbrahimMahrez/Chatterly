
const { connect } = require('mongoose');
const asyncWrapper = require('../middlewares/catchAsync');
const {User} = require('../models/User'); // import user model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // import nodemailer for sending emails
require('dotenv').config();



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
      const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // 👈 مهم لحالتك
  },
});
    const mailOptions = {
        from: process.env.EMAIL_USER, // sender email address
        to: user.email, // recipient email address (the user's email)
        subject: 'Password Reset Link', // email subject
        html: `<p>You requested a password reset. Click the link below to reset your password:</p><a href="${link}">Reset Password</a>` // email body with the reset link
    };
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
  

