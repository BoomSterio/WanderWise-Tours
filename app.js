const express = require('express')
const morgan = require('morgan')

const AppError = require('./utils/app-error')

const globalErrorHandler = require('./controllers/error')
const toursRouter = require('./routes/tours')
const usersRouter = require('./routes/users')

const app = express()

// 1) Middlewares

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}
app.use(express.json())
app.use(express.static(`${__dirname}/public`))

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
