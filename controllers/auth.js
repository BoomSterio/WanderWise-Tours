const { promisify } = require('util')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')

const User = require('../models/user')
const catchAsync = require('../utils/catch-async')
const AppError = require('../utils/app-error')
const sendEmail = require('./email')

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id)

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
  }
  // secure option will only allow sending cookie through HTTPS
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true

  res.cookie('jwt', token, cookieOptions)

  // Remove the password from output
  user.password = undefined

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  })
}

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, role, password, passwordConfirm } = req.body
  const user = await User.create({ name, email, role, password, passwordConfirm })

  createAndSendToken(user, 201, res)
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
  createAndSendToken(user, 200, res)
})

exports.logout = catchAsync(async (req, res) => {
  res.cookie('jwt', 'logged out', { expires: new Date(Date.now() + 5 * 1000), httpOnly: true })
  res.status(200).json({ status: 'success', data: null })
})

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and checking if it is there
  let token
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1]
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }

  if (!token) {
    return next(new AppError(401, 'You are not logged in!'))
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
  res.locals.user = user
  next()
})

exports.restrictTo = (roles) => (req, res, next) => {
  // Check if user has one of the roles specified in arguments
  if (!roles.includes(req.user.role)) {
    return next(new AppError(403, 'You do not have permission to access this route'))
  }
  next()
}

/**
 * Checks if user is logged in and pushes user info object to res.locals making it accessible from pug templates.
 * Use if only for RENDERED pages, returns no errors!
 */
exports.isLoggedIn = async (req, res, next) => {
  try {
    if (!req.cookies.jwt) {
      // THERE IS NO USER, SKIPPING
      return next()
    }

    // 1) Verifying token
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)

    // 2) Checking if user still exists
    const user = await User.findById(decoded.id)
    if (!user) {
      return next()
    }

    // 3) Checking is user changed password after token was issued
    const hasChangedPassword = user.hasChangedPasswordAfter(decoded.iat)
    if (hasChangedPassword) {
      return next()
    }

    // THERE IS A LOGGED IN USER, PUT INTO locals
    res.locals.user = user
    next()
  } catch (err) {
    return next()
  }
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

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } })

  // 2) Set the new password if token has not expired and user exists
  if (!user) {
    return next(new AppError(400, 'Token is invalid or has expired'))
  }

  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined

  await user.save()

  // 3) Update passwordChangedAt for the user

  // 4) Log the user in (send JWT)
  createAndSendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user from the collection
  const user = await User.findById(req.user.id).select('+password')

  // 2) Check if posted password is correct
  const isPasswordCorrect = await user.verifyPassword(req.body.passwordCurrent, user.password)
  if (!isPasswordCorrect) {
    return next(new AppError(401, `Password you provided doesn't match with the current one.`))
  }

  // 3) Update password
  user.password = req.body.password
  user.passwordConfirm = req.body.passwordConfirm
  await user.save()
  // User.findByIdAndUpdate would NOT trigger middlewares and passwordConfirm validator! That's why we use .save()

  // 4) Log user in (send JWT)
  createAndSendToken(user, 200, res)
})
