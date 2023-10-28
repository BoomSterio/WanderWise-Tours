const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')

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
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password should be at least 8 characters'],
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

const User = mongoose.model('User', userSchema)

module.exports = User
