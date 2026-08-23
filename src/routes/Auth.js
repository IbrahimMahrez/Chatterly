const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/Authcontollers');
const { loginUser } = require('../controllers/Authcontollers');


router.post('/register', registerUser);

router.post('/login', loginUser);

module.exports = router;