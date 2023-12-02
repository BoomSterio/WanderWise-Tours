const express = require('express')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')

const AppError = require('./utils/app-error')

const globalErrorHandler = require('./controllers/error')
const toursRouter = require('./routes/tours')
const usersRouter = require('./routes/users')

const app = express()

const RATE_LIMIT_MINUTES = 60

// 1) Global Middlewares

// Set Security HTTP headers
app.use(helmet())

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

// Data sanitization against NOSQL query injections
app.use(mongoSanitize())

// Data sanitization against XSS attacks
app.use(xss())

// Serving static files
app.use(express.static(`${__dirname}/public`))

// Test middleware for showcase
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString()
  next()
})

// 2) Routes

app.use('/api/v1/tours', toursRouter)
app.use('/api/v1/users', usersRouter)

app.all('*', (req, res, next) => {
  next(new AppError(404, `Can't find ${req.originalUrl} resource! Please make sure the path is correct.`))
})

// 3) Errors handling

app.use(globalErrorHandler)

module.exports = app
