const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const Tour = require('../models/tour')
const Booking = require('../models/booking')
const catchAsync = require('../utils/catch-async')

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId)

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    // TODO: replace this unsecure method with Stripe Web Hooks to create a booking
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${
      tour.price
    }`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
      },
    ],
  })

  // 3) Send session in response
  res.status(200).json({
    status: 'success',
    session,
  })
})

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  // TODO: change this temporary workaround, because IT'S UNSECURE
  const { tour, user, price } = req.query

  if (!tour || !user || !price) {
    return next()
  }

  await Booking.create({ tour, user, price })
  res.redirect(req.originalUrl.split('?')[0])
})
