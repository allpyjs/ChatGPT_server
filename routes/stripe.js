const express = require("express");
const {
  stripeCheckOut,
  stripeSubscription,
  cancelSubscription,
} = require("./../controllers/stripe");
const router = express.Router();

router.post("/create-checkout-session", stripeCheckOut);
router.post("/create-subscription", stripeSubscription);
router.post("/cancel-subscrption", cancelSubscription);

module.exports = router;
