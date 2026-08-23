const express = require('express');
const { verifyTokenAndAdmin } = require('../middlewares/verifyToken');
const { getAdminDashboard } = require('../controllers/Admincontrollers');

const router = express.Router();
router.get('/dashboard', verifyTokenAndAdmin, getAdminDashboard);

module.exports = router;
