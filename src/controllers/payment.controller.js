const axios = require("axios");

const createPaymentIntention = async (req, res) => {
  try {
    if (!process.env.PAYMOB_SECRET_KEY) throw new Error("PAYMOB_SECRET_KEY missing");
    if (!process.env.PAYMOB_INTEGRATION_ID) throw new Error("PAYMOB_INTEGRATION_ID missing");

    const rawAmount = Number(req.body.amount);
    if (!rawAmount || isNaN(rawAmount) || rawAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    const amountInCents = Math.round(rawAmount * 100);

    const intentionResponse = await axios.post(
      "https://accept.paymob.com/v1/intention/",
      {
        amount: amountInCents,
        currency: "EGP",
        payment_methods: [Number(process.env.PAYMOB_INTEGRATION_ID)],
        items: [{ name: "Order Payment", amount: amountInCents, description: "Service payment", quantity: 1 }],
        billing_data: {
          first_name:   req.body.first_name   || "User",
          last_name:    req.body.last_name    || "Test",
          email:        req.body.email        || "test@gmail.com",
          phone_number: req.body.phone_number || "01000000000",
          apartment: "NA", floor: "NA", street: "NA",
          building: "NA", city: "Cairo", state: "Cairo",
          country: "EG", postal_code: "00000", region: "NA",
        },
        expiration: 3600,
        redirection_url: process.env.REDIRECT_URL,
        notification_url: process.env.WEBHOOK_URL,
      },
      {
        headers: {
          Authorization: `Token ${process.env.PAYMOB_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const clientSecret = intentionResponse.data?.client_secret;
    const paymentUrl = clientSecret
      ? `https://accept.paymob.com/unifiedcheckout/?publicKey=${process.env.PAYMOB_PUBLIC_KEY}&clientSecret=${clientSecret}`
      : null;

    return res.json({
      message: "Payment intention created successfully",
      payment_url: paymentUrl,
      data: intentionResponse.data,
    });

  } catch (error) {
    console.error("PAYMOB ERROR:", error.response?.data || error.message);
    return res.status(500).json({
      message: "Payment failed",
      error: error.response?.data || error.message,
    });
  }
};

module.exports = { createPaymentIntention };