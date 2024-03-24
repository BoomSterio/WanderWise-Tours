const Tour = require('../models/tour')
const Booking = require('../models/booking')
const AppError = require('../utils/app-error')
const catchAsync = require('../utils/catch-async')

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find()

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  })
})

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({ path: 'reviews', fields: 'review rating user' })

  if (!tour) {
    return next(new AppError(404, 'There is no tour with that name.'))
  }

  res
    .status(200)
    .set(
      'Content-Security-Policy',
      'connect-src ws: https://*.tiles.mapbox.com https://api.mapbox.com https://events.mapbox.com',
    )
    .render('tour', {
      title: `${tour.name} Tour`,
      tour,
    })
})

exports.getLoginForm = (req, res) => {
  res.status(200).set('Content-Security-Policy', "connect-src 'self' https://unpkg.com").render('login', {
    title: `Log into your account`,
  })
}

exports.getSignupForm = (req, res) => {
  res.status(200).set('Content-Security-Policy', "connect-src 'self' https://unpkg.com").render('signup', {
    title: `Create new account`,
  })
}

exports.getAccount = (req, res) => {
  res.status(200).render('account', {
    title: `Your account`,
  })
}

exports.getMyBookings = catchAsync(async (req, res) => {
  // 1) Find all bookings of a user
  const bookings = await Booking.find({ user: req.user.id })

  // 2) Find tours with the returned IDs
  const tourIDs = bookings.map((booking) => booking.tour)
  const tours = await Tour.find({ _id: { $in: tourIDs } })

  // 3) Render the page
  res.status(200).render('overview', {
    title: 'Your Bookings',
    tours,
  })
})
