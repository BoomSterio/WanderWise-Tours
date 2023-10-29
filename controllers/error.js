const AppError = require('../utils/app-error')

const handleReadableErrors = (err) => {
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(400, message)
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => el.message)
    const message = `Invalid input data. ${errors.join('. ')}`
    return new AppError(418, message)
  }

  if (err.code === 11000) {
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0]
    const message = `Duplicate value: ${value}. Please use another value!`
    return new AppError(400, message)
  }

  if (err.name === 'JsonWebTokenError') {
    return new AppError(401, 'Invalid token. Please log in again!')
  }

  if (err.name === 'TokenExpiredError') {
    return new AppError(401, 'Expired token. Please log in again!')
  }

  return err
}

const sendErrDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  })
}

const sendErrProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    })
  }

  // Programming or other unknown error: don't leak error details
  // 1) Log error
  console.error('ERROR💥', err)

  //2) Send general error message
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
  })
}

module.exports = (err, req, res, next) => {
  const error = handleReadableErrors(err)

  error.statusCode = error.statusCode || 500
  error.status = error.status || 'error'

  if (process.env.NODE_ENV === 'development') {
    return sendErrDev(error, res)
  }
  sendErrProd(error, res)
}
