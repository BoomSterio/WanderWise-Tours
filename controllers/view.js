const Tour = require('../models/tour')
const catchAsync = require('../utils/catch-async')

exports.getOverview = catchAsync(async (req, res) => {
  const tours = await Tour.find()

  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  })
})

exports.getTour = catchAsync(async (req, res) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({ path: 'reviews', fields: 'review rating user' })

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
