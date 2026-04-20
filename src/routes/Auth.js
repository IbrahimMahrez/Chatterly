const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { validateUserRegistration, validateUserLogin } = require('../utils/validation');
const bcrypt = require('bcrypt');
const asyncWrapper = require('../middlewares/catchAsync');
const { registerUser } = require('../controllers/Authcontollers');
const { loginUser } = require('../controllers/Authcontollers');


router.post('/register', registerUser);

router.post('/login', loginUser);

module.exports = router;