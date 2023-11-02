const { promisify } = require('util')
const jwt = require('jsonwebtoken')

const User = require('../models/user')
const catchAsync = require('../utils/catch-async')
const AppError = require('../utils/app-error')
const sendEmail = require('./email')

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, role, password, passwordConfirm } = req.body
  const user = await User.create({ name, email, role, password, passwordConfirm })

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

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // Check if user has one of the roles specified in arguments
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'You do not have permission to access this route'))
    }
    next()
  }

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return next(new AppError(404, 'No user found with such email adress'))
  }

  // 2) Generate random reset token
  const resetToken = user.createPasswordResetToken()
  await user.save({ validateBeforeSave: false })

  //3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/reset-password/${resetToken}`

  const text = `Forgot your password?
  Submit a form or send a PATCH request with password and passwordConfirm to ${resetURL}.\n 
  If you didn't request to reset password, please ignore this message!`

  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset password (valid for 10 min)',
      text,
    })

    res.status(200).json({
      status: 'success',
      message: 'Reset token was sent to email!',
    })
  } catch (err) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined

    await user.save({ validateBeforeSave: false })

    return next(new AppError(500, 'There was an error sending email, try again later!'))
  }
})

exports.resetPassword = (req, res, next) => {
  // 1) Get user based on the token
}
