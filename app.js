const path = require('path')
const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const cookieParser = require('cookie-parser')

const AppError = require('./utils/app-error')

const globalErrorHandler = require('./controllers/error')
const viewRouter = require('./routes/view')
const toursRouter = require('./routes/tours')
const usersRouter = require('./routes/users')
const reviewsRouter = require('./routes/reviews')
const bookingsRouter = require('./routes/bookings')

const RATE_LIMIT_MINUTES = 60

const app = express()

// Template engine set up
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// 1) Global Middlewares

// Serving static files
app.use(express.static(path.join(__dirname, 'public')))

// Set Security HTTP headers
const scriptSrcUrls = [
  'https://unpkg.com/',
  'https://*.tiles.mapbox.com',
  'https://api.mapbox.com',
  'https://events.mapbox.com',
  'https://js.stripe.com',
  'https://m.stripe.network',
  'https://*.cloudflare.com',
]
const styleSrcUrls = ['https://unpkg.com/', 'https://*.tiles.mapbox.com', 'https://fonts.googleapis.com/']
const connectSrcUrls = [
  'https://unpkg.com',
  'https://*.tiles.mapbox.com',
  'https://api.mapbox.com',
  'https://events.mapbox.com',
  'https://*.stripe.com',
  'https://bundle.js:*',
  'ws://127.0.0.1:*/',
]
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com']

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:', 'https:', 'ws:'],
      baseUri: ["'self'"],
      fontSrc: ["'self'", ...fontSrcUrls],
      scriptSrc: ["'self'", 'https:', 'http:', 'blob:', ...scriptSrcUrls],
      frameSrc: ["'self'", 'https://js.stripe.com'],
      objectSrc: ["'none'"],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:', 'https://m.stripe.network'],
      childSrc: ["'self'", 'blob:'],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      formAction: ["'self'"],
      connectSrc: ["'self'", "'unsafe-inline'", 'data:', 'blob:', ...connectSrcUrls],
      upgradeInsecureRequests: [],
    },
  }),
)

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

// Limit requests from the same domain
const limiter = rateLimit({
  max: 100,
  windowMs: RATE_LIMIT_MINUTES * 60 * 1000,
  message: `Too many requests from this IP. Please try again after ${RATE_LIMIT_MINUTES} minutes`,
})
app.use('/api', limiter)

// Body parser, reading data from the body into req.body and limiting body size
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// Parsing cookoes to req.cookies
app.use(cookieParser())

// Data sanitization against NOSQL query injections
app.use(mongoSanitize())

// Data sanitization against XSS attacks
app.use(xss())

// Test middleware for showcase
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  next()
})

// 2) Routes

// Frontend
app.use('/', viewRouter)

// API
app.use('/api/v1/tours', toursRouter)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/reviews', reviewsRouter)
app.use('/api/v1/bookings', bookingsRouter)

app.all('*', (req, res, next) => {
  next(new AppError(404, `Can't find ${req.originalUrl} resource! Please make sure the path is correct.`))
})

// 3) Errors handling

app.use(globalErrorHandler)

module.exports = app
