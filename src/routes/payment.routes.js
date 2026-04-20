const express = require("express");
const router = express.Router();
const { createPaymentIntention } = require("../controllers/payment.controller");
const { verifyToken } = require("../middlewares/verifyToken");

router.post("/intention", verifyToken, createPaymentIntention);

module.exports = router;