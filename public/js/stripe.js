// const axios = require('axios');
import axios from 'axios';
const  { loadStripe } =require ('@stripe/stripe-js');

// import { showAlert } from './alerts';
// const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
// const stripe = stripe(STRIPE_PUBLISHABLE_KEY);
// const stripe = STRIPE_PUBLISHABLE_KEY

export const bookTour = async tourId => {
  // const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
  const stripe = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY)
  try {
    // 1) Get checkout session from API
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`
    );
    console.log(session);

    // 2) Create checkout form + chanrge credit card
    const sessionUrl = session.data.session.url
    window.location = sessionUrl
    // await stripe.redirectToCheckout({
    //   sessionId: session.data.session.id
    // });
  } catch (err) {
    console.log(err);
    // showAlert('error', err);
  }
};

