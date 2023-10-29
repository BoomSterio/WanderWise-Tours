const jwt = require('jsonwebtoken')

const User = require('../models/User')
const catchAsync = require('../utils/catch-async')

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body
  const user = await User.create({ name, email, password, passwordConfirm })

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user,
    },
  })
})
