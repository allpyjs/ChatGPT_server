const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const stripeCheckOut = async (req, res, next) => {
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "ChadGPT",
          },
          unit_amount: 5000,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/checkout-success`,
    cancel_url: `${process.env.CLIENT_URL}/dashboard`,
  });

  res.send({ url: session.url });
};

const createSubscription = async (email, name, priceId, paymentMethod) => {
  try {
    // create a stripe customer

    const customer = await stripe.customers.create({
      name: name,
      email: email,
      payment_method: paymentMethod,
      invoice_settings: {
        default_payment_method: paymentMethod,
      },
    });

    // get the price id from the front-end

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_settings: {
        payment_method_options: {
          card: {
            request_three_d_secure: "any",
          },
        },
        payment_method_types: ["card"],
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
    });

    // return the client secret and subscription id
    return {
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      subscriptionId: subscription.id,
    };
  } catch (error) {
    console.log(error);
  }
};

const stripeSubscription = async (req, res, next) => {
  const { email, name, priceId, paymentMethod } = req.body;
  console.log(email);
  let result = await createSubscription(email, name, priceId, paymentMethod);
  res.send(result);
};

const cancelSubscription = async (req, res, next) => {
  const { subId } = req.body;
  try {
    const canceledSubscription = await stripe.subscriptions.cancel(subId);

    res.send({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = { stripeCheckOut, stripeSubscription, cancelSubscription };
