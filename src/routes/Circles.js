const express = require('express');
const { verifyToken } = require('../middlewares/verifyToken');
const { listCircles, createCircle, joinCircle, addCheckIn } = require('../controllers/Circlecontrollers');

const router = express.Router();
router.use(verifyToken);
router.route('/').get(listCircles).post(createCircle);
router.post('/:id/join', joinCircle);
router.post('/:id/check-in', addCheckIn);
module.exports = router;
