const mongoose = require('mongoose');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); //lesson 211 5:45
const Tour = require('../models/tourModel.js');
const User = require('../models/userModel.js');
const Booking = require('../models/bookingModel')
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const factory = require('./handlerFactory')

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // console.log(tour);

  // 2) Create checkout session
const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,  
            // images: ['https://natours.dev/img/tours/tour-1-cover.jpg']  
            images: [`${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`]       
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
    // payment_method_types: ['card'],
    mode: 'payment',
    // success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get('host')}/my-tours?alert=booking`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
  });

  // const session = await stripe.checkout.sessions.create({
  //   payment_method_types: ['card'],
  //   success_url: `${req.protocol}://${req.get('host')}/`,
  //   cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
  //   customer_email: req.user.email,
  //   client_reference_id: req.params.tourId,
    
  //   line_items: [
  //     {
  //       name: `${tour.name} Tour`,
  //       description: tour.summary,
  //       images: [`https://natours.dev/img/tours/${tour.imageCover}`],
  //       amount: tour.price * 100,
  //       currency: 'usd',
  //       price: tour.price,
  //       quantity: 1
  //     }
  //   ]

  // })

// const session = await stripe.checkout.sessions.create({
//   line_items: [{
//     name: 'T-shirt',
//     description: 'Comfortable cotton t-shirt',
//     images: ['https://example.com/t-shirt.png'],
//     amount: 2000,
//     currency: 'usd',
//     price: price.id,
//     quantity: 1,
//   }],
//   mode: 'payment',
//   success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
//   cancel_url: 'https://example.com/cancel',
// });



  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session
  });
});


// exports.createBookingCheckout = catchAsync(async(req, res, next) => {
//   // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
//   const {tour, user, price} =  req.query;

//   if (!tour && !user && !price) return next();
//   await Booking.create({tour, user, price})

//   res.redirect(req.originalUrl.split('?')[0])
// })

const createBookingCheckout =  async session => {
  const tour = session.client_reference_id;
  const user = (await User.findOne({email: session.customer.email})).id;
  const price = session.line_items[0].unit_amount / 100;
  await Booking.create({tour, user, price})
}

exports.webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try{
    event = stripe.webhooks.constructEvent(
     req.body,
     signature,
     process.env.STRIPE_WEBHOOK_SECRET)
  }catch(err){
    return res.status(400).send(`Webhook error: ${err.message} `);
  }
  if(event.type === 'checkout.session.complete')
    createBookingCheckout(event.data.object);

  res.status(200).json({ received: true});

};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
