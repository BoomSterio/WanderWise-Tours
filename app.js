const path = require('path')
const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const cookieParser = require('cookie-parser')
const csp = require('express-csp')
const compression = require('compression')

const AppError = require('./utils/app-error')

const globalErrorHandler = require('./controllers/error')
const viewRouter = require('./routes/view')
const toursRouter = require('./routes/tours')
const usersRouter = require('./routes/users')
const reviewsRouter = require('./routes/reviews')
const bookingsRouter = require('./routes/bookings')

const RATE_LIMIT_MINUTES = 60

const app = express()

app.enable('trust proxy')

// Template engine set up
app.set('view engine', 'pug')
app.set('views', path.join(__dirname, 'views'))

// 1) Global Middlewares

// Serving static files
app.use(express.static(path.join(__dirname, 'public')))

// Set Security HTTP headers
app.use(helmet())
csp.extend(app, {
  policy: {
    directives: {
      'default-src': ['self'],
      'style-src': ['self', 'unsafe-inline', 'https:'],
      'font-src': ['self', 'https://fonts.gstatic.com'],
      'script-src': [
        'self',
        'unsafe-inline',
        'data',
        'blob',
        'https://js.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*',
        'ws://127.0.0.1:*',
      ],
      'worker-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*',
        'ws://127.0.0.1:*',
      ],
      'frame-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*',
        'ws://127.0.0.1:*',
      ],
      'img-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*',
        'ws://127.0.0.1:*',
      ],
      'connect-src': [
        'self',
        'unsafe-inline',
        'data:',
        'blob:',
        'https://*.stripe.com',
        'https://*.mapbox.com',
        'https://*.cloudflare.com/',
        'https://bundle.js:*',
        'ws://localhost:*',
        'ws://127.0.0.1:*',
      ],
    },
  },
})

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

// Compressing all the text sent to clients
app.use(compression())

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
