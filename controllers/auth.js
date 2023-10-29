const { promisify } = require('util')
const jwt = require('jsonwebtoken')

const User = require('../models/user')
const catchAsync = require('../utils/catch-async')
const AppError = require('../utils/app-error')

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body
  const user = await User.create({ name, email, password, passwordConfirm })

  const token = signToken(user._id)

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user,
    },
  })
})

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError(400, 'Please provide email and password!'))
  }

  // 2) Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password')

  // returns error if user in not found. But if user found, proceeds to check password
  if (!user || !(await user.verifyPassword(password, user.password))) {
    return next(new AppError(401, 'Incorrect email or password!'))
  }

  // 3) If everything ok, send token to client
  const token = signToken(user._id)

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  })
})

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and checking if it is there
  let token
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  }

  if (!token) {
    return next(new AppError(401, 'This user is not logged in!'))
  }

  // 2) Verifying token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

  // 3) Checking if user still exists
  const user = await User.findById(decoded.id)
  if (!user) {
    return next(new AppError(401, 'The user related to the token does not longer exists'))
  }

  // 4) Checking is user changed password after token was issued
  const hasChangedPassword = user.hasChangedPasswordAfter(decoded.iat)
  if (hasChangedPassword) {
    return next(new AppError(401, 'The user has changed password after token was issued'))
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = user
  next()
})
