const express = require('express')

const { protect } = require('../controllers/auth')

const { getCheckoutSession } = require('../controllers/booking')

const router = express.Router({ mergeParams: true })

router.get('/checkout-session/:tourId', protect, getCheckoutSession)

module.exports = router
