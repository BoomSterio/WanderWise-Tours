const express = require('express')
const { getOverview, getTour, getLoginForm, getSignupForm, getAccount, getMyBookings } = require('../controllers/view')
const { isLoggedIn, protect } = require('../controllers/auth')
const { createBookingCheckout } = require('../controllers/booking')

const router = express.Router()

router.get('/', createBookingCheckout, isLoggedIn, getOverview)
router.get('/tour/:slug', isLoggedIn, getTour)
router.get('/login', isLoggedIn, getLoginForm)
router.get('/signup', isLoggedIn, getSignupForm)
router.get('/me', protect, getAccount)
router.get('/my-tours', protect, getMyBookings)

module.exports = router
