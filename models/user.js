const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const { USER_ROLES } = require('../constants/user')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User name must be specified'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'User name must be specified'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Invalid email address'],
  },
  image: String,
  role: {
    type: String,
    enum: Object.values(USER_ROLES),
    default: USER_ROLES.USER,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password should be at least 8 characters'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm the password'],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (value) {
        return this.password === value
      },
      message: 'Passwords are not the same',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
})

// Password encryption happens between retrieving the request and saving it to the db
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12)

  // Delete the password confirm field
  this.passwordConfirm = undefined

  next()
})

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) {
    return next()
  }

  // Subsctracting 1 second to ensure the JWT is always created after the password has been changed
  this.passwordChangedAt = Date.now() - 1000
  next()
})

// INSTANCE METHOD (available for all user documents: user.verifypassword(...options))
userSchema.methods.verifyPassword = async (inputPassword, realPassword) =>
  await bcrypt.compare(inputPassword, realPassword)

userSchema.methods.hasChangedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
    return JWTTimestamp < changedTimestamp
  }

  // False means NOT changed
  return false
}

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex')

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000

  return resetToken
}

const User = mongoose.model('User', userSchema)

module.exports = User
