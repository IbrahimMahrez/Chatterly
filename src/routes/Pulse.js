const express = require('express');
const { verifyToken } = require('../middlewares/verifyToken');
const { joinPulse, getPulse } = require('../controllers/Pulsecontrollers');

const router = express.Router();
router.use(verifyToken);
router.post('/join', joinPulse);
router.get('/:id', getPulse);
module.exports = router;
